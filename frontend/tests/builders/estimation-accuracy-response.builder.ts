import {
  type DeveloperScoreResponse,
  type EstimationAccuracyResponse,
  type EstimationClassificationResponse,
  type IssueRatioResponse,
  type LabelScoreResponse,
  type TeamScoreResponse,
} from '@/modules/analytics/entities/estimation-accuracy/estimation-accuracy.response.ts';
import { EntityBuilder } from '@/shared/foundation/testing/entity-builder.ts';

interface IssueClassificationFragment {
  classification: EstimationClassificationResponse;
}

function makeIssue(
  classification: EstimationClassificationResponse,
  index: number,
): IssueRatioResponse {
  return {
    externalId: `LIN-${index}`,
    title: `Issue ${index}`,
    points: 2,
    cycleTimeInDays: 3,
    ratio: 1,
    daysPerPoint: 1.5,
    classification,
  };
}

const defaultTeamScore: TeamScoreResponse = {
  issueCount: 5,
  averageRatio: 1,
  daysPerPoint: 1.5,
  classification: 'well-estimated',
};

export class EstimationAccuracyResponseBuilder extends EntityBuilder<
  EstimationAccuracyResponse,
  EstimationAccuracyResponse
> {
  constructor() {
    super({
      issues: [
        makeIssue('well-estimated', 1),
        makeIssue('well-estimated', 2),
        makeIssue('well-estimated', 3),
        makeIssue('over-estimated', 4),
        makeIssue('under-estimated', 5),
      ],
      developerScores: [],
      labelScores: [],
      teamScore: { ...defaultTeamScore },
      excludedWithoutEstimation: 0,
      excludedWithoutCycleTime: 0,
    });
  }

  withIssues(
    issues: IssueClassificationFragment[] | IssueRatioResponse[],
  ): this {
    this.props.issues = issues.map((issue, index) => {
      if ('externalId' in issue) {
        return { ...issue };
      }
      return makeIssue(issue.classification, index + 1);
    });
    return this;
  }

  withDeveloperScores(developerScores: DeveloperScoreResponse[]): this {
    this.props.developerScores = developerScores.map((score) => ({ ...score }));
    return this;
  }

  withLabelScores(labelScores: LabelScoreResponse[]): this {
    this.props.labelScores = labelScores.map((score) => ({ ...score }));
    return this;
  }

  withTeamScore(teamScore: TeamScoreResponse): this {
    this.props.teamScore = { ...teamScore };
    return this;
  }

  withExcludedWithoutEstimation(count: number): this {
    this.props.excludedWithoutEstimation = count;
    return this;
  }

  withExcludedWithoutCycleTime(count: number): this {
    this.props.excludedWithoutCycleTime = count;
    return this;
  }

  build(): EstimationAccuracyResponse {
    return {
      issues: this.props.issues.map((issue) => ({ ...issue })),
      developerScores: this.props.developerScores.map((score) => ({
        ...score,
      })),
      labelScores: this.props.labelScores.map((score) => ({ ...score })),
      teamScore: { ...this.props.teamScore },
      excludedWithoutEstimation: this.props.excludedWithoutEstimation,
      excludedWithoutCycleTime: this.props.excludedWithoutCycleTime,
    };
  }
}
