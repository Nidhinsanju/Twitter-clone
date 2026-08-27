export interface User {
  id: string;
  name: string;
  handle: string;
  bio?: string;
  location?: string;
  website?: string;
  joined?: string;
  banner?: string; // gradient string
  color?: string; // avatar color
  verified?: boolean;
  following?: number;
  followers?: number;
}

export interface Tweet {
  id: string;
  authorId: string;
  content: string;
  createdAt: string; // ISO date
  image?: string | null;
  imageGradient?: string | null;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  liked?: boolean;
  retweeted?: boolean;
  bookmarked?: boolean;
  replyingTo?: string; // handle
}

export interface Notification {
  id: string;
  type: "like" | "retweet" | "follow" | "reply" | "mention";
  userIds: string[];
  tweetId?: string;
  content?: string;
  createdAt: string;
  read?: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  lastMessage: string;
  createdAt: string;
  unread?: boolean;
  messages: { id: string; fromMe: boolean; text: string; createdAt: string }[];
}

export interface Trend {
  category: string;
  title: string;
  posts: string;
}
