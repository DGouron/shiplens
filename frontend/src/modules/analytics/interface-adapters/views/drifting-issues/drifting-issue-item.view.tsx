import { type DriftingIssueRowViewModel } from '../../presenters/drifting-issues.view-model.schema.ts';

interface DriftingIssueItemViewProps {
  row: DriftingIssueRowViewModel;
}

export function DriftingIssueItemView({ row }: DriftingIssueItemViewProps) {
  return (
    <li className="drifting-issues-item">
      <a
        className="drifting-issues-link"
        href={row.issueUrl}
        target="_blank"
        rel="noopener noreferrer"
      >
        {row.title}
      </a>
      <span className="drifting-issues-status">{row.statusName}</span>
      <span className="drifting-issues-drift">{row.driftLabel}</span>
      <span className="drifting-issues-elapsed">{row.elapsedLabel}</span>
      <span className="drifting-issues-expected">{row.expectedLabel}</span>
      <span className="drifting-issues-points">{row.pointsLabel}</span>
    </li>
  );
}
