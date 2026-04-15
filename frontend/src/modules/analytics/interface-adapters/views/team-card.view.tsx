import { type DashboardTranslations } from '../presenters/dashboard.translations.ts';
import { type ActiveTeamCardViewModel } from '../presenters/dashboard.view-model.schema.ts';
import { CompletionRingView } from './completion-ring.view.tsx';

interface TeamCardViewProps {
  team: ActiveTeamCardViewModel;
  translations: DashboardTranslations;
}

export function TeamCardView({ team, translations }: TeamCardViewProps) {
  const healthClass = `team-card--${team.healthTier}`;
  const blockedValueClass = team.blockedAlert
    ? 'kpi-value alert-text'
    : 'kpi-value';

  return (
    <div className={`team-card ${healthClass}`}>
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
        <a className="report-link" href={team.reportLink}>
          {translations.viewReport}
        </a>
      ) : (
        <p className="no-cycle-text">{translations.noReportAvailable}</p>
      )}
    </div>
  );
}
