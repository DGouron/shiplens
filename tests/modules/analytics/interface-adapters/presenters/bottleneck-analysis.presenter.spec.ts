import { describe, it, expect } from 'vitest';
import { BottleneckAnalysisPresenter } from '@modules/analytics/interface-adapters/presenters/bottleneck-analysis.presenter.js';
import { type BottleneckAnalysisResult } from '@modules/analytics/usecases/analyze-bottlenecks-by-status.usecase.js';

describe('BottleneckAnalysisPresenter', () => {
  const presenter = new BottleneckAnalysisPresenter();

  const input: BottleneckAnalysisResult = {
    statusDistribution: [
      { statusName: 'Backlog', medianHours: 4 },
      { statusName: 'Todo', medianHours: 2.5 },
      { statusName: 'In Progress', medianHours: 24 },
      { statusName: 'In Review', medianHours: 36 },
    ],
    bottleneckStatus: 'In Review',
    assigneeBreakdown: [
      {
        assigneeName: 'Alice',
        statusMedians: [
          { statusName: 'In Progress', medianHours: 20 },
          { statusName: 'In Review', medianHours: 60 },
        ],
      },
    ],
    cycleComparison: null,
  };

  it('formats status distribution with hours label', () => {
    const dto = presenter.present(input);

    expect(dto.statusDistribution).toEqual([
      { statusName: 'Backlog', medianHours: '4h' },
      { statusName: 'Todo', medianHours: '2.5h' },
      { statusName: 'In Progress', medianHours: '24h' },
      { statusName: 'In Review', medianHours: '36h' },
    ]);
  });

  it('includes bottleneck status', () => {
    const dto = presenter.present(input);
    expect(dto.bottleneckStatus).toBe('In Review');
  });

  it('formats assignee breakdown', () => {
    const dto = presenter.present(input);

    expect(dto.assigneeBreakdown).toEqual([
      {
        assigneeName: 'Alice',
        statusMedians: [
          { statusName: 'In Progress', medianHours: '20h' },
          { statusName: 'In Review', medianHours: '60h' },
        ],
      },
    ]);
  });

  it('returns null comparison when absent', () => {
    const dto = presenter.present(input);
    expect(dto.cycleComparison).toBeNull();
  });

  it('formats cycle comparison with evolution percentage', () => {
    const inputWithComparison: BottleneckAnalysisResult = {
      ...input,
      cycleComparison: [
        {
          statusName: 'In Review',
          previousMedianHours: 48,
          currentMedianHours: 36,
          evolutionPercent: -25,
        },
      ],
    };

    const dto = presenter.present(inputWithComparison);

    expect(dto.cycleComparison).toEqual([
      {
        statusName: 'In Review',
        previousMedianHours: '48h',
        currentMedianHours: '36h',
        evolution: '-25%',
      },
    ]);
  });
});
