import { type EstimationAccuracyViewModel } from '../../presenters/estimation-accuracy.view-model.schema.ts';
import { EstimationDiagnosisView } from './estimation-diagnosis.view.tsx';
import { EstimationDonutView } from './estimation-donut.view.tsx';
import { EstimationExclusionsView } from './estimation-exclusions.view.tsx';

interface EstimationAccuracyReadyViewProps {
  viewModel: EstimationAccuracyViewModel;
}

export function EstimationAccuracyReadyView({
  viewModel,
}: EstimationAccuracyReadyViewProps) {
  return (
    <div className="estimation-accuracy-content">
      {viewModel.showEmptyMessage && (
        <p className="estimation-accuracy-empty" role="status">
          {viewModel.emptyMessage}
        </p>
      )}
      {viewModel.showContent && (
        <EstimationDiagnosisView diagnosis={viewModel.diagnosis} />
      )}
      {viewModel.showContent && <EstimationDonutView donut={viewModel.donut} />}
      <EstimationExclusionsView viewModel={viewModel} />
    </div>
  );
}
