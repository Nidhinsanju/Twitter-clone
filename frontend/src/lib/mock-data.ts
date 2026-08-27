import type { Conversation, Notification, Trend, Tweet, User } from "./types";

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}
function minutesAgo(m: number): string {
  return new Date(Date.now() - m * 60 * 1000).toISOString();
}
function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}

export const CURRENT_USER_ID = "u1";

export const users: User[] = [
  {
    id: "u1",
    name: "Nidhin Sanju",
    handle: "nidhinsanju",
    bio: "Building things on the internet. Cloning apps for fun and practice 🚀",
    location: "Kerala, India",
    website: "nidhinsanju.dev",
    joined: "September 2019",
    banner: "linear-gradient(135deg, #1d9bf0 0%, #7856ff 100%)",
    verified: true,
    following: 312,
    followers: 1204,
  },
  {
    id: "u2",
    name: "Elon Musk",
    handle: "elonmusk",
    bio: "Mars, Tesla, X, SpaceX, Neuralink, The Boring Company",
    location: "Austin, TX",
    joined: "June 2009",
    banner: "linear-gradient(135deg, #1d1d1d 0%, #3a3a3a 100%)",
    verified: true,
    following: 900,
    followers: 195_000_000,
  },
  {
    id: "u3",
    name: "Vercel",
    handle: "vercel",
    bio: "Develop. Preview. Ship. The platform for frontend developers.",
    location: "San Francisco, CA",
    joined: "April 2015",
    banner: "linear-gradient(135deg, #000000 0%, #434343 100%)",
    verified: true,
    following: 120,
    followers: 620_000,
  },
  {
    id: "u4",
    name: "React",
    handle: "reactjs",
    bio: "The library for web and native user interfaces.",
    location: "Menlo Park, CA",
    joined: "January 2014",
    banner: "linear-gradient(135deg, #087ea4 0%, #61dafb 100%)",
    verified: true,
    following: 40,
    followers: 3_400_000,
  },
  {
    id: "u5",
    name: "Priya Sharma",
    handle: "priyacodes",
    bio: "Frontend engineer • React & TypeScript • coffee-powered",
    location: "Bengaluru, India",
    joined: "March 2021",
    banner: "linear-gradient(135deg, #f4212e 0%, #ffad1f 100%)",
    verified: false,
    following: 540,
    followers: 8_900,
  },
  {
    id: "u6",
    name: "TypeScript",
    handle: "typescript",
    bio: "TypeScript is a superset of JavaScript that compiles to clean JavaScript output.",
    location: "Redmond, WA",
    joined: "October 2012",
    banner: "linear-gradient(135deg, #3178c6 0%, #235a97 100%)",
    verified: true,
    following: 20,
    followers: 1_100_000,
  },
  {
    id: "u7",
    name: "Arjun Mehta",
    handle: "arjun_builds",
    bio: "Indie hacker. Shipping side projects every month.",
    location: "Mumbai, India",
    joined: "July 2020",
    banner: "linear-gradient(135deg, #00ba7c 0%, #0f9b8e 100%)",
    verified: false,
    following: 800,
    followers: 15_200,
  },
  {
    id: "u8",
    name: "MDN Web Docs",
    handle: "mozdevnet",
    bio: "Resources for developers, by developers.",
    location: "Worldwide",
    joined: "May 2009",
    banner: "linear-gradient(135deg, #83d0f2 0%, #000000 100%)",
    verified: true,
    following: 15,
    followers: 480_000,
  },
];

export const tweets: Tweet[] = [
  {
    id: "t1",
    authorId: "u3",
    content:
      "Next.js 16 is here! ⚡ Faster builds, improved caching, and a smoother developer experience. Ship your next project today.",
    createdAt: hoursAgo(2),
    imageGradient: "linear-gradient(135deg, #000000, #434343)",
    likes: 12400,
    retweets: 3200,
    replies: 421,
    views: 890_000,
  },
  {
    id: "t2",
    authorId: "u5",
    content:
      "Finally recreating the Twitter UI from scratch with Next.js + Tailwind. The devil is really in the details — spacing, hover states, the tiny animations 🎨",
    createdAt: hoursAgo(4),
    likes: 842,
    retweets: 96,
    replies: 54,
    views: 15_300,
  },
  {
    id: "t3",
    authorId: "u2",
    content: "The future of software is agents talking to agents.",
    createdAt: hoursAgo(5),
    likes: 84_000,
    retweets: 9800,
    replies: 6200,
    views: 12_000_000,
  },
  {
    id: "t4",
    authorId: "u6",
    content:
      "TypeScript 5.9 shipped with better inference for generic functions and faster incremental builds. Update your tsconfig and enjoy 🚀",
    createdAt: hoursAgo(7),
    likes: 5400,
    retweets: 1100,
    replies: 210,
    views: 210_000,
  },
  {
    id: "t5",
    authorId: "u7",
    content:
      "Day 47 of building in public: shipped dark mode, fixed 12 bugs, and finally got the compose box to auto-resize properly. Small wins add up 💪",
    createdAt: hoursAgo(9),
    likes: 312,
    retweets: 18,
    replies: 22,
    views: 4_800,
  },
  {
    id: "t6",
    authorId: "u4",
    content:
      "React Compiler is now stable! It automatically memoizes your components so you don't have to reach for useMemo and useCallback everywhere.",
    createdAt: hoursAgo(11),
    imageGradient: "linear-gradient(135deg, #087ea4, #61dafb)",
    likes: 24_600,
    retweets: 6100,
    replies: 890,
    views: 1_900_000,
  },
  {
    id: "t7",
    authorId: "u8",
    content:
      "New guide: Understanding CSS Container Queries. Learn how to build components that respond to their container's size, not just the viewport.",
    createdAt: hoursAgo(14),
    likes: 1900,
    retweets: 540,
    replies: 63,
    views: 92_000,
  },
  {
    id: "t8",
    authorId: "u1",
    content:
      "Building a Twitter clone taught me more about layout engineering than any course ever did. Three-column responsive layouts are deceptively hard 😅",
    createdAt: hoursAgo(16),
    likes: 156,
    retweets: 12,
    replies: 31,
    views: 3_200,
  },
  {
    id: "t9",
    authorId: "u5",
    content:
      "Hot take: optimistic UI updates (like/retweet) make an app feel 10x faster even when the network request hasn't finished yet.",
    createdAt: daysAgo(1),
    likes: 2300,
    retweets: 410,
    replies: 88,
    views: 61_000,
  },
  {
    id: "t10",
    authorId: "u2",
    content: "X is the future of human communication.",
    createdAt: daysAgo(1),
    likes: 45_000,
    retweets: 8200,
    replies: 3100,
    views: 8_900_000,
  },
  {
    id: "t11",
    authorId: "u7",
    content:
      "PSA: if you're building a clone app for learning, focus on the interaction details (hover, focus, transitions) — that's what makes it feel real, not just the layout.",
    createdAt: daysAgo(2),
    likes: 980,
    retweets: 145,
    replies: 40,
    views: 22_000,
  },
  {
    id: "t12",
    authorId: "u3",
    content:
      "Turbopack is now the default bundler for `next dev` and `next build`. Expect significantly faster refresh times on large codebases.",
    createdAt: daysAgo(2),
    likes: 8700,
    retweets: 2100,
    replies: 340,
    views: 410_000,
  },
  {
    id: "t13",
    authorId: "u6",
    content: "satisfies vs as — know the difference, use it well.",
    createdAt: daysAgo(3),
    likes: 3100,
    retweets: 720,
    replies: 95,
    views: 128_000,
  },
];

export const notifications: Notification[] = [
  {
    id: "n1",
    type: "like",
    userIds: ["u2", "u5"],
    tweetId: "t8",
    content: "Building a Twitter clone taught me more about layout…",
    createdAt: minutesAgo(20),
    read: false,
  },
  {
    id: "n2",
    type: "follow",
    userIds: ["u7"],
    createdAt: hoursAgo(1),
    read: false,
  },
  {
    id: "n3",
    type: "retweet",
    userIds: ["u4"],
    tweetId: "t8",
    content: "Building a Twitter clone taught me more about layout…",
    createdAt: hoursAgo(3),
    read: false,
  },
  {
    id: "n4",
    type: "mention",
    userIds: ["u3"],
    content: "@nidhinsanju loving the progress on your Twitter clone 🔥",
    createdAt: hoursAgo(6),
    read: true,
  },
  {
    id: "n5",
    type: "reply",
    userIds: ["u5"],
    tweetId: "t8",
    content: "Totally agree, the three column layout is no joke!",
    createdAt: hoursAgo(10),
    read: true,
  },
  {
    id: "n6",
    type: "like",
    userIds: ["u6", "u8", "u2"],
    tweetId: "t8",
    content: "Building a Twitter clone taught me more about layout…",
    createdAt: daysAgo(1),
    read: true,
  },
  {
    id: "n7",
    type: "follow",
    userIds: ["u4"],
    createdAt: daysAgo(2),
    read: true,
  },
];

export const conversations: Conversation[] = [
  {
    id: "c1",
    userId: "u5",
    lastMessage: "Haha yeah the compose box auto-resize was tricky!",
    createdAt: minutesAgo(12),
    unread: true,
    messages: [
      {
        id: "m1",
        fromMe: false,
        text: "Hey! Saw your Twitter clone progress, looks awesome 🔥",
        createdAt: hoursAgo(2),
      },
      {
        id: "m2",
        fromMe: true,
        text: "Thank you! Still working on the notifications page.",
        createdAt: hoursAgo(2),
      },
      {
        id: "m3",
        fromMe: false,
        text: "The compose box animation is so smooth, how'd you do it?",
        createdAt: hoursAgo(1),
      },
      {
        id: "m4",
        fromMe: true,
        text: "CSS transitions on a textarea with auto height 😄",
        createdAt: minutesAgo(30),
      },
      {
        id: "m5",
        fromMe: false,
        text: "Haha yeah the compose box auto-resize was tricky!",
        createdAt: minutesAgo(12),
      },
    ],
  },
  {
    id: "c2",
    userId: "u7",
    lastMessage: "Let's collab on a project sometime 👀",
    createdAt: hoursAgo(5),
    unread: false,
    messages: [
      {
        id: "m6",
        fromMe: false,
        text: "Building in public is so much fun, love following your journey",
        createdAt: hoursAgo(6),
      },
      {
        id: "m7",
        fromMe: true,
        text: "Same here! Your indie hacking updates keep me motivated",
        createdAt: hoursAgo(5),
      },
      {
        id: "m8",
        fromMe: false,
        text: "Let's collab on a project sometime 👀",
        createdAt: hoursAgo(5),
      },
    ],
  },
  {
    id: "c3",
    userId: "u3",
    lastMessage: "Turbopack should help a lot with your dev speed.",
    createdAt: daysAgo(1),
    unread: false,
    messages: [
      {
        id: "m9",
        fromMe: false,
        text: "Turbopack should help a lot with your dev speed.",
        createdAt: daysAgo(1),
      },
    ],
  },
];

export const trends: Trend[] = [
  { category: "Technology · Trending", title: "#NextJS16", posts: "45.2K" },
  { category: "Trending in India", title: "React Compiler", posts: "18.9K" },
  { category: "Programming · Trending", title: "#TypeScript", posts: "32.1K" },
  { category: "Trending", title: "Turbopack", posts: "9,842" },
  { category: "Technology · Trending", title: "#WebDev", posts: "61.4K" },
];

export function getUser(id: string): User {
  const u = users.find((u) => u.id === id);
  if (!u) throw new Error(`User not found: ${id}`);
  return u;
}

export function getUserByHandle(handle: string): User | undefined {
  return users.find((u) => u.handle.toLowerCase() === handle.toLowerCase());
}

export function getTweetsByAuthor(authorId: string): Tweet[] {
  return tweets.filter((t) => t.authorId === authorId);
}

export const whoToFollow = users.filter((u) => u.id !== CURRENT_USER_ID).slice(0, 3);
