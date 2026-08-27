const mongoose = require("mongoose");

// The social graph as edges, not embedded arrays. The old design stored
// `followers`/`following` as ObjectId arrays directly on User — great for a
// demo, but a popular account's followers array grows without bound (16MB
// document cap) and following/unfollowing meant reading + rewriting that
// whole array on both users involved on every click. Here it's one small
// document per edge, and User just keeps a denormalized counter.
const followSchema = new mongoose.Schema(
  {
    follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Prevents double-follow races and powers "am I already following them?".
followSchema.index({ follower: 1, following: 1 }, { unique: true });
// "Who follows user X" (followers list), newest first.
followSchema.index({ following: 1, createdAt: -1 });
// "Who does user X follow" (following list), newest first.
followSchema.index({ follower: 1, createdAt: -1 });

module.exports = mongoose.model("Follow", followSchema);
