import { type BottleneckRowViewModel } from '../../presenters/bottleneck-analysis.view-model.schema.ts';
import { BottleneckAnalysisRowView } from './bottleneck-analysis-row.view.tsx';

interface BottleneckAnalysisTableViewProps {
  rows: BottleneckRowViewModel[];
  statusHeader: string;
  medianHeader: string;
  bottleneckRowLabel: string;
}

export function BottleneckAnalysisTableView({
  rows,
  statusHeader,
  medianHeader,
  bottleneckRowLabel,
}: BottleneckAnalysisTableViewProps) {
  return (
    <table className="bottleneck-analysis-table">
      <thead>
        <tr>
          <th scope="col">{statusHeader}</th>
          <th scope="col">{medianHeader}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <BottleneckAnalysisRowView
            key={row.statusName}
            row={row}
            bottleneckRowLabel={bottleneckRowLabel}
          />
        ))}
      </tbody>
    </table>
  );
}
