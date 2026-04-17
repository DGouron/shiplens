import { useEffect } from 'react';
import { type DashboardState, useDashboard } from './use-dashboard.ts';
import {
  type SyncState,
  useSyncOrchestrator,
} from './use-sync-orchestrator.ts';

export interface UseDashboardPageResult {
  dashboardState: DashboardState;
  syncState: SyncState;
  startResync: () => Promise<void>;
  retrySync: () => Promise<void>;
  onSelectTeam: (teamId: string) => void;
}

export function useDashboardPage(): UseDashboardPageResult {
  const { state: dashboardState, reload, onSelectTeam } = useDashboard();
  const sync = useSyncOrchestrator({ onSuccess: reload });

  const shouldAutoSync =
    dashboardState.status === 'empty' &&
    dashboardState.empty.kind === 'no_teams' &&
    sync.state.status === 'idle';

  useEffect(() => {
    if (shouldAutoSync) {
      void sync.startAutoSync();
    }
  }, [shouldAutoSync, sync.startAutoSync]);

  return {
    dashboardState,
    syncState: sync.state,
    startResync: sync.startResync,
    retrySync: sync.retry,
    onSelectTeam,
  };
}
