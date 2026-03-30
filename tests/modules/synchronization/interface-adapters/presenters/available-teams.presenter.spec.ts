import { describe, it, expect } from 'vitest';
import { AvailableTeamsPresenter } from '@modules/synchronization/interface-adapters/presenters/available-teams.presenter.js';
import { type LinearTeam } from '@modules/synchronization/entities/team-selection/linear-team.gateway.js';

describe('AvailableTeamsPresenter', () => {
  const presenter = new AvailableTeamsPresenter();

  it('presents teams with their projects', () => {
    const teams: LinearTeam[] = [
      {
        teamId: 'team-1',
        teamName: 'Frontend',
        projects: [
          { projectId: 'proj-1', projectName: 'v2 Launch', teamId: 'team-1' },
        ],
      },
    ];

    const result = presenter.present(teams);

    expect(result).toEqual([
      {
        teamId: 'team-1',
        teamName: 'Frontend',
        projects: [{ projectId: 'proj-1', projectName: 'v2 Launch' }],
      },
    ]);
  });

  it('presents team with no projects', () => {
    const teams: LinearTeam[] = [
      { teamId: 'team-1', teamName: 'Design', projects: [] },
    ];

    const result = presenter.present(teams);

    expect(result[0].projects).toEqual([]);
  });

  it('presents empty list', () => {
    expect(presenter.present([])).toEqual([]);
  });
});
