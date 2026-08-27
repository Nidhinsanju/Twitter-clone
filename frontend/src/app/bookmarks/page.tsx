"use client";

import { Bookmark } from "lucide-react";
import TweetList from "@/components/tweet/TweetList";
import { useFeed } from "@/context/FeedContext";
import { useAuth } from "@/context/AuthContext";

export default function BookmarksPage() {
  const { tweets } = useFeed();
  const { user } = useAuth();
  const bookmarked = tweets.filter((t) => t.bookmarked);

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-md">
        <h1 className="text-xl font-extrabold">Bookmarks</h1>
        {user && <p className="text-[13px] text-text-secondary">@{user.handle}</p>}
      </div>

      {bookmarked.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
          <Bookmark className="h-10 w-10 text-text-secondary" />
          <p className="text-3xl font-extrabold">Save posts for later</p>
          <p className="max-w-xs text-text-secondary">
            Bookmark posts to easily find them again in the future.
          </p>
        </div>
      ) : (
        <TweetList tweets={bookmarked} />
      )}
    </div>
  );
}
