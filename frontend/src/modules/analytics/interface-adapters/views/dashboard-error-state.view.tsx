import { type DashboardTranslations } from '../presenters/dashboard.translations.ts';

interface DashboardErrorStateViewProps {
  message: string;
  translations: DashboardTranslations;
}

export function DashboardErrorStateView({
  message,
  translations,
}: DashboardErrorStateViewProps) {
  return (
    <div className="empty-state">
      <h2>{translations.errorTitle}</h2>
      <p className="alert-text">{message}</p>
    </div>
  );
}
