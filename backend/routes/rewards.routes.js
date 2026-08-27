const express = require("express");
const User = require("../models/User");
const RewardEvent = require("../models/RewardEvent");
const { requireAuth } = require("../middleware/auth");
const { computeProfileCompletion } = require("../utils/profileCompletion");
const { POINTS } = require("../config/rewards");

const router = express.Router();

function toPublicEvent(event) {
  return {
    id: event._id.toString(),
    type: event.type,
    points: event.points,
    createdAt: event.createdAt,
  };
}

// Points total, profile-completion breakdown, and a recent activity feed —
// everything the rewards UI needs in one call.
router.get("/me", requireAuth, async (req, res) => {
  const [user, events] = await Promise.all([
    User.findById(req.userId),
    RewardEvent.find({ user: req.userId }).sort({ createdAt: -1 }).limit(20),
  ]);
  if (!user) return res.status(404).json({ error: "User not found" });

  res.json({
    points: user.points,
    profileCompletion: computeProfileCompletion(user),
    pointValues: POINTS,
    events: events.map(toPublicEvent),
  });
});

module.exports = router;
