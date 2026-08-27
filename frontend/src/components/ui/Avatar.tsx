import { API_URL } from "@/lib/api";
import { colorFromString, initialsFromName } from "@/lib/format";
import type { User } from "@/lib/types";

const SIZES = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-[88px] w-[88px] text-2xl border-4 border-bg",
};

export default function Avatar({
  user,
  size = "md",
  className = "",
}: {
  user: Partial<Pick<User, "avatarColor" | "avatarUrl">> & Pick<User, "name" | "handle">;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  if (user.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- served from the API origin, not optimizable by next/image
      <img
        src={`${API_URL}${user.avatarUrl}`}
        alt=""
        className={`shrink-0 rounded-full object-cover select-none ${SIZES[size]} ${className}`}
      />
    );
  }

  const bg = user.avatarColor || colorFromString(user.handle || user.name);
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white select-none ${SIZES[size]} ${className}`}
      style={{ backgroundColor: bg }}
      aria-hidden
    >
      {initialsFromName(user.name)}
    </div>
  );
}
