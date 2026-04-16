import { useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { MemberHealthTrendsPresenter } from '../presenters/member-health-trends.presenter.ts';
import { memberHealthTrendsTranslations } from '../presenters/member-health-trends.translations.ts';
import { type MemberHealthTrendsViewModel } from '../presenters/member-health-trends.view-model.schema.ts';
import { MEMBER_HEALTH_TRENDS_URL_PARAM } from '../url-contracts/member-health-trends.url-contract.ts';

const DEFAULT_CYCLE_COUNT = 5;

export type MemberHealthTrendsState = AsyncState<
  MemberHealthTrendsViewModel,
  { status: 'empty'; message: string }
>;

export interface UseMemberHealthTrendsResult {
  state: MemberHealthTrendsState;
  changeCycleCount: (count: number) => void;
}

export function useMemberHealthTrends(): UseMemberHealthTrendsResult {
  const locale = useLocale();
  const [searchParams] = useSearchParams();
  const [cycleCount, setCycleCount] = useState(DEFAULT_CYCLE_COUNT);

  const teamId = searchParams.get(MEMBER_HEALTH_TRENDS_URL_PARAM.teamId);
  const memberName = searchParams.get(
    MEMBER_HEALTH_TRENDS_URL_PARAM.memberName,
  );
  const translations = memberHealthTrendsTranslations[locale];
  const hasMissingParams = teamId === null || memberName === null;

  const query = useQuery({
    queryKey: ['analytics', 'member-health', teamId, memberName, cycleCount],
    queryFn: () => {
      if (teamId === null || memberName === null) {
        return Promise.reject(
          new GatewayError(translations.errorMissingParams),
        );
      }
      return usecases.getMemberHealth.execute({
        teamId,
        memberName,
        cycles: cycleCount,
      });
    },
    enabled: !hasMissingParams,
  });

  const presenter = useMemo(
    () => new MemberHealthTrendsPresenter(translations),
    [translations],
  );

  const changeCycleCount = useCallback((count: number) => {
    setCycleCount(count);
  }, []);

  const state: MemberHealthTrendsState = (() => {
    if (hasMissingParams) {
      return { status: 'error', message: translations.errorMissingParams };
    }
    if (query.isPending) {
      return { status: 'loading' };
    }
    if (query.isError) {
      const message =
        query.error instanceof GatewayError
          ? query.error.message
          : translations.errorLoadFailed;
      return { status: 'error', message };
    }
    if (query.data === null) {
      return { status: 'empty', message: translations.noDataAvailable };
    }
    return {
      status: 'ready',
      data: presenter.present({
        response: query.data,
        teamId: teamId,
        cycleCount,
      }),
    };
  })();

  return { state, changeCycleCount };
}
