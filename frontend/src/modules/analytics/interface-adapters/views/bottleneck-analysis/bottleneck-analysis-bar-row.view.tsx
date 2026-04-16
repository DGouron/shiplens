import { type BottleneckRowViewModel } from '../../presenters/bottleneck-analysis.view-model.schema.ts';

interface BottleneckAnalysisBarRowViewProps {
  row: BottleneckRowViewModel;
}

export function BottleneckAnalysisBarRowView({
  row,
}: BottleneckAnalysisBarRowViewProps) {
  const className = row.isBottleneck
    ? 'bottleneck-bar-row bottleneck-bar-row--highlighted'
    : 'bottleneck-bar-row';

  return (
    <div className={className}>
      <span className="bottleneck-bar-label">{row.statusName}</span>
      <div className="bottleneck-bar-track">
        <div
          className="bottleneck-bar-fill"
          style={{ width: `${row.barWidthPercent}%` }}
        />
      </div>
      <span className="bottleneck-bar-value">{row.medianHoursLabel}</span>
    </div>
  );
}
