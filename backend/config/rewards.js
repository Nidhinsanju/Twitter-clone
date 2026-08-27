// Central place to tune the points economy: how much each action is worth,
// and which profile fields count toward "profile completion". Change values
// here rather than at each call site. Point values can be overridden per
// environment without a redeploy of logic.
const POINTS = {
  profile_complete: Number(process.env.REWARD_POINTS_PROFILE_COMPLETE) || 100,
  post: Number(process.env.REWARD_POINTS_POST) || 10,
  like: Number(process.env.REWARD_POINTS_LIKE) || 2,
  comment: Number(process.env.REWARD_POINTS_COMMENT) || 5,
  retweet: Number(process.env.REWARD_POINTS_RETWEET) || 5,
  follow: Number(process.env.REWARD_POINTS_FOLLOW) || 3,
};

// Fields that count toward the profile-completion percentage.
// name/username/avatarColor/banner are required at signup (or randomly
// defaulted), so they're always "filled" — included anyway so a brand new
// account doesn't start at 0%, the same way LinkedIn-style completion
// meters credit required fields. `label` is only set on fields we prompt
// the user to fill in — those show up in the "still missing" checklist.
const PROFILE_FIELDS = [
  { key: "name", isFilled: (u) => Boolean(u.name && u.name.trim()) },
  { key: "username", isFilled: (u) => Boolean(u.username && u.username.trim()) },
  { key: "avatarColor", isFilled: (u) => Boolean(u.avatarColor) },
  { key: "banner", isFilled: (u) => Boolean(u.banner) },
  { key: "bio", label: "Add a bio", isFilled: (u) => Boolean(u.bio && u.bio.trim()) },
  { key: "location", label: "Add your location", isFilled: (u) => Boolean(u.location && u.location.trim()) },
  { key: "website", label: "Add your website", isFilled: (u) => Boolean(u.website && u.website.trim()) },
  { key: "avatarUrl", label: "Upload a profile picture", isFilled: (u) => Boolean(u.avatarUrl) },
  { key: "bannerUrl", label: "Upload a banner image", isFilled: (u) => Boolean(u.bannerUrl) },
];

module.exports = { POINTS, PROFILE_FIELDS };
