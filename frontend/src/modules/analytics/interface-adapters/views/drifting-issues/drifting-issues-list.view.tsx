import { type DriftingIssueRowViewModel } from '../../presenters/drifting-issues.view-model.schema.ts';
import { DriftingIssueItemView } from './drifting-issue-item.view.tsx';

interface DriftingIssuesListViewProps {
  rows: DriftingIssueRowViewModel[];
  onMemberClick: (memberName: string) => void;
}

export function DriftingIssuesListView({
  rows,
  onMemberClick,
}: DriftingIssuesListViewProps) {
  return (
    <ul className="drifting-issues-list">
      {rows.map((row) => (
        <DriftingIssueItemView
          key={row.id}
          row={row}
          onMemberClick={onMemberClick}
        />
      ))}
    </ul>
  );
}
