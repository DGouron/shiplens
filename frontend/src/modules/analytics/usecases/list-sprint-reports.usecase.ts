import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import {
  type ListSprintReportsParams,
  type SprintReportGateway,
} from '../entities/sprint-report/sprint-report.gateway.ts';
import { type SprintReportHistoryResponse } from '../entities/sprint-report/sprint-report.response.ts';

export class ListSprintReportsUsecase
  implements Usecase<ListSprintReportsParams, SprintReportHistoryResponse>
{
  constructor(private readonly gateway: SprintReportGateway) {}

  async execute(
    params: ListSprintReportsParams,
  ): Promise<SprintReportHistoryResponse> {
    return this.gateway.listForTeam(params);
  }
}
