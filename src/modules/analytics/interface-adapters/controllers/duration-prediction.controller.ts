import { Controller, Get, Param } from '@nestjs/common';
import { PredictIssueDurationUsecase } from '../../usecases/predict-issue-duration.usecase.js';
import { DurationPredictionPresenter, type DurationPredictionDto } from '../presenters/duration-prediction.presenter.js';

@Controller('api/analytics/teams')
export class DurationPredictionController {
  constructor(
    private readonly predictIssueDurationUsecase: PredictIssueDurationUsecase,
    private readonly durationPredictionPresenter: DurationPredictionPresenter,
  ) {}

  @Get(':teamId/issues/:issueExternalId/duration-prediction')
  async getDurationPrediction(
    @Param('teamId') teamId: string,
    @Param('issueExternalId') issueExternalId: string,
  ): Promise<DurationPredictionDto> {
    const prediction = await this.predictIssueDurationUsecase.execute({
      teamId,
      issueExternalId,
    });

    return this.durationPredictionPresenter.present(prediction);
  }
}
