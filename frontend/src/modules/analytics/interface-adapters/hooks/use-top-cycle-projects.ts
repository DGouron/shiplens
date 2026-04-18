import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  type CycleProjectIssuesDrawerInput,
  CycleProjectIssuesDrawerPresenter,
} from '../presenters/cycle-project-issues-drawer.presenter.ts';
import { type CycleProjectIssuesDrawerViewModel } from '../presenters/cycle-project-issues-drawer.view-model.schema.ts';
import { TopCycleProjectsPresenter } from '../presenters/top-cycle-projects.presenter.ts';
import { topCycleProjectsTranslations } from '../presenters/top-cycle-projects.translations.ts';
import {
  type TopCycleProjectsMetric,
  type TopCycleProjectsViewModel,
} from '../presenters/top-cycle-projects.view-model.schema.ts';

export interface UseTopCycleProjectsParams {
  teamId: string | null;
}

export type TopCycleProjectsState = AsyncState<TopCycleProjectsViewModel>;

export interface UseTopCycleProjectsResult {
  state: TopCycleProjectsState;
  drawerState: CycleProjectIssuesDrawerViewModel;
  onMetricChange: (metric: TopCycleProjectsMetric) => void;
  onRowClick: (projectId: string) => void;
  onDrawerClose: () => void;
  onToggleExpand: () => void;
}

export function useTopCycleProjects(
  params: UseTopCycleProjectsParams,
): UseTopCycleProjectsResult {
  const locale = useLocale();
  const { teamId } = params;
  const [activeMetric, setActiveMetric] =
    useState<TopCycleProjectsMetric>('count');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [isExpanded, setIsExpanded] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: teamId is the trigger — reset state when the team changes
  useEffect(() => {
    setActiveMetric('count');
    setSelectedProjectId(null);
    setIsExpanded(false);
  }, [teamId]);

  const rankingQuery = useQuery({
    queryKey: ['analytics', 'top-cycle-projects', teamId],
    queryFn: () => {
      if (teamId === null) throw new Error('teamId required');
      return usecases.getTopCycleProjects.execute({ teamId });
    },
    enabled: teamId !== null,
  });

  const issuesQuery = useQuery({
    queryKey: ['analytics', 'cycle-project-issues', teamId, selectedProjectId],
    queryFn: () => {
      if (teamId === null || selectedProjectId === null) {
        throw new Error('teamId and projectId required');
      }
      return usecases.listCycleProjectIssues.execute({
        teamId,
        projectId: selectedProjectId,
      });
    },
    enabled: teamId !== null && selectedProjectId !== null,
  });

  const translations = topCycleProjectsTranslations[locale];

  const rankingPresenter = useMemo(
    () => new TopCycleProjectsPresenter(translations, activeMetric, isExpanded),
    [translations, activeMetric, isExpanded],
  );

  const drawerPresenter = useMemo(
    () => new CycleProjectIssuesDrawerPresenter(translations),
    [translations],
  );

  const state: TopCycleProjectsState = (() => {
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

  const drawerInput: CycleProjectIssuesDrawerInput = (() => {
    if (selectedProjectId === null) return { kind: 'closed' };
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

  const onMetricChange = useCallback((metric: TopCycleProjectsMetric) => {
    setActiveMetric(metric);
  }, []);

  const onRowClick = useCallback((projectId: string) => {
    setSelectedProjectId(projectId);
  }, []);

  const onDrawerClose = useCallback(() => {
    setSelectedProjectId(null);
  }, []);

  const onToggleExpand = useCallback(() => {
    setIsExpanded((current) => !current);
  }, []);

  return {
    state,
    drawerState,
    onMetricChange,
    onRowClick,
    onDrawerClose,
    onToggleExpand,
  };
}
