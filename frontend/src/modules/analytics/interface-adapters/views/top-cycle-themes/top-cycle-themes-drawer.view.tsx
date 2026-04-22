import { type CycleThemeIssuesDrawerViewModel } from '../../presenters/cycle-theme-issues-drawer.view-model.schema.ts';
import { CycleInsightDrawerView } from '../cycle-insight-drawer/cycle-insight-drawer.view.tsx';
import { CycleInsightDrawerIssueRowView } from '../cycle-insight-drawer/cycle-insight-drawer-issue-row.view.tsx';

interface TopCycleThemesDrawerViewProps {
  viewModel: CycleThemeIssuesDrawerViewModel;
  onClose: () => void;
}

export function TopCycleThemesDrawerView({
  viewModel,
  onClose,
}: TopCycleThemesDrawerViewProps) {
  return (
    <CycleInsightDrawerView
      isOpen={viewModel.isOpen}
      title={viewModel.title}
      closeLabel={viewModel.closeLabel}
      onClose={onClose}
    >
      {viewModel.showLoading && viewModel.loadingMessage && (
        <p className="top-cycle-themes-drawer__loading">
          {viewModel.loadingMessage}
        </p>
      )}
      {viewModel.showError && viewModel.errorMessage && (
        <p className="top-cycle-themes-drawer__error">
          {viewModel.errorMessage}
        </p>
      )}
      {viewModel.showEmptyMessage && viewModel.emptyMessage && (
        <p className="top-cycle-themes-drawer__empty" role="status">
          {viewModel.emptyMessage}
        </p>
      )}
      {viewModel.showIssues && (
        <ul className="top-cycle-themes-drawer__list">
          {viewModel.issueRows.map((issue) => (
            <CycleInsightDrawerIssueRowView
              key={issue.externalId}
              title={issue.title}
              assigneeLabel={issue.assigneeLabel}
              pointsLabel={issue.pointsLabel}
              statusName={issue.statusName}
              linearUrl={issue.linearUrl}
              linearLinkLabel={issue.linearLinkLabel}
            />
          ))}
        </ul>
      )}
    </CycleInsightDrawerView>
  );
}
