import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { DataNotSynchronizedError } from '../entities/cycle-report-page/cycle-report-page.errors.js';
import { type CycleIssueDetail } from '../entities/cycle-report-page/cycle-report-page.schema.js';
import { CycleReportPageDataGateway } from '../entities/cycle-report-page/cycle-report-page-data.gateway.js';

interface GetCycleIssuesParams {
  cycleId: string;
  teamId: string;
}

interface GetCycleIssuesResult {
  issues: CycleIssueDetail[];
}

@Injectable()
export class GetCycleIssuesUsecase
  implements Usecase<GetCycleIssuesParams, GetCycleIssuesResult>
{
  constructor(
    private readonly cycleReportPageDataGateway: CycleReportPageDataGateway,
  ) {}

  async execute(params: GetCycleIssuesParams): Promise<GetCycleIssuesResult> {
    const isSynchronized = await this.cycleReportPageDataGateway.isSynchronized(
      params.teamId,
    );

    if (!isSynchronized) {
      throw new DataNotSynchronizedError();
    }

    const issues = await this.cycleReportPageDataGateway.getCycleIssues(
      params.cycleId,
      params.teamId,
    );

    return { issues };
  }
}
