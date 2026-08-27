const mongoose = require("mongoose");
const { computeProfileCompletion } = require("../utils/profileCompletion");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 50 },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minlength: 3,
      maxlength: 20,
      match: /^[a-z0-9_]+$/,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    bio: { type: String, default: "", maxlength: 160 },
    location: { type: String, default: "", maxlength: 30 },
    website: { type: String, default: "", maxlength: 100 },
    avatarColor: { type: String, default: "#1d9bf0" },
    banner: {
      type: String,
      default: "linear-gradient(135deg, #1d9bf0 0%, #7856ff 100%)",
    },
    // Path (relative to the API origin, e.g. "/uploads/xxx.jpg") of an
    // uploaded profile picture / banner photo — see middleware/upload.js.
    // null until the user uploads one, in which case it's shown instead of
    // avatarColor/banner (which stay as the color/gradient fallback).
    avatarUrl: { type: String, default: null },
    bannerUrl: { type: String, default: null },
    profileComplete: { type: Boolean, default: false },

    // Denormalized counters. Follows live in their own collection (see
    // models/Follow.js) so a popular account's followers can't grow an
    // embedded array past MongoDB's 16MB document cap or serialize a huge
    // array on every profile fetch. These counters are kept in sync with
    // $inc alongside Follow document writes (see routes/users.routes.js)
    // instead of computing count() on every read.
    followersCount: { type: Number, default: 0, min: 0 },
    followingCount: { type: Number, default: 0, min: 0 },
    postsCount: { type: Number, default: 0, min: 0 },

    // Denormalized reward-points total — the ledger of individual awards
    // (profile completion, posting, liking, commenting, retweeting) lives
    // in RewardEvent; this is kept in sync with $inc alongside it (see
    // services/rewards.service.js) so reads stay O(1).
    points: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

userSchema.index({ createdAt: -1 });

// `isFollowedByMe` can no longer be derived from an embedded array, so the
// caller looks it up (usually via a batched Follow query) and passes it in.
userSchema.methods.toPublicJSON = function (viewerId, isFollowedByMe = false) {
  const isMe = viewerId ? viewerId.toString() === this._id.toString() : false;
  return {
    id: this._id.toString(),
    name: this.name,
    handle: this.username,
    ...(isMe
      ? { email: this.email, points: this.points, profileCompletion: computeProfileCompletion(this) }
      : {}),
    bio: this.bio,
    location: this.location,
    website: this.website,
    avatarColor: this.avatarColor,
    banner: this.banner,
    avatarUrl: this.avatarUrl,
    bannerUrl: this.bannerUrl,
    profileComplete: this.profileComplete,
    followersCount: this.followersCount,
    followingCount: this.followingCount,
    isMe,
    isFollowedByMe: isMe ? false : isFollowedByMe,
    joinedAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
