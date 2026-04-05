import { MemberHealthPresenter } from '@modules/analytics/interface-adapters/presenters/member-health.presenter.js';
import { describe, expect, it } from 'vitest';
import { MemberHealthBuilder } from '../../../../builders/member-health.builder.js';

describe('MemberHealthPresenter', () => {
  const presenter = new MemberHealthPresenter();

  it('formats estimation score as percentage with rising trend green', () => {
    const health = new MemberHealthBuilder()
      .withCycleSnapshots([
        {
          cycleId: 'cycle-1',
          estimationScorePercent: 60,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: 65,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: 70,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ])
      .build();

    const dto = presenter.present(health);

    expect(dto.estimationScore.value).toBe('70%');
    expect(dto.estimationScore.trend).toBe('rising');
    expect(dto.estimationScore.indicator).toBe('green');
  });

  it('formats not applicable signal with indicator not-applicable', () => {
    const health = new MemberHealthBuilder()
      .withCycleSnapshots([
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ])
      .build();

    const dto = presenter.present(health);

    expect(dto.estimationScore.value).toBe('Not applicable');
    expect(dto.estimationScore.trend).toBeNull();
    expect(dto.estimationScore.indicator).toBe('not-applicable');
  });

  it('formats insufficient history signal with raw last value and indicator not-enough-history', () => {
    const health = new MemberHealthBuilder()
      .withCycleSnapshots([
        {
          cycleId: 'cycle-1',
          estimationScorePercent: 60,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ])
      .build();

    const dto = presenter.present(health);

    expect(dto.estimationScore.value).toBe('60%');
    expect(dto.estimationScore.trend).toBeNull();
    expect(dto.estimationScore.indicator).toBe('not-enough-history');
  });

  it('formats average cycle time in days with one decimal', () => {
    const health = new MemberHealthBuilder()
      .withCycleSnapshots([
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 1.2,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 1.5,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: 2.1,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ])
      .build();

    const dto = presenter.present(health);

    expect(dto.averageCycleTime.value).toBe('2.1d');
    expect(dto.averageCycleTime.trend).toBe('rising');
    expect(dto.averageCycleTime.indicator).toBe('red');
  });

  it('formats median review time in hours as integer with h suffix', () => {
    const health = new MemberHealthBuilder()
      .withCycleSnapshots([
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: 8,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: 12,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: 24,
        },
      ])
      .build();

    const dto = presenter.present(health);

    expect(dto.medianReviewTime.value).toBe('24h');
    expect(dto.medianReviewTime.trend).toBe('rising');
    expect(dto.medianReviewTime.indicator).toBe('red');
  });

  it('formats drifting tickets as integer count', () => {
    const health = new MemberHealthBuilder()
      .withCycleSnapshots([
        {
          cycleId: 'cycle-1',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: 4,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: 2,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: 1,
          medianReviewTimeInHours: null,
        },
      ])
      .build();

    const dto = presenter.present(health);

    expect(dto.driftingTickets.value).toBe('1');
    expect(dto.driftingTickets.trend).toBe('falling');
    expect(dto.driftingTickets.indicator).toBe('green');
  });

  it('exposes memberName and teamId in the DTO', () => {
    const health = new MemberHealthBuilder()
      .withTeamId('team-7')
      .withMemberName('Alice')
      .withCycleSnapshots([
        {
          cycleId: 'cycle-1',
          estimationScorePercent: 50,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ])
      .build();

    const dto = presenter.present(health);

    expect(dto.memberName).toBe('Alice');
    expect(dto.teamId).toBe('team-7');
  });
});
