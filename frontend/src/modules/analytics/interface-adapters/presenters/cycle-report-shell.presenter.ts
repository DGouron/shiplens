import { type SyncAvailableTeamResponse } from '@/modules/synchronization/entities/sync/sync.response.ts';
import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type TeamCyclesResponse } from '../../entities/team-cycles/team-cycles.response.ts';
import { type CycleReportShellTranslations } from './cycle-report-shell.translations.ts';
import {
  type CycleReportShellViewModel,
  type SectionPlaceholderViewModel,
} from './cycle-report-shell.view-model.schema.ts';
import { formatMemberDisplayName } from './format-member-display-name.ts';

export interface CycleReportShellInput {
  availableTeams: SyncAvailableTeamResponse[];
  teamCycles: TeamCyclesResponse | null;
  selectedTeamId: string | null;
  selectedCycleId: string | null;
  selectedMemberName: string | null;
}

export class CycleReportShellPresenter
  implements Presenter<CycleReportShellInput, CycleReportShellViewModel>
{
  constructor(private readonly translations: CycleReportShellTranslations) {}

  present(input: CycleReportShellInput): CycleReportShellViewModel {
    const hasSelectedTeam = input.selectedTeamId !== null;
    const hasSelectedCycle = input.selectedCycleId !== null;
    const isMemberMode = input.selectedMemberName !== null;

    return {
      heading: this.translations.pageTitle,
      isMemberMode,
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
              startsAt: cycle.startsAt,
            })),
          }
        : null,
      emptyPrompt: hasSelectedTeam ? null : this.translations.emptyPrompt,
      sectionPlaceholders: hasSelectedTeam
        ? this.buildSectionPlaceholders(
            hasSelectedCycle,
            input.selectedMemberName,
          )
        : [],
    };
  }

  private buildSectionPlaceholders(
    hasSelectedCycle: boolean,
    selectedMemberName: string | null,
  ): SectionPlaceholderViewModel[] {
    const metricsTitle =
      selectedMemberName === null
        ? this.translations.sectionMetrics
        : this.translations.sectionMemberMetrics(
            formatMemberDisplayName(selectedMemberName),
          );
    const placeholders: SectionPlaceholderViewModel[] = [
      {
        id: 'metrics',
        title: metricsTitle,
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
    ];
    if (selectedMemberName === null) {
      placeholders.push({
        id: 'estimation',
        title: this.translations.sectionEstimation,
        canRenderContent: hasSelectedCycle,
      });
    }
    placeholders.push({
      id: 'drifting',
      title: this.translations.sectionDrifting,
      canRenderContent: true,
    });
    if (selectedMemberName === null) {
      placeholders.push({
        id: 'ai-report',
        title: this.translations.sectionAiReport,
        canRenderContent: hasSelectedCycle,
      });
    }
    return placeholders;
  }
}
