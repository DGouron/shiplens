import {
  type CycleReportShellState,
  useCycleReportShell,
} from './use-cycle-report-shell.ts';

export interface UseCycleReportPageResult {
  shellState: CycleReportShellState;
  selectTeam: (teamId: string) => void;
  selectCycle: (cycleId: string) => void;
}

export function useCycleReportPage(): UseCycleReportPageResult {
  const { state, selectTeam, selectCycle } = useCycleReportShell();
  return { shellState: state, selectTeam, selectCycle };
}
