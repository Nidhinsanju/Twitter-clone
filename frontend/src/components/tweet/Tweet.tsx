"use client";

import Link from "next/link";
import {
  BadgeCheck,
  BarChart3,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Share,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { getUser } from "@/lib/mock-data";
import { formatCount, formatTimeAgo } from "@/lib/format";
import { useFeed } from "@/context/FeedContext";
import type { Tweet as TweetType } from "@/lib/types";

export default function Tweet({ tweet }: { tweet: TweetType }) {
  const author = getUser(tweet.authorId);
  const { toggleLike, toggleRetweet, toggleBookmark } = useFeed();

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <article className="flex gap-3 border-b border-border px-4 py-3 transition-colors hover:bg-hover/40">
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
            {author.verified && (
              <BadgeCheck className="h-[18px] w-[18px] shrink-0 fill-accent text-bg" />
            )}
            <span className="shrink-0 truncate text-text-secondary">
              @{author.handle}
            </span>
            <span className="shrink-0 text-text-secondary">·</span>
            <span className="shrink-0 whitespace-nowrap text-text-secondary">
              {formatTimeAgo(tweet.createdAt)}
            </span>
          </div>
          <button
            onClick={stop}
            className="-mr-2 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-hover-blue hover:text-accent"
            aria-label="More"
          >
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </button>
        </div>

        {tweet.replyingTo && (
          <p className="text-[15px] text-text-secondary">
            Replying to <span className="text-accent">@{tweet.replyingTo}</span>
          </p>
        )}

        <p className="whitespace-pre-wrap break-words text-[15px] leading-normal">
          {tweet.content}
        </p>

        {tweet.imageGradient && (
          <div
            className="mt-3 aspect-video w-full overflow-hidden rounded-2xl border border-border"
            style={{ background: tweet.imageGradient }}
          />
        )}

        <div className="mt-2 flex max-w-md items-center justify-between">
          <ActionButton
            icon={MessageCircle}
            count={tweet.replies}
            colorClass="hover:text-accent hover:bg-hover-blue"
            onClick={stop}
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
      className={`group flex items-center gap-1 rounded-full text-text-secondary transition-colors ${colorClass} ${
        active ? activeColorClass : ""
      }`}
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
