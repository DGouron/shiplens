import { type BottleneckRowViewModel } from '../../presenters/bottleneck-analysis.view-model.schema.ts';

interface BottleneckAnalysisRowViewProps {
  row: BottleneckRowViewModel;
  bottleneckRowLabel: string;
}

export function BottleneckAnalysisRowView({
  row,
  bottleneckRowLabel,
}: BottleneckAnalysisRowViewProps) {
  const className = row.isBottleneck
    ? 'bottleneck-analysis-row bottleneck-analysis-row--highlighted'
    : 'bottleneck-analysis-row';
  const highlightedProps = row.isBottleneck
    ? { 'aria-label': bottleneckRowLabel }
    : {};
  return (
    <tr className={className} {...highlightedProps}>
      <td>{row.statusName}</td>
      <td>{row.medianHoursLabel}</td>
    </tr>
  );
}
