"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function FollowButton({
  handle,
  initialFollowing,
  size = "md",
  onChange,
}: {
  handle: string;
  initialFollowing: boolean;
  size?: "sm" | "md";
  onChange?: (following: boolean) => void;
}) {
  const { updateUser } = useAuth();
  const [following, setFollowing] = useState(initialFollowing);
  const [hovering, setHovering] = useState(false);
  const [busy, setBusy] = useState(false);

  const padding = size === "sm" ? "px-4 py-1.5 text-[13px]" : "px-4 py-1.5 text-[15px]";

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next); // optimistic
    try {
      if (next) {
        const { reward } = await api.follow(handle);
        if (reward?.awarded && reward.totalPoints !== null) {
          updateUser((prev) => (prev ? { ...prev, points: reward.totalPoints! } : prev));
        }
      } else {
        await api.unfollow(handle);
      }
      onChange?.(next);
    } catch {
      setFollowing(!next); // revert on failure
    } finally {
      setBusy(false);
    }
  }

  if (following) {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        disabled={busy}
        className={`shrink-0 rounded-full border font-bold transition-colors disabled:opacity-60 ${padding} ${
          hovering
            ? "border-danger bg-danger-hover text-danger"
            : "border-border bg-transparent text-text"
        }`}
      >
        {hovering ? "Unfollow" : "Following"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`shrink-0 rounded-full bg-text font-bold text-bg transition-opacity hover:opacity-90 disabled:opacity-60 ${padding}`}
    >
      Follow
    </button>
  );
}
