import { Controller, Post, Param, Body } from '@nestjs/common';
import { GenerateSprintReportUsecase } from '../../usecases/generate-sprint-report.usecase.js';
import { SprintReportPresenter, type SprintReportDto } from '../presenters/sprint-report.presenter.js';
import { type AiProvider } from '../../entities/sprint-report/ai-text-generator.gateway.js';

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
