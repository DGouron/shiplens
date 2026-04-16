import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type EstimationAccuracyResponse,
  type EstimationClassificationResponse,
  type TeamScoreResponse,
} from '../../entities/estimation-accuracy/estimation-accuracy.response.ts';
import { type EstimationAccuracyTranslations } from './estimation-accuracy.translations.ts';
import {
  type EstimationAccuracyViewModel,
  type EstimationBucketViewModel,
  type EstimationTeamScoreViewModel,
} from './estimation-accuracy.view-model.schema.ts';

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
      teamScore: this.buildTeamScore(input.teamScore),
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

  private buildTeamScore(
    teamScore: TeamScoreResponse,
  ): EstimationTeamScoreViewModel {
    const classificationLabel = this.classificationLabel(
      teamScore.classification,
    );
    return {
      classification: teamScore.classification,
      classificationLabel,
      daysPerPointLabel: this.translations.teamScoreDaysPerPointLabel(
        teamScore.daysPerPoint,
      ),
      issueCountLabel: this.translations.teamScoreIssueCountLabel(
        teamScore.issueCount,
      ),
    };
  }

  private classificationLabel(
    classification: EstimationClassificationResponse,
  ): string {
    if (classification === 'well-estimated')
      return this.translations.classificationWellEstimated;
    if (classification === 'over-estimated')
      return this.translations.classificationOverEstimated;
    return this.translations.classificationUnderEstimated;
  }
}
