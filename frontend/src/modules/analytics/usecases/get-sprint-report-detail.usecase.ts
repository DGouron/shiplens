import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import {
  type GetSprintReportDetailParams,
  type SprintReportGateway,
} from '../entities/sprint-report/sprint-report.gateway.ts';
import { type SprintReportDetailResponse } from '../entities/sprint-report/sprint-report.response.ts';

export class GetSprintReportDetailUsecase
  implements Usecase<GetSprintReportDetailParams, SprintReportDetailResponse>
{
  constructor(private readonly gateway: SprintReportGateway) {}

  async execute(
    params: GetSprintReportDetailParams,
  ): Promise<SprintReportDetailResponse> {
    return this.gateway.getDetail(params);
  }
}
