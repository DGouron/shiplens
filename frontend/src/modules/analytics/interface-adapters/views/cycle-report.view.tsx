import { useLocale } from '@/locale-context.tsx';
import { type CycleMetricsState } from '../hooks/use-cycle-metrics.ts';
import { useCycleReportPage } from '../hooks/use-cycle-report-page.ts';
import {
  type CycleMetricsTranslations,
  cycleMetricsTranslations,
} from '../presenters/cycle-metrics.translations.ts';
import {
  type CycleReportShellViewModel,
  type SectionPlaceholderViewModel,
} from '../presenters/cycle-report-shell.view-model.schema.ts';
import { CycleMetricsSectionView } from './cycle-metrics.view.tsx';
import { CycleReportCycleSelectorView } from './cycle-report-cycle-selector.view.tsx';
import { CycleReportEmptyPromptView } from './cycle-report-empty-prompt.view.tsx';
import { CycleReportSectionPlaceholderView } from './cycle-report-section-placeholder.view.tsx';
import { CycleReportTeamSelectorView } from './cycle-report-team-selector.view.tsx';

export function CycleReportView() {
  const locale = useLocale();
  const { shellState, metricsState, selectTeam, selectCycle } =
    useCycleReportPage();
  const metricsTranslations = cycleMetricsTranslations[locale];

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
      metricsTranslations={metricsTranslations}
      onTeamChange={selectTeam}
      onCycleChange={selectCycle}
    />
  );
}

interface CycleReportReadyViewProps {
  viewModel: CycleReportShellViewModel;
  metricsState: CycleMetricsState;
  metricsTranslations: CycleMetricsTranslations;
  onTeamChange: (teamId: string) => void;
  onCycleChange: (cycleId: string) => void;
}

function CycleReportReadyView({
  viewModel,
  metricsState,
  metricsTranslations,
  onTeamChange,
  onCycleChange,
}: CycleReportReadyViewProps) {
  const hasSelectedCycle = viewModel.cycleSelector?.selectedCycleId !== null;
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
              hasSelectedCycle={hasSelectedCycle}
              metricsState={metricsState}
              metricsTranslations={metricsTranslations}
            />
          ))}
        </div>
      )}
    </main>
  );
}

interface CycleReportSectionRendererProps {
  placeholder: SectionPlaceholderViewModel;
  hasSelectedCycle: boolean;
  metricsState: CycleMetricsState;
  metricsTranslations: CycleMetricsTranslations;
}

function CycleReportSectionRenderer({
  placeholder,
  hasSelectedCycle,
  metricsState,
  metricsTranslations,
}: CycleReportSectionRendererProps) {
  if (placeholder.id === 'metrics' && hasSelectedCycle) {
    return (
      <CycleMetricsSectionView
        state={metricsState}
        translations={metricsTranslations}
      />
    );
  }
  return <CycleReportSectionPlaceholderView placeholder={placeholder} />;
}
