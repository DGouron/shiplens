import { describe, expect, it } from 'vitest';
import { MemberHealthBuilder } from '../../../../builders/member-health.builder.js';

describe('MemberHealth', () => {
  it('computes estimation score signal from per-cycle values', () => {
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

    const signal = health.estimationScoreSignal();

    expect(signal.isApplicable).toBe(true);
    if (!signal.isApplicable) return;
    expect(signal.hasEnoughHistory).toBe(true);
    if (!signal.hasEnoughHistory) return;
    expect(signal.lastValue).toBe(70);
    expect(signal.trend).toBe('rising');
    expect(signal.indicator).toBe('green');
  });

  it('returns not applicable when all estimation scores are null', () => {
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
        {
          cycleId: 'cycle-2',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
        {
          cycleId: 'cycle-3',
          estimationScorePercent: null,
          underestimationRatioPercent: null,
          averageCycleTimeInDays: null,
          driftingTicketCount: null,
          medianReviewTimeInHours: null,
        },
      ])
      .build();

    expect(health.estimationScoreSignal().isApplicable).toBe(false);
    expect(health.underestimationRatioSignal().isApplicable).toBe(false);
    expect(health.averageCycleTimeSignal().isApplicable).toBe(false);
    expect(health.driftingTicketsSignal().isApplicable).toBe(false);
    expect(health.medianReviewTimeSignal().isApplicable).toBe(false);
  });

  it('exposes memberName and teamId', () => {
    const health = new MemberHealthBuilder()
      .withTeamId('team-1')
      .withMemberName('Alice')
      .build();

    expect(health.memberName).toBe('Alice');
    expect(health.teamId).toBe('team-1');
  });
});
