import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type EstimationAccuracy, type IssueRatio, type DeveloperScore, type LabelScore, type TeamScore } from '../../entities/estimation-accuracy/estimation-accuracy.js';

export interface EstimationAccuracyDto {
  issues: IssueRatio[];
  developerScores: DeveloperScore[];
  labelScores: LabelScore[];
  teamScore: TeamScore;
  excludedWithoutEstimation: number;
  excludedWithoutCycleTime: number;
}

@Injectable()
export class EstimationAccuracyPresenter
  implements Presenter<EstimationAccuracy, EstimationAccuracyDto>
{
  present(accuracy: EstimationAccuracy): EstimationAccuracyDto {
    return {
      issues: accuracy.ratioPerIssue(),
      developerScores: accuracy.scoreByDeveloper(),
      labelScores: accuracy.scoreByLabel(),
      teamScore: accuracy.teamScore(),
      excludedWithoutEstimation: accuracy.excludedWithoutEstimation,
      excludedWithoutCycleTime: accuracy.excludedWithoutCycleTime,
    };
  }
}
