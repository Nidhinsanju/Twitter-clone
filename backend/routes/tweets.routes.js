const express = require("express");
const { body, validationResult } = require("express-validator");
const { Post, toPublicPost, toReplySummary } = require("../models/Post");
const User = require("../models/User");
const Like = require("../models/Like");
const Retweet = require("../models/Retweet");
const Bookmark = require("../models/Bookmark");
const Notification = require("../models/Notification");
const { requireAuth } = require("../middleware/auth");
const { uploadImage, deleteUploadedFile } = require("../middleware/upload");
const { notify } = require("../utils/notify");

const router = express.Router();

const AUTHOR_FIELDS = "name username avatarColor";

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

// Batch-fetch which of `postIds` the viewer has liked/retweeted/bookmarked,
// in three indexed queries total — regardless of how many posts are in the
// page. Avoids the N+1 (or "scan an embedded array per post") alternative.
async function getViewerFlagSets(viewerId, postIds) {
  if (!viewerId || postIds.length === 0) {
    return { liked: new Set(), retweeted: new Set(), bookmarked: new Set() };
  }
  const [liked, retweeted, bookmarked] = await Promise.all([
    Like.find({ user: viewerId, post: { $in: postIds } }).distinct("post"),
    Retweet.find({ user: viewerId, post: { $in: postIds } }).distinct("post"),
    Bookmark.find({ user: viewerId, post: { $in: postIds } }).distinct("post"),
  ]);
  return {
    liked: new Set(liked.map(String)),
    retweeted: new Set(retweeted.map(String)),
    bookmarked: new Set(bookmarked.map(String)),
  };
}

function flagsFor(sets, postId) {
  const key = postId.toString();
  return {
    liked: sets.liked.has(key),
    retweeted: sets.retweeted.has(key),
    bookmarked: sets.bookmarked.has(key),
  };
}

async function fetchRepliesFor(postId) {
  const replies = await Post.find({ parentPost: postId })
    .sort({ createdAt: 1 })
    .populate("author", AUTHOR_FIELDS);
  return replies.map(toReplySummary);
}

// Deletes a post along with everything that hangs off it: its direct
// replies, and every Like/Retweet/Bookmark/Notification that references any
// of those posts. Without this, deleting a post would leave dangling refs
// (e.g. a Bookmark pointing at a post that no longer exists) and stale
// counters on User.postsCount / the parent's replyCount.
async function deletePostCascade(rootPost) {
  const replies = await Post.find({ parentPost: rootPost._id }, { _id: 1, author: 1, imageUrl: 1 });
  const deleted = [{ _id: rootPost._id, author: rootPost.author }, ...replies];
  const postIds = deleted.map((p) => p._id);

  deleteUploadedFile(rootPost.imageUrl);
  for (const r of replies) deleteUploadedFile(r.imageUrl);

  await Promise.all([
    Post.deleteMany({ _id: { $in: postIds } }),
    Like.deleteMany({ post: { $in: postIds } }),
    Retweet.deleteMany({ post: { $in: postIds } }),
    Bookmark.deleteMany({ post: { $in: postIds } }),
    Notification.deleteMany({ post: { $in: postIds } }),
  ]);

  const postsByAuthor = new Map();
  for (const p of deleted) {
    const key = p.author.toString();
    postsByAuthor.set(key, (postsByAuthor.get(key) || 0) + 1);
  }
  await Promise.all([
    ...[...postsByAuthor.entries()].map(([authorId, count]) =>
      User.updateOne({ _id: authorId }, { $inc: { postsCount: -count } })
    ),
    rootPost.parentPost
      ? Post.updateOne({ _id: rootPost.parentPost }, { $inc: { replyCount: -1 } })
      : Promise.resolve(),
  ]);
}

router.get("/", requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  // Top-level posts only (parentPost: null) — replies show up on the post
  // they're attached to, not in the home feed.
  const posts = await Post.find({ parentPost: null })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("author", AUTHOR_FIELDS);
  const flags = await getViewerFlagSets(req.userId, posts.map((p) => p._id));
  // repliesList is intentionally omitted here: shipping every reply thread
  // on every feed row doesn't scale. The single-post endpoint below is
  // where a post's full reply thread is fetched.
  res.json({ tweets: posts.map((p) => toPublicPost(p, { ...flagsFor(flags, p._id) })) });
});

router.get("/bookmarked", requireAuth, async (req, res) => {
  const bookmarks = await Bookmark.find({ user: req.userId })
    .sort({ createdAt: -1 })
    .populate({ path: "post", populate: { path: "author", select: AUTHOR_FIELDS } });
  const posts = bookmarks.map((b) => b.post).filter(Boolean);
  const flags = await getViewerFlagSets(req.userId, posts.map((p) => p._id));
  res.json({
    tweets: posts.map((p) => toPublicPost(p, { ...flagsFor(flags, p._id), bookmarked: true })),
  });
});

router.get("/user/:username", requireAuth, async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) return res.status(404).json({ error: "User not found" });

  const posts = await Post.find({ author: user._id, parentPost: null })
    .sort({ createdAt: -1 })
    .populate("author", AUTHOR_FIELDS);
  const flags = await getViewerFlagSets(req.userId, posts.map((p) => p._id));
  res.json({ tweets: posts.map((p) => toPublicPost(p, { ...flagsFor(flags, p._id) })) });
});

router.get("/:id", requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id).populate("author", AUTHOR_FIELDS);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const [flags, repliesList] = await Promise.all([
    getViewerFlagSets(req.userId, [post._id]),
    fetchRepliesFor(post._id),
  ]);
  res.json({ tweet: toPublicPost(post, { ...flagsFor(flags, post._id), repliesList }) });
});

router.post(
  "/",
  requireAuth,
  // Parses multipart/form-data (an optional "image" file + the "content"
  // field) into req.file / req.body before the validators below run. A
  // JSON request without a file works exactly as before — multer only
  // kicks in for multipart bodies.
  uploadImage,
  [
    body("content")
      .trim()
      .isLength({ max: 280 })
      .withMessage("Post can't exceed 280 characters"),
    // A post needs text OR an image, not necessarily both — mirrors real
    // Twitter allowing image-only posts.
    body("content").custom((value, { req }) => {
      if (!value && !req.file) throw new Error("Post can't be empty");
      return true;
    }),
  ],
  handleValidation,
  async (req, res) => {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    let post;
    try {
      post = await Post.create({ author: req.userId, content: req.body.content || "", imageUrl });
    } catch (err) {
      deleteUploadedFile(imageUrl); // don't leave an orphaned file if the post failed to save
      throw err;
    }
    await User.updateOne({ _id: req.userId }, { $inc: { postsCount: 1 } });
    const populated = await post.populate("author", AUTHOR_FIELDS);
    res.status(201).json({ tweet: toPublicPost(populated, {}) });
  }
);

router.delete("/:id", requireAuth, async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) return res.status(404).json({ error: "Post not found" });
  if (post.author.toString() !== req.userId) {
    return res.status(403).json({ error: "You can only delete your own posts" });
  }
  await deletePostCascade(post);
  res.json({ ok: true });
});

async function toggleInteraction(req, res, { Model, countField, notifyType }) {
  const post = await Post.findById(req.params.id).populate("author", AUTHOR_FIELDS);
  if (!post) return res.status(404).json({ error: "Post not found" });

  const existing = await Model.findOne({ user: req.userId, post: post._id });
  let delta = 0;
  if (existing) {
    await existing.deleteOne();
    delta = -1;
  } else {
    try {
      await Model.create({ user: req.userId, post: post._id });
      delta = 1;
    } catch (err) {
      if (err.code !== 11000) throw err; // duplicate toggle race — treat as a no-op
    }
    if (delta === 1 && notifyType) {
      await notify({
        recipientId: post.author._id,
        actorId: req.userId,
        type: notifyType,
        postId: post._id,
        content: post.content,
      });
    }
  }

  if (delta !== 0) {
    post[countField] = Math.max(0, post[countField] + delta);
    await post.save();
  }

  const [flags, repliesList] = await Promise.all([
    getViewerFlagSets(req.userId, [post._id]),
    fetchRepliesFor(post._id),
  ]);
  res.json({ tweet: toPublicPost(post, { ...flagsFor(flags, post._id), repliesList }) });
}

router.post("/:id/like", requireAuth, (req, res) =>
  toggleInteraction(req, res, { Model: Like, countField: "likeCount", notifyType: "like" })
);
router.post("/:id/retweet", requireAuth, (req, res) =>
  toggleInteraction(req, res, { Model: Retweet, countField: "retweetCount", notifyType: "retweet" })
);
router.post("/:id/bookmark", requireAuth, (req, res) =>
  toggleInteraction(req, res, { Model: Bookmark, countField: "bookmarkCount", notifyType: null })
);

router.post(
  "/:id/replies",
  requireAuth,
  [
    body("content")
      .trim()
      .notEmpty()
      .withMessage("Reply can't be empty")
      .isLength({ max: 280 })
      .withMessage("Reply can't exceed 280 characters"),
  ],
  handleValidation,
  async (req, res) => {
    const parent = await Post.findById(req.params.id).populate("author", AUTHOR_FIELDS);
    if (!parent) return res.status(404).json({ error: "Post not found" });

    const reply = await Post.create({
      author: req.userId,
      content: req.body.content,
      parentPost: parent._id,
    });
    await Promise.all([
      User.updateOne({ _id: req.userId }, { $inc: { postsCount: 1 } }),
      notify({
        recipientId: parent.author._id,
        actorId: req.userId,
        type: "reply",
        postId: parent._id,
        content: reply.content,
      }),
    ]);
    parent.replyCount += 1;
    await parent.save();

    const [flags, repliesList] = await Promise.all([
      getViewerFlagSets(req.userId, [parent._id]),
      fetchRepliesFor(parent._id),
    ]);
    res.status(201).json({
      tweet: toPublicPost(parent, { ...flagsFor(flags, parent._id), repliesList }),
    });
  }
);

module.exports = router;
