const MAX = 280;
const WARN_AT = 260;

export default function CharCountRing({ length }: { length: number }) {
  const remaining = MAX - length;
  const over = remaining < 0;
  const pct = Math.min(length / MAX, 1);
  const radius = 9;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);
  const showNumber = length > WARN_AT || over;

  const color = over
    ? "var(--color-danger)"
    : length > WARN_AT
      ? "#ffd400"
      : "var(--color-accent)";

  return (
    <div className="flex items-center gap-2">
      {showNumber && (
        <span
          className={`text-[13px] tabular-nums ${over ? "text-danger" : "text-text-secondary"}`}
        >
          {remaining}
        </span>
      )}
      <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90">
        <circle
          cx="11"
          cy="11"
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="2"
        />
        <circle
          cx="11"
          cy="11"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
