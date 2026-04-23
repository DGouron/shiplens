import '@/styles/cycle-report.css';
import { useLocale } from '@/locale-context.tsx';
import { useCycleReportPage } from '../../hooks/use-cycle-report-page.ts';
import { aiReportTranslations } from '../../presenters/ai-report.translations.ts';
import { blockedIssuesTranslations } from '../../presenters/blocked-issues.translations.ts';
import { bottleneckAnalysisTranslations } from '../../presenters/bottleneck-analysis.translations.ts';
import { cycleMetricsTranslations } from '../../presenters/cycle-metrics.translations.ts';
import { driftingIssuesTranslations } from '../../presenters/drifting-issues.translations.ts';
import { estimationAccuracyTranslations } from '../../presenters/estimation-accuracy.translations.ts';
import { memberDigestTranslations } from '../../presenters/member-digest.translations.ts';
import { CycleReportReadyView } from './cycle-report-ready.view.tsx';

export function CycleReportView() {
  const locale = useLocale();
  const {
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
  } = useCycleReportPage();
  const metricsTranslationBundle = cycleMetricsTranslations[locale];
  const bottleneckTranslationBundle = bottleneckAnalysisTranslations[locale];
  const blockedIssuesTranslationBundle = blockedIssuesTranslations[locale];
  const estimationTranslationBundle = estimationAccuracyTranslations[locale];
  const driftingTranslationBundle = driftingIssuesTranslations[locale];
  const aiReportTranslationBundle = aiReportTranslations[locale];
  const memberDigestTranslationBundle = memberDigestTranslations[locale];

  if (shellState.status === 'loading') {
    return (
      <main data-testid="cycle-report-page" className="container">
        <p>Loading...</p>
      </main>
    );
  }

  if (shellState.status === 'error') {
    return (
      <main data-testid="cycle-report-page" className="container">
        <p>{shellState.message}</p>
      </main>
    );
  }

  return (
    <CycleReportReadyView
      viewModel={shellState.data}
      metricsState={metricsState}
      memberMetricsState={memberMetricsState}
      bottleneckState={bottleneckState}
      blockedIssuesState={blockedIssuesState}
      estimationState={estimationState}
      driftingState={driftingState}
      aiReportState={aiReportState}
      memberDigestState={memberDigestState}
      showMemberDigestSection={showMemberDigestSection}
      memberFilterViewModel={memberFilterViewModel}
      metricsTranslations={metricsTranslationBundle}
      bottleneckTranslations={bottleneckTranslationBundle}
      blockedIssuesTranslations={blockedIssuesTranslationBundle}
      estimationTranslations={estimationTranslationBundle}
      driftingTranslations={driftingTranslationBundle}
      aiReportTranslations={aiReportTranslationBundle}
      memberDigestTranslations={memberDigestTranslationBundle}
      onTeamChange={selectTeam}
      onCycleChange={selectCycle}
      onMemberSelect={selectMember}
      onMemberClick={onMemberClick}
      onGenerateAiReport={generateAiReport}
      onExportAiReport={exportAiReport}
      onCopyAiReport={copyAiReport}
      onGenerateMemberDigest={generateMemberDigest}
      onCopyMemberDigest={copyMemberDigest}
    />
  );
}
