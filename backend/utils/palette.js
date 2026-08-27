const AVATAR_COLORS = [
  "#f4212e",
  "#1d9bf0",
  "#00ba7c",
  "#ffad1f",
  "#7856ff",
  "#f91880",
  "#0f9b8e",
  "#e0631e",
];

const BANNERS = [
  "linear-gradient(135deg, #1d9bf0 0%, #7856ff 100%)",
  "linear-gradient(135deg, #f4212e 0%, #ffad1f 100%)",
  "linear-gradient(135deg, #00ba7c 0%, #0f9b8e 100%)",
  "linear-gradient(135deg, #7856ff 0%, #f91880 100%)",
  "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
  "linear-gradient(135deg, #087ea4 0%, #61dafb 100%)",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAvatarColor() {
  return randomFrom(AVATAR_COLORS);
}

function randomBanner() {
  return randomFrom(BANNERS);
}

module.exports = { AVATAR_COLORS, BANNERS, randomAvatarColor, randomBanner };
