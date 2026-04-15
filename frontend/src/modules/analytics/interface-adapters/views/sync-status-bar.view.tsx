import { Button } from '@/components/button.tsx';
import { type SyncStatusViewModel } from '../presenters/dashboard.view-model.schema.ts';

interface SyncStatusBarViewProps {
  synchronization: SyncStatusViewModel;
  resyncLabel: string;
  onResyncClick: () => void;
}

export function SyncStatusBarView({
  synchronization,
  resyncLabel,
  onResyncClick,
}: SyncStatusBarViewProps) {
  const className = synchronization.isLate
    ? 'glass sync-bar late'
    : 'glass sync-bar';

  return (
    <div className={className}>
      <div className="sync-info">
        <span className="sync-dot" />
        <span>{synchronization.lastSyncLabel}</span>
        {synchronization.lateWarning && (
          <span className="alert-text">{synchronization.lateWarning}</span>
        )}
      </div>
      <Button onClick={onResyncClick}>{resyncLabel}</Button>
    </div>
  );
}
