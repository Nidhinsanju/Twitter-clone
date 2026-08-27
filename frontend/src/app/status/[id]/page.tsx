"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Heart, MessageCircle, Repeat2 } from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import { useFeed } from "@/context/FeedContext";
import { useAuth } from "@/context/AuthContext";
import { api, API_URL, ApiError } from "@/lib/api";
import { formatFullDate, formatTimeAgo } from "@/lib/format";
import type { Tweet } from "@/lib/types";

export default function StatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { tweets, toggleLike, toggleRetweet, addReply } = useFeed();
  const { user } = useAuth();

  const fromFeed = tweets.find((t) => t.id === id);
  const [fetchedTweet, setFetchedTweet] = useState<Tweet | null>(null);
  // The feed/list endpoints don't ship each post's full reply thread (that
  // wouldn't scale — see backend/routes/tweets.routes.js), so this page
  // always fetches the single-post detail itself for repliesList, and
  // otherwise prefers the feed's copy (kept fresh by optimistic like/retweet
  // updates) for everything else.
  const tweet = fromFeed ?? fetchedTweet;
  const repliesList = fetchedTweet?.repliesList ?? [];
  const [notFound, setNotFound] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getTweet(id)
      .then(({ tweet }) => setFetchedTweet(tweet))
      .catch(() => setNotFound(true));
  }, [id]);

  async function submitReply() {
    if (!replyText.trim() || posting) return;
    setPosting(true);
    setError("");
    try {
      await addReply(id, replyText.trim());
      const { tweet: fresh } = await api.getTweet(id);
      setFetchedTweet(fresh);
      setReplyText("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't post reply");
    } finally {
      setPosting(false);
    }
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-2 px-8 py-24 text-center">
        <p className="text-3xl font-extrabold">This post doesn&apos;t exist</p>
        <button onClick={() => router.push("/")} className="text-accent hover:underline">
          Go back home
        </button>
      </div>
    );
  }

  if (!tweet) {
    return <div className="px-4 py-8 text-center text-text-secondary">Loading…</div>;
  }

  const author = tweet.author;

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-6 border-b border-border bg-bg/80 px-4 py-2 backdrop-blur-md">
        <button
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <p className="text-xl font-extrabold">Post</p>
      </div>

      {author && (
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/profile/${author.handle}`}>
              <Avatar user={author} size="md" />
            </Link>
            <div className="min-w-0">
              <Link href={`/profile/${author.handle}`} className="block truncate font-bold hover:underline">
                {author.name}
              </Link>
              <p className="truncate text-[15px] text-text-secondary">@{author.handle}</p>
            </div>
          </div>

          <p className="mt-3 whitespace-pre-wrap break-words text-[20px] leading-normal">
            {tweet.content}
          </p>

          {tweet.imageUrl ? (
            <div className="mt-3 w-full overflow-hidden rounded-2xl border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element -- served from the API origin, not optimizable by next/image */}
              <img src={`${API_URL}${tweet.imageUrl}`} alt="" className="w-full object-cover" />
            </div>
          ) : (
            tweet.imageGradient && (
              <div
                className="mt-3 aspect-video w-full overflow-hidden rounded-2xl border border-border"
                style={{ background: tweet.imageGradient }}
              />
            )
          )}

          <p className="mt-3 text-[15px] text-text-secondary" suppressHydrationWarning>
            {formatFullDate(tweet.createdAt)}
          </p>

          <div className="mt-3 flex gap-4 border-y border-border py-3 text-[15px]">
            <span>
              <span className="font-bold">{tweet.retweets}</span>{" "}
              <span className="text-text-secondary">Reposts</span>
            </span>
            <span>
              <span className="font-bold">{tweet.likes}</span>{" "}
              <span className="text-text-secondary">Likes</span>
            </span>
          </div>

          <div className="flex max-w-xs items-center justify-between py-1 text-text-secondary">
            <button
              onClick={() => document.getElementById("reply-box")?.focus()}
              className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover-blue hover:text-accent"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleRetweet(tweet.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[rgba(0,186,124,0.1)] hover:text-success ${
                tweet.retweeted ? "text-success" : ""
              }`}
            >
              <Repeat2 className="h-5 w-5" />
            </button>
            <button
              onClick={() => toggleLike(tweet.id)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-danger-hover hover:text-danger ${
                tweet.liked ? "text-danger" : ""
              }`}
            >
              <Heart className="h-5 w-5" fill={tweet.liked ? "currentColor" : "none"} />
            </button>
          </div>
        </div>
      )}

      {user && (
        <div className="flex gap-3 border-b border-border px-4 py-3">
          <Avatar user={user} size="md" />
          <div className="min-w-0 flex-1">
            <textarea
              id="reply-box"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={author ? `Post your reply to @${author.handle}` : "Post your reply"}
              rows={2}
              className="w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-text-secondary"
            />
            {error && <p className="mb-2 text-[13px] text-danger">{error}</p>}
            <div className="flex justify-end">
              <button
                onClick={submitReply}
                disabled={!replyText.trim() || posting}
                className="rounded-full bg-accent px-4 py-1.5 text-[14px] font-bold text-white transition-colors enabled:hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {repliesList.length === 0 ? (
        <p className="px-4 py-8 text-center text-text-secondary">No replies yet.</p>
      ) : (
        repliesList.map((reply) => (
          <div key={reply.id} className="flex gap-3 border-b border-border px-4 py-3">
            {reply.author ? (
              <>
                <Link href={`/profile/${reply.author.handle}`} className="shrink-0">
                  <Avatar user={reply.author} size="md" />
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 text-[15px]">
                    <Link
                      href={`/profile/${reply.author.handle}`}
                      className="truncate font-bold hover:underline"
                    >
                      {reply.author.name}
                    </Link>
                    <span className="shrink-0 truncate text-text-secondary">
                      @{reply.author.handle}
                    </span>
                    <span className="shrink-0 text-text-secondary">·</span>
                    <span className="shrink-0 text-text-secondary" suppressHydrationWarning>
                      {formatTimeAgo(reply.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-[15px]">{reply.content}</p>
                </div>
              </>
            ) : (
              <p className="text-text-secondary">{reply.content}</p>
            )}
          </div>
        ))
      )}
    </div>
  );
}

