const User = require("../models/User");
const RewardEvent = require("../models/RewardEvent");
const { POINTS } = require("../config/rewards");
const externalRewardsApi = require("./externalRewardsApi");

// Credits `type`-worth of points to `userId`, once per (user, type,
// sourceId). Returns { awarded, points, totalPoints }: `awarded` is false
// when this exact event already happened (e.g. re-liking a post you'd
// already liked once before, or a retried request) — callers use that to
// decide whether to surface a "+N points" hint.
//
// The internal ledger write is synchronous (the caller gets the real new
// total back for the response); the call to the external rewards API is
// fire-and-forget, same pattern as utils/notify.js, so a slow or
// unavailable third party never blocks or fails the like/post/comment/etc.
// that earned the points.
async function awardPoints({ userId, type, sourceId = null }) {
  const points = POINTS[type];
  if (!points) throw new Error(`Unknown reward type: ${type}`);

  let event;
  try {
    event = await RewardEvent.create({ user: userId, type, sourceId, points });
  } catch (err) {
    if (err.code === 11000) return { awarded: false, points: 0, totalPoints: null }; // already awarded
    throw err;
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $inc: { points } },
    { new: true, select: "points" }
  );

  syncToExternalApi(event).catch((err) => {
    console.error("Failed to sync reward event to external API:", err);
  });

  return { awarded: true, points, totalPoints: updatedUser.points };
}

async function syncToExternalApi(event) {
  try {
    const result = await externalRewardsApi.sendReward({
      userId: event.user,
      type: event.type,
      points: event.points,
      sourceId: event.sourceId,
    });
    event.externalStatus = result.skipped ? "skipped" : "synced";
    event.externalRef = result.id || null;
  } catch (err) {
    event.externalStatus = "failed";
    throw err;
  } finally {
    await event.save().catch(() => {});
  }
}

module.exports = { awardPoints };
