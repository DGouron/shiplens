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
        ? this.buildSectionPlaceholders()
        : [],
    };
  }

  private buildSectionPlaceholders(): SectionPlaceholderViewModel[] {
    return [
      { id: 'metrics', title: this.translations.sectionMetrics },
      { id: 'bottlenecks', title: this.translations.sectionBottlenecks },
      { id: 'blocked', title: this.translations.sectionBlocked },
      { id: 'estimation', title: this.translations.sectionEstimation },
      { id: 'drifting', title: this.translations.sectionDrifting },
      { id: 'ai-report', title: this.translations.sectionAiReport },
    ];
  }
}
