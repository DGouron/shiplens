import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TopCycleAssigneesGateway } from '../entities/top-cycle-assignees/top-cycle-assignees.gateway.ts';
import { type TopCycleAssigneesResponse } from '../entities/top-cycle-assignees/top-cycle-assignees.response.ts';

export interface GetTopCycleAssigneesParams {
  teamId: string;
}

export class GetTopCycleAssigneesUsecase
  implements Usecase<GetTopCycleAssigneesParams, TopCycleAssigneesResponse>
{
  constructor(private readonly gateway: TopCycleAssigneesGateway) {}

  async execute(
    params: GetTopCycleAssigneesParams,
  ): Promise<TopCycleAssigneesResponse> {
    return this.gateway.fetchTopCycleAssignees({ teamId: params.teamId });
  }
}
