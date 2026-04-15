import { useCycleReportPage } from '../hooks/use-cycle-report-page.ts';
import { type CycleReportShellViewModel } from '../presenters/cycle-report-shell.view-model.schema.ts';
import { CycleReportCycleSelectorView } from './cycle-report-cycle-selector.view.tsx';
import { CycleReportEmptyPromptView } from './cycle-report-empty-prompt.view.tsx';
import { CycleReportSectionPlaceholderView } from './cycle-report-section-placeholder.view.tsx';
import { CycleReportTeamSelectorView } from './cycle-report-team-selector.view.tsx';

export function CycleReportView() {
  const { shellState, selectTeam, selectCycle } = useCycleReportPage();

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
      onTeamChange={selectTeam}
      onCycleChange={selectCycle}
    />
  );
}

interface CycleReportReadyViewProps {
  viewModel: CycleReportShellViewModel;
  onTeamChange: (teamId: string) => void;
  onCycleChange: (cycleId: string) => void;
}

function CycleReportReadyView({
  viewModel,
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
      {viewModel.sectionPlaceholders.length > 0 && (
        <div className="cycle-report-sections">
          {viewModel.sectionPlaceholders.map((placeholder) => (
            <CycleReportSectionPlaceholderView
              key={placeholder.id}
              placeholder={placeholder}
            />
          ))}
        </div>
      )}
    </main>
  );
}
