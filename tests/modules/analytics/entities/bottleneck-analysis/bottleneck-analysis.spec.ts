import { describe, it, expect } from 'vitest';
import { BottleneckAnalysis } from '@modules/analytics/entities/bottleneck-analysis/bottleneck-analysis.js';
import { NoCompletedIssuesError } from '@modules/analytics/entities/bottleneck-analysis/bottleneck-analysis.errors.js';
import { type BottleneckAnalysisProps } from '@modules/analytics/entities/bottleneck-analysis/bottleneck-analysis.schema.js';

function makeProps(overrides?: Partial<BottleneckAnalysisProps>): BottleneckAnalysisProps {
  return {
    cycleId: 'cycle-1',
    teamId: 'team-1',
    completedIssues: [
      {
        externalId: 'issue-1',
        assigneeName: 'Alice',
        transitions: [
          { toStatusName: 'Backlog', occurredAt: '2026-01-01T00:00:00Z' },
          { toStatusName: 'Todo', occurredAt: '2026-01-01T04:00:00Z' },
          { toStatusName: 'In Progress', occurredAt: '2026-01-01T08:00:00Z' },
          { toStatusName: 'In Review', occurredAt: '2026-01-02T08:00:00Z' },
          { toStatusName: 'Done', occurredAt: '2026-01-03T20:00:00Z' },
        ],
      },
      {
        externalId: 'issue-2',
        assigneeName: 'Bob',
        transitions: [
          { toStatusName: 'Backlog', occurredAt: '2026-01-01T00:00:00Z' },
          { toStatusName: 'Todo', occurredAt: '2026-01-01T02:00:00Z' },
          { toStatusName: 'In Progress', occurredAt: '2026-01-01T06:00:00Z' },
          { toStatusName: 'In Review', occurredAt: '2026-01-01T18:00:00Z' },
          { toStatusName: 'Done', occurredAt: '2026-01-02T06:00:00Z' },
        ],
      },
    ],
    ...overrides,
  };
}

describe('BottleneckAnalysis', () => {
  it('rejects when no completed issues', () => {
    expect(() =>
      BottleneckAnalysis.create(makeProps({ completedIssues: [] })),
    ).toThrow(NoCompletedIssuesError);
  });

  it('calculates median time per status in hours', () => {
    const analysis = BottleneckAnalysis.create(makeProps());
    const distribution = analysis.statusDistribution;

    expect(distribution).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ statusName: 'Backlog' }),
        expect.objectContaining({ statusName: 'Todo' }),
        expect.objectContaining({ statusName: 'In Progress' }),
        expect.objectContaining({ statusName: 'In Review' }),
      ]),
    );

    const inReview = distribution.find((d) => d.statusName === 'In Review');
    expect(inReview).toBeDefined();
    expect(inReview!.medianHours).toBeGreaterThan(0);
  });

  it('identifies bottleneck as status with highest median', () => {
    const analysis = BottleneckAnalysis.create(makeProps());

    expect(analysis.bottleneckStatus).toBe('In Review');
  });

  it('calculates median correctly for odd number of issues', () => {
    const props = makeProps({
      completedIssues: [
        {
          externalId: 'issue-1',
          assigneeName: 'Alice',
          transitions: [
            { toStatusName: 'In Progress', occurredAt: '2026-01-01T00:00:00Z' },
            { toStatusName: 'Done', occurredAt: '2026-01-01T10:00:00Z' },
          ],
        },
        {
          externalId: 'issue-2',
          assigneeName: 'Bob',
          transitions: [
            { toStatusName: 'In Progress', occurredAt: '2026-01-01T00:00:00Z' },
            { toStatusName: 'Done', occurredAt: '2026-01-01T20:00:00Z' },
          ],
        },
        {
          externalId: 'issue-3',
          assigneeName: 'Charlie',
          transitions: [
            { toStatusName: 'In Progress', occurredAt: '2026-01-01T00:00:00Z' },
            { toStatusName: 'Done', occurredAt: '2026-01-02T00:00:00Z' },
          ],
        },
      ],
    });

    const analysis = BottleneckAnalysis.create(props);
    const inProgress = analysis.statusDistribution.find(
      (d) => d.statusName === 'In Progress',
    );

    expect(inProgress!.medianHours).toBe(20);
  });

  it('provides breakdown by assignee', () => {
    const analysis = BottleneckAnalysis.create(makeProps());
    const breakdown = analysis.assigneeBreakdown;

    expect(breakdown).toHaveLength(2);

    const alice = breakdown.find((b) => b.assigneeName === 'Alice');
    const bob = breakdown.find((b) => b.assigneeName === 'Bob');

    expect(alice).toBeDefined();
    expect(bob).toBeDefined();
    expect(alice!.statusMedians.length).toBeGreaterThan(0);
  });

  it('excludes issues without assignee from breakdown', () => {
    const props = makeProps({
      completedIssues: [
        {
          externalId: 'issue-1',
          assigneeName: null,
          transitions: [
            { toStatusName: 'In Progress', occurredAt: '2026-01-01T00:00:00Z' },
            { toStatusName: 'Done', occurredAt: '2026-01-01T10:00:00Z' },
          ],
        },
      ],
    });

    const analysis = BottleneckAnalysis.create(props);

    expect(analysis.assigneeBreakdown).toHaveLength(0);
    expect(analysis.statusDistribution).toHaveLength(1);
  });

  it('calculates cycle comparison when previous medians provided', () => {
    const props = makeProps({
      previousCycleMedians: {
        'Backlog': 8,
        'Todo': 6,
        'In Progress': 30,
        'In Review': 48,
      },
    });

    const analysis = BottleneckAnalysis.create(props);
    const comparison = analysis.cycleComparison;

    expect(comparison).not.toBeNull();
    expect(comparison!.length).toBeGreaterThan(0);

    const inReview = comparison!.find((c) => c.statusName === 'In Review');
    expect(inReview).toBeDefined();
    expect(inReview!.evolutionPercent).toBeDefined();
  });

  it('returns null cycle comparison when no previous medians', () => {
    const analysis = BottleneckAnalysis.create(makeProps());

    expect(analysis.cycleComparison).toBeNull();
  });

  it('exposes medians as record for downstream comparison', () => {
    const analysis = BottleneckAnalysis.create(makeProps());
    const medians = analysis.mediansAsRecord;

    expect(medians).toHaveProperty('In Review');
    expect(typeof medians['In Review']).toBe('number');
  });
});
