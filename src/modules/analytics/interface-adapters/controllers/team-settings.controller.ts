import { Controller, Get, Put, Param, Body } from '@nestjs/common';
import { GetTeamExcludedStatusesUsecase } from '../../usecases/get-team-excluded-statuses.usecase.js';
import { SetTeamExcludedStatusesUsecase } from '../../usecases/set-team-excluded-statuses.usecase.js';
import { AvailableStatusesGateway } from '../../entities/team-settings/available-statuses.gateway.js';

@Controller('settings')
export class TeamSettingsController {
  constructor(
    private readonly getExcludedStatuses: GetTeamExcludedStatusesUsecase,
    private readonly setExcludedStatuses: SetTeamExcludedStatusesUsecase,
    private readonly availableStatusesGateway: AvailableStatusesGateway,
  ) {}

  @Get('teams/:teamId/excluded-statuses')
  async getExcluded(
    @Param('teamId') teamId: string,
  ): Promise<{ statuses: string[] }> {
    const statuses = await this.getExcludedStatuses.execute(teamId);
    return { statuses };
  }

  @Put('teams/:teamId/excluded-statuses')
  async setExcluded(
    @Param('teamId') teamId: string,
    @Body() body: { statuses: string[] },
  ): Promise<void> {
    await this.setExcludedStatuses.execute({
      teamId,
      statuses: body.statuses,
    });
  }

  @Get('teams/:teamId/available-statuses')
  async getAvailable(
    @Param('teamId') teamId: string,
  ): Promise<{ statuses: string[] }> {
    const statuses =
      await this.availableStatusesGateway.getDistinctStatusNames(teamId);
    return { statuses };
  }
}
