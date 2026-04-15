import { type DashboardTranslations } from '../presenters/dashboard.translations.ts';

interface DashboardEmptyStateViewProps {
  kind: 'not_connected' | 'no_teams';
  message: string;
  translations: DashboardTranslations;
}

export function DashboardEmptyStateView({
  kind,
  message,
  translations,
}: DashboardEmptyStateViewProps) {
  const title =
    kind === 'not_connected'
      ? translations.emptyNotConnectedTitle
      : translations.emptyNoTeamsTitle;

  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
}
