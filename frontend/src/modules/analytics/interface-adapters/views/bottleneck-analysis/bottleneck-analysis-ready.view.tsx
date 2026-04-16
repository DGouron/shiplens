import { type BottleneckAnalysisViewModel } from '../../presenters/bottleneck-analysis.view-model.schema.ts';
import { BottleneckAnalysisBarRowView } from './bottleneck-analysis-bar-row.view.tsx';

interface BottleneckAnalysisReadyViewProps {
  viewModel: BottleneckAnalysisViewModel;
}

export function BottleneckAnalysisReadyView({
  viewModel,
}: BottleneckAnalysisReadyViewProps) {
  return (
    <div className="bottleneck-analysis-content">
      <p className="bottleneck-analysis-headline">
        {viewModel.bottleneckHeadline}
      </p>
      {viewModel.showEmptyMessage && (
        <p className="bottleneck-analysis-empty">{viewModel.emptyMessage}</p>
      )}
      {viewModel.showTable && (
        <div className="bottleneck-analysis-bars">
          {viewModel.rows.map((row) => (
            <BottleneckAnalysisBarRowView key={row.statusName} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}
