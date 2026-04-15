import { useEffect } from 'react';
import {
  type BlockedIssuesState,
  useBlockedIssues,
} from './use-blocked-issues.ts';
import {
  type BottleneckAnalysisState,
  useBottleneckAnalysis,
} from './use-bottleneck-analysis.ts';
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
  bottleneckState: BottleneckAnalysisState;
  blockedIssuesState: BlockedIssuesState;
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
  const { state: bottleneckState } = useBottleneckAnalysis({
    teamId: selectedTeamId,
    cycleId: selectedCycleId,
  });
  const { state: blockedIssuesState } = useBlockedIssues({
    teamId: selectedTeamId,
  });

  useEffect(() => {
    if (selectedCycleId !== null) return;
    if (shellState.status !== 'ready') return;
    if (shellState.data.cycleSelector === null) return;
    const options = shellState.data.cycleSelector.options;
    const firstCompleted = options.find(
      (option) => option.status === 'completed',
    );
    const cycleToSelect = firstCompleted ?? options[0];
    if (cycleToSelect === undefined) return;
    selectCycle(cycleToSelect.cycleId);
  }, [selectedCycleId, shellState, selectCycle]);

  return {
    shellState,
    metricsState,
    bottleneckState,
    blockedIssuesState,
    selectTeam,
    selectCycle,
  };
}
