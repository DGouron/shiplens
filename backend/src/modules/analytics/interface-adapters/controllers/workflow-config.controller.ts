import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { GetWorkflowConfigUsecase } from '../../usecases/get-workflow-config.usecase.js';
import { SetWorkflowConfigUsecase } from '../../usecases/set-workflow-config.usecase.js';
import {
  type WorkflowConfigDto,
  WorkflowConfigPresenter,
} from '../presenters/workflow-config.presenter.js';

@Controller('analytics')
export class WorkflowConfigController {
  constructor(
    private readonly getWorkflowConfig: GetWorkflowConfigUsecase,
    private readonly setWorkflowConfig: SetWorkflowConfigUsecase,
    private readonly presenter: WorkflowConfigPresenter,
  ) {}

  @Get('teams/:teamId/workflow-config')
  async get(@Param('teamId') teamId: string): Promise<WorkflowConfigDto> {
    const config = await this.getWorkflowConfig.execute({ teamId });
    return this.presenter.present(config);
  }

  @Put('teams/:teamId/workflow-config')
  async set(
    @Param('teamId') teamId: string,
    @Body() body: { startedStatuses: string[]; completedStatuses: string[] },
  ): Promise<WorkflowConfigDto> {
    const config = await this.setWorkflowConfig.execute({
      teamId,
      startedStatuses: body.startedStatuses,
      completedStatuses: body.completedStatuses,
    });
    return this.presenter.present(config);
  }
}
