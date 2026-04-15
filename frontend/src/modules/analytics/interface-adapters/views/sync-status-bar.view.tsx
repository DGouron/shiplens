import { Button } from '@/components/button.tsx';
import { type SyncStatusViewModel } from '../presenters/dashboard.view-model.schema.ts';

export interface SyncProgressIndicator {
  stepLabel: string;
  attemptLabel?: string;
}

interface SyncStatusBarViewProps {
  synchronization: SyncStatusViewModel;
  resyncLabel: string;
  onResyncClick: () => void;
  syncProgress?: SyncProgressIndicator | null;
}

export function SyncStatusBarView({
  synchronization,
  resyncLabel,
  onResyncClick,
  syncProgress,
}: SyncStatusBarViewProps) {
  const className = synchronization.isLate
    ? 'glass sync-bar late'
    : 'glass sync-bar';
  const inProgress = syncProgress !== null && syncProgress !== undefined;

  return (
    <div className={className}>
      <div className="sync-info">
        <span className="sync-dot" />
        <span>{synchronization.lastSyncLabel}</span>
        {synchronization.lateWarning && (
          <span className="alert-text">{synchronization.lateWarning}</span>
        )}
      </div>
      {inProgress ? (
        <div className="sync-progress">
          <span>{syncProgress.stepLabel}</span>
          {syncProgress.attemptLabel && (
            <span className="sync-progress-attempt">
              {syncProgress.attemptLabel}
            </span>
          )}
          <Button disabled onClick={onResyncClick}>
            {resyncLabel}
          </Button>
        </div>
      ) : (
        <Button onClick={onResyncClick}>{resyncLabel}</Button>
      )}
    </div>
  );
}
