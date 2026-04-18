import {
  type ActiveCycleLocator,
  type CycleProjectAggregate,
  type CycleProjectIssueDetail,
  type CycleProjectIssuesResult,
} from '../../entities/top-cycle-projects/top-cycle-projects.schema.js';
import { TopCycleProjectsDataGateway } from '../../entities/top-cycle-projects/top-cycle-projects-data.gateway.js';

export class StubTopCycleProjectsDataGateway extends TopCycleProjectsDataGateway {
  activeCycleLocatorByTeamId: Map<string, ActiveCycleLocator | null> =
    new Map();

  projectAggregatesByTeamId: Map<string, CycleProjectAggregate[]> = new Map();

  issuesByProjectKey: Map<string, CycleProjectIssuesResult> = new Map();

  lastStartedStatuses: string[] | null = null;
  lastCompletedStatuses: string[] | null = null;

  async getActiveCycleLocator(
    teamId: string,
  ): Promise<ActiveCycleLocator | null> {
    return this.activeCycleLocatorByTeamId.get(teamId) ?? null;
  }

  async getCycleProjectAggregates(
    teamId: string,
    _cycleId: string,
    startedStatuses: string[],
    completedStatuses: string[],
  ): Promise<CycleProjectAggregate[]> {
    this.lastStartedStatuses = startedStatuses;
    this.lastCompletedStatuses = completedStatuses;
    return this.projectAggregatesByTeamId.get(teamId) ?? [];
  }

  async getCycleIssuesForProject(
    teamId: string,
    cycleId: string,
    projectExternalIdOrNull: string | null,
  ): Promise<CycleProjectIssuesResult> {
    const key = this.buildIssueKey(teamId, cycleId, projectExternalIdOrNull);
    return (
      this.issuesByProjectKey.get(key) ?? { projectName: null, issues: [] }
    );
  }

  setIssuesForProject(
    teamId: string,
    cycleId: string,
    projectExternalIdOrNull: string | null,
    result: { projectName: string | null; issues: CycleProjectIssueDetail[] },
  ): void {
    const key = this.buildIssueKey(teamId, cycleId, projectExternalIdOrNull);
    this.issuesByProjectKey.set(key, result);
  }

  private buildIssueKey(
    teamId: string,
    cycleId: string,
    projectExternalIdOrNull: string | null,
  ): string {
    return `${teamId}|${cycleId}|${projectExternalIdOrNull ?? ''}`;
  }
}
