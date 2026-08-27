import type { AppNotification, ChatMessage, Conversation, Tweet, User } from "./types";

export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  // A FormData body (image upload) must NOT get a manual Content-Type — the
  // browser sets one itself with the multipart boundary included.
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });

  const isJson = res.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await res.json().catch(() => ({})) : {};

  if (!res.ok) {
    throw new ApiError(body.error || "Something went wrong", res.status);
  }
  return body as T;
}

export const api = {
  // Auth
  signup: (data: { name: string; username: string; email: string; password: string }) =>
    request<{ user: User }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  login: (data: { identifier: string; password: string }) =>
    request<{ user: User }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/api/auth/me"),

  // Users
  getUser: (username: string) => request<{ user: User }>(`/api/users/${username}`),
  updateMe: (data: Partial<Pick<User, "name" | "bio" | "location" | "website" | "avatarColor" | "banner" | "profileComplete">>) =>
    request<{ user: User }>("/api/users/me", { method: "PATCH", body: JSON.stringify(data) }),
  listUsers: (limit = 10) => request<{ users: User[] }>(`/api/users?limit=${limit}`),
  follow: (username: string) =>
    request<{ user: User }>(`/api/users/${username}/follow`, { method: "POST" }),
  unfollow: (username: string) =>
    request<{ user: User }>(`/api/users/${username}/unfollow`, { method: "POST" }),

  // Tweets
  getFeed: () => request<{ tweets: Tweet[] }>("/api/tweets"),
  getTweet: (id: string) => request<{ tweet: Tweet }>(`/api/tweets/${id}`),
  getBookmarks: () => request<{ tweets: Tweet[] }>("/api/tweets/bookmarked"),
  getUserTweets: (username: string) =>
    request<{ tweets: Tweet[] }>(`/api/tweets/user/${username}`),
  createTweet: (content: string, image?: File | null) => {
    if (image) {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("image", image);
      return request<{ tweet: Tweet }>("/api/tweets", { method: "POST", body: formData });
    }
    return request<{ tweet: Tweet }>("/api/tweets", { method: "POST", body: JSON.stringify({ content }) });
  },
  deleteTweet: (id: string) => request<{ ok: true }>(`/api/tweets/${id}`, { method: "DELETE" }),
  like: (id: string) => request<{ tweet: Tweet }>(`/api/tweets/${id}/like`, { method: "POST" }),
  retweet: (id: string) =>
    request<{ tweet: Tweet }>(`/api/tweets/${id}/retweet`, { method: "POST" }),
  bookmark: (id: string) =>
    request<{ tweet: Tweet }>(`/api/tweets/${id}/bookmark`, { method: "POST" }),
  reply: (id: string, content: string) =>
    request<{ tweet: Tweet }>(`/api/tweets/${id}/replies`, {
      method: "POST",
      body: JSON.stringify({ content }),
    }),

  // Notifications
  getNotifications: () => request<{ notifications: AppNotification[] }>("/api/notifications"),
  markNotificationsRead: () =>
    request<{ ok: true }>("/api/notifications/read-all", { method: "POST" }),

  // Messages
  getConversations: () => request<{ conversations: Conversation[] }>("/api/conversations"),
  startConversation: (username: string) =>
    request<{ conversation: Conversation }>(`/api/conversations/with/${username}`, {
      method: "POST",
    }),
  getMessages: (conversationId: string) =>
    request<{ messages: ChatMessage[] }>(`/api/conversations/${conversationId}/messages`),
  sendMessage: (conversationId: string, text: string) =>
    request<{ message: ChatMessage }>(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      body: JSON.stringify({ text }),
    }),
};
