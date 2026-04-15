import { type IdleTeamCardViewModel } from '../presenters/dashboard.view-model.schema.ts';

interface TeamCardIdleViewProps {
  team: IdleTeamCardViewModel;
}

export function TeamCardIdleView({ team }: TeamCardIdleViewProps) {
  return (
    <div className="team-card team-card--idle">
      <div className="team-name">{team.teamName}</div>
      <div className="no-cycle">
        <svg
          className="no-cycle-icon"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="No active cycle"
        >
          <title>No active cycle</title>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
        <span className="no-cycle-text">{team.noActiveCycleMessage}</span>
      </div>
    </div>
  );
}
