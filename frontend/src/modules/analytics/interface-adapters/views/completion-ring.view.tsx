interface CompletionRingViewProps {
  completionPercentage: number;
  strokeColor: string;
  dashOffset: number;
}

export function CompletionRingView({
  completionPercentage,
  strokeColor,
  dashOffset,
}: CompletionRingViewProps) {
  return (
    <div className="completion-ring">
      <svg
        viewBox="0 0 36 36"
        width="52"
        height="52"
        role="img"
        aria-label={`Cycle completion ${completionPercentage} percent`}
      >
        <title>{`Cycle completion ${completionPercentage}%`}</title>
        <circle
          className="ring-bg"
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          strokeWidth="2.8"
        />
        <circle
          className="ring-fg"
          cx="18"
          cy="18"
          r="15.9"
          fill="none"
          stroke={strokeColor}
          strokeWidth="2.8"
          strokeDasharray="100"
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          transform="rotate(-90 18 18)"
        />
        <text
          className="ring-text"
          x="18"
          y="18"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="8"
        >
          {completionPercentage}%
        </text>
      </svg>
    </div>
  );
}
