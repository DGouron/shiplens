import { describe, expect, it } from 'vitest';
import { type Locale } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { MemberMetricsPresenter } from '@/modules/analytics/interface-adapters/presenters/member-metrics.presenter.ts';
import { memberMetricsTranslations } from '@/modules/analytics/interface-adapters/presenters/member-metrics.translations.ts';
import { BlockedIssueAlertResponseBuilder } from '../../../../builders/blocked-issue-alert-response.builder.ts';
import { BottleneckAnalysisResponseBuilder } from '../../../../builders/bottleneck-analysis-response.builder.ts';
import { DriftingIssueResponseBuilder } from '../../../../builders/drifting-issue-response.builder.ts';
import { EstimationAccuracyResponseBuilder } from '../../../../builders/estimation-accuracy-response.builder.ts';

const MEMBER = 'gauthier@mentorgoal.com';
const TEAM = 'team-alpha';

function makePresenter(locale: Locale = 'en') {
  return new MemberMetricsPresenter(memberMetricsTranslations[locale]);
}

function defaultInput() {
  return {
    blockedIssues: [],
    driftingIssues: [],
    bottleneck: new BottleneckAnalysisResponseBuilder()
      .withStatusDistribution([])
      .withBottleneckStatus('')
      .withAssigneeBreakdown([])
      .build(),
    estimation: new EstimationAccuracyResponseBuilder()
      .withIssues([])
      .withDeveloperScores([])
      .build(),
    selectedTeamId: TEAM,
    selectedMemberName: MEMBER,
  };
}

describe('MemberMetricsPresenter', () => {
  it('counts blocked issues for the member and the team', () => {
    const viewModel = makePresenter().present({
      ...defaultInput(),
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder()
          .withTeamId(TEAM)
          .withAssigneeName(MEMBER)
          .build(),
        new BlockedIssueAlertResponseBuilder()
          .withTeamId(TEAM)
          .withAssigneeName('someone-else')
          .build(),
        new BlockedIssueAlertResponseBuilder()
          .withTeamId('other-team')
          .withAssigneeName(MEMBER)
          .build(),
      ],
    });

    const card = viewModel.cards.find((entry) => entry.id === 'blocked');
    expect(card?.value).toBe('1');
    expect(card?.signal).toBe('orange');
  });

  it('marks the blocked card green when the member has zero blocked issues', () => {
    const viewModel = makePresenter().present(defaultInput());

    const card = viewModel.cards.find((entry) => entry.id === 'blocked');
    expect(card?.value).toBe('0');
    expect(card?.signal).toBe('green');
  });

  it('marks the blocked card red when the member reaches the red threshold', () => {
    const viewModel = makePresenter().present({
      ...defaultInput(),
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder()
          .withId('a')
          .withTeamId(TEAM)
          .withAssigneeName(MEMBER)
          .build(),
        new BlockedIssueAlertResponseBuilder()
          .withId('b')
          .withTeamId(TEAM)
          .withAssigneeName(MEMBER)
          .build(),
      ],
    });

    const card = viewModel.cards.find((entry) => entry.id === 'blocked');
    expect(card?.value).toBe('2');
    expect(card?.signal).toBe('red');
  });

  it('counts drifting issues for the member', () => {
    const viewModel = makePresenter().present({
      ...defaultInput(),
      driftingIssues: [
        new DriftingIssueResponseBuilder().withAssigneeName(MEMBER).build(),
        new DriftingIssueResponseBuilder().withAssigneeName(MEMBER).build(),
        new DriftingIssueResponseBuilder()
          .withAssigneeName('someone-else')
          .build(),
      ],
    });

    const card = viewModel.cards.find((entry) => entry.id === 'drifting');
    expect(card?.value).toBe('2');
    expect(card?.signal).toBe('orange');
  });

  it('excludes epic-like issues from the drift count (null, zero, or 21+ points)', () => {
    const viewModel = makePresenter().present({
      ...defaultInput(),
      driftingIssues: [
        new DriftingIssueResponseBuilder()
          .withAssigneeName(MEMBER)
          .withPoints(3)
          .build(),
        new DriftingIssueResponseBuilder()
          .withAssigneeName(MEMBER)
          .withPoints(null)
          .build(),
        new DriftingIssueResponseBuilder()
          .withAssigneeName(MEMBER)
          .withPoints(0)
          .build(),
        new DriftingIssueResponseBuilder()
          .withAssigneeName(MEMBER)
          .withPoints(21)
          .build(),
        new DriftingIssueResponseBuilder()
          .withAssigneeName(MEMBER)
          .withPoints(34)
          .build(),
      ],
    });

    const card = viewModel.cards.find((entry) => entry.id === 'drifting');
    expect(card?.value).toBe('1');
    expect(card?.signal).toBe('orange');
  });

  it('picks the slowest status for the member from the bottleneck breakdown', () => {
    const viewModel = makePresenter().present({
      ...defaultInput(),
      bottleneck: new BottleneckAnalysisResponseBuilder()
        .withStatusDistribution([])
        .withBottleneckStatus('')
        .withAssigneeBreakdown([
          {
            assigneeName: MEMBER,
            statusMedians: [
              { statusName: 'In Progress', medianHours: 40 },
              { statusName: 'In Review', medianHours: 10 },
            ],
          },
        ])
        .build(),
    });

    const card = viewModel.cards.find((entry) => entry.id === 'slowestStatus');
    expect(card?.value).toBe('In Progress');
  });

  it('falls back to a dash for the slowest status when the member has no bottleneck data', () => {
    const viewModel = makePresenter().present(defaultInput());

    const card = viewModel.cards.find((entry) => entry.id === 'slowestStatus');
    expect(card?.value).toBe('—');
    expect(card?.caption).toBe(memberMetricsTranslations.en.noStatusAvailable);
  });

  it('renders the estimation classification for the member with a matching signal color', () => {
    const viewModel = makePresenter().present({
      ...defaultInput(),
      estimation: new EstimationAccuracyResponseBuilder()
        .withIssues([])
        .withDeveloperScores([
          {
            developerName: MEMBER,
            issueCount: 5,
            averageRatio: 0.4,
            daysPerPoint: 2.5,
            classification: 'under-estimated',
          },
        ])
        .build(),
    });

    const card = viewModel.cards.find(
      (entry) => entry.id === 'estimationCalibration',
    );
    expect(card?.value).toBe(
      memberMetricsTranslations.en.classificationUnderEstimated,
    );
    expect(card?.signal).toBe('red');
    expect(card?.caption).toBe('2.5 days/point');
  });

  it('shows a neutral empty state for the estimation card when the member has no score', () => {
    const viewModel = makePresenter().present(defaultInput());

    const card = viewModel.cards.find(
      (entry) => entry.id === 'estimationCalibration',
    );
    expect(card?.value).toBe('—');
    expect(card?.signal).toBe('neutral');
  });

  it('derives completed-estimated throughput from the developer score issue count', () => {
    const viewModel = makePresenter().present({
      ...defaultInput(),
      estimation: new EstimationAccuracyResponseBuilder()
        .withIssues([])
        .withDeveloperScores([
          {
            developerName: MEMBER,
            issueCount: 4,
            averageRatio: 1,
            daysPerPoint: 1.5,
            classification: 'well-estimated',
          },
        ])
        .build(),
    });

    const card = viewModel.cards.find((entry) => entry.id === 'throughput');
    expect(card?.value).toBe('4');
  });

  it('synthesizes a drowning verdict when the member shows two or more red signals', () => {
    const viewModel = makePresenter().present({
      ...defaultInput(),
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder()
          .withId('a')
          .withTeamId(TEAM)
          .withAssigneeName(MEMBER)
          .build(),
        new BlockedIssueAlertResponseBuilder()
          .withId('b')
          .withTeamId(TEAM)
          .withAssigneeName(MEMBER)
          .build(),
      ],
      estimation: new EstimationAccuracyResponseBuilder()
        .withIssues([])
        .withDeveloperScores([
          {
            developerName: MEMBER,
            issueCount: 3,
            averageRatio: 0.3,
            daysPerPoint: 3,
            classification: 'under-estimated',
          },
        ])
        .build(),
    });

    const verdict = viewModel.cards.find((card) => card.id === 'verdict');
    expect(verdict?.value).toBe(memberMetricsTranslations.en.verdictDrowning);
    expect(verdict?.signal).toBe('red');
  });

  it('synthesizes an available verdict when every decisive signal is green', () => {
    const viewModel = makePresenter().present({
      ...defaultInput(),
      estimation: new EstimationAccuracyResponseBuilder()
        .withIssues([])
        .withDeveloperScores([
          {
            developerName: MEMBER,
            issueCount: 4,
            averageRatio: 1,
            daysPerPoint: 1.5,
            classification: 'well-estimated',
          },
        ])
        .build(),
    });

    const verdict = viewModel.cards.find((card) => card.id === 'verdict');
    expect(verdict?.value).toBe(memberMetricsTranslations.en.verdictAvailable);
    expect(verdict?.signal).toBe('green');
  });

  it('uses French translations under the fr locale', () => {
    const viewModel = makePresenter('fr').present(defaultInput());

    const blocked = viewModel.cards.find((entry) => entry.id === 'blocked');
    expect(blocked?.label).toBe(memberMetricsTranslations.fr.labelBlocked);
  });
});
