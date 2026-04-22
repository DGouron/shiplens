import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import {
  type CycleThemeIssuesDrawerInput,
  CycleThemeIssuesDrawerPresenter,
} from '../presenters/cycle-theme-issues-drawer.presenter.ts';
import { type CycleThemeIssuesDrawerViewModel } from '../presenters/cycle-theme-issues-drawer.view-model.schema.ts';
import { TopCycleThemesPresenter } from '../presenters/top-cycle-themes.presenter.ts';
import { topCycleThemesTranslations } from '../presenters/top-cycle-themes.translations.ts';
import {
  type TopCycleThemesMetric,
  type TopCycleThemesViewModel,
} from '../presenters/top-cycle-themes.view-model.schema.ts';

export interface UseTopCycleThemesParams {
  teamId: string | null;
}

export type TopCycleThemesState = AsyncState<TopCycleThemesViewModel>;

export interface UseTopCycleThemesResult {
  state: TopCycleThemesState;
  cardTitle: string;
  loadingMessage: string;
  loadingHint: string;
  drawerState: CycleThemeIssuesDrawerViewModel;
  onMetricChange: (metric: TopCycleThemesMetric) => void;
  onRowClick: (themeName: string) => void;
  onDrawerClose: () => void;
  onRefreshClick: () => void;
}

export function useTopCycleThemes(
  params: UseTopCycleThemesParams,
): UseTopCycleThemesResult {
  const locale = useLocale();
  const { teamId } = params;
  const [activeMetric, setActiveMetric] =
    useState<TopCycleThemesMetric>('count');
  const [selectedThemeName, setSelectedThemeName] = useState<string | null>(
    null,
  );
  const [forceRefreshToken, setForceRefreshToken] = useState(0);
  const queryClient = useQueryClient();

  // biome-ignore lint/correctness/useExhaustiveDependencies: teamId is the trigger — reset state when the team changes
  useEffect(() => {
    setActiveMetric('count');
    setSelectedThemeName(null);
    setForceRefreshToken(0);
  }, [teamId]);

  const themesQuery = useQuery({
    queryKey: ['analytics', 'top-cycle-themes', teamId, forceRefreshToken],
    queryFn: () => {
      if (teamId === null) throw new Error('teamId required');
      return usecases.getTopCycleThemes.execute({
        teamId,
        forceRefresh: forceRefreshToken > 0,
      });
    },
    enabled: teamId !== null,
  });

  const issuesQuery = useQuery({
    queryKey: ['analytics', 'cycle-theme-issues', teamId, selectedThemeName],
    queryFn: () => {
      if (teamId === null || selectedThemeName === null) {
        throw new Error('teamId and themeName required');
      }
      return usecases.listCycleThemeIssues.execute({
        teamId,
        themeName: selectedThemeName,
      });
    },
    enabled: teamId !== null && selectedThemeName !== null,
  });

  const translations = topCycleThemesTranslations[locale];

  const rankingPresenter = useMemo(
    () => new TopCycleThemesPresenter(translations, activeMetric),
    [translations, activeMetric],
  );

  const drawerPresenter = useMemo(
    () => new CycleThemeIssuesDrawerPresenter(translations),
    [translations],
  );

  const state: TopCycleThemesState = (() => {
    if (teamId === null || themesQuery.isPending) {
      return { status: 'loading' };
    }
    if (themesQuery.isError) {
      const message =
        themesQuery.error instanceof GatewayError
          ? themesQuery.error.message
          : 'Unknown error';
      return { status: 'error', message };
    }
    return {
      status: 'ready',
      data: rankingPresenter.present(themesQuery.data),
    };
  })();

  const drawerInput: CycleThemeIssuesDrawerInput = (() => {
    if (selectedThemeName === null) return { kind: 'closed' };
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

  const onMetricChange = useCallback((metric: TopCycleThemesMetric) => {
    setActiveMetric(metric);
  }, []);

  const onRowClick = useCallback((themeName: string) => {
    setSelectedThemeName(themeName);
  }, []);

  const onDrawerClose = useCallback(() => {
    setSelectedThemeName(null);
  }, []);

  const onRefreshClick = useCallback(() => {
    queryClient.removeQueries({
      queryKey: ['analytics', 'top-cycle-themes', teamId],
    });
    setForceRefreshToken((previous) => previous + 1);
  }, [queryClient, teamId]);

  return {
    state,
    cardTitle: translations.cardTitle,
    loadingMessage: translations.loadingMessage,
    loadingHint: translations.loadingHint,
    drawerState,
    onMetricChange,
    onRowClick,
    onDrawerClose,
    onRefreshClick,
  };
}
