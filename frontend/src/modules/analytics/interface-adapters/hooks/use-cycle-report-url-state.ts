import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export interface UseCycleReportUrlStateResult {
  selectedTeamId: string | null;
  selectedCycleId: string | null;
  selectTeam: (teamId: string) => void;
  selectCycle: (cycleId: string) => void;
}

export function useCycleReportUrlState(): UseCycleReportUrlStateResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTeamId = searchParams.get('teamId');
  const selectedCycleId = searchParams.get('cycleId');

  const selectTeam = useCallback(
    (teamId: string) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('teamId', teamId);
        next.delete('cycleId');
        return next;
      });
    },
    [setSearchParams],
  );

  const selectCycle = useCallback(
    (cycleId: string) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set('cycleId', cycleId);
        return next;
      });
    },
    [setSearchParams],
  );

  return { selectedTeamId, selectedCycleId, selectTeam, selectCycle };
}
