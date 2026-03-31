import { type IssueData, type CycleData, type StateTransitionData } from './issue-data.schema.js';

export abstract class IssueDataGateway {
  abstract upsertIssuesForTeam(teamId: string, issues: IssueData[]): Promise<void>;
  abstract upsertCyclesForTeam(teamId: string, cycles: CycleData[]): Promise<void>;
  abstract upsertTransitionsForTeam(teamId: string, transitions: StateTransitionData[]): Promise<void>;
}
