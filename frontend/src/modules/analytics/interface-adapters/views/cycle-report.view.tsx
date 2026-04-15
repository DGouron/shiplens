import { useLocale } from '@/locale-context.tsx';
import { type BlockedIssuesState } from '../hooks/use-blocked-issues.ts';
import { type BottleneckAnalysisState } from '../hooks/use-bottleneck-analysis.ts';
import { type CycleMetricsState } from '../hooks/use-cycle-metrics.ts';
import { useCycleReportPage } from '../hooks/use-cycle-report-page.ts';
import {
  type BlockedIssuesTranslations,
  blockedIssuesTranslations,
} from '../presenters/blocked-issues.translations.ts';
import {
  type BottleneckAnalysisTranslations,
  bottleneckAnalysisTranslations,
} from '../presenters/bottleneck-analysis.translations.ts';
import {
  type CycleMetricsTranslations,
  cycleMetricsTranslations,
} from '../presenters/cycle-metrics.translations.ts';
import {
  type CycleReportShellViewModel,
  type SectionPlaceholderViewModel,
} from '../presenters/cycle-report-shell.view-model.schema.ts';
import { BlockedIssuesSectionView } from './blocked-issues.view.tsx';
import { BottleneckAnalysisSectionView } from './bottleneck-analysis.view.tsx';
import { CycleMetricsSectionView } from './cycle-metrics.view.tsx';
import { CycleReportCycleSelectorView } from './cycle-report-cycle-selector.view.tsx';
import { CycleReportEmptyPromptView } from './cycle-report-empty-prompt.view.tsx';
import { CycleReportSectionPlaceholderView } from './cycle-report-section-placeholder.view.tsx';
import { CycleReportTeamSelectorView } from './cycle-report-team-selector.view.tsx';

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
  const metricsTranslations = cycleMetricsTranslations[locale];
  const bottleneckTranslations = bottleneckAnalysisTranslations[locale];
  const blockedIssuesTranslationsBundle = blockedIssuesTranslations[locale];

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
      metricsTranslations={metricsTranslations}
      bottleneckTranslations={bottleneckTranslations}
      blockedIssuesTranslationsBundle={blockedIssuesTranslationsBundle}
      onTeamChange={selectTeam}
      onCycleChange={selectCycle}
    />
  );
}

interface CycleReportReadyViewProps {
  viewModel: CycleReportShellViewModel;
  metricsState: CycleMetricsState;
  bottleneckState: BottleneckAnalysisState;
  blockedIssuesState: BlockedIssuesState;
  metricsTranslations: CycleMetricsTranslations;
  bottleneckTranslations: BottleneckAnalysisTranslations;
  blockedIssuesTranslationsBundle: BlockedIssuesTranslations;
  onTeamChange: (teamId: string) => void;
  onCycleChange: (cycleId: string) => void;
}

function CycleReportReadyView({
  viewModel,
  metricsState,
  bottleneckState,
  blockedIssuesState,
  metricsTranslations,
  bottleneckTranslations,
  blockedIssuesTranslationsBundle,
  onTeamChange,
  onCycleChange,
}: CycleReportReadyViewProps) {
  const hasSelectedTeam = viewModel.teamSelector.selectedTeamId !== null;
  const hasSelectedCycle =
    viewModel.cycleSelector !== null &&
    viewModel.cycleSelector.selectedCycleId !== null;
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
      {viewModel.sectionPlaceholders.length > 0 && (
        <div className="cycle-report-sections">
          {viewModel.sectionPlaceholders.map((placeholder) => (
            <CycleReportSectionRenderer
              key={placeholder.id}
              placeholder={placeholder}
              hasSelectedTeam={hasSelectedTeam}
              hasSelectedCycle={hasSelectedCycle}
              metricsState={metricsState}
              bottleneckState={bottleneckState}
              blockedIssuesState={blockedIssuesState}
              metricsTranslations={metricsTranslations}
              bottleneckTranslations={bottleneckTranslations}
              blockedIssuesTranslationsBundle={blockedIssuesTranslationsBundle}
            />
          ))}
        </div>
      )}
    </main>
  );
}

interface CycleReportSectionRendererProps {
  placeholder: SectionPlaceholderViewModel;
  hasSelectedTeam: boolean;
  hasSelectedCycle: boolean;
  metricsState: CycleMetricsState;
  bottleneckState: BottleneckAnalysisState;
  blockedIssuesState: BlockedIssuesState;
  metricsTranslations: CycleMetricsTranslations;
  bottleneckTranslations: BottleneckAnalysisTranslations;
  blockedIssuesTranslationsBundle: BlockedIssuesTranslations;
}

function CycleReportSectionRenderer({
  placeholder,
  hasSelectedTeam,
  hasSelectedCycle,
  metricsState,
  bottleneckState,
  blockedIssuesState,
  metricsTranslations,
  bottleneckTranslations,
  blockedIssuesTranslationsBundle,
}: CycleReportSectionRendererProps) {
  if (placeholder.id === 'metrics' && hasSelectedCycle) {
    return (
      <CycleMetricsSectionView
        state={metricsState}
        translations={metricsTranslations}
      />
    );
  }
  if (placeholder.id === 'bottlenecks' && hasSelectedCycle) {
    return (
      <BottleneckAnalysisSectionView
        state={bottleneckState}
        translations={bottleneckTranslations}
      />
    );
  }
  if (placeholder.id === 'blocked' && hasSelectedTeam) {
    return (
      <BlockedIssuesSectionView
        state={blockedIssuesState}
        translations={blockedIssuesTranslationsBundle}
      />
    );
  }
  return <CycleReportSectionPlaceholderView placeholder={placeholder} />;
}
