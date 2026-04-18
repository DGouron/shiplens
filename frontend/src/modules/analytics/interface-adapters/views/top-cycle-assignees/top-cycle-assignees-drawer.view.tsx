import { type CycleAssigneeIssuesDrawerViewModel } from '../../presenters/cycle-assignee-issues-drawer.view-model.schema.ts';
import { CycleInsightDrawerView } from '../cycle-insight-drawer/cycle-insight-drawer.view.tsx';
import { CycleInsightDrawerIssueRowView } from '../cycle-insight-drawer/cycle-insight-drawer-issue-row.view.tsx';

interface TopCycleAssigneesDrawerViewProps {
  viewModel: CycleAssigneeIssuesDrawerViewModel;
  onClose: () => void;
}

export function TopCycleAssigneesDrawerView({
  viewModel,
  onClose,
}: TopCycleAssigneesDrawerViewProps) {
  return (
    <CycleInsightDrawerView
      isOpen={viewModel.isOpen}
      title={viewModel.title}
      closeLabel={viewModel.closeLabel}
      onClose={onClose}
    >
      {viewModel.showLoading && viewModel.loadingMessage && (
        <p className="top-cycle-assignees-drawer__loading">
          {viewModel.loadingMessage}
        </p>
      )}
      {viewModel.showError && viewModel.errorMessage && (
        <p className="top-cycle-assignees-drawer__error">
          {viewModel.errorMessage}
        </p>
      )}
      {viewModel.showEmptyMessage && viewModel.emptyMessage && (
        <p className="top-cycle-assignees-drawer__empty" role="status">
          {viewModel.emptyMessage}
        </p>
      )}
      {viewModel.showIssues && (
        <ul className="top-cycle-assignees-drawer__list">
          {viewModel.issueRows.map((issue) => (
            <CycleInsightDrawerIssueRowView
              key={issue.externalId}
              title={issue.title}
              pointsLabel={issue.pointsLabel}
              cycleTimeLabel={issue.cycleTimeLabel}
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
