// One-time migration: moves data out of the old embedded-array shape
// (a single `tweets` collection with likes/retweets/bookmarks/replies
// embedded as arrays on each document, and following/followers arrays on
// each user) into the normalized collections the app now reads/writes
// (posts, likes, retweets, bookmarks, follows).
//
// Safe to run more than once — it skips straight to renaming `tweets` out
// of the way if that collection no longer exists, and it never deletes
// data: the original collection is renamed to `tweets_legacy_backup`
// instead of dropped.
//
// Usage: node scripts/migrate-legacy-tweets.js
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../db");

async function run() {
  await connectDB();
  const db = mongoose.connection.db;

  const collectionNames = new Set((await db.listCollections().toArray()).map((c) => c.name));
  if (!collectionNames.has("tweets")) {
    console.log("No legacy `tweets` collection found — nothing to migrate.");
    await mongoose.disconnect();
    return;
  }

  const posts = db.collection("posts");
  const likes = db.collection("likes");
  const retweets = db.collection("retweets");
  const bookmarks = db.collection("bookmarks");
  const follows = db.collection("follows");
  const users = db.collection("users");

  const legacyTweets = await db.collection("tweets").find({}).toArray();
  console.log(`Migrating ${legacyTweets.length} legacy tweet document(s)...`);

  const postsCountDelta = new Map(); // authorId (string) -> number of posts to add
  const bumpPostsCount = (authorId) => {
    const key = authorId.toString();
    postsCountDelta.set(key, (postsCountDelta.get(key) || 0) + 1);
  };

  for (const t of legacyTweets) {
    await posts.insertOne({
      _id: t._id,
      author: t.author,
      content: t.content,
      imageGradient: t.imageGradient ?? null,
      parentPost: null,
      likeCount: (t.likes || []).length,
      retweetCount: (t.retweets || []).length,
      replyCount: (t.replies || []).length,
      bookmarkCount: (t.bookmarks || []).length,
      views: t.views || 0,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      __v: 0,
    });
    bumpPostsCount(t.author);

    for (const userId of t.likes || []) {
      await likes.insertOne({ user: userId, post: t._id, createdAt: t.updatedAt, updatedAt: t.updatedAt });
    }
    for (const userId of t.retweets || []) {
      await retweets.insertOne({ user: userId, post: t._id, createdAt: t.updatedAt, updatedAt: t.updatedAt });
    }
    for (const userId of t.bookmarks || []) {
      await bookmarks.insertOne({ user: userId, post: t._id, createdAt: t.updatedAt, updatedAt: t.updatedAt });
    }
    for (const reply of t.replies || []) {
      await posts.insertOne({
        _id: reply._id,
        author: reply.author,
        content: reply.content,
        imageGradient: null,
        parentPost: t._id,
        likeCount: 0,
        retweetCount: 0,
        replyCount: 0,
        bookmarkCount: 0,
        views: 0,
        createdAt: reply.createdAt,
        updatedAt: reply.updatedAt,
        __v: 0,
      });
      bumpPostsCount(reply.author);
    }
  }

  for (const [authorId, count] of postsCountDelta) {
    await users.updateOne({ _id: new mongoose.Types.ObjectId(authorId) }, { $inc: { postsCount: count } });
  }

  // Migrate the social graph. Only `followers` is read (per user, "who
  // follows me") to avoid double-inserting the same edge from both sides
  // of a bidirectional pair; the unique index on Follow would reject a
  // duplicate anyway, but this keeps counters accurate on the first pass.
  const legacyUsers = await users.find({}, { projection: { followers: 1, following: 1 } }).toArray();
  let followEdges = 0;
  for (const u of legacyUsers) {
    for (const followerId of u.followers || []) {
      try {
        await follows.insertOne({ follower: followerId, following: u._id, createdAt: new Date(), updatedAt: new Date() });
        followEdges += 1;
      } catch (err) {
        if (err.code !== 11000) throw err; // duplicate edge, already migrated
      }
    }
  }
  for (const u of legacyUsers) {
    const followersCount = (u.followers || []).length;
    const followingCount = (u.following || []).length;
    if (followersCount || followingCount) {
      await users.updateOne({ _id: u._id }, { $set: { followersCount, followingCount } });
    }
  }
  await users.updateMany({}, { $unset: { followers: "", following: "" } });

  await db.collection("tweets").rename("tweets_legacy_backup");

  console.log(
    `Done. Migrated ${legacyTweets.length} posts (+ nested replies), ${followEdges} follow edge(s). ` +
      "Original data preserved in `tweets_legacy_backup`."
  );
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
