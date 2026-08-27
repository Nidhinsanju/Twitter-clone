"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { formatCount, formatTimeAgo } from "@/lib/format";
import { useFeed } from "@/context/FeedContext";
import { useAuth } from "@/context/AuthContext";
import { api, API_URL } from "@/lib/api";
import type { Tweet as TweetType } from "@/lib/types";

export default function Tweet({ tweet }: { tweet: TweetType }) {
  const { toggleLike, toggleRetweet, toggleBookmark, refresh } = useFeed();
  const { user } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const author = tweet.author;

  const stop = (e: React.MouseEvent) => e.stopPropagation();
  const isMine = author && user && author.id === user.id;

  async function handleDelete(e: React.MouseEvent) {
    stop(e);
    setMenuOpen(false);
    await api.deleteTweet(tweet.id);
    refresh();
  }

  if (!author) return null;

  return (
    <article
      onClick={() => router.push(`/status/${tweet.id}`)}
      className="flex cursor-pointer gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-hover/40"
    >
      <Link href={`/profile/${author.handle}`} onClick={stop} className="shrink-0">
        <Avatar user={author} size="md" />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1 text-[15px]">
            <Link
              href={`/profile/${author.handle}`}
              onClick={stop}
              className="truncate font-bold hover:underline"
            >
              {author.name}
            </Link>
            <span className="shrink-0 truncate text-text-secondary">
              @{author.handle}
            </span>
            <span className="shrink-0 text-text-secondary">·</span>
            <span
              className="shrink-0 whitespace-nowrap text-text-secondary"
              suppressHydrationWarning
            >
              {formatTimeAgo(tweet.createdAt)}
            </span>
          </div>
          <div className="relative">
            <button
              onClick={(e) => {
                stop(e);
                setMenuOpen((v) => !v);
              }}
              className="-mr-2 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover-blue hover:text-accent"
              aria-label="More"
            >
              <MoreHorizontal className="h-[18px] w-[18px]" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={(e) => { stop(e); setMenuOpen(false); }} />
                <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-bg py-1 shadow-[0_0_15px_rgba(101,119,134,0.2)]">
                  {isMine ? (
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-[14px] font-medium text-danger hover:bg-danger-hover"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </button>
                  ) : (
                    <div className="px-4 py-2.5 text-[14px] text-text-secondary">
                      No actions available
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="whitespace-pre-wrap break-words text-[15px] leading-normal">
          {tweet.content}
        </p>

        {tweet.imageUrl ? (
          <div className="mt-3 w-full overflow-hidden rounded-2xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element -- served from the API origin, not optimizable by next/image */}
            <img
              src={`${API_URL}${tweet.imageUrl}`}
              alt=""
              className="max-h-[510px] w-full object-cover"
            />
          </div>
        ) : (
          tweet.imageGradient && (
            <div
              className="mt-3 aspect-video w-full overflow-hidden rounded-2xl border border-border"
              style={{ background: tweet.imageGradient }}
            />
          )
        )}

        <div className="mt-2 flex max-w-md items-center justify-between">
          <ActionButton
            icon={MessageCircle}
            count={tweet.replies}
            colorClass="hover:text-accent hover:bg-hover-blue"
            onClick={(e) => {
              stop(e);
              router.push(`/status/${tweet.id}`);
            }}
          />
          <ActionButton
            icon={Repeat2}
            count={tweet.retweets}
            active={tweet.retweeted}
            colorClass="hover:text-success hover:bg-[rgba(0,186,124,0.1)]"
            activeColorClass="text-success"
            onClick={(e) => {
              stop(e);
              toggleRetweet(tweet.id);
            }}
          />
          <ActionButton
            icon={Heart}
            count={tweet.likes}
            active={tweet.liked}
            fillWhenActive
            colorClass="hover:text-danger hover:bg-danger-hover"
            activeColorClass="text-danger"
            onClick={(e) => {
              stop(e);
              toggleLike(tweet.id);
            }}
          />
          <ActionButton
            icon={BarChart3}
            count={tweet.views}
            colorClass="hover:text-accent hover:bg-hover-blue"
            onClick={stop}
          />
          <div className="flex items-center">
            <button
              onClick={(e) => {
                stop(e);
                toggleBookmark(tweet.id);
              }}
              className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-hover-blue hover:text-accent ${
                tweet.bookmarked ? "text-accent" : "text-text-secondary"
              }`}
              aria-label="Bookmark"
            >
              <Bookmark
                className="h-[18px] w-[18px]"
                fill={tweet.bookmarked ? "currentColor" : "none"}
              />
            </button>
            <button
              onClick={stop}
              className="flex h-8 w-8 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover-blue hover:text-accent"
              aria-label="Share"
            >
              <Share className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ActionButton({
  icon: Icon,
  count,
  active,
  fillWhenActive,
  colorClass,
  activeColorClass = "text-accent",
  onClick,
}: {
  icon: typeof MessageCircle;
  count: number;
  active?: boolean;
  fillWhenActive?: boolean;
  colorClass: string;
  activeColorClass?: string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-1 rounded-full transition-colors ${
        active ? activeColorClass : "text-text-secondary"
      } ${colorClass}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-full transition-colors group-hover:bg-current/10">
        <Icon
          className={`h-[18px] w-[18px] ${active ? "animate-like-pop" : ""}`}
          fill={active && fillWhenActive ? "currentColor" : "none"}
        />
      </span>
      {count > 0 && <span className="-ml-1 text-[13px]">{formatCount(count)}</span>}
    </button>
  );
}
