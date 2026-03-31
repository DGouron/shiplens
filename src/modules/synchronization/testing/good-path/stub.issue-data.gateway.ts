import { IssueDataGateway } from '../../entities/issue-data/issue-data.gateway.js';
import { type IssueData, type CycleData, type StateTransitionData, type CommentData } from '../../entities/issue-data/issue-data.schema.js';

export class StubIssueDataGateway extends IssueDataGateway {
  issuesByTeamId: Map<string, IssueData[]> = new Map();
  cyclesByTeamId: Map<string, CycleData[]> = new Map();
  transitionsByTeamId: Map<string, StateTransitionData[]> = new Map();

  upsertedIssues: IssueData[] = [];
  softDeletedIssues: Array<{ externalId: string; teamId: string }> = [];
  upsertedCycles: CycleData[] = [];
  createdComments: CommentData[] = [];
  upsertedTransitions: StateTransitionData[] = [];

  private upsertIssueFailuresRemaining = 0;

  failNextUpsertIssue(times: number): void {
    this.upsertIssueFailuresRemaining = times;
  }

  async upsertIssuesForTeam(teamId: string, issues: IssueData[]): Promise<void> {
    this.issuesByTeamId.set(teamId, issues);
  }

  async upsertCyclesForTeam(teamId: string, cycles: CycleData[]): Promise<void> {
    this.cyclesByTeamId.set(teamId, cycles);
  }

  async upsertTransitionsForTeam(teamId: string, transitions: StateTransitionData[]): Promise<void> {
    this.transitionsByTeamId.set(teamId, transitions);
  }

  async upsertIssue(issue: IssueData): Promise<void> {
    if (this.upsertIssueFailuresRemaining > 0) {
      this.upsertIssueFailuresRemaining--;
      throw new Error('Temporary failure');
    }
    const existing = this.upsertedIssues.findIndex(
      (existing) => existing.externalId === issue.externalId && existing.teamId === issue.teamId,
    );
    if (existing >= 0) {
      this.upsertedIssues[existing] = issue;
    } else {
      this.upsertedIssues.push(issue);
    }
  }

  async softDeleteIssue(externalId: string, teamId: string): Promise<void> {
    this.softDeletedIssues.push({ externalId, teamId });
  }

  async upsertCycle(cycle: CycleData): Promise<void> {
    const existing = this.upsertedCycles.findIndex(
      (existing) => existing.externalId === cycle.externalId && existing.teamId === cycle.teamId,
    );
    if (existing >= 0) {
      this.upsertedCycles[existing] = cycle;
    } else {
      this.upsertedCycles.push(cycle);
    }
  }

  async createComment(comment: CommentData): Promise<void> {
    this.createdComments.push(comment);
  }

  async upsertTransition(transition: StateTransitionData): Promise<void> {
    this.upsertedTransitions.push(transition);
  }
}
