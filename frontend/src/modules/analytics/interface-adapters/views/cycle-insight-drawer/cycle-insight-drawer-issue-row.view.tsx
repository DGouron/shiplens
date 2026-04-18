interface CycleInsightDrawerIssueRowViewProps {
  title: string;
  assigneeLabel?: string;
  pointsLabel: string;
  cycleTimeLabel?: string;
  statusName: string;
  linearUrl: string;
  linearLinkLabel: string;
}

export function CycleInsightDrawerIssueRowView({
  title,
  assigneeLabel,
  pointsLabel,
  cycleTimeLabel,
  statusName,
  linearUrl,
  linearLinkLabel,
}: CycleInsightDrawerIssueRowViewProps) {
  const showAssignee = assigneeLabel !== undefined;
  const showCycleTime = cycleTimeLabel !== undefined;
  return (
    <li className="cycle-insight-drawer-issue-row">
      <div className="cycle-insight-drawer-issue-row__title">{title}</div>
      <div className="cycle-insight-drawer-issue-row__meta">
        {showAssignee && (
          <span className="cycle-insight-drawer-issue-row__assignee">
            {assigneeLabel}
          </span>
        )}
        <span className="cycle-insight-drawer-issue-row__points">
          {pointsLabel}
        </span>
        {showCycleTime && (
          <span className="cycle-insight-drawer-issue-row__cycle-time">
            {cycleTimeLabel}
          </span>
        )}
        <span className="cycle-insight-drawer-issue-row__status">
          {statusName}
        </span>
        <a
          className="cycle-insight-drawer-issue-row__link"
          href={linearUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {linearLinkLabel}
        </a>
      </div>
    </li>
  );
}
