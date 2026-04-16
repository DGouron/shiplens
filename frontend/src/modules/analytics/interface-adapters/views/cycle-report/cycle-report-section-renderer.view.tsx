import { type AiReportState } from '../../hooks/use-ai-report.ts';
import { type BlockedIssuesState } from '../../hooks/use-blocked-issues.ts';
import { type BottleneckAnalysisState } from '../../hooks/use-bottleneck-analysis.ts';
import { type CycleMetricsState } from '../../hooks/use-cycle-metrics.ts';
import { type DriftingIssuesState } from '../../hooks/use-drifting-issues.ts';
import { type EstimationAccuracyState } from '../../hooks/use-estimation-accuracy.ts';
import { type AiReportTranslations } from '../../presenters/ai-report.translations.ts';
import { type BlockedIssuesTranslations } from '../../presenters/blocked-issues.translations.ts';
import { type BottleneckAnalysisTranslations } from '../../presenters/bottleneck-analysis.translations.ts';
import { type CycleMetricsTranslations } from '../../presenters/cycle-metrics.translations.ts';
import { type SectionPlaceholderViewModel } from '../../presenters/cycle-report-shell.view-model.schema.ts';
import { type DriftingIssuesTranslations } from '../../presenters/drifting-issues.translations.ts';
import { type EstimationAccuracyTranslations } from '../../presenters/estimation-accuracy.translations.ts';
import { AiReportSectionView } from '../ai-report/ai-report-section.view.tsx';
import { BlockedIssuesSectionView } from '../blocked-issues/blocked-issues-section.view.tsx';
import { BottleneckAnalysisSectionView } from '../bottleneck-analysis/bottleneck-analysis-section.view.tsx';
import { CycleMetricsSectionView } from '../cycle-metrics/cycle-metrics-section.view.tsx';
import { DriftingIssuesSectionView } from '../drifting-issues/drifting-issues-section.view.tsx';
import { EstimationAccuracySectionView } from '../estimation-accuracy/estimation-accuracy-section.view.tsx';
import { CycleReportSectionPlaceholderView } from './cycle-report-section-placeholder.view.tsx';

interface CycleReportSectionRendererViewProps {
  placeholder: SectionPlaceholderViewModel;
  metricsState: CycleMetricsState;
  bottleneckState: BottleneckAnalysisState;
  blockedIssuesState: BlockedIssuesState;
  estimationState: EstimationAccuracyState;
  driftingState: DriftingIssuesState;
  aiReportState: AiReportState;
  metricsTranslations: CycleMetricsTranslations;
  bottleneckTranslations: BottleneckAnalysisTranslations;
  blockedIssuesTranslations: BlockedIssuesTranslations;
  estimationTranslations: EstimationAccuracyTranslations;
  driftingTranslations: DriftingIssuesTranslations;
  aiReportTranslations: AiReportTranslations;
  onMemberClick: (memberName: string) => void;
  onGenerateAiReport: () => void;
  onExportAiReport: () => void;
  onCopyAiReport: () => void;
}

export function CycleReportSectionRendererView({
  placeholder,
  metricsState,
  bottleneckState,
  blockedIssuesState,
  estimationState,
  driftingState,
  aiReportState,
  metricsTranslations,
  bottleneckTranslations,
  blockedIssuesTranslations,
  estimationTranslations,
  driftingTranslations,
  aiReportTranslations,
  onMemberClick,
  onGenerateAiReport,
  onExportAiReport,
  onCopyAiReport,
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
        onMemberClick={onMemberClick}
      />
    );
  }
  if (placeholder.id === 'estimation') {
    return (
      <EstimationAccuracySectionView
        state={estimationState}
        translations={estimationTranslations}
      />
    );
  }
  if (placeholder.id === 'drifting') {
    return (
      <DriftingIssuesSectionView
        state={driftingState}
        translations={driftingTranslations}
        onMemberClick={onMemberClick}
      />
    );
  }
  if (placeholder.id === 'ai-report') {
    return (
      <AiReportSectionView
        state={aiReportState}
        translations={aiReportTranslations}
        onGenerate={onGenerateAiReport}
        onExport={onExportAiReport}
        onCopy={onCopyAiReport}
      />
    );
  }
  return <CycleReportSectionPlaceholderView placeholder={placeholder} />;
}
