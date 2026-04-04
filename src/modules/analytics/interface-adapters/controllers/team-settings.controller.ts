import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { AvailableStatusesGateway } from '../../entities/team-settings/available-statuses.gateway.js';
import { TeamSettingsGateway } from '../../entities/team-settings/team-settings.gateway.js';
import { GetTeamExcludedStatusesUsecase } from '../../usecases/get-team-excluded-statuses.usecase.js';
import { SetTeamExcludedStatusesUsecase } from '../../usecases/set-team-excluded-statuses.usecase.js';

@Controller('settings')
export class TeamSettingsController {
  constructor(
    private readonly getExcludedStatuses: GetTeamExcludedStatusesUsecase,
    private readonly setExcludedStatuses: SetTeamExcludedStatusesUsecase,
    private readonly availableStatusesGateway: AvailableStatusesGateway,
    private readonly teamSettingsGateway: TeamSettingsGateway,
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

  @Get('teams/:teamId/timezone')
  async getTimezone(
    @Param('teamId') teamId: string,
  ): Promise<{ timezone: string }> {
    const timezone = await this.teamSettingsGateway.getTimezone(teamId);
    return { timezone };
  }

  @Put('teams/:teamId/timezone')
  async setTimezone(
    @Param('teamId') teamId: string,
    @Body() body: { timezone: string },
  ): Promise<void> {
    await this.teamSettingsGateway.setTimezone(teamId, body.timezone);
  }
}
