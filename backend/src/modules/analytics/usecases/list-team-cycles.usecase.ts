import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { DataNotSynchronizedError } from '../entities/cycle-report-page/cycle-report-page.errors.js';
import { type CycleSummary } from '../entities/cycle-report-page/cycle-report-page.schema.js';
import { CycleReportPageDataGateway } from '../entities/cycle-report-page/cycle-report-page-data.gateway.js';

interface ListTeamCyclesParams {
  teamId: string;
}

interface ListTeamCyclesResult {
  cycles: CycleSummary[];
}

@Injectable()
export class ListTeamCyclesUsecase
  implements Usecase<ListTeamCyclesParams, ListTeamCyclesResult>
{
  constructor(
    private readonly cycleReportPageDataGateway: CycleReportPageDataGateway,
  ) {}

  async execute(params: ListTeamCyclesParams): Promise<ListTeamCyclesResult> {
    const isSynchronized = await this.cycleReportPageDataGateway.isSynchronized(
      params.teamId,
    );

    if (!isSynchronized) {
      throw new DataNotSynchronizedError();
    }

    const cycles = await this.cycleReportPageDataGateway.listCycles(
      params.teamId,
    );

    const sortedCycles = [...cycles].sort(
      (a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime(),
    );

    return { cycles: sortedCycles };
  }
}
