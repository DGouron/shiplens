import { type CycleIssue } from '../cycle-snapshot/cycle-snapshot.schema.js';

export interface SprintContext {
  cycleId: string;
  teamId: string;
  cycleName: string;
  startsAt: string;
  endsAt: string;
  issues: readonly CycleIssue[];
}

export interface TrendContext {
  previousVelocities: number[];
}

export abstract class SprintReportDataGateway {
  abstract isSynchronized(teamId: string): Promise<boolean>;
  abstract getSprintContext(
    cycleId: string,
    teamId: string,
    startedStatuses: readonly string[],
    completedStatuses: readonly string[],
  ): Promise<SprintContext>;
  abstract getTrendContext(
    cycleId: string,
    teamId: string,
    completedStatuses: readonly string[],
  ): Promise<TrendContext | null>;
}
