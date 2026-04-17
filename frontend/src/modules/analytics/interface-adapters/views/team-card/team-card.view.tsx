import { type KeyboardEvent } from 'react';
import { Link } from 'react-router';
import { type DashboardTranslations } from '../../presenters/dashboard.translations.ts';
import { type ActiveTeamCardViewModel } from '../../presenters/dashboard.view-model.schema.ts';
import { CompletionRingView } from '../completion-ring.view.tsx';
import { TeamSelectionCheckmarkView } from './team-selection-checkmark.view.tsx';

interface TeamCardViewProps {
  team: ActiveTeamCardViewModel;
  translations: DashboardTranslations;
  onSelect: () => void;
}

export function TeamCardView({
  team,
  translations,
  onSelect,
}: TeamCardViewProps) {
  const selectedClass = team.isSelected ? ' team-card--selected' : '';
  const className = `team-card team-card--${team.healthTier}${selectedClass}`;
  const blockedValueClass = team.blockedAlert
    ? 'kpi-value alert-text'
    : 'kpi-value';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect();
    }
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: the card contains a <Link> so a <button> would produce invalid nested interactive elements
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
      <div className="card-header">
        <CompletionRingView
          completionPercentage={team.completionPercentage}
          strokeColor={team.ringStrokeColor}
          dashOffset={team.ringDashOffset}
        />
        <div className="card-header-text">
          <div className="team-name">{team.teamName}</div>
          <div className="cycle-name">{team.cycleName}</div>
        </div>
      </div>
      <div className="kpi">
        <span className="kpi-label">{translations.kpiVelocity}</span>
        <span className="kpi-value">{team.velocityText}</span>
      </div>
      <div className="kpi">
        <span className="kpi-label">{translations.kpiBlockedIssues}</span>
        <span className={blockedValueClass}>{team.blockedIssuesCount}</span>
      </div>
      {team.reportLink ? (
        <Link className="report-link" to={team.reportLink}>
          {translations.viewReport}
        </Link>
      ) : (
        <p className="no-cycle-text">{translations.noReportAvailable}</p>
      )}
    </div>
  );
}
