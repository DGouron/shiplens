import {
  type ActiveCycleLocator,
  type CycleAssigneeAggregate,
  type CycleAssigneeIssueDetail,
  type CycleAssigneeIssuesResult,
} from '../../entities/top-cycle-assignees/top-cycle-assignees.schema.js';
import { TopCycleAssigneesDataGateway } from '../../entities/top-cycle-assignees/top-cycle-assignees-data.gateway.js';

export class StubTopCycleAssigneesDataGateway extends TopCycleAssigneesDataGateway {
  activeCycleLocatorByTeamId: Map<string, ActiveCycleLocator | null> =
    new Map();

  assigneeAggregatesByCycleKey: Map<string, CycleAssigneeAggregate[]> =
    new Map();

  issuesByAssigneeKey: Map<string, CycleAssigneeIssuesResult> = new Map();

  lastStartedStatuses: string[] | null = null;
  lastCompletedStatuses: string[] | null = null;

  async getActiveCycleLocator(
    teamId: string,
  ): Promise<ActiveCycleLocator | null> {
    return this.activeCycleLocatorByTeamId.get(teamId) ?? null;
  }

  async getCycleAssigneeAggregates(
    teamId: string,
    cycleId: string,
    startedStatuses: string[],
    completedStatuses: string[],
  ): Promise<CycleAssigneeAggregate[]> {
    this.lastStartedStatuses = startedStatuses;
    this.lastCompletedStatuses = completedStatuses;
    return (
      this.assigneeAggregatesByCycleKey.get(
        this.buildCycleKey(teamId, cycleId),
      ) ?? []
    );
  }

  async getCycleIssuesForAssignee(
    teamId: string,
    cycleId: string,
    assigneeName: string,
    startedStatuses: string[],
    completedStatuses: string[],
  ): Promise<CycleAssigneeIssuesResult> {
    this.lastStartedStatuses = startedStatuses;
    this.lastCompletedStatuses = completedStatuses;
    const key = this.buildAssigneeKey(teamId, cycleId, assigneeName);
    return (
      this.issuesByAssigneeKey.get(key) ?? {
        assigneeName,
        issues: [],
      }
    );
  }

  setActiveCycle(teamId: string, locator: ActiveCycleLocator | null): void {
    this.activeCycleLocatorByTeamId.set(teamId, locator);
  }

  setAssigneeAggregates(
    teamId: string,
    cycleId: string,
    aggregates: CycleAssigneeAggregate[],
  ): void {
    this.assigneeAggregatesByCycleKey.set(
      this.buildCycleKey(teamId, cycleId),
      aggregates,
    );
  }

  setIssuesForAssignee(
    teamId: string,
    cycleId: string,
    assigneeName: string,
    result: { assigneeName: string; issues: CycleAssigneeIssueDetail[] },
  ): void {
    const key = this.buildAssigneeKey(teamId, cycleId, assigneeName);
    this.issuesByAssigneeKey.set(key, result);
  }

  private buildCycleKey(teamId: string, cycleId: string): string {
    return `${teamId}::${cycleId}`;
  }

  private buildAssigneeKey(
    teamId: string,
    cycleId: string,
    assigneeName: string,
  ): string {
    return `${teamId}::${cycleId}::${assigneeName}`;
  }
}
