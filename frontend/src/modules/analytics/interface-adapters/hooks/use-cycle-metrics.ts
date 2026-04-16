import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { CycleMetricsPresenter } from '../presenters/cycle-metrics.presenter.ts';
import { cycleMetricsTranslations } from '../presenters/cycle-metrics.translations.ts';
import { type CycleMetricsViewModel } from '../presenters/cycle-metrics.view-model.schema.ts';

export interface UseCycleMetricsParams {
  teamId: string | null;
  cycleId: string | null;
}

export type CycleMetricsState = AsyncState<CycleMetricsViewModel>;

export interface UseCycleMetricsResult {
  state: CycleMetricsState;
}

export function useCycleMetrics(
  params: UseCycleMetricsParams,
): UseCycleMetricsResult {
  const locale = useLocale();
  const { teamId, cycleId } = params;
  const isEnabled = teamId !== null && cycleId !== null;

  const query = useQuery({
    queryKey: ['analytics', 'cycle-metrics', cycleId, teamId],
    queryFn: () => {
      if (teamId === null || cycleId === null) {
        return Promise.reject(
          new Error('useCycleMetrics: teamId and cycleId are required'),
        );
      }
      return usecases.getCycleMetrics.execute({ teamId, cycleId });
    },
    enabled: isEnabled,
  });

  const presenter = useMemo(
    () => new CycleMetricsPresenter(cycleMetricsTranslations[locale]),
    [locale],
  );

  const state: CycleMetricsState = (() => {
    if (!isEnabled || query.isPending) {
      return { status: 'loading' };
    }
    if (query.isError) {
      const message =
        query.error instanceof GatewayError
          ? query.error.message
          : 'Unknown error';
      return { status: 'error', message };
    }
    return { status: 'ready', data: presenter.present(query.data) };
  })();

  return { state };
}
