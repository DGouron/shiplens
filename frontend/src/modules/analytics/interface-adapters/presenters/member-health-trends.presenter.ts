import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type MemberHealthResponse,
  type SignalIndicator,
} from '../../entities/member-health/member-health.response.ts';
import { type MemberHealthTrendsTranslations } from './member-health-trends.translations.ts';
import {
  type HealthSignalId,
  type HealthSignalViewModel,
  type MemberHealthTrendsViewModel,
} from './member-health-trends.view-model.schema.ts';

export interface MemberHealthTrendsPresenterInput {
  response: MemberHealthResponse;
  teamId: string;
  cycleCount: number;
}

const CYCLE_COUNT_OPTIONS = [3, 5, 8, 10];

const SIGNAL_KEYS: ReadonlyArray<{
  id: HealthSignalId;
  responseKey: keyof Pick<
    MemberHealthResponse,
    | 'estimationScore'
    | 'underestimationRatio'
    | 'averageCycleTime'
    | 'driftingTickets'
    | 'medianReviewTime'
  >;
  labelKey: keyof MemberHealthTrendsTranslations;
  descriptionKey: keyof MemberHealthTrendsTranslations;
}> = [
  {
    id: 'estimationScore',
    responseKey: 'estimationScore',
    labelKey: 'signalEstimationScore',
    descriptionKey: 'signalEstimationScoreDescription',
  },
  {
    id: 'underestimationRatio',
    responseKey: 'underestimationRatio',
    labelKey: 'signalUnderestimationRatio',
    descriptionKey: 'signalUnderestimationRatioDescription',
  },
  {
    id: 'averageCycleTime',
    responseKey: 'averageCycleTime',
    labelKey: 'signalAverageCycleTime',
    descriptionKey: 'signalAverageCycleTimeDescription',
  },
  {
    id: 'driftingTickets',
    responseKey: 'driftingTickets',
    labelKey: 'signalDriftingTickets',
    descriptionKey: 'signalDriftingTicketsDescription',
  },
  {
    id: 'medianReviewTime',
    responseKey: 'medianReviewTime',
    labelKey: 'signalMedianReviewTime',
    descriptionKey: 'signalMedianReviewTimeDescription',
  },
];

export class MemberHealthTrendsPresenter
  implements
    Presenter<MemberHealthTrendsPresenterInput, MemberHealthTrendsViewModel>
{
  constructor(private readonly translations: MemberHealthTrendsTranslations) {}

  present(
    input: MemberHealthTrendsPresenterInput,
  ): MemberHealthTrendsViewModel {
    const { response, teamId, cycleCount } = input;
    const backToReportHref = `/cycle-report?teamId=${teamId}`;

    return {
      pageTitle: `${response.memberName} — ${this.translations.healthTrendsSuffix}`,
      memberName: response.memberName,
      breadcrumbs: [
        { label: 'Shiplens', href: '/dashboard' },
        { label: 'Cycle Report', href: backToReportHref },
        { label: response.memberName, href: null },
      ],
      backToReportHref,
      backToReportLabel: this.translations.backToCycleReport,
      cycleCountOptions: [...CYCLE_COUNT_OPTIONS],
      selectedCycleCount: cycleCount,
      subtitle: this.translations.healthSignalsSubtitle.replace(
        '{cycleCount}',
        String(cycleCount),
      ),
      completedSprintsLabel: this.translations.completedSprintsLabel,
      signals: this.mapSignals(response),
      legendItems: [
        {
          indicator: 'green',
          label: this.translations.indicatorFavorable,
        },
        {
          indicator: 'orange',
          label: this.translations.indicatorMixed,
        },
        {
          indicator: 'red',
          label: this.translations.indicatorUnfavorable,
        },
        {
          indicator: 'gray',
          label: this.translations.indicatorNotEnoughData,
        },
      ],
      noticeIntro: this.translations.noticeIntro,
      noticeMinimum: this.translations.noticeMinimum,
    };
  }

  private toColorIndicator(
    indicator: SignalIndicator,
  ): 'green' | 'orange' | 'red' | null {
    if (
      indicator === 'green' ||
      indicator === 'orange' ||
      indicator === 'red'
    ) {
      return indicator;
    }
    return null;
  }

  private mapSignals(response: MemberHealthResponse): HealthSignalViewModel[] {
    return SIGNAL_KEYS.map((key) => {
      const signal = response[key.responseKey];
      const isNotApplicable = signal.indicator === 'not-applicable';
      const isNotEnoughHistory = signal.indicator === 'not-enough-history';
      const hasColorIndicator = !isNotApplicable && !isNotEnoughHistory;

      return {
        id: key.id,
        label: this.translations[key.labelKey],
        description: this.translations[key.descriptionKey],
        value: signal.value,
        trendDirection: signal.trend,
        indicatorColor: hasColorIndicator
          ? this.toColorIndicator(signal.indicator)
          : null,
        showNotApplicableNote: isNotApplicable,
        showNotEnoughHistoryNote: isNotEnoughHistory,
        notApplicableNote: this.translations.noteNotApplicable,
        notEnoughHistoryNote: this.translations.noteNotEnoughHistory,
      };
    });
  }
}
