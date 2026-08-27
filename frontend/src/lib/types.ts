export interface AuthorSummary {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  email?: string;
  bio: string;
  location: string;
  website: string;
  avatarColor: string;
  banner: string;
  profileComplete: boolean;
  followersCount: number;
  followingCount: number;
  isMe: boolean;
  isFollowedByMe: boolean;
  joinedAt: string;
}

export interface Reply {
  id: string;
  content: string;
  createdAt: string;
  author: AuthorSummary | null;
}

export interface Tweet {
  id: string;
  content: string;
  imageGradient?: string | null;
  // Path returned by the backend (e.g. "/uploads/xxx.jpg") — relative to
  // the API origin, not the frontend's, so prefix with API_URL when
  // rendering (see lib/api.ts).
  imageUrl?: string | null;
  createdAt: string;
  author: AuthorSummary | null;
  likes: number;
  retweets: number;
  replies: number;
  views: number;
  liked: boolean;
  retweeted: boolean;
  bookmarked: boolean;
  repliesList: Reply[];
}

export interface Trend {
  category: string;
  title: string;
  posts: string;
}

export type NotificationType = "like" | "retweet" | "follow" | "reply";

// A lean actor summary, not a full User — the notifications list is a
// batch fetch across many actors, so it only carries what the notification
// row actually renders (see backend/routes/notifications.routes.js).
export interface NotificationActor {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  bio: string;
  isFollowedByMe: boolean;
}

export interface AppNotification {
  id: string;
  type: NotificationType;
  user: NotificationActor;
  content?: string;
  read: boolean;
  createdAt: string;
}

export interface ConversationUser {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
}

export interface Conversation {
  id: string;
  user: ConversationUser;
  lastMessage: string;
  lastMessageAt: string;
  unread: boolean;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string;
}
