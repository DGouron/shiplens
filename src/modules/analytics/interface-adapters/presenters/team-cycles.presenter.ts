import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type CycleSummary } from '../../entities/cycle-report-page/cycle-report-page.schema.js';

interface TeamCyclesInput {
  cycles: CycleSummary[];
}

export interface CycleSummaryDto {
  externalId: string;
  name: string;
  startsAt: string;
  endsAt: string;
  issueCount: number;
  status: string;
}

export interface TeamCyclesDto {
  cycles: CycleSummaryDto[];
}

@Injectable()
export class TeamCyclesPresenter
  implements Presenter<TeamCyclesInput, TeamCyclesDto>
{
  present(input: TeamCyclesInput): TeamCyclesDto {
    return {
      cycles: input.cycles.map((cycle) => ({
        externalId: cycle.externalId,
        name: cycle.name,
        startsAt: cycle.startsAt,
        endsAt: cycle.endsAt,
        issueCount: cycle.issueCount,
        status: cycle.isActive ? 'Cycle en cours' : 'Terminé',
      })),
    };
  }
}
