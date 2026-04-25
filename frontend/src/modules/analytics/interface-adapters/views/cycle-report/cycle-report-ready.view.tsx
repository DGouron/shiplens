import { type AiReportState } from '../../hooks/use-ai-report.ts';
import { type BlockedIssuesState } from '../../hooks/use-blocked-issues.ts';
import { type BottleneckAnalysisState } from '../../hooks/use-bottleneck-analysis.ts';
import { type CycleMetricsState } from '../../hooks/use-cycle-metrics.ts';
import { type DriftingIssuesState } from '../../hooks/use-drifting-issues.ts';
import { type EstimationAccuracyState } from '../../hooks/use-estimation-accuracy.ts';
import { type MemberDigestState } from '../../hooks/use-member-digest.ts';
import { type MemberMetricsState } from '../../hooks/use-member-metrics.ts';
import { type AiReportTranslations } from '../../presenters/ai-report.translations.ts';
import { type BlockedIssuesTranslations } from '../../presenters/blocked-issues.translations.ts';
import { type BottleneckAnalysisTranslations } from '../../presenters/bottleneck-analysis.translations.ts';
import { type CycleMetricsTranslations } from '../../presenters/cycle-metrics.translations.ts';
import { type CycleReportShellViewModel } from '../../presenters/cycle-report-shell.view-model.schema.ts';
import { type DriftingIssuesTranslations } from '../../presenters/drifting-issues.translations.ts';
import { type EstimationAccuracyTranslations } from '../../presenters/estimation-accuracy.translations.ts';
import { type MemberDigestTranslations } from '../../presenters/member-digest.translations.ts';
import { type MemberFilterViewModel } from '../../presenters/member-filter.view-model.schema.ts';
import { MemberDigestSectionView } from '../member-digest/member-digest-section.view.tsx';
import { MemberFilterView } from '../member-filter/member-filter.view.tsx';
import { CycleReportCycleSelectorView } from './cycle-report-cycle-selector.view.tsx';
import { CycleReportEmptyPromptView } from './cycle-report-empty-prompt.view.tsx';
import { CycleReportSectionRendererView } from './cycle-report-section-renderer.view.tsx';
import { CycleReportTeamSelectorView } from './cycle-report-team-selector.view.tsx';

interface CycleReportReadyViewProps {
  viewModel: CycleReportShellViewModel;
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
  metricsTranslations: CycleMetricsTranslations;
  bottleneckTranslations: BottleneckAnalysisTranslations;
  blockedIssuesTranslations: BlockedIssuesTranslations;
  estimationTranslations: EstimationAccuracyTranslations;
  driftingTranslations: DriftingIssuesTranslations;
  aiReportTranslations: AiReportTranslations;
  memberDigestTranslations: MemberDigestTranslations;
  onTeamChange: (teamId: string) => void;
  onCycleChange: (cycleId: string) => void;
  onMemberSelect: (memberName: string | null) => void;
  onMemberClick: (memberName: string) => void;
  onGenerateAiReport: () => void;
  onExportAiReport: () => void;
  onCopyAiReport: () => void;
  onGenerateMemberDigest: () => void;
  onCopyMemberDigest: () => void;
}

export function CycleReportReadyView({
  viewModel,
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
  metricsTranslations,
  bottleneckTranslations,
  blockedIssuesTranslations,
  estimationTranslations,
  driftingTranslations,
  aiReportTranslations,
  memberDigestTranslations,
  onTeamChange,
  onCycleChange,
  onMemberSelect,
  onMemberClick,
  onGenerateAiReport,
  onExportAiReport,
  onCopyAiReport,
  onGenerateMemberDigest,
  onCopyMemberDigest,
}: CycleReportReadyViewProps) {
  return (
    <main data-testid="cycle-report-page" className="container">
      <h1 className="page-title">{viewModel.heading}</h1>
      <div className="cycle-report-toolbar">
        <CycleReportTeamSelectorView
          label={viewModel.teamSelector.label}
          placeholder={viewModel.teamSelector.placeholder}
          selectedTeamId={viewModel.teamSelector.selectedTeamId}
          options={viewModel.teamSelector.options}
          onTeamChange={onTeamChange}
        />
        {viewModel.cycleSelector && (
          <CycleReportCycleSelectorView
            label={viewModel.cycleSelector.label}
            placeholder={viewModel.cycleSelector.placeholder}
            selectedCycleId={viewModel.cycleSelector.selectedCycleId}
            options={viewModel.cycleSelector.options}
            onCycleChange={onCycleChange}
          />
        )}
        <MemberFilterView
          viewModel={memberFilterViewModel}
          onMemberSelect={onMemberSelect}
        />
      </div>
      {viewModel.emptyPrompt && (
        <CycleReportEmptyPromptView message={viewModel.emptyPrompt} />
      )}
      {showMemberDigestSection && memberDigestState && (
        <MemberDigestSectionView
          state={memberDigestState}
          translations={memberDigestTranslations}
          onGenerate={onGenerateMemberDigest}
          onCopy={onCopyMemberDigest}
        />
      )}
      <div className="cycle-report-sections">
        {viewModel.sectionPlaceholders.map((placeholder) => (
          <CycleReportSectionRendererView
            key={placeholder.id}
            placeholder={placeholder}
            isMemberMode={viewModel.isMemberMode}
            metricsState={metricsState}
            memberMetricsState={memberMetricsState}
            bottleneckState={bottleneckState}
            blockedIssuesState={blockedIssuesState}
            estimationState={estimationState}
            driftingState={driftingState}
            aiReportState={aiReportState}
            metricsTranslations={metricsTranslations}
            bottleneckTranslations={bottleneckTranslations}
            blockedIssuesTranslations={blockedIssuesTranslations}
            estimationTranslations={estimationTranslations}
            driftingTranslations={driftingTranslations}
            aiReportTranslations={aiReportTranslations}
            onMemberClick={onMemberClick}
            onGenerateAiReport={onGenerateAiReport}
            onExportAiReport={onExportAiReport}
            onCopyAiReport={onCopyAiReport}
          />
        ))}
      </div>
    </main>
  );
}
