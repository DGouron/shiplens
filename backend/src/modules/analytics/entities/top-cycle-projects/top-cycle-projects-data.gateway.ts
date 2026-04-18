import {
  type ActiveCycleLocator,
  type CycleProjectAggregate,
  type CycleProjectIssuesResult,
} from './top-cycle-projects.schema.js';

export abstract class TopCycleProjectsDataGateway {
  abstract getActiveCycleLocator(
    teamId: string,
  ): Promise<ActiveCycleLocator | null>;

  abstract getCycleProjectAggregates(
    teamId: string,
    cycleId: string,
    startedStatuses: string[],
    completedStatuses: string[],
  ): Promise<CycleProjectAggregate[]>;

  abstract getCycleIssuesForProject(
    teamId: string,
    cycleId: string,
    projectExternalIdOrNull: string | null,
  ): Promise<CycleProjectIssuesResult>;
}
