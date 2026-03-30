import { TeamSelectionGateway } from '../../entities/team-selection/team-selection.gateway.js';
import { type TeamSelection } from '../../entities/team-selection/team-selection.js';

export class StubTeamSelectionGateway extends TeamSelectionGateway {
  selection: TeamSelection | null = null;

  async save(selection: TeamSelection): Promise<void> {
    this.selection = selection;
  }

  async get(): Promise<TeamSelection | null> {
    return this.selection;
  }
}
