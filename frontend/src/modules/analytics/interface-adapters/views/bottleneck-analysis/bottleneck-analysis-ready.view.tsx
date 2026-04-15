import { type BottleneckAnalysisTranslations } from '../../presenters/bottleneck-analysis.translations.ts';
import { type BottleneckAnalysisViewModel } from '../../presenters/bottleneck-analysis.view-model.schema.ts';
import { BottleneckAnalysisTableView } from './bottleneck-analysis-table.view.tsx';

interface BottleneckAnalysisReadyViewProps {
  viewModel: BottleneckAnalysisViewModel;
  translations: BottleneckAnalysisTranslations;
}

export function BottleneckAnalysisReadyView({
  viewModel,
  translations,
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
        <BottleneckAnalysisTableView
          rows={viewModel.rows}
          statusHeader={translations.tableHeaderStatus}
          medianHeader={translations.tableHeaderMedianTime}
          bottleneckRowLabel={translations.bottleneckRowLabel}
        />
      )}
    </div>
  );
}
