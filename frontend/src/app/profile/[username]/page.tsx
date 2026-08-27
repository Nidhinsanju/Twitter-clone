"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  MapPin,
  MoreHorizontal,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import FollowButton from "@/components/ui/FollowButton";
import TweetList from "@/components/tweet/TweetList";
import { getUserByHandle, CURRENT_USER_ID } from "@/lib/mock-data";
import { useFeed } from "@/context/FeedContext";

const TABS = ["Posts", "Replies", "Highlights", "Media", "Likes"] as const;

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const user = getUserByHandle(username);
  const { tweets } = useFeed();
  const [tab, setTab] = useState<(typeof TABS)[number]>("Posts");

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-2 px-8 py-24 text-center">
        <p className="text-3xl font-extrabold">This account doesn&apos;t exist</p>
        <p className="text-text-secondary">Try searching for another.</p>
      </div>
    );
  }

  const isMe = user.id === CURRENT_USER_ID;
  const authored = tweets.filter((t) => t.authorId === user.id);
  const liked = tweets.filter((t) => t.liked);

  const visibleTweets =
    tab === "Posts"
      ? authored
      : tab === "Likes"
        ? liked
        : tab === "Media"
          ? authored.filter((t) => t.imageGradient)
          : [];

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-6 border-b border-border bg-bg/80 px-4 py-2 backdrop-blur-md">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xl font-extrabold leading-tight">{user.name}</p>
          <p className="text-[13px] text-text-secondary">{authored.length} posts</p>
        </div>
      </div>

      <div className="h-[200px] w-full" style={{ background: user.banner }} />

      <div className="px-4">
        <div className="flex items-end justify-between">
          <Avatar user={user} size="xl" className="-mt-11" />
          <div className="mt-3 flex items-center gap-2">
            {isMe ? (
              <button className="rounded-full border border-border px-4 py-1.5 text-[15px] font-bold transition-colors hover:bg-hover">
                Edit profile
              </button>
            ) : (
              <>
                <button className="flex h-9 w-9 items-center justify-center rounded-full border border-border transition-colors hover:bg-hover">
                  <MoreHorizontal className="h-5 w-5" />
                </button>
                <FollowButton />
              </>
            )}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xl font-extrabold">{user.name}</p>
          <p className="text-[15px] text-text-secondary">@{user.handle}</p>
        </div>

        {user.bio && <p className="mt-3 text-[15px]">{user.bio}</p>}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-text-secondary">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-[18px] w-[18px]" />
              {user.location}
            </span>
          )}
          {user.website && (
            <span className="flex items-center gap-1 text-accent">
              <LinkIcon className="h-[18px] w-[18px]" />
              {user.website}
            </span>
          )}
          {user.joined && (
            <span className="flex items-center gap-1">
              <Calendar className="h-[18px] w-[18px]" />
              Joined {user.joined}
            </span>
          )}
        </div>

        <div className="mt-3 flex gap-5 text-[15px]">
          <span>
            <span className="font-bold">{user.following?.toLocaleString()}</span>{" "}
            <span className="text-text-secondary">Following</span>
          </span>
          <span>
            <span className="font-bold">{user.followers?.toLocaleString()}</span>{" "}
            <span className="text-text-secondary">Followers</span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex overflow-x-auto border-b border-border no-scrollbar">
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

      <TweetList tweets={visibleTweets} />
    </div>
  );
}
