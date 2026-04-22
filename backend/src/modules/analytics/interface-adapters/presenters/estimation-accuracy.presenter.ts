import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import {
  type DeveloperScore,
  type EstimationAccuracy,
  type IssueRatio,
  type LabelScore,
} from '../../entities/estimation-accuracy/estimation-accuracy.js';

export interface EstimationAccuracyDto {
  issues: IssueRatio[];
  developerScores: DeveloperScore[];
  labelScores: LabelScore[];
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
      excludedWithoutEstimation: accuracy.excludedWithoutEstimation,
      excludedWithoutCycleTime: accuracy.excludedWithoutCycleTime,
    };
  }
}
