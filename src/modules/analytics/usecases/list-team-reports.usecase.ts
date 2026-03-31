import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { SprintReportGateway } from '../entities/sprint-report/sprint-report.gateway.js';
import { type SprintReport } from '../entities/sprint-report/sprint-report.js';

interface ListTeamReportsParams {
  teamId: string;
}

@Injectable()
export class ListTeamReportsUsecase
  implements Usecase<ListTeamReportsParams, SprintReport[]>
{
  constructor(private readonly sprintReportGateway: SprintReportGateway) {}

  async execute(params: ListTeamReportsParams): Promise<SprintReport[]> {
    return this.sprintReportGateway.findByTeamId(params.teamId);
  }
}
