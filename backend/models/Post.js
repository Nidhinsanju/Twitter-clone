const mongoose = require("mongoose");

// A "post" is both a top-level tweet and a reply: replies are just posts
// with `parentPost` set, instead of subdocuments embedded on the parent.
// That keeps a single document small and fixed-size no matter how many
// replies or likes a post accumulates (an embedded replies/likes array on a
// viral post would otherwise grow toward the 16MB document limit and get
// fully rewritten on every single reply).
//
// likeCount / retweetCount / replyCount / bookmarkCount are denormalized
// counters kept in sync with $inc when a Like/Retweet/Bookmark/reply-Post is
// created or removed (see routes/tweets.routes.js). Reads stay O(1) instead
// of counting related collections on every feed render; the source of truth
// for *who* liked/retweeted/bookmarked lives in those collections.
const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // Not `required` at the schema level: an image-only post (no caption)
    // is valid, so "text or image" is enforced by the route's validator
    // instead (see routes/tweets.routes.js) — Mongoose's default String
    // required check rejects "" outright, which would break that case.
    content: { type: String, maxlength: 280, default: "" },
    // Decorative CSS gradient used by seeded/demo posts (no real file behind it).
    imageGradient: { type: String, default: null },
    // Path (relative to the API origin, e.g. "/uploads/xxx.jpg") of a real
    // uploaded image — see middleware/upload.js. Files live on disk, not in
    // Mongo, so a post stores a pointer to one, not the image bytes.
    imageUrl: { type: String, default: null },
    parentPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post", default: null },

    likeCount: { type: Number, default: 0, min: 0 },
    retweetCount: { type: Number, default: 0, min: 0 },
    replyCount: { type: Number, default: 0, min: 0 },
    bookmarkCount: { type: Number, default: 0, min: 0 },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Reverse-chronological home feed (top-level posts only).
postSchema.index({ parentPost: 1, createdAt: -1 });
// A user's own posts, in either "posts" (parentPost: null) or "replies" view.
postSchema.index({ author: 1, parentPost: 1, createdAt: -1 });

function toPublicPost(post, { viewerId, liked = false, retweeted = false, bookmarked = false, repliesList = [] } = {}) {
  const author = post.author;
  return {
    id: post._id.toString(),
    content: post.content,
    imageGradient: post.imageGradient,
    imageUrl: post.imageUrl,
    createdAt: post.createdAt,
    author: author && author._id
      ? {
          id: author._id.toString(),
          name: author.name,
          handle: author.username,
          avatarColor: author.avatarColor,
          avatarUrl: author.avatarUrl,
        }
      : null,
    likes: post.likeCount,
    retweets: post.retweetCount,
    replies: post.replyCount,
    views: post.views,
    liked,
    retweeted,
    bookmarked,
    repliesList,
  };
}

function toReplySummary(reply) {
  const author = reply.author;
  return {
    id: reply._id.toString(),
    content: reply.content,
    createdAt: reply.createdAt,
    author: author && author._id
      ? {
          id: author._id.toString(),
          name: author.name,
          handle: author.username,
          avatarColor: author.avatarColor,
          avatarUrl: author.avatarUrl,
        }
      : null,
  };
}

const Post = mongoose.model("Post", postSchema);
module.exports = { Post, toPublicPost, toReplySummary };
