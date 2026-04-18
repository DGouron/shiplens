import { type TopCycleProjectsViewModel } from '../../presenters/top-cycle-projects.view-model.schema.ts';
import { CycleInsightEmptyStateView } from '../cycle-insight-shell/cycle-insight-empty-state.view.tsx';
import { CycleInsightRankingRowView } from '../cycle-insight-shell/cycle-insight-ranking-row.view.tsx';

interface TopCycleProjectsReadyViewProps {
  viewModel: TopCycleProjectsViewModel;
  onRowClick: (projectId: string) => void;
  onToggleExpand: () => void;
}

export function TopCycleProjectsReadyView({
  viewModel,
  onRowClick,
  onToggleExpand,
}: TopCycleProjectsReadyViewProps) {
  return (
    <div className="top-cycle-projects-content">
      {viewModel.showEmptyMessage && viewModel.emptyMessage && (
        <CycleInsightEmptyStateView message={viewModel.emptyMessage} />
      )}
      {viewModel.showRows && (
        <ul className="top-cycle-projects-list">
          {viewModel.rankingRows.map((row) => (
            <li key={row.projectId}>
              <CycleInsightRankingRowView
                label={row.projectName}
                metricValueLabel={row.metricValueLabel}
                onClick={() => onRowClick(row.projectId)}
                testId="top-cycle-projects-row"
              />
            </li>
          ))}
        </ul>
      )}
      {viewModel.showExpandButton && (
        <button
          type="button"
          className="top-cycle-projects-expand"
          onClick={onToggleExpand}
        >
          {viewModel.expandLabel}
        </button>
      )}
    </div>
  );
}
