import {
  type ActiveCycleLocator,
  type CycleAssigneeAggregate,
  type CycleAssigneeIssuesResult,
} from './top-cycle-assignees.schema.js';

export abstract class TopCycleAssigneesDataGateway {
  abstract getActiveCycleLocator(
    teamId: string,
  ): Promise<ActiveCycleLocator | null>;

  abstract getCycleAssigneeAggregates(
    teamId: string,
    cycleId: string,
    startedStatuses: string[],
    completedStatuses: string[],
  ): Promise<CycleAssigneeAggregate[]>;

  abstract getCycleIssuesForAssignee(
    teamId: string,
    cycleId: string,
    assigneeName: string,
    startedStatuses: string[],
    completedStatuses: string[],
  ): Promise<CycleAssigneeIssuesResult>;
}
