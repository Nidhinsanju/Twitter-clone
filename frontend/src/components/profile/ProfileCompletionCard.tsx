import { Check, Sparkles } from "lucide-react";
import ProfileCompletionRing from "@/components/ui/ProfileCompletionRing";
import type { ProfileCompletion } from "@/lib/types";

export default function ProfileCompletionCard({
  completion,
  rewardPoints,
  compact = false,
}: {
  completion: ProfileCompletion;
  /** Points earned for hitting 100% — shown in the pitch while incomplete. */
  rewardPoints?: number;
  compact?: boolean;
}) {
  const { percent, missing } = completion;
  const complete = percent === 100;

  return (
    <div className={compact ? "" : "rounded-2xl border border-border p-4"}>
      <div className="flex items-center gap-3">
        <ProfileCompletionRing percent={percent} />
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold">
            {complete ? "Profile complete" : "Complete your profile"}
          </p>
          {!complete && typeof rewardPoints === "number" && (
            <p className="flex items-center gap-1 text-[13px] text-text-secondary">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              Earn {rewardPoints} points at 100%
            </p>
          )}
          {complete && (
            <p className="flex items-center gap-1 text-[13px] text-success">
              <Check className="h-3.5 w-3.5" /> Reward claimed
            </p>
          )}
        </div>
      </div>

      {missing.length > 0 && (
        <ul className="mt-3 flex flex-col gap-1.5">
          {missing.map((field) => (
            <li key={field.key} className="flex items-center gap-2 text-[13px] text-text-secondary">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-border" />
              {field.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
