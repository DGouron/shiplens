import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import {
  type HealthSignalResult,
  type Trend,
} from '../../entities/member-health/health-signal.js';
import { type MemberHealth } from '../../entities/member-health/member-health.js';

type SignalIndicator =
  | 'green'
  | 'orange'
  | 'red'
  | 'not-applicable'
  | 'not-enough-history';

export interface MemberHealthSignalDto {
  value: string;
  trend: Trend | null;
  indicator: SignalIndicator;
}

export interface MemberHealthDto {
  teamId: string;
  memberName: string;
  estimationScore: MemberHealthSignalDto;
  underestimationRatio: MemberHealthSignalDto;
  averageCycleTime: MemberHealthSignalDto;
  driftingTickets: MemberHealthSignalDto;
  medianReviewTime: MemberHealthSignalDto;
}

type ValueFormatter = (value: number) => string;

const NOT_APPLICABLE_LABEL = 'Not applicable';

function formatSignal(
  result: HealthSignalResult,
  formatValue: ValueFormatter,
): MemberHealthSignalDto {
  if (!result.isApplicable) {
    return {
      value: NOT_APPLICABLE_LABEL,
      trend: null,
      indicator: 'not-applicable',
    };
  }

  if (!result.hasEnoughHistory) {
    return {
      value:
        result.lastValue === null
          ? NOT_APPLICABLE_LABEL
          : formatValue(result.lastValue),
      trend: null,
      indicator: 'not-enough-history',
    };
  }

  return {
    value: formatValue(result.lastValue),
    trend: result.trend,
    indicator: result.indicator,
  };
}

const formatPercent: ValueFormatter = (value) => `${Math.round(value)}%`;
const formatDaysWithOneDecimal: ValueFormatter = (value) =>
  `${value.toFixed(1)}d`;
const formatHoursAsInteger: ValueFormatter = (value) => `${Math.round(value)}h`;
const formatCount: ValueFormatter = (value) => `${Math.round(value)}`;

@Injectable()
export class MemberHealthPresenter
  implements Presenter<MemberHealth, MemberHealthDto>
{
  present(health: MemberHealth): MemberHealthDto {
    return {
      teamId: health.teamId,
      memberName: health.memberName,
      estimationScore: formatSignal(
        health.estimationScoreSignal(),
        formatPercent,
      ),
      underestimationRatio: formatSignal(
        health.underestimationRatioSignal(),
        formatPercent,
      ),
      averageCycleTime: formatSignal(
        health.averageCycleTimeSignal(),
        formatDaysWithOneDecimal,
      ),
      driftingTickets: formatSignal(
        health.driftingTicketsSignal(),
        formatCount,
      ),
      medianReviewTime: formatSignal(
        health.medianReviewTimeSignal(),
        formatHoursAsInteger,
      ),
    };
  }
}
