import { Controller, Get, Param, Query } from '@nestjs/common';
import { CalculateCycleMetricsUsecase } from '../../usecases/calculate-cycle-metrics.usecase.js';
import { CycleMetricsPresenter, type CycleMetricsDto } from '../presenters/cycle-metrics.presenter.js';

@Controller('analytics/cycles')
export class CycleMetricsController {
  constructor(
    private readonly calculateCycleMetrics: CalculateCycleMetricsUsecase,
    private readonly cycleMetricsPresenter: CycleMetricsPresenter,
  ) {}

  @Get(':cycleId/metrics')
  async getMetrics(
    @Param('cycleId') cycleId: string,
    @Query('teamId') teamId: string,
    @Query('includeTrend') includeTrend?: string,
  ): Promise<CycleMetricsDto> {
    const result = await this.calculateCycleMetrics.execute({
      cycleId,
      teamId,
      includeTrend: includeTrend === 'true',
    });

    return this.cycleMetricsPresenter.present(result);
  }
}
