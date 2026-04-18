import {
  type CycleProjectIssuesResponse,
  type TopCycleProjectsResponse,
} from './top-cycle-projects.response.ts';

export abstract class TopCycleProjectsGateway {
  abstract fetchTopCycleProjects(params: {
    teamId: string;
  }): Promise<TopCycleProjectsResponse>;

  abstract fetchCycleProjectIssues(params: {
    teamId: string;
    projectId: string;
  }): Promise<CycleProjectIssuesResponse>;
}
