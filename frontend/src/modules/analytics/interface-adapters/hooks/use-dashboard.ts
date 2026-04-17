import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { DashboardPresenter } from '../presenters/dashboard.presenter.ts';
import { dashboardTranslations } from '../presenters/dashboard.translations.ts';
import { type DashboardViewModel } from '../presenters/dashboard.view-model.schema.ts';

export type DashboardEmptyKind = 'not_connected' | 'no_teams';

export type DashboardState = AsyncState<
  DashboardViewModel,
  {
    status: 'empty';
    empty: { kind: DashboardEmptyKind; message: string };
  }
>;

export interface UseDashboardResult {
  state: DashboardState;
  reload: () => Promise<void>;
  onSelectTeam: (teamId: string) => void;
}

export function useDashboard(): UseDashboardResult {
  const locale = useLocale();
  const query = useQuery({
    queryKey: ['analytics', 'workspace-dashboard'],
    queryFn: () => usecases.getWorkspaceDashboard.execute(),
  });

  const presenter = useMemo(
    () => new DashboardPresenter(locale, dashboardTranslations[locale]),
    [locale],
  );

  const workspaceId =
    query.data && 'teams' in query.data ? query.data.workspaceId : null;

  const [selectionOverride, setSelectionOverride] = useState<string | null>(
    null,
  );
  const [persistedTeamId, setPersistedTeamId] = useState<string | null>(null);

  useEffect(() => {
    setSelectionOverride(null);
    setPersistedTeamId(null);
    if (workspaceId === null) return;
    let cancelled = false;
    usecases.getPersistedTeamSelection
      .execute({ workspaceId })
      .then((value) => {
        if (!cancelled) setPersistedTeamId(value);
      })
      .catch(() => {
        if (!cancelled) setPersistedTeamId(null);
      });
    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  const onSelectTeam = useCallback(
    (teamId: string) => {
      setSelectionOverride(teamId);
      if (workspaceId === null) return;
      void usecases.persistTeamSelection
        .execute({ workspaceId, teamId })
        .catch(() => {
          // Storage failure must not break the UX — override state already applied in memory.
        });
    },
    [workspaceId],
  );

  const state: DashboardState = (() => {
    if (query.isPending) {
      return { status: 'loading' };
    }
    if (query.isError) {
      const message =
        query.error instanceof GatewayError
          ? query.error.message
          : 'Unknown error';
      return { status: 'error', message };
    }
    const data = query.data;
    if ('status' in data) {
      return {
        status: 'empty',
        empty: { kind: data.status, message: data.message },
      };
    }
    const effectivePersistedTeamId = selectionOverride ?? persistedTeamId;
    return {
      status: 'ready',
      data: presenter.present(data, {
        persistedTeamId: effectivePersistedTeamId,
      }),
    };
  })();

  return {
    state,
    reload: async () => {
      await query.refetch();
    },
    onSelectTeam,
  };
}
