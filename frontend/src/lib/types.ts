export interface AuthorSummary {
  id: string;
  name: string;
  handle: string;
  avatarColor: string;
  avatarUrl?: string | null;
}

// What's still missing toward a 100% complete profile — see
// backend/config/rewards.js for the field list this mirrors.
export interface MissingProfileField {
  key: string;
  label: string;
}

export interface ProfileCompletion {
  percent: number;
  missing: MissingProfileField[];
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
  // Uploaded photos (paths relative to the API origin, e.g. "/uploads/xxx.jpg")
  // — shown in place of avatarColor/banner when present. null until uploaded.
  avatarUrl: string | null;
  bannerUrl: string | null;
  profileComplete: boolean;
  followersCount: number;
  followingCount: number;
  isMe: boolean;
  isFollowedByMe: boolean;
  joinedAt: string;
  // Only present when isMe (the backend only includes these for the owner).
  points?: number;
  profileCompletion?: ProfileCompletion;
}

// A single points-earning action, as recorded in the rewards ledger.
export type RewardType = "profile_complete" | "post" | "like" | "comment" | "retweet" | "follow";

export interface RewardEvent {
  id: string;
  type: RewardType;
  points: number;
  createdAt: string;
}

// Returned alongside actions that can earn points (posting, liking,
// commenting, retweeting, completing a profile). `awarded` is false when
// the action already earned its points before (e.g. re-liking a post you'd
// liked previously) — see backend/services/rewards.service.js.
export interface RewardResult {
  awarded: boolean;
  points: number;
  totalPoints: number | null;
}

export interface RewardsSummary {
  points: number;
  profileCompletion: ProfileCompletion;
  pointValues: Record<RewardType, number>;
  events: RewardEvent[];
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
  avatarUrl?: string | null;
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
  avatarUrl?: string | null;
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
