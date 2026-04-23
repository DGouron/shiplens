import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useLocale } from '@/locale-context.tsx';
import { usecases } from '@/main/dependencies.ts';
import { MemberFilterPresenter } from '../presenters/member-filter.presenter.ts';
import { memberFilterTranslations } from '../presenters/member-filter.translations.ts';
import { type MemberFilterViewModel } from '../presenters/member-filter.view-model.schema.ts';
import { memberHealthTrendsHref } from '../url-contracts/member-health-trends.url-contract.ts';
import { type AiReportState, useAiReport } from './use-ai-report.ts';
import {
  type BlockedIssuesState,
  useBlockedIssues,
} from './use-blocked-issues.ts';
import {
  type BottleneckAnalysisState,
  useBottleneckAnalysis,
} from './use-bottleneck-analysis.ts';
import {
  type CycleMetricsState,
  useCycleMetrics,
} from './use-cycle-metrics.ts';
import {
  type CycleReportShellState,
  useCycleReportShell,
} from './use-cycle-report-shell.ts';
import { useCycleReportUrlState } from './use-cycle-report-url-state.ts';
import {
  type DriftingIssuesState,
  useDriftingIssues,
} from './use-drifting-issues.ts';
import {
  type EstimationAccuracyState,
  useEstimationAccuracy,
} from './use-estimation-accuracy.ts';
import {
  type MemberDigestState,
  useMemberDigest,
} from './use-member-digest.ts';
import {
  type MemberMetricsState,
  useMemberMetrics,
} from './use-member-metrics.ts';

export interface UseCycleReportPageResult {
  shellState: CycleReportShellState;
  metricsState: CycleMetricsState;
  memberMetricsState: MemberMetricsState;
  bottleneckState: BottleneckAnalysisState;
  blockedIssuesState: BlockedIssuesState;
  estimationState: EstimationAccuracyState;
  driftingState: DriftingIssuesState;
  aiReportState: AiReportState;
  memberDigestState: MemberDigestState | null;
  showMemberDigestSection: boolean;
  memberFilterViewModel: MemberFilterViewModel;
  selectTeam: (teamId: string) => void;
  selectCycle: (cycleId: string) => void;
  selectMember: (memberName: string | null) => void;
  onMemberClick: (memberName: string) => void;
  generateAiReport: () => void;
  exportAiReport: () => void;
  copyAiReport: () => void;
  generateMemberDigest: () => void;
  copyMemberDigest: () => void;
}

export function useCycleReportPage(): UseCycleReportPageResult {
  const locale = useLocale();
  const navigate = useNavigate();
  const { selectedTeamId, selectedCycleId, selectedMemberName, selectMember } =
    useCycleReportUrlState();
  const { state: shellState, selectTeam, selectCycle } = useCycleReportShell();
  const { state: metricsState } = useCycleMetrics({
    teamId: selectedTeamId,
    cycleId: selectedCycleId,
  });
  const { state: bottleneckState } = useBottleneckAnalysis({
    teamId: selectedTeamId,
    cycleId: selectedCycleId,
    selectedMemberName,
  });
  const { state: blockedIssuesState } = useBlockedIssues({
    teamId: selectedTeamId,
    selectedMemberName,
  });
  const { state: estimationState } = useEstimationAccuracy({
    teamId: selectedTeamId,
    cycleId: selectedCycleId,
  });
  const { state: driftingState } = useDriftingIssues({
    teamId: selectedTeamId,
    selectedMemberName,
  });
  const { state: memberMetricsState } = useMemberMetrics({
    teamId: selectedTeamId,
    cycleId: selectedCycleId,
    selectedMemberName,
  });

  const blockedIssuesQuery = useQuery({
    queryKey: ['analytics', 'blocked-issues'],
    queryFn: () => usecases.listBlockedIssues.execute(),
    enabled: selectedTeamId !== null,
  });
  const driftingIssuesQuery = useQuery({
    queryKey: ['analytics', 'drifting-issues', selectedTeamId],
    queryFn: () => {
      if (selectedTeamId === null) {
        return Promise.reject(
          new Error('useCycleReportPage: selectedTeamId is required'),
        );
      }
      return usecases.listDriftingIssues.execute({ teamId: selectedTeamId });
    },
    enabled: selectedTeamId !== null,
  });

  const memberFilterViewModel = useMemo<MemberFilterViewModel>(() => {
    const presenter = new MemberFilterPresenter(
      memberFilterTranslations[locale],
      selectedMemberName,
    );
    const blockedForTeam = (blockedIssuesQuery.data ?? []).filter(
      (alert) => alert.teamId === selectedTeamId,
    );
    return presenter.present({
      blockedIssues: blockedForTeam,
      driftingIssues: driftingIssuesQuery.data ?? [],
    });
  }, [
    locale,
    selectedMemberName,
    selectedTeamId,
    blockedIssuesQuery.data,
    driftingIssuesQuery.data,
  ]);

  const onMemberClick = useCallback(
    (memberName: string) => {
      if (selectedTeamId === null) return;
      navigate(memberHealthTrendsHref({ teamId: selectedTeamId, memberName }));
    },
    [navigate, selectedTeamId],
  );

  const {
    state: aiReportState,
    generate: generateAiReport,
    exportMarkdown: exportAiReport,
    copyToClipboard: copyAiReport,
  } = useAiReport({
    teamId: selectedTeamId,
    cycleId: selectedCycleId,
  });

  const showMemberDigestSection = selectedMemberName !== null;

  const memberDigestHook = useMemberDigest({
    teamId: selectedTeamId ?? '',
    cycleId: selectedCycleId ?? '',
    memberName: selectedMemberName ?? '',
  });

  const memberDigestState: MemberDigestState | null = showMemberDigestSection
    ? memberDigestHook.state
    : null;

  const generateMemberDigest = useCallback(() => {
    memberDigestHook.generate();
  }, [memberDigestHook]);

  const copyMemberDigest = useCallback(() => {
    memberDigestHook.copyToClipboard();
  }, [memberDigestHook]);

  useEffect(() => {
    if (selectedCycleId !== null) return;
    if (shellState.status !== 'ready') return;
    if (shellState.data.cycleSelector === null) return;
    const options = shellState.data.cycleSelector.options;
    const now = Date.now();
    const activeCycle = options.find(
      (option) =>
        option.status === 'in_progress' &&
        new Date(option.startsAt).getTime() <= now,
    );
    const firstCompleted = options.find(
      (option) => option.status === 'completed',
    );
    const cycleToSelect = activeCycle ?? firstCompleted ?? options[0];
    if (cycleToSelect === undefined) return;
    selectCycle(cycleToSelect.cycleId);
  }, [selectedCycleId, shellState, selectCycle]);

  return {
    shellState,
    metricsState,
    memberMetricsState,
    bottleneckState,
    blockedIssuesState,
    estimationState,
    driftingState,
    aiReportState,
    memberDigestState,
    showMemberDigestSection,
    memberFilterViewModel,
    selectTeam,
    selectCycle,
    selectMember,
    onMemberClick,
    generateAiReport,
    exportAiReport,
    copyAiReport,
    generateMemberDigest,
    copyMemberDigest,
  };
}
