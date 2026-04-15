import { type BlockedIssueItemViewModel } from '../../presenters/blocked-issues.view-model.schema.ts';

interface BlockedIssueItemViewProps {
  item: BlockedIssueItemViewModel;
}

export function BlockedIssueItemView({ item }: BlockedIssueItemViewProps) {
  return (
    <li className="blocked-issues-item">
      <a
        className="blocked-issues-link"
        href={item.issueUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {item.issueTitle}
      </a>
      <span className="blocked-issues-status">{item.statusName}</span>
      <span className="blocked-issues-severity">{item.severityLabel}</span>
      <span className="blocked-issues-duration">{item.durationLabel}</span>
    </li>
  );
}
