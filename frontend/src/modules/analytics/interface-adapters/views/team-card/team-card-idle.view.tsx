import { type KeyboardEvent } from 'react';
import { type IdleTeamCardViewModel } from '../../presenters/dashboard.view-model.schema.ts';
import { TeamSelectionCheckmarkView } from './team-selection-checkmark.view.tsx';

interface TeamCardIdleViewProps {
  team: IdleTeamCardViewModel;
  onSelect: () => void;
}

export function TeamCardIdleView({ team, onSelect }: TeamCardIdleViewProps) {
  const selectedClass = team.isSelected ? ' team-card--selected' : '';
  const className = `team-card team-card--idle${selectedClass}`;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: idle card shares the same role="button" shape as its active sibling for consistency
    <div
      className={className}
      role="button"
      tabIndex={0}
      aria-pressed={team.isSelected}
      aria-label={team.teamName}
      onClick={onSelect}
      onKeyDown={handleKeyDown}
    >
      {team.isSelected && <TeamSelectionCheckmarkView />}
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
