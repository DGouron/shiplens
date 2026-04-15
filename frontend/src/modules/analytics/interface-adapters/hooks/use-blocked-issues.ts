import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { BlockedIssuesPresenter } from '../presenters/blocked-issues.presenter.ts';
import { blockedIssuesTranslations } from '../presenters/blocked-issues.translations.ts';
import { type BlockedIssuesViewModel } from '../presenters/blocked-issues.view-model.schema.ts';

export interface UseBlockedIssuesParams {
  teamId: string | null;
}

export type BlockedIssuesState = AsyncState<BlockedIssuesViewModel>;

export interface UseBlockedIssuesResult {
  state: BlockedIssuesState;
}

export function useBlockedIssues(
  params: UseBlockedIssuesParams,
): UseBlockedIssuesResult {
  const locale = useLocale();
  const { teamId } = params;
  const isEnabled = teamId !== null;

  const query = useQuery({
    queryKey: ['analytics', 'blocked-issues'],
    queryFn: () => usecases.listBlockedIssues.execute(),
    enabled: isEnabled,
  });

  const presenter = useMemo(
    () =>
      teamId === null
        ? null
        : new BlockedIssuesPresenter(blockedIssuesTranslations[locale], teamId),
    [locale, teamId],
  );

  const state: BlockedIssuesState = (() => {
    if (!isEnabled || presenter === null || query.isPending) {
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
