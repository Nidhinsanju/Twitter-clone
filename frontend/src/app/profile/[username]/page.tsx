"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Link as LinkIcon,
  MapPin,
} from "lucide-react";
import Avatar from "@/components/ui/Avatar";
import FollowButton from "@/components/ui/FollowButton";
import TweetList from "@/components/tweet/TweetList";
import EditProfileModal from "@/components/profile/EditProfileModal";
import ProfileCompletionCard from "@/components/profile/ProfileCompletionCard";
import { api, API_URL } from "@/lib/api";
import { useFeed } from "@/context/FeedContext";
import type { Tweet, User } from "@/lib/types";

const TABS = ["Posts", "Replies", "Media", "Likes"] as const;

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { tweets: feedTweets } = useFeed();
  const [profile, setProfile] = useState<User | null>(null);
  const [userTweets, setUserTweets] = useState<Tweet[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<(typeof TABS)[number]>("Posts");

  useEffect(() => {
    // Reset and reload whenever the viewed username changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setNotFound(false);
    Promise.all([api.getUser(username), api.getUserTweets(username)])
      .then(([{ user }, { tweets }]) => {
        setProfile(user);
        setUserTweets(tweets);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [username]);

  if (notFound) {
    return (
      <div className="flex flex-col items-center gap-2 px-8 py-24 text-center">
        <p className="text-3xl font-extrabold">This account doesn&apos;t exist</p>
        <p className="text-text-secondary">Try searching for another.</p>
      </div>
    );
  }

  if (loading || !profile) {
    return <div className="px-4 py-8 text-center text-text-secondary">Loading…</div>;
  }

  const repliesFromUser = feedTweets
    .flatMap((t) =>
      t.repliesList
        .filter((r) => r.author?.handle === profile.handle)
        .map((r) => ({ parent: t, reply: r }))
    );

  const visibleTweets =
    tab === "Posts"
      ? userTweets
      : tab === "Likes"
        ? profile.isMe
          ? feedTweets.filter((t) => t.liked)
          : []
        : tab === "Media"
          ? userTweets.filter((t) => t.imageUrl || t.imageGradient)
          : [];

  return (
    <div>
      {editing && (
        <EditProfileModal
          user={profile}
          onClose={() => setEditing(false)}
          onSaved={(updated) => setProfile(updated)}
        />
      )}

      <div className="sticky top-0 z-10 flex items-center gap-6 border-b border-border bg-bg/80 px-4 py-2 backdrop-blur-md">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-hover"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="text-xl font-extrabold leading-tight">{profile.name}</p>
          <p className="text-[13px] text-text-secondary">
            {userTweets.length} {userTweets.length === 1 ? "post" : "posts"}
          </p>
        </div>
      </div>

      <div
        className="h-[200px] w-full bg-cover bg-center"
        style={
          profile.bannerUrl
            ? { backgroundImage: `url(${API_URL}${profile.bannerUrl})` }
            : { background: profile.banner }
        }
      />

      <div className="px-4">
        <div className="flex items-end justify-between">
          <Avatar user={profile} size="xl" className="-mt-11" />
          <div className="mt-3 flex items-center gap-2">
            {profile.isMe ? (
              <button
                onClick={() => setEditing(true)}
                className="rounded-full border border-border px-4 py-1.5 text-[15px] font-bold transition-colors hover:bg-hover"
              >
                Edit profile
              </button>
            ) : (
              <FollowButton
                handle={profile.handle}
                initialFollowing={profile.isFollowedByMe}
                onChange={(following) =>
                  setProfile((p) =>
                    p
                      ? {
                          ...p,
                          isFollowedByMe: following,
                          followersCount: p.followersCount + (following ? 1 : -1),
                        }
                      : p
                  )
                }
              />
            )}
          </div>
        </div>

        <div className="mt-3">
          <p className="text-xl font-extrabold">{profile.name}</p>
          <p className="text-[15px] text-text-secondary">@{profile.handle}</p>
        </div>

        {profile.bio && <p className="mt-3 text-[15px]">{profile.bio}</p>}

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[15px] text-text-secondary">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-[18px] w-[18px]" />
              {profile.location}
            </span>
          )}
          {profile.website && (
            <span className="flex items-center gap-1 text-accent">
              <LinkIcon className="h-[18px] w-[18px]" />
              {profile.website}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-[18px] w-[18px]" />
            Joined{" "}
            {new Date(profile.joinedAt).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="mt-3 flex gap-5 text-[15px]">
          <span>
            <span className="font-bold">{profile.followingCount.toLocaleString()}</span>{" "}
            <span className="text-text-secondary">Following</span>
          </span>
          <span>
            <span className="font-bold">{profile.followersCount.toLocaleString()}</span>{" "}
            <span className="text-text-secondary">Followers</span>
          </span>
          {profile.isMe && (
            <span>
              <span className="font-bold">{(profile.points ?? 0).toLocaleString()}</span>{" "}
              <span className="text-text-secondary">Points</span>
            </span>
          )}
        </div>

        {profile.isMe && profile.profileCompletion && profile.profileCompletion.percent < 100 && (
          <div className="mt-4">
            <ProfileCompletionCard completion={profile.profileCompletion} compact />
          </div>
        )}
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

      {tab === "Replies" ? (
        repliesFromUser.length === 0 ? (
          <p className="px-8 py-16 text-center text-text-secondary">No replies yet.</p>
        ) : (
          repliesFromUser.map(({ parent, reply }) => (
            <Link
              key={reply.id}
              href={`/status/${parent.id}`}
              className="block border-b border-border px-4 py-3 hover:bg-hover/40"
            >
              <p className="text-[13px] text-text-secondary">
                Replying to @{parent.author?.handle}
              </p>
              <p className="text-[15px]">{reply.content}</p>
            </Link>
          ))
        )
      ) : tab === "Likes" && !profile.isMe ? (
        <p className="px-8 py-16 text-center text-text-secondary">
          @{profile.handle}&apos;s likes aren&apos;t public.
        </p>
      ) : (
        <TweetList tweets={visibleTweets} />
      )}
    </div>
  );
}
