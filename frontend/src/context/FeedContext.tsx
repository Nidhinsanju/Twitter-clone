"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { RewardResult, Tweet } from "@/lib/types";

interface FeedContextValue {
  tweets: Tweet[];
  loading: boolean;
  refresh: () => Promise<void>;
  addTweet: (content: string, image?: File | null) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  toggleRetweet: (id: string) => Promise<void>;
  toggleBookmark: (id: string) => Promise<void>;
  addReply: (id: string, content: string) => Promise<void>;
  upsertTweet: (tweet: Tweet) => void;
}

const FeedContext = createContext<FeedContextValue | null>(null);

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const { user, updateUser } = useAuth();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(false);

  // Posting/liking/retweeting/replying can each earn points (see
  // backend/services/rewards.service.js). Rather than thread the reward
  // through every caller, just bump the points badge in place when one was
  // actually awarded — cheap, and keeps Sidebar/RightPanel in sync without
  // a full user refetch.
  const applyReward = useCallback(
    (reward: RewardResult | null | undefined) => {
      if (reward?.awarded && reward.totalPoints !== null) {
        updateUser((prev) => (prev ? { ...prev, points: reward.totalPoints! } : prev));
      }
    },
    [updateUser]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { tweets } = await api.getFeed();
      setTweets(tweets);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Load the feed once a session exists, clear it once it ends.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user) refresh();
    else setTweets([]);
  }, [user, refresh]);

  const upsertTweet = useCallback((tweet: Tweet) => {
    setTweets((prev) => {
      const exists = prev.some((t) => t.id === tweet.id);
      return exists ? prev.map((t) => (t.id === tweet.id ? tweet : t)) : [tweet, ...prev];
    });
  }, []);

  const addTweet = useCallback(
    async (content: string, image?: File | null) => {
      const { tweet, reward } = await api.createTweet(content, image);
      setTweets((prev) => [tweet, ...prev]);
      applyReward(reward);
    },
    [applyReward]
  );

  // Optimistically flip a boolean+count locally, then reconcile with the server response.
  const optimisticToggle = useCallback(
    async (
      id: string,
      field: "liked" | "retweeted" | "bookmarked",
      countField: "likes" | "retweets" | null,
      apiCall: (id: string) => Promise<{ tweet: Tweet; reward?: RewardResult | null }>
    ) => {
      setTweets((prev) =>
        prev.map((t) =>
          t.id === id
            ? {
                ...t,
                [field]: !t[field],
                ...(countField ? { [countField]: t[field] ? t[countField] - 1 : t[countField] + 1 } : {}),
              }
            : t
        )
      );
      try {
        const { tweet, reward } = await apiCall(id);
        setTweets((prev) => prev.map((t) => (t.id === id ? tweet : t)));
        applyReward(reward);
      } catch {
        // Revert on failure by refetching the true state from the server.
        refresh();
      }
    },
    [refresh, applyReward]
  );

  const toggleLike = useCallback(
    (id: string) => optimisticToggle(id, "liked", "likes", api.like),
    [optimisticToggle]
  );
  const toggleRetweet = useCallback(
    (id: string) => optimisticToggle(id, "retweeted", "retweets", api.retweet),
    [optimisticToggle]
  );
  const toggleBookmark = useCallback(
    (id: string) => optimisticToggle(id, "bookmarked", null, api.bookmark),
    [optimisticToggle]
  );

  const addReply = useCallback(
    async (id: string, content: string) => {
      const { tweet, reward } = await api.reply(id, content);
      setTweets((prev) => prev.map((t) => (t.id === id ? tweet : t)));
      applyReward(reward);
    },
    [applyReward]
  );

  const value = useMemo(
    () => ({
      tweets,
      loading,
      refresh,
      addTweet,
      toggleLike,
      toggleRetweet,
      toggleBookmark,
      addReply,
      upsertTweet,
    }),
    [tweets, loading, refresh, addTweet, toggleLike, toggleRetweet, toggleBookmark, addReply, upsertTweet]
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed(): FeedContextValue {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used within FeedProvider");
  return ctx;
}
