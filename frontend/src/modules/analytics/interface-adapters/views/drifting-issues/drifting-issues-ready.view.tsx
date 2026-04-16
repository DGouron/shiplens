import { type DriftingIssuesViewModel } from '../../presenters/drifting-issues.view-model.schema.ts';
import { DriftingIssuesListView } from './drifting-issues-list.view.tsx';

interface DriftingIssuesReadyViewProps {
  viewModel: DriftingIssuesViewModel;
  onMemberClick: (memberName: string) => void;
}

export function DriftingIssuesReadyView({
  viewModel,
  onMemberClick,
}: DriftingIssuesReadyViewProps) {
  return (
    <div className="drifting-issues-content">
      {viewModel.showEmptyMessage && (
        <p className="drifting-issues-empty" role="status">
          {viewModel.emptyMessage}
        </p>
      )}
      {viewModel.showList && (
        <DriftingIssuesListView
          rows={viewModel.rows}
          onMemberClick={onMemberClick}
        />
      )}
    </div>
  );
}
