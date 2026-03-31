import { IssueDataGateway } from '../../entities/issue-data/issue-data.gateway.js';
import { type IssueData, type CycleData, type StateTransitionData } from '../../entities/issue-data/issue-data.schema.js';

export class StubIssueDataGateway extends IssueDataGateway {
  issuesByTeamId: Map<string, IssueData[]> = new Map();
  cyclesByTeamId: Map<string, CycleData[]> = new Map();
  transitionsByTeamId: Map<string, StateTransitionData[]> = new Map();

  async upsertIssuesForTeam(teamId: string, issues: IssueData[]): Promise<void> {
    this.issuesByTeamId.set(teamId, issues);
  }

  async upsertCyclesForTeam(teamId: string, cycles: CycleData[]): Promise<void> {
    this.cyclesByTeamId.set(teamId, cycles);
  }

  async upsertTransitionsForTeam(teamId: string, transitions: StateTransitionData[]): Promise<void> {
    this.transitionsByTeamId.set(teamId, transitions);
  }
}
