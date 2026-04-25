import { type MouseEvent } from 'react';
import { type BlockedIssueItemViewModel } from '../../presenters/blocked-issues.view-model.schema.ts';

interface BlockedIssueItemViewProps {
  item: BlockedIssueItemViewModel;
  onMemberClick: (memberName: string) => void;
}

export function BlockedIssueItemView({
  item,
  onMemberClick,
}: BlockedIssueItemViewProps) {
  const handleMemberClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (item.assigneeName === null) return;
    onMemberClick(item.assigneeName);
  };

  return (
    <li
      className={`blocked-issues-item blocked-issues-item--${item.severityLevel}`}
    >
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
      {item.showMemberLink && (
        <a
          className="blocked-issues-member-link"
          href={item.memberHealthTrendsHref ?? '#'}
          onClick={handleMemberClick}
        >
          {item.assigneeLabel}
        </a>
      )}
    </li>
  );
}
