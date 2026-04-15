import { type SyncAvailableTeamResponse } from '@/modules/synchronization/entities/sync/sync.response.ts';
import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type TeamCyclesResponse } from '../../entities/team-cycles/team-cycles.response.ts';
import { type CycleReportShellTranslations } from './cycle-report-shell.translations.ts';
import {
  type CycleReportShellViewModel,
  type SectionPlaceholderViewModel,
} from './cycle-report-shell.view-model.schema.ts';

export interface CycleReportShellInput {
  availableTeams: SyncAvailableTeamResponse[];
  teamCycles: TeamCyclesResponse | null;
  selectedTeamId: string | null;
  selectedCycleId: string | null;
}

export class CycleReportShellPresenter
  implements Presenter<CycleReportShellInput, CycleReportShellViewModel>
{
  constructor(private readonly translations: CycleReportShellTranslations) {}

  present(input: CycleReportShellInput): CycleReportShellViewModel {
    const hasSelectedTeam = input.selectedTeamId !== null;
    const hasSelectedCycle = input.selectedCycleId !== null;

    return {
      heading: this.translations.pageTitle,
      teamSelector: {
        label: this.translations.teamSelectorLabel,
        placeholder: this.translations.teamSelectorPlaceholder,
        selectedTeamId: input.selectedTeamId,
        options: input.availableTeams.map((team) => ({
          teamId: team.teamId,
          teamName: team.teamName,
        })),
      },
      cycleSelector: hasSelectedTeam
        ? {
            label: this.translations.cycleSelectorLabel,
            placeholder: this.translations.cycleSelectorPlaceholder,
            selectedCycleId: input.selectedCycleId,
            options: (input.teamCycles?.cycles ?? []).map((cycle) => ({
              cycleId: cycle.externalId,
              label: cycle.name,
              status: cycle.status,
            })),
          }
        : null,
      emptyPrompt: hasSelectedTeam ? null : this.translations.emptyPrompt,
      sectionPlaceholders: hasSelectedTeam
        ? this.buildSectionPlaceholders(hasSelectedCycle)
        : [],
    };
  }

  private buildSectionPlaceholders(
    hasSelectedCycle: boolean,
  ): SectionPlaceholderViewModel[] {
    return [
      {
        id: 'metrics',
        title: this.translations.sectionMetrics,
        canRenderContent: hasSelectedCycle,
      },
      {
        id: 'bottlenecks',
        title: this.translations.sectionBottlenecks,
        canRenderContent: hasSelectedCycle,
      },
      {
        id: 'blocked',
        title: this.translations.sectionBlocked,
        canRenderContent: true,
      },
      {
        id: 'estimation',
        title: this.translations.sectionEstimation,
        canRenderContent: hasSelectedCycle,
      },
      {
        id: 'drifting',
        title: this.translations.sectionDrifting,
        canRenderContent: true,
      },
      {
        id: 'ai-report',
        title: this.translations.sectionAiReport,
        canRenderContent: hasSelectedCycle,
      },
    ];
  }
}
