"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import ComposeForm from "@/components/compose/ComposeForm";
import TweetList from "@/components/tweet/TweetList";
import { useFeed } from "@/context/FeedContext";

const TABS = ["For you", "Following"] as const;

export default function Home() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("For you");
  const { tweets } = useFeed();

  const visibleTweets = tab === "For you" ? tweets : tweets.slice(0, 5);

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg/80 backdrop-blur-md">
        <div className="flex flex-1">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="group relative flex flex-1 items-center justify-center py-4 text-[15px] font-bold text-text-secondary transition-colors hover:bg-hover"
            >
              <span className={tab === t ? "text-text" : ""}>{t}</span>
              {tab === t && (
                <span className="absolute bottom-0 h-1 w-14 rounded-full bg-accent" />
              )}
            </button>
          ))}
        </div>
        <button
          className="mr-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-accent transition-colors hover:bg-hover-blue"
          aria-label="Timeline settings"
        >
          <Sparkles className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-border">
        <ComposeForm />
      </div>

      <TweetList tweets={visibleTweets} />
    </div>
  );
}
