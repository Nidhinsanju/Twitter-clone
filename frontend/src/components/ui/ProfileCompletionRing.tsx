export default function ProfileCompletionRing({
  percent,
  size = 44,
}: {
  percent: number;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - 4) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);
  const complete = clamped === 100;
  const color = complete ? "var(--color-success)" : "var(--color-accent)";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth="3"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-[11px] font-bold tabular-nums"
        style={{ color }}
      >
        {clamped}%
      </span>
    </div>
  );
}
