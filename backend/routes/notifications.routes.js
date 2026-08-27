const express = require("express");
const Notification = require("../models/Notification");
const Follow = require("../models/Follow");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const ACTOR_FIELDS = "name username avatarColor bio";

router.get("/", requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const notifications = await Notification.find({ recipient: req.userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("actor", ACTOR_FIELDS);

  const actorIds = notifications.map((n) => n.actor?._id).filter(Boolean);
  const followedIds = new Set(
    (
      await Follow.find({ follower: req.userId, following: { $in: actorIds } }).distinct(
        "following"
      )
    ).map(String)
  );

  res.json({
    notifications: notifications
      .filter((n) => n.actor) // actor account may since have been deleted
      .map((n) => ({
        id: n._id.toString(),
        type: n.type,
        content: n.content || undefined,
        createdAt: n.createdAt,
        read: n.read,
        user: {
          id: n.actor._id.toString(),
          name: n.actor.name,
          handle: n.actor.username,
          avatarColor: n.actor.avatarColor,
          bio: n.actor.bio,
          isFollowedByMe: followedIds.has(n.actor._id.toString()),
        },
      })),
  });
});

// Marks every notification as read — called when the notifications tab is opened.
router.post("/read-all", requireAuth, async (req, res) => {
  await Notification.updateMany({ recipient: req.userId, read: false }, { $set: { read: true } });
  res.json({ ok: true });
});

router.get("/unread-count", requireAuth, async (req, res) => {
  const count = await Notification.countDocuments({ recipient: req.userId, read: false });
  res.json({ count });
});

module.exports = router;
