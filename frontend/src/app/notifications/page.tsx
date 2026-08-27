"use client";

import { useEffect, useState } from "react";
import { AtSign, Heart, Repeat2, UserPlus } from "lucide-react";
import Link from "next/link";
import Avatar from "@/components/ui/Avatar";
import FollowButton from "@/components/ui/FollowButton";
import { api } from "@/lib/api";
import { formatTimeAgo } from "@/lib/format";
import type { AppNotification, NotificationType } from "@/lib/types";

const TABS = ["All", "Mentions"] as const;

const ICONS: Record<NotificationType, { icon: typeof Heart; className: string }> = {
  like: { icon: Heart, className: "text-danger" },
  retweet: { icon: Repeat2, className: "text-success" },
  follow: { icon: UserPlus, className: "text-accent" },
  reply: { icon: AtSign, className: "text-accent" },
};

const ACTION_SUFFIX: Record<NotificationType, string> = {
  like: "liked your post",
  retweet: "reposted your post",
  follow: "followed you",
  reply: "replied to your post",
};

export default function NotificationsPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getNotifications()
      .then(({ notifications }) => setNotifications(notifications))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
    // Opening the tab clears the unread badge.
    api.markNotificationsRead().catch(() => {});
  }, []);

  const items = tab === "All" ? notifications : notifications.filter((n) => n.type === "reply");

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

      {!loading && items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-8 py-16 text-center">
          <p className="text-xl font-extrabold">Nothing to see here yet</p>
          <p className="text-text-secondary">
            When someone mentions you, you&apos;ll find it here.
          </p>
        </div>
      ) : (
        items.map((n) => {
          const { icon: Icon, className } = ICONS[n.type];
          return (
            <div
              key={n.id}
              className="flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-hover/40"
            >
              <Icon className={`h-7 w-7 shrink-0 ${className}`} fill={n.type === "like" ? "currentColor" : "none"} />
              <div className="min-w-0 flex-1">
                <Link href={`/profile/${n.user.handle}`} className="mb-2 block w-fit">
                  <Avatar user={n.user} size="sm" />
                </Link>
                <p className="text-[15px]">
                  <Link href={`/profile/${n.user.handle}`} className="font-bold hover:underline">
                    {n.user.name}
                  </Link>{" "}
                  {ACTION_SUFFIX[n.type]}
                </p>
                {n.content && (
                  <p className="mt-1 truncate text-[15px] text-text-secondary">{n.content}</p>
                )}
                <p className="mt-1 text-[13px] text-text-secondary" suppressHydrationWarning>
                  {formatTimeAgo(n.createdAt)}
                </p>
                {n.type === "follow" && (
                  <div className="mt-2 flex items-center justify-between rounded-2xl border border-border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-[15px] font-bold">{n.user.name}</p>
                      <p className="truncate text-[15px] text-text-secondary">
                        @{n.user.handle}
                      </p>
                      <p className="mt-1 line-clamp-2 text-[13px] text-text-secondary">
                        {n.user.bio}
                      </p>
                    </div>
                    <FollowButton handle={n.user.handle} initialFollowing={n.user.isFollowedByMe} size="sm" />
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
