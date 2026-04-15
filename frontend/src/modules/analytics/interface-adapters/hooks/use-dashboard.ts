import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
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
    return { status: 'ready', data: presenter.present(data) };
  })();

  return {
    state,
    reload: async () => {
      await query.refetch();
    },
  };
}
