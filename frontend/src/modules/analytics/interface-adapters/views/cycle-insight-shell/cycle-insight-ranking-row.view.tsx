interface CycleInsightRankingRowViewProps {
  label: string;
  metricValueLabel: string;
  onClick: () => void;
  testId?: string;
}

export function CycleInsightRankingRowView({
  label,
  metricValueLabel,
  onClick,
  testId,
}: CycleInsightRankingRowViewProps) {
  return (
    <button
      type="button"
      className="cycle-insight-ranking-row"
      onClick={onClick}
      data-testid={testId}
    >
      <span className="cycle-insight-ranking-row__label">{label}</span>
      <span className="cycle-insight-ranking-row__value">
        {metricValueLabel}
      </span>
    </button>
  );
}
