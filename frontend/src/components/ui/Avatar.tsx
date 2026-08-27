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
  user: Partial<Pick<User, "avatarColor">> & Pick<User, "name" | "handle">;
  size?: keyof typeof SIZES;
  className?: string;
}) {
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
