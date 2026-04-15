import { type BlockedIssuesState } from '../../hooks/use-blocked-issues.ts';
import { type BottleneckAnalysisState } from '../../hooks/use-bottleneck-analysis.ts';
import { type CycleMetricsState } from '../../hooks/use-cycle-metrics.ts';
import { type BlockedIssuesTranslations } from '../../presenters/blocked-issues.translations.ts';
import { type BottleneckAnalysisTranslations } from '../../presenters/bottleneck-analysis.translations.ts';
import { type CycleMetricsTranslations } from '../../presenters/cycle-metrics.translations.ts';
import { type CycleReportShellViewModel } from '../../presenters/cycle-report-shell.view-model.schema.ts';
import { CycleReportCycleSelectorView } from './cycle-report-cycle-selector.view.tsx';
import { CycleReportEmptyPromptView } from './cycle-report-empty-prompt.view.tsx';
import { CycleReportSectionRendererView } from './cycle-report-section-renderer.view.tsx';
import { CycleReportTeamSelectorView } from './cycle-report-team-selector.view.tsx';

interface CycleReportReadyViewProps {
  viewModel: CycleReportShellViewModel;
  metricsState: CycleMetricsState;
  bottleneckState: BottleneckAnalysisState;
  blockedIssuesState: BlockedIssuesState;
  metricsTranslations: CycleMetricsTranslations;
  bottleneckTranslations: BottleneckAnalysisTranslations;
  blockedIssuesTranslations: BlockedIssuesTranslations;
  onTeamChange: (teamId: string) => void;
  onCycleChange: (cycleId: string) => void;
}

export function CycleReportReadyView({
  viewModel,
  metricsState,
  bottleneckState,
  blockedIssuesState,
  metricsTranslations,
  bottleneckTranslations,
  blockedIssuesTranslations,
  onTeamChange,
  onCycleChange,
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
      </div>
      {viewModel.emptyPrompt && (
        <CycleReportEmptyPromptView message={viewModel.emptyPrompt} />
      )}
      <div className="cycle-report-sections">
        {viewModel.sectionPlaceholders.map((placeholder) => (
          <CycleReportSectionRendererView
            key={placeholder.id}
            placeholder={placeholder}
            metricsState={metricsState}
            bottleneckState={bottleneckState}
            blockedIssuesState={blockedIssuesState}
            metricsTranslations={metricsTranslations}
            bottleneckTranslations={bottleneckTranslations}
            blockedIssuesTranslations={blockedIssuesTranslations}
          />
        ))}
      </div>
    </main>
  );
}
