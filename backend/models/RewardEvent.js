const mongoose = require("mongoose");

// One row per point-earning action — the ledger backing User.points. The
// unique index on {user, type, sourceId} is what makes awarding idempotent:
// unliking then re-liking the same post, or a retried request, just fails
// the duplicate insert instead of double-crediting the user. sourceId pins
// the event to the specific thing that earned it (the post that was
// liked/retweeted/commented on; null for the one-off profile_complete
// event) — see services/rewards.service.js.
const rewardEventSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["profile_complete", "post", "like", "comment", "retweet", "follow"],
      required: true,
    },
    sourceId: { type: mongoose.Schema.Types.ObjectId, default: null },
    points: { type: Number, required: true },
    // Tracks the (not-yet-built) external rewards API call: "pending" until
    // we call out, then "synced"/"failed"/"skipped" (no API configured
    // yet). The internal ledger + User.points are authoritative regardless
    // of this status — it's bookkeeping for the external integration.
    externalStatus: {
      type: String,
      enum: ["pending", "synced", "failed", "skipped"],
      default: "pending",
    },
    externalRef: { type: String, default: null },
  },
  { timestamps: true }
);

rewardEventSchema.index({ user: 1, type: 1, sourceId: 1 }, { unique: true });
rewardEventSchema.index({ user: 1, createdAt: -1 }); // "my recent rewards", newest first

module.exports = mongoose.model("RewardEvent", rewardEventSchema);
