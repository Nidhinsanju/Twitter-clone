"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { tweets as initialTweets, CURRENT_USER_ID } from "@/lib/mock-data";
import type { Tweet } from "@/lib/types";

interface FeedContextValue {
  tweets: Tweet[];
  addTweet: (content: string) => void;
  toggleLike: (id: string) => void;
  toggleRetweet: (id: string) => void;
  toggleBookmark: (id: string) => void;
}

const FeedContext = createContext<FeedContextValue | null>(null);

let nextId = 1000;

export function FeedProvider({ children }: { children: React.ReactNode }) {
  const [tweets, setTweets] = useState<Tweet[]>(initialTweets);

  const addTweet = useCallback((content: string) => {
    const tweet: Tweet = {
      id: `new-${nextId++}`,
      authorId: CURRENT_USER_ID,
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      retweets: 0,
      replies: 0,
      views: 0,
    };
    setTweets((prev) => [tweet, ...prev]);
  }, []);

  const toggleLike = useCallback((id: string) => {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, liked: !t.liked, likes: t.liked ? t.likes - 1 : t.likes + 1 }
          : t
      )
    );
  }, []);

  const toggleRetweet = useCallback((id: string) => {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              retweeted: !t.retweeted,
              retweets: t.retweeted ? t.retweets - 1 : t.retweets + 1,
            }
          : t
      )
    );
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setTweets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, bookmarked: !t.bookmarked } : t))
    );
  }, []);

  const value = useMemo(
    () => ({ tweets, addTweet, toggleLike, toggleRetweet, toggleBookmark }),
    [tweets, addTweet, toggleLike, toggleRetweet, toggleBookmark]
  );

  return <FeedContext.Provider value={value}>{children}</FeedContext.Provider>;
}

export function useFeed(): FeedContextValue {
  const ctx = useContext(FeedContext);
  if (!ctx) throw new Error("useFeed must be used within FeedProvider");
  return ctx;
}
