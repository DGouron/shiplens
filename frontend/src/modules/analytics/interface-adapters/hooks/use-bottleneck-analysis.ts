import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { BottleneckAnalysisPresenter } from '../presenters/bottleneck-analysis.presenter.ts';
import { bottleneckAnalysisTranslations } from '../presenters/bottleneck-analysis.translations.ts';
import { type BottleneckAnalysisViewModel } from '../presenters/bottleneck-analysis.view-model.schema.ts';

export interface UseBottleneckAnalysisParams {
  teamId: string | null;
  cycleId: string | null;
  selectedMemberName: string | null;
}

export type BottleneckAnalysisState = AsyncState<BottleneckAnalysisViewModel>;

export interface UseBottleneckAnalysisResult {
  state: BottleneckAnalysisState;
}

export function useBottleneckAnalysis(
  params: UseBottleneckAnalysisParams,
): UseBottleneckAnalysisResult {
  const locale = useLocale();
  const { teamId, cycleId, selectedMemberName } = params;
  const isEnabled = teamId !== null && cycleId !== null;

  const query = useQuery({
    queryKey: ['analytics', 'bottleneck-analysis', cycleId, teamId],
    queryFn: () => {
      if (teamId === null || cycleId === null) {
        return Promise.reject(
          new Error('useBottleneckAnalysis: teamId and cycleId are required'),
        );
      }
      return usecases.getBottleneckAnalysis.execute({ teamId, cycleId });
    },
    enabled: isEnabled,
  });

  const presenter = useMemo(
    () =>
      new BottleneckAnalysisPresenter(
        bottleneckAnalysisTranslations[locale],
        selectedMemberName,
      ),
    [locale, selectedMemberName],
  );

  const state: BottleneckAnalysisState = (() => {
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
