"use client";

import { useState } from "react";

export default function FollowButton({
  initialFollowing = false,
  size = "md",
}: {
  initialFollowing?: boolean;
  size?: "sm" | "md";
}) {
  const [following, setFollowing] = useState(initialFollowing);
  const [hovering, setHovering] = useState(false);

  const padding = size === "sm" ? "px-4 py-1.5 text-[13px]" : "px-4 py-1.5 text-[15px]";

  if (following) {
    return (
      <button
        onClick={() => setFollowing(false)}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        className={`shrink-0 rounded-full border font-bold transition-colors ${padding} ${
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
      onClick={() => setFollowing(true)}
      className={`shrink-0 rounded-full bg-text font-bold text-bg transition-opacity hover:opacity-90 ${padding}`}
    >
      Follow
    </button>
  );
}
