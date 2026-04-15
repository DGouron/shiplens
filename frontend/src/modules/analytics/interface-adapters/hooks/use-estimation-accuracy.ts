import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { EstimationAccuracyPresenter } from '../presenters/estimation-accuracy.presenter.ts';
import { estimationAccuracyTranslations } from '../presenters/estimation-accuracy.translations.ts';
import { type EstimationAccuracyViewModel } from '../presenters/estimation-accuracy.view-model.schema.ts';

export interface UseEstimationAccuracyParams {
  teamId: string | null;
  cycleId: string | null;
}

export type EstimationAccuracyState = AsyncState<EstimationAccuracyViewModel>;

export interface UseEstimationAccuracyResult {
  state: EstimationAccuracyState;
}

export function useEstimationAccuracy(
  params: UseEstimationAccuracyParams,
): UseEstimationAccuracyResult {
  const locale = useLocale();
  const { teamId, cycleId } = params;
  const isEnabled = teamId !== null && cycleId !== null;

  const query = useQuery({
    queryKey: ['analytics', 'estimation-accuracy', teamId, cycleId],
    queryFn: () => {
      if (teamId === null || cycleId === null) {
        return Promise.reject(
          new Error('useEstimationAccuracy: teamId and cycleId are required'),
        );
      }
      return usecases.getEstimationAccuracy.execute({ teamId, cycleId });
    },
    enabled: isEnabled,
  });

  const presenter = useMemo(
    () =>
      new EstimationAccuracyPresenter(estimationAccuracyTranslations[locale]),
    [locale],
  );

  const state: EstimationAccuracyState = (() => {
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
