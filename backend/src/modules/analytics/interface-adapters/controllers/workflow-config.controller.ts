import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { AvailableStatusesGateway } from '../../entities/team-settings/available-statuses.gateway.js';
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
    private readonly availableStatusesGateway: AvailableStatusesGateway,
    private readonly presenter: WorkflowConfigPresenter,
  ) {}

  @Get('teams/:teamId/workflow-config')
  async get(@Param('teamId') teamId: string): Promise<WorkflowConfigDto> {
    const [config, knownStatuses] = await Promise.all([
      this.getWorkflowConfig.execute({ teamId }),
      this.availableStatusesGateway.getDistinctTransitionStatusNames(teamId),
    ]);
    return this.presenter.present(config, knownStatuses);
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
    const knownStatuses =
      await this.availableStatusesGateway.getDistinctTransitionStatusNames(
        teamId,
      );
    return this.presenter.present(config, knownStatuses);
  }
}
