"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import FollowButton from "@/components/ui/FollowButton";
import TwitterLogo from "@/components/icons/TwitterLogo";
import ProfileCompletionCard from "@/components/profile/ProfileCompletionCard";
import { trends } from "@/lib/mock-data";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { User } from "@/lib/types";

export default function RightPanel() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<User[]>([]);

  useEffect(() => {
    api
      .listUsers(3)
      .then(({ users }) => setSuggestions(users.filter((u) => !u.isFollowedByMe)))
      .catch(() => setSuggestions([]));
  }, []);

  return (
    <div className="flex flex-col gap-4 py-1.5">
      <div className="sticky top-0 z-10 bg-bg pb-2 pt-1.5">
        <div className="flex items-center gap-3 rounded-full bg-bg-secondary px-4 py-2.5 transition-colors focus-within:bg-bg focus-within:ring-1 focus-within:ring-accent">
          <Search className="h-5 w-5 text-text-secondary" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-text-secondary"
          />
        </div>
      </div>

      {user?.profileCompletion && user.profileCompletion.percent < 100 && (
        <Link
          href={`/profile/${user.handle}`}
          className="block rounded-2xl border border-border p-4 transition-colors hover:bg-hover/40"
        >
          <ProfileCompletionCard completion={user.profileCompletion} compact />
        </Link>
      )}

      <div className="rounded-2xl border border-border">
        <h2 className="px-4 pb-1 pt-3 text-xl font-extrabold">What&apos;s happening</h2>
        {trends.map((trend) => (
          <button
            key={trend.title}
            className="flex w-full flex-col items-start px-4 py-3 text-left transition-colors hover:bg-hover"
          >
            <span className="text-[13px] text-text-secondary">{trend.category}</span>
            <span className="text-[15px] font-bold">{trend.title}</span>
            <span className="text-[13px] text-text-secondary">{trend.posts} posts</span>
          </button>
        ))}
        <Link
          href="/explore"
          className="block rounded-b-2xl px-4 py-3 text-[15px] text-accent transition-colors hover:bg-hover"
        >
          Show more
        </Link>
      </div>

      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-border">
          <h2 className="px-4 pb-1 pt-3 text-xl font-extrabold">Who to follow</h2>
          {suggestions.map((user) => (
            <div key={user.id} className="flex items-center gap-3 px-4 py-3 hover:bg-hover">
              <Link href={`/profile/${user.handle}`}>
                <Avatar user={user} size="md" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${user.handle}`}
                  className="block truncate text-[15px] font-bold hover:underline"
                >
                  {user.name}
                </Link>
                <p className="truncate text-[15px] text-text-secondary">@{user.handle}</p>
              </div>
              <FollowButton handle={user.handle} initialFollowing={user.isFollowedByMe} size="sm" />
            </div>
          ))}
          <Link
            href="/explore"
            className="block rounded-b-2xl px-4 py-3 text-[15px] text-accent transition-colors hover:bg-hover"
          >
            Show more
          </Link>
        </div>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1 px-4 text-[13px] text-text-secondary">
        <a href="#" className="hover:underline">Terms of Service</a>
        <a href="#" className="hover:underline">Privacy Policy</a>
        <a href="#" className="hover:underline">Cookie Policy</a>
        <a href="#" className="hover:underline">Accessibility</a>
        <a href="#" className="hover:underline">Ads info</a>
        <a href="#" className="hover:underline">More &middot;&middot;&middot;</a>
        <span>© 2026 Twitter Clone</span>
      </div>
    </div>
  );
}
