import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { CycleReportShellPresenter } from '../presenters/cycle-report-shell.presenter.ts';
import { cycleReportShellTranslations } from '../presenters/cycle-report-shell.translations.ts';
import { type CycleReportShellViewModel } from '../presenters/cycle-report-shell.view-model.schema.ts';
import { useCycleReportUrlState } from './use-cycle-report-url-state.ts';

export type CycleReportShellState = AsyncState<CycleReportShellViewModel>;

export interface UseCycleReportShellResult {
  state: CycleReportShellState;
  selectTeam: (teamId: string) => void;
  selectCycle: (cycleId: string) => void;
}

export function useCycleReportShell(): UseCycleReportShellResult {
  const locale = useLocale();
  const {
    selectedTeamId,
    selectedCycleId,
    selectedMemberName,
    selectTeam,
    selectCycle,
  } = useCycleReportUrlState();

  const teamsQuery = useQuery({
    queryKey: ['analytics', 'cycle-report', 'available-teams'],
    queryFn: () => usecases.listAvailableTeams.execute(),
  });

  const cyclesQuery = useQuery({
    queryKey: ['analytics', 'cycle-report', 'team-cycles', selectedTeamId],
    queryFn: () =>
      selectedTeamId === null
        ? Promise.resolve({ cycles: [] })
        : usecases.listTeamCycles.execute({ teamId: selectedTeamId }),
    enabled: selectedTeamId !== null,
  });

  const presenter = useMemo(
    () => new CycleReportShellPresenter(cycleReportShellTranslations[locale]),
    [locale],
  );

  const state: CycleReportShellState = (() => {
    if (teamsQuery.isPending) {
      return { status: 'loading' };
    }
    if (teamsQuery.isError) {
      return { status: 'error', message: extractMessage(teamsQuery.error) };
    }
    if (selectedTeamId !== null && cyclesQuery.isPending) {
      return { status: 'loading' };
    }
    if (selectedTeamId !== null && cyclesQuery.isError) {
      return { status: 'error', message: extractMessage(cyclesQuery.error) };
    }
    return {
      status: 'ready',
      data: presenter.present({
        availableTeams: teamsQuery.data,
        teamCycles: selectedTeamId === null ? null : (cyclesQuery.data ?? null),
        selectedTeamId,
        selectedCycleId,
        selectedMemberName,
      }),
    };
  })();

  return { state, selectTeam, selectCycle };
}

function extractMessage(error: unknown): string {
  if (error instanceof GatewayError) return error.message;
  if (error instanceof Error) return error.message;
  return 'Unknown error';
}
