import { type TopCycleAssigneesViewModel } from '../../presenters/top-cycle-assignees.view-model.schema.ts';
import { CycleInsightEmptyStateView } from '../cycle-insight-shell/cycle-insight-empty-state.view.tsx';
import { CycleInsightRankingRowView } from '../cycle-insight-shell/cycle-insight-ranking-row.view.tsx';

interface TopCycleAssigneesReadyViewProps {
  viewModel: TopCycleAssigneesViewModel;
  onRowClick: (assigneeName: string) => void;
}

export function TopCycleAssigneesReadyView({
  viewModel,
  onRowClick,
}: TopCycleAssigneesReadyViewProps) {
  return (
    <div className="top-cycle-assignees-content">
      {viewModel.showEmptyMessage && viewModel.emptyMessage && (
        <CycleInsightEmptyStateView message={viewModel.emptyMessage} />
      )}
      {viewModel.showRows && (
        <ul className="top-cycle-assignees-list">
          {viewModel.rankingRows.map((row) => (
            <li key={row.assigneeName}>
              <CycleInsightRankingRowView
                label={row.assigneeName}
                metricValueLabel={row.metricValueLabel}
                onClick={() => onRowClick(row.assigneeName)}
                testId="top-cycle-assignees-row"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
