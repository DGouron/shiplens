import { describe, it, expect } from 'vitest';
import { EstimationAccuracy } from '@modules/analytics/entities/estimation-accuracy/estimation-accuracy.js';

describe('EstimationAccuracy', () => {
  it('computes ratio per issue as points divided by cycle time in days', () => {
    const accuracy = EstimationAccuracy.create({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Setup CI pipeline',
          points: 3,
          cycleTimeInDays: 2,
          assigneeName: 'Alice',
          labelNames: ['infra'],
        },
      ],
      excludedWithoutEstimation: 0,
      excludedWithoutCycleTime: 0,
    });

    const ratios = accuracy.ratioPerIssue();

    expect(ratios).toHaveLength(1);
    expect(ratios[0].externalId).toBe('issue-1');
    expect(ratios[0].title).toBe('Setup CI pipeline');
    expect(ratios[0].points).toBe(3);
    expect(ratios[0].cycleTimeInDays).toBe(2);
    expect(ratios[0].ratio).toBe(1.5);
    expect(ratios[0].classification).toBe('well-estimated');
  });

  it('classifies over-estimated when ratio exceeds 2.0', () => {
    const accuracy = EstimationAccuracy.create({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Quick fix',
          points: 8,
          cycleTimeInDays: 0.5,
          assigneeName: 'Alice',
          labelNames: [],
        },
      ],
      excludedWithoutEstimation: 0,
      excludedWithoutCycleTime: 0,
    });

    const ratios = accuracy.ratioPerIssue();

    expect(ratios[0].ratio).toBe(16);
    expect(ratios[0].classification).toBe('over-estimated');
  });

  it('classifies under-estimated when ratio is below 0.5', () => {
    const accuracy = EstimationAccuracy.create({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      issues: [
        {
          externalId: 'issue-1',
          title: 'Complex task',
          points: 1,
          cycleTimeInDays: 5,
          assigneeName: 'Alice',
          labelNames: [],
        },
      ],
      excludedWithoutEstimation: 0,
      excludedWithoutCycleTime: 0,
    });

    const ratios = accuracy.ratioPerIssue();

    expect(ratios[0].ratio).toBe(0.2);
    expect(ratios[0].classification).toBe('under-estimated');
  });

  it('aggregates score by developer', () => {
    const accuracy = EstimationAccuracy.create({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      issues: [
        { externalId: 'issue-1', title: 'Task 1', points: 3, cycleTimeInDays: 2, assigneeName: 'Alice', labelNames: [] },
        { externalId: 'issue-2', title: 'Task 2', points: 2, cycleTimeInDays: 3, assigneeName: 'Alice', labelNames: [] },
        { externalId: 'issue-3', title: 'Task 3', points: 5, cycleTimeInDays: 4, assigneeName: 'Bob', labelNames: [] },
      ],
      excludedWithoutEstimation: 0,
      excludedWithoutCycleTime: 0,
    });

    const scores = accuracy.scoreByDeveloper();

    expect(scores).toHaveLength(2);

    const alice = scores.find((score) => score.developerName === 'Alice');
    expect(alice?.issueCount).toBe(2);
    expect(alice?.averageRatio).toBeCloseTo(1.083, 2);
    expect(alice?.classification).toBe('well-estimated');

    const bob = scores.find((score) => score.developerName === 'Bob');
    expect(bob?.issueCount).toBe(1);
    expect(bob?.averageRatio).toBe(1.25);
    expect(bob?.classification).toBe('well-estimated');
  });

  it('excludes issues with null assignee from developer scores', () => {
    const accuracy = EstimationAccuracy.create({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      issues: [
        { externalId: 'issue-1', title: 'Task 1', points: 3, cycleTimeInDays: 2, assigneeName: null, labelNames: [] },
        { externalId: 'issue-2', title: 'Task 2', points: 2, cycleTimeInDays: 3, assigneeName: 'Alice', labelNames: [] },
      ],
      excludedWithoutEstimation: 0,
      excludedWithoutCycleTime: 0,
    });

    const scores = accuracy.scoreByDeveloper();

    expect(scores).toHaveLength(1);
    expect(scores[0].developerName).toBe('Alice');
  });

  it('aggregates score by label', () => {
    const accuracy = EstimationAccuracy.create({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      issues: [
        { externalId: 'issue-1', title: 'Task 1', points: 3, cycleTimeInDays: 2, assigneeName: 'Alice', labelNames: ['frontend'] },
        { externalId: 'issue-2', title: 'Task 2', points: 5, cycleTimeInDays: 4, assigneeName: 'Bob', labelNames: ['frontend', 'backend'] },
        { externalId: 'issue-3', title: 'Task 3', points: 2, cycleTimeInDays: 3, assigneeName: 'Alice', labelNames: ['backend'] },
      ],
      excludedWithoutEstimation: 0,
      excludedWithoutCycleTime: 0,
    });

    const scores = accuracy.scoreByLabel();

    const frontend = scores.find((score) => score.labelName === 'frontend');
    expect(frontend?.issueCount).toBe(2);

    const backend = scores.find((score) => score.labelName === 'backend');
    expect(backend?.issueCount).toBe(2);
  });

  it('computes team score across all issues', () => {
    const accuracy = EstimationAccuracy.create({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      issues: [
        { externalId: 'issue-1', title: 'Task 1', points: 3, cycleTimeInDays: 2, assigneeName: 'Alice', labelNames: [] },
        { externalId: 'issue-2', title: 'Task 2', points: 2, cycleTimeInDays: 3, assigneeName: 'Bob', labelNames: [] },
      ],
      excludedWithoutEstimation: 0,
      excludedWithoutCycleTime: 0,
    });

    const team = accuracy.teamScore();

    expect(team.issueCount).toBe(2);
    expect(team.averageRatio).toBeCloseTo(1.083, 2);
    expect(team.classification).toBe('well-estimated');
  });

  it('exposes excluded counts', () => {
    const accuracy = EstimationAccuracy.create({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      issues: [],
      excludedWithoutEstimation: 4,
      excludedWithoutCycleTime: 3,
    });

    expect(accuracy.excludedWithoutEstimation).toBe(4);
    expect(accuracy.excludedWithoutCycleTime).toBe(3);
  });
});
