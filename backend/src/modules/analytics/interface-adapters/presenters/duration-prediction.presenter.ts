import { Injectable } from '@nestjs/common';
import { type Presenter } from '@shared/foundation/presenter/presenter.js';
import { type DurationPrediction } from '../../entities/duration-prediction/duration-prediction.js';

export interface DurationPredictionDto {
  optimistic: number;
  probable: number;
  pessimistic: number;
  confidence: 'high' | 'low';
  similarIssueCount: number;
}

@Injectable()
export class DurationPredictionPresenter
  implements Presenter<DurationPrediction, DurationPredictionDto>
{
  present(prediction: DurationPrediction): DurationPredictionDto {
    return {
      optimistic: prediction.optimistic,
      probable: prediction.probable,
      pessimistic: prediction.pessimistic,
      confidence: prediction.confidence,
      similarIssueCount: prediction.similarIssueCount,
    };
  }
}
