import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SprintReportGateway } from '../entities/sprint-report/sprint-report.gateway.js';
import { type SprintReport } from '../entities/sprint-report/sprint-report.js';
import { ReportNotFoundError } from '../entities/sprint-report/sprint-report.errors.js';

interface GetReportParams {
  reportId: string;
}

@Injectable()
export class GetReportUsecase
  implements Usecase<GetReportParams, SprintReport>
{
  constructor(private readonly sprintReportGateway: SprintReportGateway) {}

  async execute(params: GetReportParams): Promise<SprintReport> {
    const report = await this.sprintReportGateway.findById(params.reportId);
    if (!report) {
      throw new ReportNotFoundError();
    }
    return report;
  }
}
