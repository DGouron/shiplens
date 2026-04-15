import { useEffect } from 'react';
import {
  type CycleMetricsState,
  useCycleMetrics,
} from './use-cycle-metrics.ts';
import {
  type CycleReportShellState,
  useCycleReportShell,
} from './use-cycle-report-shell.ts';
import { useCycleReportUrlState } from './use-cycle-report-url-state.ts';

export interface UseCycleReportPageResult {
  shellState: CycleReportShellState;
  metricsState: CycleMetricsState;
  selectTeam: (teamId: string) => void;
  selectCycle: (cycleId: string) => void;
}

export function useCycleReportPage(): UseCycleReportPageResult {
  const { selectedTeamId, selectedCycleId } = useCycleReportUrlState();
  const { state: shellState, selectTeam, selectCycle } = useCycleReportShell();
  const { state: metricsState } = useCycleMetrics({
    teamId: selectedTeamId,
    cycleId: selectedCycleId,
  });

  useEffect(() => {
    if (selectedCycleId !== null) return;
    if (shellState.status !== 'ready') return;
    if (shellState.data.cycleSelector === null) return;
    const firstCycle = shellState.data.cycleSelector.options[0];
    if (firstCycle === undefined) return;
    selectCycle(firstCycle.cycleId);
  }, [selectedCycleId, shellState, selectCycle]);

  return { shellState, metricsState, selectTeam, selectCycle };
}
