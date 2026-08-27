const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const Follow = require("../models/Follow");
const { requireAuth, attachUser } = require("../middleware/auth");
const { uploadProfileImages, deleteUploadedFile } = require("../middleware/upload");
const { notify } = require("../utils/notify");
const { computeProfileCompletion } = require("../utils/profileCompletion");
const { awardPoints } = require("../services/rewards.service");

const router = express.Router();

function handleValidation(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: errors.array()[0].msg });
  }
  next();
}

// Which of `userIds` does `viewerId` already follow? One indexed query,
// regardless of list size.
async function getFollowedSet(viewerId, userIds) {
  if (!viewerId || userIds.length === 0) return new Set();
  const following = await Follow.find({ follower: viewerId, following: { $in: userIds } }).distinct(
    "following"
  );
  return new Set(following.map(String));
}

// List users (for "who to follow"), excludes self.
router.get("/", requireAuth, async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);
  const users = await User.find({ _id: { $ne: req.userId } })
    .sort({ createdAt: -1 })
    .limit(limit);
  const followedSet = await getFollowedSet(req.userId, users.map((u) => u._id));
  res.json({
    users: users.map((u) => u.toPublicJSON(req.userId, followedSet.has(u._id.toString()))),
  });
});

router.patch(
  "/me",
  requireAuth,
  // Parses multipart/form-data (optional "avatar"/"banner" photos + the
  // text fields) into req.files/req.body before the validators below run.
  // A plain JSON request without files works exactly as before — multer
  // only kicks in for multipart bodies.
  uploadProfileImages,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("bio").optional().isLength({ max: 160 }).withMessage("Bio is too long"),
    body("location").optional().isLength({ max: 30 }).withMessage("Location is too long"),
    body("website").optional().isLength({ max: 100 }).withMessage("Website is too long"),
    body("avatarColor").optional().isString(),
    body("banner").optional().isString(),
    body("profileComplete").optional().isBoolean(),
  ],
  handleValidation,
  async (req, res) => {
    const allowed = [
      "name",
      "bio",
      "location",
      "website",
      "avatarColor",
      "banner",
      "profileComplete",
    ];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    const avatarFile = req.files?.avatar?.[0];
    const bannerFile = req.files?.banner?.[0];
    if (avatarFile) updates.avatarUrl = `/uploads/${avatarFile.filename}`;
    if (bannerFile) updates.bannerUrl = `/uploads/${bannerFile.filename}`;

    let previous;
    let user;
    try {
      // Fetched before the update so we know which (now-replaced) files to
      // clean up afterward — an uploaded photo isn't kept once superseded.
      if (avatarFile || bannerFile) {
        previous = await User.findById(req.userId, "avatarUrl bannerUrl");
      }
      user = await User.findByIdAndUpdate(req.userId, updates, {
        new: true,
        runValidators: true,
      });
    } catch (err) {
      deleteUploadedFile(avatarFile && updates.avatarUrl);
      deleteUploadedFile(bannerFile && updates.bannerUrl);
      throw err;
    }
    if (!user) return res.status(404).json({ error: "User not found" });

    if (avatarFile && previous?.avatarUrl) deleteUploadedFile(previous.avatarUrl);
    if (bannerFile && previous?.bannerUrl) deleteUploadedFile(previous.bannerUrl);

    // A fully-filled-out profile earns a one-time reward. `awardPoints` is
    // idempotent (unique index on RewardEvent), so it's safe to call this
    // on every save that happens to already be at 100% — only the save that
    // first crosses the line actually credits anything.
    let reward = null;
    if (computeProfileCompletion(user).percent === 100) {
      reward = await awardPoints({ userId: user._id, type: "profile_complete" });
    }

    res.json({ user: user.toPublicJSON(user._id), reward });
  }
);

router.get("/:username", attachUser, async (req, res) => {
  const user = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!user) return res.status(404).json({ error: "User not found" });
  const isFollowedByMe = req.userId
    ? Boolean(await Follow.exists({ follower: req.userId, following: user._id }))
    : false;
  res.json({ user: user.toPublicJSON(req.userId, isFollowedByMe) });
});

router.post("/:username/follow", requireAuth, async (req, res) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return res.status(404).json({ error: "User not found" });
  if (target._id.toString() === req.userId) {
    return res.status(400).json({ error: "You can't follow yourself" });
  }

  let reward = null;
  try {
    await Follow.create({ follower: req.userId, following: target._id });
    // rewardType is keyed by the followed account, mirroring how
    // like/retweet key on the target post — so following the same person
    // again after unfollowing doesn't earn a second reward.
    const [, , , awarded] = await Promise.all([
      User.updateOne({ _id: target._id }, { $inc: { followersCount: 1 } }),
      User.updateOne({ _id: req.userId }, { $inc: { followingCount: 1 } }),
      notify({ recipientId: target._id, actorId: req.userId, type: "follow" }),
      awardPoints({ userId: req.userId, type: "follow", sourceId: target._id }),
    ]);
    reward = awarded;
  } catch (err) {
    if (err.code !== 11000) throw err; // already following — treat as a no-op
  }

  const updated = await User.findById(target._id);
  res.json({ user: updated.toPublicJSON(req.userId, true), reward });
});

router.post("/:username/unfollow", requireAuth, async (req, res) => {
  const target = await User.findOne({ username: req.params.username.toLowerCase() });
  if (!target) return res.status(404).json({ error: "User not found" });

  const removed = await Follow.findOneAndDelete({ follower: req.userId, following: target._id });
  if (removed) {
    await Promise.all([
      User.updateOne({ _id: target._id }, { $inc: { followersCount: -1 } }),
      User.updateOne({ _id: req.userId }, { $inc: { followingCount: -1 } }),
    ]);
  }

  const updated = await User.findById(target._id);
  res.json({ user: updated.toPublicJSON(req.userId, false) });
});

module.exports = router;
