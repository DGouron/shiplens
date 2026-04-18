import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type TopCycleAssigneesGateway } from '../entities/top-cycle-assignees/top-cycle-assignees.gateway.ts';
import { type CycleAssigneeIssuesResponse } from '../entities/top-cycle-assignees/top-cycle-assignees.response.ts';

export interface ListCycleAssigneeIssuesParams {
  teamId: string;
  assigneeName: string;
}

export class ListCycleAssigneeIssuesUsecase
  implements Usecase<ListCycleAssigneeIssuesParams, CycleAssigneeIssuesResponse>
{
  constructor(private readonly gateway: TopCycleAssigneesGateway) {}

  async execute(
    params: ListCycleAssigneeIssuesParams,
  ): Promise<CycleAssigneeIssuesResponse> {
    return this.gateway.fetchCycleAssigneeIssues({
      teamId: params.teamId,
      assigneeName: params.assigneeName,
    });
  }
}
