import { type TeamSelection } from './team-selection.js';

export abstract class TeamSelectionGateway {
  abstract save(selection: TeamSelection): Promise<void>;
  abstract get(): Promise<TeamSelection | null>;
}
