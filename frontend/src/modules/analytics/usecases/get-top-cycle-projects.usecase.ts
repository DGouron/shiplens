import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TopCycleProjectsGateway } from '../entities/top-cycle-projects/top-cycle-projects.gateway.ts';
import { type TopCycleProjectsResponse } from '../entities/top-cycle-projects/top-cycle-projects.response.ts';

export interface GetTopCycleProjectsParams {
  teamId: string;
}

export class GetTopCycleProjectsUsecase
  implements Usecase<GetTopCycleProjectsParams, TopCycleProjectsResponse>
{
  constructor(private readonly gateway: TopCycleProjectsGateway) {}

  async execute(
    params: GetTopCycleProjectsParams,
  ): Promise<TopCycleProjectsResponse> {
    return this.gateway.fetchTopCycleProjects({ teamId: params.teamId });
  }
}
