import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type EstimationAccuracyResponse } from '../../entities/estimation-accuracy/estimation-accuracy.response.ts';
import {
  type EstimationAccuracyTranslations,
  type EstimationDriftDirection,
  type EstimationHealthLevel,
} from './estimation-accuracy.translations.ts';
import {
  type EstimationAccuracyViewModel,
  type EstimationBucketViewModel,
  type EstimationDiagnosisViewModel,
} from './estimation-accuracy.view-model.schema.ts';

const HEALTHY_WELL_ESTIMATED_THRESHOLD = 0.7;
const MIXED_WELL_ESTIMATED_THRESHOLD = 0.5;

interface ClassificationCounts {
  wellEstimated: number;
  overEstimated: number;
  underEstimated: number;
}

export class EstimationAccuracyPresenter
  implements Presenter<EstimationAccuracyResponse, EstimationAccuracyViewModel>
{
  constructor(private readonly translations: EstimationAccuracyTranslations) {}

  present(input: EstimationAccuracyResponse): EstimationAccuracyViewModel {
    const counts = this.countClassifications(input.issues);
    const total = input.issues.length;
    const donut = {
      wellEstimated: this.buildBucket(
        this.translations.wellEstimatedLabel,
        counts.wellEstimated,
        total,
      ),
      overEstimated: this.buildBucket(
        this.translations.overEstimatedLabel,
        counts.overEstimated,
        total,
      ),
      underEstimated: this.buildBucket(
        this.translations.underEstimatedLabel,
        counts.underEstimated,
        total,
      ),
      totalLabel: this.translations.totalLabel(total),
    };
    const hasExclusionWithoutEstimation = input.excludedWithoutEstimation > 0;
    const hasExclusionWithoutCycleTime = input.excludedWithoutCycleTime > 0;
    const hasAnyExclusion =
      hasExclusionWithoutEstimation || hasExclusionWithoutCycleTime;
    const showContent = total > 0;
    const showEmptyMessage = total === 0 && !hasAnyExclusion;

    return {
      donut,
      diagnosis: this.buildDiagnosis(counts, total),
      exclusions: {
        withoutEstimation: {
          count: input.excludedWithoutEstimation,
          label: this.translations.exclusionWithoutEstimationLabel(
            input.excludedWithoutEstimation,
          ),
        },
        withoutCycleTime: {
          count: input.excludedWithoutCycleTime,
          label: this.translations.exclusionWithoutCycleTimeLabel(
            input.excludedWithoutCycleTime,
          ),
        },
      },
      emptyMessage: showEmptyMessage ? this.translations.emptyMessage : null,
      showEmptyMessage,
      showContent,
      showExclusionWithoutEstimation: hasExclusionWithoutEstimation,
      showExclusionWithoutCycleTime: hasExclusionWithoutCycleTime,
    };
  }

  private countClassifications(
    issues: EstimationAccuracyResponse['issues'],
  ): ClassificationCounts {
    const counts: ClassificationCounts = {
      wellEstimated: 0,
      overEstimated: 0,
      underEstimated: 0,
    };
    for (const issue of issues) {
      if (issue.classification === 'well-estimated') counts.wellEstimated += 1;
      else if (issue.classification === 'over-estimated')
        counts.overEstimated += 1;
      else if (issue.classification === 'under-estimated')
        counts.underEstimated += 1;
    }
    return counts;
  }

  private buildBucket(
    label: string,
    count: number,
    total: number,
  ): EstimationBucketViewModel {
    const percentage = total === 0 ? 0 : Math.round((count / total) * 100);
    return {
      label: this.translations.bucketLabel(label, count, percentage),
      count,
      percentage,
    };
  }

  private buildDiagnosis(
    counts: ClassificationCounts,
    total: number,
  ): EstimationDiagnosisViewModel {
    const healthLevel = this.computeHealthLevel(counts.wellEstimated, total);
    const driftDirection = this.computeDriftDirection(
      counts.overEstimated,
      counts.underEstimated,
    );
    const accuracyPercentage =
      total === 0 ? 0 : Math.round((counts.wellEstimated / total) * 100);

    return {
      healthLevel,
      healthHeadline: this.translations.diagnosisHeadline(healthLevel),
      accuracySummary: this.translations.diagnosisAccuracySummary(
        counts.wellEstimated,
        total,
        accuracyPercentage,
      ),
      driftSummary: this.translations.diagnosisDriftSummary(
        driftDirection,
        counts.underEstimated,
        counts.overEstimated,
      ),
      showDriftSummary: driftDirection !== 'balanced',
      recommendation: this.translations.diagnosisRecommendation(
        healthLevel,
        driftDirection,
      ),
    };
  }

  private computeHealthLevel(
    wellEstimatedCount: number,
    total: number,
  ): EstimationHealthLevel {
    if (total === 0) return 'healthy';
    const share = wellEstimatedCount / total;
    if (share >= HEALTHY_WELL_ESTIMATED_THRESHOLD) return 'healthy';
    if (share >= MIXED_WELL_ESTIMATED_THRESHOLD) return 'mixed';
    return 'needs-calibration';
  }

  private computeDriftDirection(
    overEstimatedCount: number,
    underEstimatedCount: number,
  ): EstimationDriftDirection {
    if (underEstimatedCount > overEstimatedCount) return 'under-dominant';
    if (overEstimatedCount > underEstimatedCount) return 'over-dominant';
    return 'balanced';
  }
}
