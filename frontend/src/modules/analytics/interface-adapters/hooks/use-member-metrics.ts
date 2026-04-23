import { useQueries, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { type AsyncState } from '@/shared/foundation/async-state/async-state.type.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { MemberMetricsPresenter } from '../presenters/member-metrics.presenter.ts';
import { memberMetricsTranslations } from '../presenters/member-metrics.translations.ts';
import { type MemberMetricsViewModel } from '../presenters/member-metrics.view-model.schema.ts';

export interface UseMemberMetricsParams {
  teamId: string | null;
  cycleId: string | null;
  selectedMemberName: string | null;
}

export type MemberMetricsState = AsyncState<MemberMetricsViewModel>;

export interface UseMemberMetricsResult {
  state: MemberMetricsState;
}

export function useMemberMetrics(
  params: UseMemberMetricsParams,
): UseMemberMetricsResult {
  const locale = useLocale();
  const { teamId, cycleId, selectedMemberName } = params;
  const isEnabled =
    teamId !== null && cycleId !== null && selectedMemberName !== null;

  const blockedIssuesQuery = useQuery({
    queryKey: ['analytics', 'blocked-issues'],
    queryFn: () => usecases.listBlockedIssues.execute(),
    enabled: isEnabled,
  });

  const driftingIssuesQuery = useQuery({
    queryKey: ['analytics', 'drifting-issues', teamId],
    queryFn: () => {
      if (teamId === null) {
        return Promise.reject(
          new Error('useMemberMetrics: teamId is required'),
        );
      }
      return usecases.listDriftingIssues.execute({ teamId });
    },
    enabled: isEnabled,
  });

  const queries = useQueries({
    queries: [
      {
        queryKey: ['analytics', 'bottleneck-analysis', cycleId, teamId],
        queryFn: () => {
          if (teamId === null || cycleId === null) {
            return Promise.reject(
              new Error('useMemberMetrics: teamId and cycleId are required'),
            );
          }
          return usecases.getBottleneckAnalysis.execute({ teamId, cycleId });
        },
        enabled: isEnabled,
      },
      {
        queryKey: ['analytics', 'estimation-accuracy', teamId, cycleId],
        queryFn: () => {
          if (teamId === null || cycleId === null) {
            return Promise.reject(
              new Error('useMemberMetrics: teamId and cycleId are required'),
            );
          }
          return usecases.getEstimationAccuracy.execute({ teamId, cycleId });
        },
        enabled: isEnabled,
      },
    ],
  });

  const [bottleneckQuery, estimationQuery] = queries;

  const presenter = useMemo(
    () => new MemberMetricsPresenter(memberMetricsTranslations[locale]),
    [locale],
  );

  const state: MemberMetricsState = (() => {
    if (!isEnabled) return { status: 'loading' };
    const allQueries = [
      blockedIssuesQuery,
      driftingIssuesQuery,
      bottleneckQuery,
      estimationQuery,
    ];
    if (allQueries.some((entry) => entry.isPending)) {
      return { status: 'loading' };
    }
    const errored = allQueries.find((entry) => entry.isError);
    if (errored !== undefined) {
      const message =
        errored.error instanceof GatewayError
          ? errored.error.message
          : 'Unknown error';
      return { status: 'error', message };
    }
    if (
      blockedIssuesQuery.data === undefined ||
      driftingIssuesQuery.data === undefined ||
      bottleneckQuery.data === undefined ||
      estimationQuery.data === undefined ||
      teamId === null ||
      selectedMemberName === null
    ) {
      return { status: 'loading' };
    }
    return {
      status: 'ready',
      data: presenter.present({
        blockedIssues: blockedIssuesQuery.data,
        driftingIssues: driftingIssuesQuery.data,
        bottleneck: bottleneckQuery.data,
        estimation: estimationQuery.data,
        selectedTeamId: teamId,
        selectedMemberName,
      }),
    };
  })();

  return { state };
}
