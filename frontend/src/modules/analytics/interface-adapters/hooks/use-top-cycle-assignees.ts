import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  type CycleAssigneeIssuesDrawerInput,
  CycleAssigneeIssuesDrawerPresenter,
} from '../presenters/cycle-assignee-issues-drawer.presenter.ts';
import { type CycleAssigneeIssuesDrawerViewModel } from '../presenters/cycle-assignee-issues-drawer.view-model.schema.ts';
import { TopCycleAssigneesPresenter } from '../presenters/top-cycle-assignees.presenter.ts';
import { topCycleAssigneesTranslations } from '../presenters/top-cycle-assignees.translations.ts';
import {
  type TopCycleAssigneesMetric,
  type TopCycleAssigneesViewModel,
} from '../presenters/top-cycle-assignees.view-model.schema.ts';

export interface UseTopCycleAssigneesParams {
  teamId: string | null;
}

export type TopCycleAssigneesState = AsyncState<TopCycleAssigneesViewModel>;

export interface UseTopCycleAssigneesResult {
  state: TopCycleAssigneesState;
  drawerState: CycleAssigneeIssuesDrawerViewModel;
  onMetricChange: (metric: TopCycleAssigneesMetric) => void;
  onRowClick: (assigneeName: string) => void;
  onDrawerClose: () => void;
}

export function useTopCycleAssignees(
  params: UseTopCycleAssigneesParams,
): UseTopCycleAssigneesResult {
  const locale = useLocale();
  const { teamId } = params;
  const [activeMetric, setActiveMetric] =
    useState<TopCycleAssigneesMetric>('count');
  const [selectedAssigneeName, setSelectedAssigneeName] = useState<
    string | null
  >(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: teamId is the trigger — reset state when the team changes
  useEffect(() => {
    setActiveMetric('count');
    setSelectedAssigneeName(null);
  }, [teamId]);

  const rankingQuery = useQuery({
    queryKey: ['analytics', 'top-cycle-assignees', teamId],
    queryFn: () => {
      if (teamId === null) throw new Error('teamId required');
      return usecases.getTopCycleAssignees.execute({ teamId });
    },
    enabled: teamId !== null,
  });

  const issuesQuery = useQuery({
    queryKey: [
      'analytics',
      'cycle-assignee-issues',
      teamId,
      selectedAssigneeName,
    ],
    queryFn: () => {
      if (teamId === null || selectedAssigneeName === null) {
        throw new Error('teamId and assigneeName required');
      }
      return usecases.listCycleAssigneeIssues.execute({
        teamId,
        assigneeName: selectedAssigneeName,
      });
    },
    enabled: teamId !== null && selectedAssigneeName !== null,
  });

  const translations = topCycleAssigneesTranslations[locale];

  const rankingPresenter = useMemo(
    () => new TopCycleAssigneesPresenter(translations, activeMetric),
    [translations, activeMetric],
  );

  const drawerPresenter = useMemo(
    () => new CycleAssigneeIssuesDrawerPresenter(translations),
    [translations],
  );

  const state: TopCycleAssigneesState = (() => {
    if (teamId === null || rankingQuery.isPending) {
      return { status: 'loading' };
    }
    if (rankingQuery.isError) {
      const message =
        rankingQuery.error instanceof GatewayError
          ? rankingQuery.error.message
          : 'Unknown error';
      return { status: 'error', message };
    }
    return {
      status: 'ready',
      data: rankingPresenter.present(rankingQuery.data),
    };
  })();

  const drawerInput: CycleAssigneeIssuesDrawerInput = (() => {
    if (selectedAssigneeName === null) return { kind: 'closed' };
    if (issuesQuery.isPending) return { kind: 'loading' };
    if (issuesQuery.isError) {
      const message =
        issuesQuery.error instanceof GatewayError
          ? issuesQuery.error.message
          : translations.drawerErrorMessage;
      return { kind: 'error', message };
    }
    return { kind: 'ready', response: issuesQuery.data };
  })();

  const drawerState = drawerPresenter.present(drawerInput);

  const onMetricChange = useCallback((metric: TopCycleAssigneesMetric) => {
    setActiveMetric(metric);
  }, []);

  const onRowClick = useCallback((assigneeName: string) => {
    setSelectedAssigneeName(assigneeName);
  }, []);

  const onDrawerClose = useCallback(() => {
    setSelectedAssigneeName(null);
  }, []);

  return {
    state,
    drawerState,
    onMetricChange,
    onRowClick,
    onDrawerClose,
  };
}
