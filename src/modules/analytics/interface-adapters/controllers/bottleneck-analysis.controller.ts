import { Controller, Get, Param, Query } from '@nestjs/common';
import { AnalyzeBottlenecksByStatusUsecase } from '../../usecases/analyze-bottlenecks-by-status.usecase.js';
import {
  type BottleneckAnalysisDto,
  BottleneckAnalysisPresenter,
} from '../presenters/bottleneck-analysis.presenter.js';

@Controller('analytics/cycles')
export class BottleneckAnalysisController {
  constructor(
    private readonly analyzeBottlenecks: AnalyzeBottlenecksByStatusUsecase,
    private readonly bottleneckPresenter: BottleneckAnalysisPresenter,
  ) {}

  @Get(':cycleId/bottlenecks')
  async getBottlenecks(
    @Param('cycleId') cycleId: string,
    @Query('teamId') teamId: string,
    @Query('includeComparison') includeComparison?: string,
  ): Promise<BottleneckAnalysisDto> {
    const result = await this.analyzeBottlenecks.execute({
      cycleId,
      teamId,
      includeComparison: includeComparison === 'true',
    });

    return this.bottleneckPresenter.present(result);
  }
}
