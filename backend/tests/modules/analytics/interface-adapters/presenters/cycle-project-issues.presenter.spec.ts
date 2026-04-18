import { CycleProjectIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-project-issues.presenter.js';
import { describe, expect, it } from 'vitest';

describe('CycleProjectIssuesPresenter', () => {
  const presenter = new CycleProjectIssuesPresenter();

  it('presents no_active_cycle as a discriminated DTO', () => {
    const result = presenter.present({ status: 'no_active_cycle' });

    expect(result).toEqual({ status: 'no_active_cycle' });
  });

  it('presents ready result with issues for a real project', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      projectExternalId: 'project-a',
      projectName: 'Project A',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Fix login',
          assigneeName: 'Alice',
          points: 3,
          statusName: 'In Progress',
        },
      ],
    });

    expect(result).toEqual({
      status: 'ready',
      cycleId: 'cycle-1',
      projectId: 'project-a',
      projectName: 'Project A',
      isNoProjectBucket: false,
      issues: [
        {
          externalId: 'issue-1',
          title: 'Fix login',
          assigneeName: 'Alice',
          points: 3,
          statusName: 'In Progress',
        },
      ],
    });
  });

  it('presents the No project bucket when projectExternalId is null', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      projectExternalId: null,
      projectName: null,
      issues: [
        {
          externalId: 'issue-2',
          title: 'Orphan',
          assigneeName: null,
          points: null,
          statusName: 'Todo',
        },
      ],
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.projectId).toBe('__no_project__');
    expect(result.projectName).toBe('No project');
    expect(result.isNoProjectBucket).toBe(true);
    expect(result.issues).toHaveLength(1);
  });
});
