import { TopCycleProjectsPresenter } from '@modules/analytics/interface-adapters/presenters/top-cycle-projects.presenter.js';
import { describe, expect, it } from 'vitest';

describe('TopCycleProjectsPresenter', () => {
  const presenter = new TopCycleProjectsPresenter();

  it('presents no_active_cycle as a discriminated DTO', () => {
    const result = presenter.present({ status: 'no_active_cycle' });

    expect(result).toEqual({ status: 'no_active_cycle' });
  });

  it('presents ready result with cycle info and empty projects when no aggregates', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: [],
    });

    expect(result).toEqual({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      projects: [],
    });
  });

  it('maps a named project aggregate to a project DTO with isNoProjectBucket false', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: [
        {
          projectExternalId: 'project-a',
          projectName: 'Project A',
          issueCount: 3,
          totalPoints: 8,
          totalCycleTimeInHours: 12,
        },
      ],
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.projects).toHaveLength(1);
    expect(result.projects[0]).toEqual({
      projectId: 'project-a',
      projectName: 'Project A',
      isNoProjectBucket: false,
      issueCount: 3,
      totalPoints: 8,
      totalCycleTimeInHours: 12,
    });
  });

  it('maps a null-project aggregate to the No project bucket DTO', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: [
        {
          projectExternalId: null,
          projectName: null,
          issueCount: 2,
          totalPoints: 4,
          totalCycleTimeInHours: null,
        },
      ],
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.projects[0]).toEqual({
      projectId: '__no_project__',
      projectName: 'No project',
      isNoProjectBucket: true,
      issueCount: 2,
      totalPoints: 4,
      totalCycleTimeInHours: null,
    });
  });

  it('sorts projects by issueCount descending', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: [
        {
          projectExternalId: 'project-b',
          projectName: 'B',
          issueCount: 3,
          totalPoints: 5,
          totalCycleTimeInHours: 4,
        },
        {
          projectExternalId: 'project-a',
          projectName: 'A',
          issueCount: 5,
          totalPoints: 2,
          totalCycleTimeInHours: 10,
        },
      ],
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.projects.map((project) => project.projectId)).toEqual([
      'project-a',
      'project-b',
    ]);
  });

  it('truncates the ranking to the top 10 projects', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: Array.from({ length: 13 }, (_, index) => ({
        projectExternalId: `project-${index}`,
        projectName: `Project ${index}`,
        issueCount: 20 - index,
        totalPoints: 0,
        totalCycleTimeInHours: 0,
      })),
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.projects).toHaveLength(10);
    expect(result.projects.map((project) => project.projectId)).toEqual([
      'project-0',
      'project-1',
      'project-2',
      'project-3',
      'project-4',
      'project-5',
      'project-6',
      'project-7',
      'project-8',
      'project-9',
    ]);
  });

  it('includes the No project bucket in the top 10 when it qualifies', () => {
    const result = presenter.present({
      status: 'ready',
      cycleId: 'cycle-1',
      cycleName: 'Sprint 10',
      aggregates: [
        {
          projectExternalId: 'project-a',
          projectName: 'A',
          issueCount: 3,
          totalPoints: 0,
          totalCycleTimeInHours: 0,
        },
        {
          projectExternalId: null,
          projectName: null,
          issueCount: 7,
          totalPoints: 0,
          totalCycleTimeInHours: 0,
        },
      ],
    });

    if (result.status !== 'ready') {
      throw new Error('expected ready status');
    }
    expect(result.projects[0].isNoProjectBucket).toBe(true);
    expect(result.projects[0].issueCount).toBe(7);
  });
});
