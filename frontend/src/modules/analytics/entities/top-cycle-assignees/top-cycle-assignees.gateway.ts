import {
  type CycleAssigneeIssuesResponse,
  type TopCycleAssigneesResponse,
} from './top-cycle-assignees.response.ts';

export abstract class TopCycleAssigneesGateway {
  abstract fetchTopCycleAssignees(params: {
    teamId: string;
  }): Promise<TopCycleAssigneesResponse>;

  abstract fetchCycleAssigneeIssues(params: {
    teamId: string;
    assigneeName: string;
  }): Promise<CycleAssigneeIssuesResponse>;
}
