import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type BlockedIssuesResponse } from '../../entities/blocked-issues/blocked-issues.response.ts';
import { type BottleneckAnalysisResponse } from '../../entities/bottleneck-analysis/bottleneck-analysis.response.ts';
import { type DriftingIssuesResponse } from '../../entities/drifting-issues/drifting-issues.response.ts';
import { type EstimationAccuracyResponse } from '../../entities/estimation-accuracy/estimation-accuracy.response.ts';
import { formatDurationHours } from './format-duration-hours.ts';
import { isProbableEpic } from './is-probable-epic.ts';
import { type MemberMetricsTranslations } from './member-metrics.translations.ts';
import {
  type MemberMetricsCardViewModel,
  type MemberMetricsSignal,
  type MemberMetricsViewModel,
} from './member-metrics.view-model.schema.ts';

const BLOCKED_RED_THRESHOLD = 2;
const DRIFTING_RED_THRESHOLD = 3;

export interface MemberMetricsPresenterInput {
  blockedIssues: BlockedIssuesResponse;
  driftingIssues: DriftingIssuesResponse;
  bottleneck: BottleneckAnalysisResponse;
  estimation: EstimationAccuracyResponse;
  selectedTeamId: string;
  selectedMemberName: string;
}

export class MemberMetricsPresenter
  implements Presenter<MemberMetricsPresenterInput, MemberMetricsViewModel>
{
  constructor(private readonly translations: MemberMetricsTranslations) {}

  present(input: MemberMetricsPresenterInput): MemberMetricsViewModel {
    const cards: MemberMetricsCardViewModel[] = [
      this.blockedCard(input),
      this.driftingCard(input),
      this.slowestStatusCard(input),
      this.estimationCard(input),
      this.throughputCard(input),
    ];
    const verdict = this.verdictCard(cards);
    return { cards: [...cards, verdict] };
  }

  private blockedCard(
    input: MemberMetricsPresenterInput,
  ): MemberMetricsCardViewModel {
    const count = input.blockedIssues.filter(
      (alert) =>
        alert.teamId === input.selectedTeamId &&
        alert.assigneeName === input.selectedMemberName,
    ).length;
    const signal = this.thresholdSignal(count, BLOCKED_RED_THRESHOLD);
    return {
      id: 'blocked',
      label: this.translations.labelBlocked,
      value: String(count),
      caption: count === 0 ? null : this.translations.blockedIssuesCaption,
      signal,
    };
  }

  private driftingCard(
    input: MemberMetricsPresenterInput,
  ): MemberMetricsCardViewModel {
    const count = input.driftingIssues.filter(
      (issue) =>
        issue.assigneeName === input.selectedMemberName &&
        !isProbableEpic(issue.points),
    ).length;
    const signal = this.thresholdSignal(count, DRIFTING_RED_THRESHOLD);
    return {
      id: 'drifting',
      label: this.translations.labelDrifting,
      value: String(count),
      caption: count === 0 ? null : this.translations.driftingIssuesCaption,
      signal,
    };
  }

  private slowestStatusCard(
    input: MemberMetricsPresenterInput,
  ): MemberMetricsCardViewModel {
    const breakdown = input.bottleneck.assigneeBreakdown.find(
      (entry) => entry.assigneeName === input.selectedMemberName,
    );
    if (breakdown === undefined || breakdown.statusMedians.length === 0) {
      return {
        id: 'slowestStatus',
        label: this.translations.labelSlowestStatus,
        value: '—',
        caption: this.translations.noStatusAvailable,
        signal: 'neutral',
      };
    }
    const slowest = [...breakdown.statusMedians].sort(
      (left, right) => right.medianHours - left.medianHours,
    )[0];
    const hoursLabel =
      slowest === undefined
        ? this.translations.noStatusAvailable
        : formatDurationHours(slowest.medianHours, {
            daysSuffix: 'days',
          });
    return {
      id: 'slowestStatus',
      label: this.translations.labelSlowestStatus,
      value: slowest?.statusName ?? '—',
      caption: hoursLabel,
      signal: 'neutral',
    };
  }

  private estimationCard(
    input: MemberMetricsPresenterInput,
  ): MemberMetricsCardViewModel {
    const score = input.estimation.developerScores.find(
      (entry) => entry.developerName === input.selectedMemberName,
    );
    if (score === undefined) {
      return {
        id: 'estimationCalibration',
        label: this.translations.labelEstimationCalibration,
        value: '—',
        caption: this.translations.noEstimationSignal,
        signal: 'neutral',
      };
    }
    const classificationLabel = this.classificationLabel(score.classification);
    const daysPerPoint = Math.round(score.daysPerPoint * 10) / 10;
    return {
      id: 'estimationCalibration',
      label: this.translations.labelEstimationCalibration,
      value: classificationLabel,
      caption: `${daysPerPoint} ${this.translations.daysPerPointSuffix}`,
      signal: this.classificationSignal(score.classification),
    };
  }

  private throughputCard(
    input: MemberMetricsPresenterInput,
  ): MemberMetricsCardViewModel {
    const score = input.estimation.developerScores.find(
      (entry) => entry.developerName === input.selectedMemberName,
    );
    const count = score?.issueCount ?? 0;
    return {
      id: 'throughput',
      label: this.translations.labelThroughput,
      value: String(count),
      caption: this.translations.completedIssuesCaption,
      signal: 'neutral',
    };
  }

  private thresholdSignal(
    count: number,
    redThreshold: number,
  ): MemberMetricsSignal {
    if (count === 0) return 'green';
    if (count >= redThreshold) return 'red';
    return 'orange';
  }

  private verdictCard(
    cards: MemberMetricsCardViewModel[],
  ): MemberMetricsCardViewModel {
    const decisive = cards.filter(
      (card) =>
        card.id === 'blocked' ||
        card.id === 'drifting' ||
        card.id === 'estimationCalibration',
    );
    const redCount = decisive.filter((card) => card.signal === 'red').length;
    const orangeCount = decisive.filter(
      (card) => card.signal === 'orange',
    ).length;
    const greenCount = decisive.filter(
      (card) => card.signal === 'green',
    ).length;

    if (redCount >= 2) {
      return {
        id: 'verdict',
        label: this.translations.labelVerdict,
        value: this.translations.verdictDrowning,
        caption: this.translations.verdictDrowningCaption,
        signal: 'red',
      };
    }
    if (redCount === 1 || orangeCount >= 2) {
      return {
        id: 'verdict',
        label: this.translations.labelVerdict,
        value: this.translations.verdictWatch,
        caption: this.translations.verdictWatchCaption,
        signal: 'orange',
      };
    }
    if (greenCount === decisive.length) {
      return {
        id: 'verdict',
        label: this.translations.labelVerdict,
        value: this.translations.verdictAvailable,
        caption: this.translations.verdictAvailableCaption,
        signal: 'green',
      };
    }
    return {
      id: 'verdict',
      label: this.translations.labelVerdict,
      value: this.translations.verdictOnTrack,
      caption: this.translations.verdictOnTrackCaption,
      signal: 'green',
    };
  }

  private classificationLabel(
    classification: 'over-estimated' | 'under-estimated' | 'well-estimated',
  ): string {
    if (classification === 'well-estimated')
      return this.translations.classificationWellEstimated;
    if (classification === 'over-estimated')
      return this.translations.classificationOverEstimated;
    return this.translations.classificationUnderEstimated;
  }

  private classificationSignal(
    classification: 'over-estimated' | 'under-estimated' | 'well-estimated',
  ): MemberMetricsSignal {
    if (classification === 'well-estimated') return 'green';
    if (classification === 'under-estimated') return 'red';
    return 'orange';
  }
}
