import { useLocale } from '@/locale-context.tsx';
import { useCycleReportPage } from '../../hooks/use-cycle-report-page.ts';
import { blockedIssuesTranslations } from '../../presenters/blocked-issues.translations.ts';
import { bottleneckAnalysisTranslations } from '../../presenters/bottleneck-analysis.translations.ts';
import { cycleMetricsTranslations } from '../../presenters/cycle-metrics.translations.ts';
import { CycleReportReadyView } from './cycle-report-ready.view.tsx';

export function CycleReportView() {
  const locale = useLocale();
  const {
    shellState,
    metricsState,
    bottleneckState,
    blockedIssuesState,
    selectTeam,
    selectCycle,
  } = useCycleReportPage();
  const metricsTranslationBundle = cycleMetricsTranslations[locale];
  const bottleneckTranslationBundle = bottleneckAnalysisTranslations[locale];
  const blockedIssuesTranslationBundle = blockedIssuesTranslations[locale];

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
      bottleneckState={bottleneckState}
      blockedIssuesState={blockedIssuesState}
      metricsTranslations={metricsTranslationBundle}
      bottleneckTranslations={bottleneckTranslationBundle}
      blockedIssuesTranslations={blockedIssuesTranslationBundle}
      onTeamChange={selectTeam}
      onCycleChange={selectCycle}
    />
  );
}
