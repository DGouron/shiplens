import { Body, Controller, Param, Post } from '@nestjs/common';
import { type AiProvider } from '../../entities/sprint-report/ai-text-generator.gateway.js';
import { GenerateSprintReportUsecase } from '../../usecases/generate-sprint-report.usecase.js';
import {
  type SprintReportDto,
  SprintReportPresenter,
} from '../presenters/sprint-report.presenter.js';

interface GenerateSprintReportBody {
  teamId: string;
  language: string;
  provider: AiProvider;
}

@Controller('analytics/cycles')
export class SprintReportController {
  constructor(
    private readonly generateSprintReport: GenerateSprintReportUsecase,
    private readonly sprintReportPresenter: SprintReportPresenter,
  ) {}

  @Post(':cycleId/report')
  async generate(
    @Param('cycleId') cycleId: string,
    @Body() body: GenerateSprintReportBody,
  ): Promise<SprintReportDto> {
    const report = await this.generateSprintReport.execute({
      cycleId,
      teamId: body.teamId,
      language: body.language,
      provider: body.provider,
    });

    return this.sprintReportPresenter.present(report);
  }
}
