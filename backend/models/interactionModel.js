const mongoose = require("mongoose");

// Likes, retweets and bookmarks are structurally identical: "one user did
// this to one post, once". Factoring them into their own small collections
// (rather than an array embedded on the Post) means:
//   - a viral post's like list can't blow past the 16MB document cap
//   - liking a post is a single small insert, not a rewrite of a giant array
//   - "posts I liked/bookmarked" is a plain indexed query instead of a scan
// The unique compound index also makes the toggle idempotent under
// concurrent requests instead of relying on array find/splice races.
function createInteractionModel(modelName, collectionName) {
  const schema = new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      post: { type: mongoose.Schema.Types.ObjectId, ref: "Post", required: true },
    },
    { timestamps: true }
  );

  schema.index({ user: 1, post: 1 }, { unique: true });
  schema.index({ post: 1 }); // e.g. recompute/verify a post's counters
  schema.index({ user: 1, createdAt: -1 }); // "my bookmarks/likes", newest first

  return mongoose.model(modelName, schema, collectionName);
}

module.exports = createInteractionModel;
