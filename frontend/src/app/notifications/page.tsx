"use client";

import { useState } from "react";
import { AtSign, Heart, Repeat2, UserPlus } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import FollowButton from "@/components/ui/FollowButton";
import { getUser, notifications } from "@/lib/mock-data";
import { formatTimeAgo } from "@/lib/format";
import type { Notification } from "@/lib/types";

const TABS = ["All", "Mentions"] as const;

const ICONS: Record<Notification["type"], { icon: typeof Heart; className: string }> = {
  like: { icon: Heart, className: "text-danger fill-danger" },
  retweet: { icon: Repeat2, className: "text-success" },
  follow: { icon: UserPlus, className: "text-accent" },
  reply: { icon: AtSign, className: "text-accent" },
  mention: { icon: AtSign, className: "text-accent" },
};

const ACTION_SUFFIX: Record<Notification["type"], string> = {
  like: "liked your post",
  retweet: "reposted your post",
  follow: "followed you",
  reply: "replied to your post",
  mention: "mentioned you",
};

function joinNames(userIds: string[]): string {
  const names = userIds.map((id) => getUser(id).name);
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names[0]}, ${names[1]} and ${names.length - 2} others`;
}

export default function NotificationsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");

  const items =
    tab === "All" ? notifications : notifications.filter((n) => n.type === "mention");

  return (
    <div>
      <div className="sticky top-0 z-10 flex border-b border-border bg-bg/80 backdrop-blur-md">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="relative flex flex-1 items-center justify-center py-4 text-[15px] font-bold text-text-secondary transition-colors hover:bg-hover"
          >
            <span className={tab === t ? "text-text" : ""}>{t}</span>
            {tab === t && (
              <span className="absolute bottom-0 h-1 w-14 rounded-full bg-accent" />
            )}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
          <p className="text-xl font-extrabold">Nothing to see here yet</p>
          <p className="text-text-secondary">
            When someone mentions you, you&apos;ll find it here.
          </p>
        </div>
      ) : (
        items.map((n) => {
          const { icon: Icon, className } = ICONS[n.type];
          const names = joinNames(n.userIds);
          const primaryUser = getUser(n.userIds[0]);
          return (
            <div
              key={n.id}
              className={`flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-hover/40 ${
                !n.read ? "bg-hover-blue/40" : ""
              }`}
            >
              <Icon
                className={`h-7 w-7 shrink-0 ${className}`}
                fill={n.type === "like" ? "currentColor" : "none"}
              />
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex -space-x-1">
                  {n.userIds.slice(0, 3).map((id) => (
                    <Link key={id} href={`/profile/${getUser(id).handle}`}>
                      <Avatar user={getUser(id)} size="sm" className="ring-2 ring-bg" />
                    </Link>
                  ))}
                </div>
                <p className="text-[15px]">
                  <span className="font-bold">{names}</span> {ACTION_SUFFIX[n.type]}
                </p>
                {n.content && (
                  <p className="mt-1 truncate text-[15px] text-text-secondary">
                    {n.content}
                  </p>
                )}
                <p className="mt-1 text-[13px] text-text-secondary">
                  {formatTimeAgo(n.createdAt)}
                </p>
                {n.type === "follow" && (
                  <div className="mt-2 flex items-center justify-between rounded-2xl border border-border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold">{primaryUser.name}</p>
                      <p className="truncate text-[15px] text-text-secondary">
                        @{primaryUser.handle}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[13px] text-text-secondary">
                        {primaryUser.bio}
                      </p>
                    </div>
                    <FollowButton size="sm" />
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
