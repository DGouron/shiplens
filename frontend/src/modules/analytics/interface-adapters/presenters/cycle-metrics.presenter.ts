import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type CycleMetricsResponse } from '../../entities/cycle-metrics/cycle-metrics.response.ts';
import { type CycleMetricsTranslations } from './cycle-metrics.translations.ts';
import {
  type CycleMetricsCardViewModel,
  type CycleMetricsViewModel,
} from './cycle-metrics.view-model.schema.ts';

const SCOPE_CREEP_ALERT_THRESHOLD = 30;

export class CycleMetricsPresenter
  implements Presenter<CycleMetricsResponse, CycleMetricsViewModel>
{
  constructor(private readonly translations: CycleMetricsTranslations) {}

  present(input: CycleMetricsResponse): CycleMetricsViewModel {
    const cards: CycleMetricsCardViewModel[] = [
      {
        id: 'velocity',
        label: this.translations.labelVelocity,
        value: `${input.velocity.completedPoints}/${input.velocity.plannedPoints} ${this.translations.pointsUnit}`,
        isAlert: false,
      },
      {
        id: 'throughput',
        label: this.translations.labelThroughput,
        value: `${input.throughput} ${this.translations.issuesUnit}`,
        isAlert: false,
      },
      {
        id: 'completionRate',
        label: this.translations.labelCompletionRate,
        value: `${input.completionRate}%`,
        isAlert: false,
      },
      {
        id: 'scopeCreep',
        label: this.translations.labelScopeCreep,
        value: `${input.scopeCreep} ${this.translations.issuesAddedUnit}`,
        isAlert: input.scopeCreep > SCOPE_CREEP_ALERT_THRESHOLD,
      },
      {
        id: 'averageCycleTime',
        label: this.translations.labelAverageCycleTime,
        value: this.formatDays(input.averageCycleTimeInDays),
        isAlert: false,
      },
      {
        id: 'averageLeadTime',
        label: this.translations.labelAverageLeadTime,
        value: this.formatDays(input.averageLeadTimeInDays),
        isAlert: false,
      },
    ];
    return { cards };
  }

  private formatDays(days: number | null): string {
    if (days === null) {
      return this.translations.notAvailable;
    }
    const rounded = Math.round(days * 10) / 10;
    const display = Number.isInteger(rounded)
      ? String(rounded)
      : rounded.toFixed(1);
    return `${display} ${this.translations.daysUnit}`;
  }
}
