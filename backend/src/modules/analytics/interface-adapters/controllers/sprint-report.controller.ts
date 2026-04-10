import { Body, Controller, Param, Post } from '@nestjs/common';
import { type AiProvider } from '../../entities/sprint-report/ai-text-generator.gateway.js';
import { WorkspaceSettingsGateway } from '../../entities/workspace-settings/workspace-settings.gateway.js';
import { GenerateSprintReportUsecase } from '../../usecases/generate-sprint-report.usecase.js';
import {
  type SprintReportDto,
  SprintReportPresenter,
} from '../presenters/sprint-report.presenter.js';

interface GenerateSprintReportBody {
  teamId: string;
  provider: AiProvider;
}

@Controller('analytics/cycles')
export class SprintReportController {
  constructor(
    private readonly generateSprintReport: GenerateSprintReportUsecase,
    private readonly sprintReportPresenter: SprintReportPresenter,
    private readonly workspaceSettingsGateway: WorkspaceSettingsGateway,
  ) {}

  @Post(':cycleId/report')
  async generate(
    @Param('cycleId') cycleId: string,
    @Body() body: GenerateSprintReportBody,
  ): Promise<SprintReportDto> {
    const report = await this.generateSprintReport.execute({
      cycleId,
      teamId: body.teamId,
      provider: body.provider,
    });

    const locale = await this.workspaceSettingsGateway.getLanguage();
    return this.sprintReportPresenter.present(report, locale);
  }
}
