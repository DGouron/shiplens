import {
  type TeamSelectionProps,
  type SelectedTeamProps,
  type SelectedProjectProps,
} from './team-selection.schema.js';
import { teamSelectionGuard } from './team-selection.guard.js';

export class TeamSelection {
  private constructor(private readonly props: TeamSelectionProps) {}

  static create(props: unknown): TeamSelection {
    const validatedProps = teamSelectionGuard.parse(props);
    return new TeamSelection(validatedProps);
  }

  get selectedTeams(): SelectedTeamProps[] {
    return this.props.selectedTeams;
  }

  get selectedProjects(): SelectedProjectProps[] {
    return this.props.selectedProjects;
  }
}
