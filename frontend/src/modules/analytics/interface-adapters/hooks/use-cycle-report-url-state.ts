import { useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { CYCLE_REPORT_URL_PARAM } from '../url-contracts/cycle-report.url-contract.ts';

export interface UseCycleReportUrlStateResult {
  selectedTeamId: string | null;
  selectedCycleId: string | null;
  selectedMemberName: string | null;
  selectTeam: (teamId: string) => void;
  selectCycle: (cycleId: string) => void;
  selectMember: (memberName: string | null) => void;
}

export function useCycleReportUrlState(): UseCycleReportUrlStateResult {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedTeamId = searchParams.get(CYCLE_REPORT_URL_PARAM.teamId);
  const selectedCycleId = searchParams.get(CYCLE_REPORT_URL_PARAM.cycleId);
  const selectedMemberName = searchParams.get(
    CYCLE_REPORT_URL_PARAM.memberName,
  );

  const selectTeam = useCallback(
    (teamId: string) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set(CYCLE_REPORT_URL_PARAM.teamId, teamId);
        next.delete(CYCLE_REPORT_URL_PARAM.cycleId);
        next.delete(CYCLE_REPORT_URL_PARAM.memberName);
        return next;
      });
    },
    [setSearchParams],
  );

  const selectCycle = useCallback(
    (cycleId: string) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        next.set(CYCLE_REPORT_URL_PARAM.cycleId, cycleId);
        return next;
      });
    },
    [setSearchParams],
  );

  const selectMember = useCallback(
    (memberName: string | null) => {
      setSearchParams((current) => {
        const next = new URLSearchParams(current);
        if (memberName === null) {
          next.delete(CYCLE_REPORT_URL_PARAM.memberName);
        } else {
          next.set(CYCLE_REPORT_URL_PARAM.memberName, memberName);
        }
        return next;
      });
    },
    [setSearchParams],
  );

  return {
    selectedTeamId,
    selectedCycleId,
    selectedMemberName,
    selectTeam,
    selectCycle,
    selectMember,
  };
}
