import { type TopCycleThemesViewModel } from '../../presenters/top-cycle-themes.view-model.schema.ts';
import { CycleInsightEmptyStateView } from '../cycle-insight-shell/cycle-insight-empty-state.view.tsx';
import { CycleInsightRankingRowView } from '../cycle-insight-shell/cycle-insight-ranking-row.view.tsx';

interface TopCycleThemesReadyViewProps {
  viewModel: TopCycleThemesViewModel;
  onRowClick: (themeName: string) => void;
}

export function TopCycleThemesReadyView({
  viewModel,
  onRowClick,
}: TopCycleThemesReadyViewProps) {
  return (
    <div className="top-cycle-themes-content">
      {viewModel.showEmptyMessage && viewModel.emptyMessage && (
        <CycleInsightEmptyStateView
          message={viewModel.emptyMessage}
          tone={viewModel.emptyTone}
        />
      )}
      {viewModel.showRows && (
        <ul className="top-cycle-themes-list">
          {viewModel.rankingRows.map((row) => (
            <li key={row.themeName}>
              <CycleInsightRankingRowView
                label={row.themeName}
                metricValueLabel={row.metricValueLabel}
                onClick={() => onRowClick(row.themeName)}
                testId="top-cycle-themes-row"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
