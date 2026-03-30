import { describe, it, expect } from 'vitest';
import { TeamSelectionPresenter } from '@modules/synchronization/interface-adapters/presenters/team-selection.presenter.js';
import { TeamSelectionBuilder } from '../../../../builders/team-selection.builder.js';

describe('TeamSelectionPresenter', () => {
  const presenter = new TeamSelectionPresenter();

  it('presents a selection with teams and projects', () => {
    const selection = new TeamSelectionBuilder().build();

    const result = presenter.present(selection);

    expect(result).toEqual({
      selectedTeams: [
        { teamId: 'team-1', teamName: 'Frontend' },
        { teamId: 'team-2', teamName: 'Backend' },
      ],
      selectedProjects: [
        { projectId: 'proj-1', projectName: 'v2 Launch', teamId: 'team-1' },
      ],
    });
  });

  it('presents null when no selection exists', () => {
    expect(presenter.present(null)).toBeNull();
  });
});
