import type { Trend } from "./types";

// Trending topics are presentational only — there's no trends backend yet.
export const trends: Trend[] = [
  { category: "Technology · Trending", title: "#NextJS16", posts: "45.2K" },
  { category: "Trending in India", title: "React Compiler", posts: "18.9K" },
  { category: "Programming · Trending", title: "#TypeScript", posts: "32.1K" },
  { category: "Trending", title: "Turbopack", posts: "9,842" },
  { category: "Technology · Trending", title: "#WebDev", posts: "61.4K" },
];

export const AVATAR_PALETTE = [
  "#f4212e",
  "#1d9bf0",
  "#00ba7c",
  "#ffad1f",
  "#7856ff",
  "#f91880",
  "#0f9b8e",
  "#e0631e",
];

export const BANNER_PALETTE = [
  "linear-gradient(135deg, #1d9bf0 0%, #7856ff 100%)",
  "linear-gradient(135deg, #f4212e 0%, #ffad1f 100%)",
  "linear-gradient(135deg, #00ba7c 0%, #0f9b8e 100%)",
  "linear-gradient(135deg, #7856ff 0%, #f91880 100%)",
  "linear-gradient(135deg, #0f172a 0%, #334155 100%)",
  "linear-gradient(135deg, #087ea4 0%, #61dafb 100%)",
];
