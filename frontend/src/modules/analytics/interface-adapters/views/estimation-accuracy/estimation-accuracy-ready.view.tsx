import { type EstimationAccuracyTranslations } from '../../presenters/estimation-accuracy.translations.ts';
import { type EstimationAccuracyViewModel } from '../../presenters/estimation-accuracy.view-model.schema.ts';
import { EstimationDonutView } from './estimation-donut.view.tsx';
import { EstimationExclusionsView } from './estimation-exclusions.view.tsx';
import { EstimationTeamScoreView } from './estimation-team-score.view.tsx';

interface EstimationAccuracyReadyViewProps {
  viewModel: EstimationAccuracyViewModel;
  translations: EstimationAccuracyTranslations;
}

export function EstimationAccuracyReadyView({
  viewModel,
  translations,
}: EstimationAccuracyReadyViewProps) {
  return (
    <div className="estimation-accuracy-content">
      {viewModel.showEmptyMessage && (
        <p className="estimation-accuracy-empty" role="status">
          {viewModel.emptyMessage}
        </p>
      )}
      {viewModel.showContent && <EstimationDonutView donut={viewModel.donut} />}
      {viewModel.showContent && (
        <EstimationTeamScoreView
          teamScore={viewModel.teamScore}
          heading={translations.teamScoreHeading}
        />
      )}
      <EstimationExclusionsView viewModel={viewModel} />
    </div>
  );
}
