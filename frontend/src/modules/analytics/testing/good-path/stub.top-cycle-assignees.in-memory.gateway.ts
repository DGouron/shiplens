import { TopCycleAssigneesGateway } from '../../entities/top-cycle-assignees/top-cycle-assignees.gateway.ts';
import {
  type CycleAssigneeIssuesResponse,
  type TopCycleAssigneesResponse,
} from '../../entities/top-cycle-assignees/top-cycle-assignees.response.ts';

interface StubTopCycleAssigneesGatewayOptions {
  ranking?: TopCycleAssigneesResponse;
  rankingByTeamId?: Record<string, TopCycleAssigneesResponse>;
  issuesByAssigneeName?: Record<string, CycleAssigneeIssuesResponse>;
}

export class StubTopCycleAssigneesGateway extends TopCycleAssigneesGateway {
  private readonly ranking: TopCycleAssigneesResponse;
  private readonly rankingByTeamId: Record<string, TopCycleAssigneesResponse>;
  private readonly issuesByAssigneeName: Record<
    string,
    CycleAssigneeIssuesResponse
  >;
  topCallCount = 0;
  issuesCallCount = 0;
  lastIssuesCall: { teamId: string; assigneeName: string } | null = null;

  constructor(options: StubTopCycleAssigneesGatewayOptions = {}) {
    super();
    this.ranking = options.ranking ?? { status: 'no_active_cycle' };
    this.rankingByTeamId = options.rankingByTeamId ?? {};
    this.issuesByAssigneeName = options.issuesByAssigneeName ?? {};
  }

  async fetchTopCycleAssignees(params: {
    teamId: string;
  }): Promise<TopCycleAssigneesResponse> {
    this.topCallCount += 1;
    const byTeam = this.rankingByTeamId[params.teamId];
    if (byTeam !== undefined) {
      return cloneRanking(byTeam);
    }
    return cloneRanking(this.ranking);
  }

  async fetchCycleAssigneeIssues(params: {
    teamId: string;
    assigneeName: string;
  }): Promise<CycleAssigneeIssuesResponse> {
    this.issuesCallCount += 1;
    this.lastIssuesCall = {
      teamId: params.teamId,
      assigneeName: params.assigneeName,
    };
    const issues = this.issuesByAssigneeName[params.assigneeName];
    if (issues !== undefined) {
      return cloneIssues(issues);
    }
    return {
      status: 'ready',
      cycleId: 'cycle-1',
      assigneeName: params.assigneeName,
      issues: [],
    };
  }
}

function cloneRanking(
  response: TopCycleAssigneesResponse,
): TopCycleAssigneesResponse {
  if (response.status === 'no_active_cycle') {
    return { status: 'no_active_cycle' };
  }
  return {
    status: 'ready',
    cycleId: response.cycleId,
    cycleName: response.cycleName,
    assignees: response.assignees.map((assignee) => ({ ...assignee })),
  };
}

function cloneIssues(
  response: CycleAssigneeIssuesResponse,
): CycleAssigneeIssuesResponse {
  if (response.status === 'no_active_cycle') {
    return { status: 'no_active_cycle' };
  }
  return {
    status: 'ready',
    cycleId: response.cycleId,
    assigneeName: response.assigneeName,
    issues: response.issues.map((issue) => ({ ...issue })),
  };
}
