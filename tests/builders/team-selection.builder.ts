import { TeamSelection } from '@modules/synchronization/entities/team-selection/team-selection.js';
import { type TeamSelectionProps } from '@modules/synchronization/entities/team-selection/team-selection.schema.js';
import { EntityBuilder } from '@shared/foundation/testing/entity-builder.js';

const defaultProps: TeamSelectionProps = {
  selectedTeams: [
    { teamId: 'team-1', teamName: 'Frontend' },
    { teamId: 'team-2', teamName: 'Backend' },
  ],
  selectedProjects: [
    { projectId: 'proj-1', projectName: 'v2 Launch', teamId: 'team-1' },
  ],
};

export class TeamSelectionBuilder extends EntityBuilder<
  TeamSelectionProps,
  TeamSelection
> {
  constructor() {
    super(defaultProps);
  }

  withSelectedTeams(teams: TeamSelectionProps['selectedTeams']): this {
    this.props.selectedTeams = teams;
    return this;
  }

  withSelectedProjects(projects: TeamSelectionProps['selectedProjects']): this {
    this.props.selectedProjects = projects;
    return this;
  }

  build(): TeamSelection {
    return TeamSelection.create({ ...this.props });
  }
}
