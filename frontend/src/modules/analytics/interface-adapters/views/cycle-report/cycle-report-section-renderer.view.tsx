import { type BlockedIssuesState } from '../../hooks/use-blocked-issues.ts';
import { type BottleneckAnalysisState } from '../../hooks/use-bottleneck-analysis.ts';
import { type CycleMetricsState } from '../../hooks/use-cycle-metrics.ts';
import { type BlockedIssuesTranslations } from '../../presenters/blocked-issues.translations.ts';
import { type BottleneckAnalysisTranslations } from '../../presenters/bottleneck-analysis.translations.ts';
import { type CycleMetricsTranslations } from '../../presenters/cycle-metrics.translations.ts';
import { type SectionPlaceholderViewModel } from '../../presenters/cycle-report-shell.view-model.schema.ts';
import { BlockedIssuesSectionView } from '../blocked-issues/blocked-issues-section.view.tsx';
import { BottleneckAnalysisSectionView } from '../bottleneck-analysis/bottleneck-analysis-section.view.tsx';
import { CycleMetricsSectionView } from '../cycle-metrics/cycle-metrics-section.view.tsx';
import { CycleReportSectionPlaceholderView } from './cycle-report-section-placeholder.view.tsx';

interface CycleReportSectionRendererViewProps {
  placeholder: SectionPlaceholderViewModel;
  metricsState: CycleMetricsState;
  bottleneckState: BottleneckAnalysisState;
  blockedIssuesState: BlockedIssuesState;
  metricsTranslations: CycleMetricsTranslations;
  bottleneckTranslations: BottleneckAnalysisTranslations;
  blockedIssuesTranslations: BlockedIssuesTranslations;
}

export function CycleReportSectionRendererView({
  placeholder,
  metricsState,
  bottleneckState,
  blockedIssuesState,
  metricsTranslations,
  bottleneckTranslations,
  blockedIssuesTranslations,
}: CycleReportSectionRendererViewProps) {
  if (!placeholder.canRenderContent) {
    return <CycleReportSectionPlaceholderView placeholder={placeholder} />;
  }
  if (placeholder.id === 'metrics') {
    return (
      <CycleMetricsSectionView
        state={metricsState}
        translations={metricsTranslations}
      />
    );
  }
  if (placeholder.id === 'bottlenecks') {
    return (
      <BottleneckAnalysisSectionView
        state={bottleneckState}
        translations={bottleneckTranslations}
      />
    );
  }
  if (placeholder.id === 'blocked') {
    return (
      <BlockedIssuesSectionView
        state={blockedIssuesState}
        translations={blockedIssuesTranslations}
      />
    );
  }
  return <CycleReportSectionPlaceholderView placeholder={placeholder} />;
}
