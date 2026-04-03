import { TeamSelection } from '@modules/synchronization/entities/team-selection/team-selection.js';
import { describe, expect, it } from 'vitest';

describe('TeamSelection', () => {
  it('creates a valid selection with teams and projects', () => {
    const selection = TeamSelection.create({
      selectedTeams: [
        { teamId: 'team-1', teamName: 'Frontend' },
        { teamId: 'team-2', teamName: 'Backend' },
      ],
      selectedProjects: [
        { projectId: 'proj-1', projectName: 'v2 Launch', teamId: 'team-1' },
      ],
    });

    expect(selection.selectedTeams).toHaveLength(2);
    expect(selection.selectedTeams[0].teamId).toBe('team-1');
    expect(selection.selectedProjects).toHaveLength(1);
  });

  it('creates a valid selection with teams and no projects', () => {
    const selection = TeamSelection.create({
      selectedTeams: [{ teamId: 'team-1', teamName: 'Frontend' }],
      selectedProjects: [],
    });

    expect(selection.selectedTeams).toHaveLength(1);
    expect(selection.selectedProjects).toHaveLength(0);
  });

  it('rejects when no teams are selected', () => {
    expect(() =>
      TeamSelection.create({
        selectedTeams: [],
        selectedProjects: [],
      }),
    ).toThrow();
  });

  it('rejects when team data is invalid', () => {
    expect(() =>
      TeamSelection.create({
        selectedTeams: [{ teamId: '', teamName: 'Frontend' }],
        selectedProjects: [],
      }),
    ).toThrow();
  });
});
