import { type BlockedIssuesViewModel } from '../../presenters/blocked-issues.view-model.schema.ts';
import { BlockedIssueItemView } from './blocked-issue-item.view.tsx';

interface BlockedIssuesReadyViewProps {
  viewModel: BlockedIssuesViewModel;
}

export function BlockedIssuesReadyView({
  viewModel,
}: BlockedIssuesReadyViewProps) {
  return (
    <div className="blocked-issues-content">
      {viewModel.showEmptyMessage && (
        <p className="blocked-issues-empty" role="status">
          {viewModel.emptyMessage}
        </p>
      )}
      {viewModel.showList && (
        <ul className="blocked-issues-list">
          {viewModel.items.map((item) => (
            <BlockedIssueItemView key={item.id} item={item} />
          ))}
        </ul>
      )}
    </div>
  );
}
