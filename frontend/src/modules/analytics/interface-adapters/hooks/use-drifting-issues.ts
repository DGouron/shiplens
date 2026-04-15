import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { DriftingIssuesPresenter } from '../presenters/drifting-issues.presenter.ts';
import { driftingIssuesTranslations } from '../presenters/drifting-issues.translations.ts';
import { type DriftingIssuesViewModel } from '../presenters/drifting-issues.view-model.schema.ts';

export interface UseDriftingIssuesParams {
  teamId: string | null;
}

export type DriftingIssuesState = AsyncState<DriftingIssuesViewModel>;

export interface UseDriftingIssuesResult {
  state: DriftingIssuesState;
}

export function useDriftingIssues(
  params: UseDriftingIssuesParams,
): UseDriftingIssuesResult {
  const locale = useLocale();
  const { teamId } = params;
  const isEnabled = teamId !== null;

  const query = useQuery({
    queryKey: ['analytics', 'drifting-issues', teamId],
    queryFn: () => {
      if (teamId === null) {
        return Promise.reject(
          new Error('useDriftingIssues: teamId is required'),
        );
      }
      return usecases.listDriftingIssues.execute({ teamId });
    },
    enabled: isEnabled,
  });

  const presenter = useMemo(
    () => new DriftingIssuesPresenter(driftingIssuesTranslations[locale]),
    [locale],
  );

  const state: DriftingIssuesState = (() => {
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
