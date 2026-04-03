import { LinearIssueDataGateway } from '../../entities/issue-data/linear-issue-data.gateway.js';
import { type PaginatedIssues, type CycleData, type StateTransitionData, type IssueData } from '../../entities/issue-data/issue-data.schema.js';

const PAGE_SIZE = 50;

const STATUS_POOL: Array<{ name: string; type: string }> = [
  { name: 'Backlog', type: 'backlog' },
  { name: 'Todo', type: 'unstarted' },
  { name: 'In Progress', type: 'started' },
  { name: 'Done', type: 'completed' },
];

function generateIssues(teamId: string, count: number): IssueData[] {
  return Array.from({ length: count }, (_, index) => ({
    externalId: `issue-${teamId}-${index + 1}`,
    teamId,
    title: `Issue ${index + 1}`,
    statusName: STATUS_POOL[index % 4].name,
    statusType: STATUS_POOL[index % 4].type,
    points: index % 3 === 0 ? index + 1 : null,
    labelIds: JSON.stringify(index % 2 === 0 ? ['label-1'] : []),
    assigneeName: index % 2 === 0 ? 'Alice Martin' : null,
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-16T10:00:00Z',
  }));
}

function generateCycles(teamId: string): CycleData[] {
  return Array.from({ length: 5 }, (_, index) => ({
    externalId: `cycle-${teamId}-${index + 1}`,
    teamId,
    name: `Sprint ${index + 1}`,
    number: index + 1,
    startsAt: `2026-0${index + 1}-01T00:00:00Z`,
    endsAt: `2026-0${index + 1}-14T00:00:00Z`,
    issueExternalIds: JSON.stringify(
      Array.from({ length: 10 }, (_, issueIndex) => `issue-${teamId}-${index * 10 + issueIndex + 1}`),
    ),
  }));
}

function generateTransitions(teamId: string, issueExternalIds: string[]): StateTransitionData[] {
  const transitions: StateTransitionData[] = [];

  for (const issueExternalId of issueExternalIds.slice(0, 5)) {
    for (let statusIndex = 0; statusIndex < STATUS_POOL.length; statusIndex++) {
      transitions.push({
        externalId: `transition-${issueExternalId}-${statusIndex}`,
        issueExternalId,
        teamId,
        fromStatusName: statusIndex === 0 ? null : STATUS_POOL[statusIndex - 1].name,
        fromStatusType: statusIndex === 0 ? null : STATUS_POOL[statusIndex - 1].type,
        toStatusName: STATUS_POOL[statusIndex].name,
        toStatusType: STATUS_POOL[statusIndex].type,
        occurredAt: `2026-01-${String(statusIndex + 15).padStart(2, '0')}T10:00:00Z`,
      });
    }
  }

  return transitions;
}

export class StubLinearIssueDataGateway extends LinearIssueDataGateway {
  private issuesByTeamId: Map<string, IssueData[]> = new Map([
    ['team-1', generateIssues('team-1', 150)],
  ]);

  private cyclesByTeamId: Map<string, CycleData[]> = new Map([
    ['team-1', generateCycles('team-1')],
  ]);

  async getIssuesPage(
    _accessToken: string,
    teamId: string,
    cursor: string | null,
  ): Promise<PaginatedIssues> {
    const allIssues = this.issuesByTeamId.get(teamId) ?? [];
    const startIndex = cursor ? parseInt(cursor, 10) : 0;
    const pageIssues = allIssues.slice(startIndex, startIndex + PAGE_SIZE);
    const nextIndex = startIndex + PAGE_SIZE;
    const hasNextPage = nextIndex < allIssues.length;

    return {
      issues: pageIssues,
      hasNextPage,
      endCursor: hasNextPage ? String(nextIndex) : null,
    };
  }

  async getCycles(
    _accessToken: string,
    teamId: string,
  ): Promise<CycleData[]> {
    return this.cyclesByTeamId.get(teamId) ?? [];
  }

  async getIssueHistory(
    _accessToken: string,
    teamId: string,
    issueExternalIds: string[],
  ): Promise<StateTransitionData[]> {
    return generateTransitions(teamId, issueExternalIds);
  }

  setEmptyTeam(teamId: string): void {
    this.issuesByTeamId.set(teamId, []);
    this.cyclesByTeamId.set(teamId, []);
  }
}
