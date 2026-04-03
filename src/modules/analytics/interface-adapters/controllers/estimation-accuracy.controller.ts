import { Controller, Get, Param } from '@nestjs/common';
import { CalculateEstimationAccuracyUsecase } from '../../usecases/calculate-estimation-accuracy.usecase.js';
import {
  type CycleTrendEntry,
  GetEstimationTrendUsecase,
} from '../../usecases/get-estimation-trend.usecase.js';
import {
  type EstimationAccuracyDto,
  EstimationAccuracyPresenter,
} from '../presenters/estimation-accuracy.presenter.js';

@Controller('api/analytics/teams')
export class EstimationAccuracyController {
  constructor(
    private readonly calculateEstimationAccuracyUsecase: CalculateEstimationAccuracyUsecase,
    private readonly getEstimationTrendUsecase: GetEstimationTrendUsecase,
    private readonly estimationAccuracyPresenter: EstimationAccuracyPresenter,
  ) {}

  @Get(':teamId/cycles/:cycleId/estimation-accuracy')
  async getEstimationAccuracy(
    @Param('teamId') teamId: string,
    @Param('cycleId') cycleId: string,
  ): Promise<EstimationAccuracyDto> {
    const accuracy = await this.calculateEstimationAccuracyUsecase.execute({
      cycleId,
      teamId,
    });

    return this.estimationAccuracyPresenter.present(accuracy);
  }

  @Get(':teamId/estimation-trend')
  async getEstimationTrend(
    @Param('teamId') teamId: string,
  ): Promise<CycleTrendEntry[]> {
    return this.getEstimationTrendUsecase.execute({ teamId });
  }
}
