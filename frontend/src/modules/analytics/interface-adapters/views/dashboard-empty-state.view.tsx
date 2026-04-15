import { Button } from '@/components/button.tsx';
import { type DashboardTranslations } from '../presenters/dashboard.translations.ts';
import { type SyncProgressIndicator } from './sync-status-bar.view.tsx';

interface DashboardEmptyStateViewProps {
  kind: 'not_connected' | 'no_teams';
  message: string;
  translations: DashboardTranslations;
  syncProgress?: SyncProgressIndicator | null;
  onRetryClick?: () => void;
}

export function DashboardEmptyStateView({
  kind,
  message,
  translations,
  syncProgress,
  onRetryClick,
}: DashboardEmptyStateViewProps) {
  const title =
    kind === 'not_connected'
      ? translations.emptyNotConnectedTitle
      : translations.emptyNoTeamsTitle;
  const inProgress = syncProgress !== null && syncProgress !== undefined;
  const canRetry = !inProgress && onRetryClick !== undefined;

  return (
    <div className="empty-state">
      <h2>{title}</h2>
      <p>{message}</p>
      {inProgress && (
        <div className="sync-progress">
          <span>{syncProgress.stepLabel}</span>
          {syncProgress.attemptLabel && (
            <span className="sync-progress-attempt">
              {syncProgress.attemptLabel}
            </span>
          )}
          <Button disabled onClick={noop}>
            {translations.syncInProgress}
          </Button>
        </div>
      )}
      {canRetry && (
        <Button onClick={onRetryClick}>{translations.syncRetryButton}</Button>
      )}
    </div>
  );
}

function noop() {}
