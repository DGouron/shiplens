import { TopCycleProjectsGateway } from '../../entities/top-cycle-projects/top-cycle-projects.gateway.ts';
import {
  type CycleProjectIssuesResponse,
  type TopCycleProjectsResponse,
} from '../../entities/top-cycle-projects/top-cycle-projects.response.ts';

interface StubTopCycleProjectsGatewayOptions {
  ranking?: TopCycleProjectsResponse;
  rankingByTeamId?: Record<string, TopCycleProjectsResponse>;
  issuesByProjectId?: Record<string, CycleProjectIssuesResponse>;
}

export class StubTopCycleProjectsGateway extends TopCycleProjectsGateway {
  private readonly ranking: TopCycleProjectsResponse;
  private readonly rankingByTeamId: Record<string, TopCycleProjectsResponse>;
  private readonly issuesByProjectId: Record<
    string,
    CycleProjectIssuesResponse
  >;
  topCallCount = 0;
  issuesCallCount = 0;

  constructor(options: StubTopCycleProjectsGatewayOptions = {}) {
    super();
    this.ranking = options.ranking ?? { status: 'no_active_cycle' };
    this.rankingByTeamId = options.rankingByTeamId ?? {};
    this.issuesByProjectId = options.issuesByProjectId ?? {};
  }

  async fetchTopCycleProjects(params: {
    teamId: string;
  }): Promise<TopCycleProjectsResponse> {
    this.topCallCount += 1;
    const byTeam = this.rankingByTeamId[params.teamId];
    if (byTeam !== undefined) {
      return cloneRanking(byTeam);
    }
    return cloneRanking(this.ranking);
  }

  async fetchCycleProjectIssues(params: {
    teamId: string;
    projectId: string;
  }): Promise<CycleProjectIssuesResponse> {
    this.issuesCallCount += 1;
    const issues = this.issuesByProjectId[params.projectId];
    if (issues !== undefined) {
      return cloneIssues(issues);
    }
    return {
      status: 'ready',
      cycleId: 'cycle-1',
      projectId: params.projectId,
      projectName: 'Stub project',
      isNoProjectBucket: false,
      issues: [],
    };
  }
}

function cloneRanking(
  response: TopCycleProjectsResponse,
): TopCycleProjectsResponse {
  if (response.status === 'no_active_cycle') {
    return { status: 'no_active_cycle' };
  }
  return {
    status: 'ready',
    cycleId: response.cycleId,
    cycleName: response.cycleName,
    projects: response.projects.map((project) => ({ ...project })),
  };
}

function cloneIssues(
  response: CycleProjectIssuesResponse,
): CycleProjectIssuesResponse {
  if (response.status === 'no_active_cycle') {
    return { status: 'no_active_cycle' };
  }
  return {
    status: 'ready',
    cycleId: response.cycleId,
    projectId: response.projectId,
    projectName: response.projectName,
    isNoProjectBucket: response.isNoProjectBucket,
    issues: response.issues.map((issue) => ({ ...issue })),
  };
}
