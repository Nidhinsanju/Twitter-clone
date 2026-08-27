"use client";

import { useState } from "react";
import { Search, Settings2 } from "lucide-react";
import { trends } from "@/lib/mock-data";
import { useFeed } from "@/context/FeedContext";
import TweetList from "@/components/tweet/TweetList";

const TABS = ["For you", "Trending", "News", "Sports", "Entertainment"] as const;

export default function ExplorePage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("For you");
  const [query, setQuery] = useState("");
  const { tweets } = useFeed();

  return (
    <div>
      <div className="sticky top-0 z-10 bg-bg/80 px-4 py-2 backdrop-blur-md">
        <div className="flex items-center gap-3 rounded-full bg-bg-secondary px-4 py-2.5 focus-within:bg-bg focus-within:ring-1 focus-within:ring-accent">
          <Search className="h-5 w-5 text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-text-secondary"
          />
          <Settings2 className="h-5 w-5 shrink-0 text-accent" />
        </div>
      </div>

      <div className="sticky top-[57px] z-10 flex overflow-x-auto border-b border-border bg-bg/80 backdrop-blur-md no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex shrink-0 items-center justify-center whitespace-nowrap px-4 py-4 text-[15px] font-bold text-text-secondary transition-colors hover:bg-hover"
          >
            <span className={tab === t ? "text-text" : ""}>{t}</span>
            {tab === t && (
              <span className="absolute bottom-0 h-1 w-14 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {tab === "Trending" ? (
        <div>
          {trends.concat(trends).map((trend, i) => (
            <button
              key={i}
              className="flex w-full flex-col items-start px-4 py-3 text-left transition-colors hover:bg-hover"
            >
              <span className="text-[13px] text-text-secondary">
                {i + 1} · {trend.category}
              </span>
              <span className="text-[15px] font-bold">{trend.title}</span>
              <span className="text-[13px] text-text-secondary">{trend.posts} posts</span>
            </button>
          ))}
        </div>
      ) : (
        <TweetList tweets={tweets} />
      )}
    </div>
  );
}
