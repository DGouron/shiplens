import { type EstimationAccuracyViewModel } from '../../presenters/estimation-accuracy.view-model.schema.ts';

interface EstimationExclusionsViewProps {
  viewModel: EstimationAccuracyViewModel;
}

export function EstimationExclusionsView({
  viewModel,
}: EstimationExclusionsViewProps) {
  return (
    <ul className="estimation-accuracy-exclusions">
      {viewModel.showExclusionWithoutEstimation && (
        <li className="estimation-accuracy-exclusion estimation-accuracy-exclusion--no-estimation">
          {viewModel.exclusions.withoutEstimation.label}
        </li>
      )}
      {viewModel.showExclusionWithoutCycleTime && (
        <li className="estimation-accuracy-exclusion estimation-accuracy-exclusion--no-cycle-time">
          {viewModel.exclusions.withoutCycleTime.label}
        </li>
      )}
    </ul>
  );
}
