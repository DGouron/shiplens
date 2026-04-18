type MetricKey = 'count' | 'points' | 'time';

interface CycleInsightMetricToggleViewProps {
  activeMetric: MetricKey;
  countLabel: string;
  pointsLabel: string;
  timeLabel: string;
  onChange: (metric: MetricKey) => void;
}

export function CycleInsightMetricToggleView({
  activeMetric,
  countLabel,
  pointsLabel,
  timeLabel,
  onChange,
}: CycleInsightMetricToggleViewProps) {
  const metrics: { key: MetricKey; label: string }[] = [
    { key: 'count', label: countLabel },
    { key: 'points', label: pointsLabel },
    { key: 'time', label: timeLabel },
  ];

  return (
    <div className="cycle-insight-metric-toggle" role="tablist">
      {metrics.map((metric) => (
        <button
          key={metric.key}
          type="button"
          role="tab"
          aria-selected={metric.key === activeMetric}
          className={
            metric.key === activeMetric
              ? 'cycle-insight-metric-toggle__button cycle-insight-metric-toggle__button--active'
              : 'cycle-insight-metric-toggle__button'
          }
          onClick={() => onChange(metric.key)}
        >
          {metric.label}
        </button>
      ))}
    </div>
  );
}
