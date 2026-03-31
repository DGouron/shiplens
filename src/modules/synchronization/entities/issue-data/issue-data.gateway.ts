import { type IssueData, type CycleData, type StateTransitionData, type CommentData } from './issue-data.schema.js';

export abstract class IssueDataGateway {
  abstract upsertIssuesForTeam(teamId: string, issues: IssueData[]): Promise<void>;
  abstract upsertCyclesForTeam(teamId: string, cycles: CycleData[]): Promise<void>;
  abstract upsertTransitionsForTeam(teamId: string, transitions: StateTransitionData[]): Promise<void>;
  abstract upsertIssue(issue: IssueData): Promise<void>;
  abstract softDeleteIssue(externalId: string, teamId: string): Promise<void>;
  abstract upsertCycle(cycle: CycleData): Promise<void>;
  abstract createComment(comment: CommentData): Promise<void>;
  abstract upsertTransition(transition: StateTransitionData): Promise<void>;
}
