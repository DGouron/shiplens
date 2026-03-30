import { Controller, Get, Post, Body } from '@nestjs/common';
import { ListAvailableTeamsUsecase } from '../../usecases/list-available-teams.usecase.js';
import { SaveTeamSelectionUsecase } from '../../usecases/save-team-selection.usecase.js';
import { GetTeamSelectionUsecase } from '../../usecases/get-team-selection.usecase.js';
import {
  AvailableTeamsPresenter,
  type AvailableTeamDto,
} from '../presenters/available-teams.presenter.js';
import {
  TeamSelectionPresenter,
  type TeamSelectionDto,
} from '../presenters/team-selection.presenter.js';
import { type TeamSelectionProps } from '../../entities/team-selection/team-selection.schema.js';

interface SaveSelectionResponse {
  estimatedIssueCount: number;
}

@Controller('sync')
export class TeamSelectionController {
  constructor(
    private readonly listAvailableTeams: ListAvailableTeamsUsecase,
    private readonly saveTeamSelection: SaveTeamSelectionUsecase,
    private readonly getTeamSelection: GetTeamSelectionUsecase,
    private readonly availableTeamsPresenter: AvailableTeamsPresenter,
    private readonly teamSelectionPresenter: TeamSelectionPresenter,
  ) {}

  @Get('teams')
  async getAvailableTeams(): Promise<AvailableTeamDto[]> {
    const teams = await this.listAvailableTeams.execute();
    return this.availableTeamsPresenter.present(teams);
  }

  @Post('selection')
  async saveSelection(
    @Body() body: TeamSelectionProps,
  ): Promise<SaveSelectionResponse> {
    return this.saveTeamSelection.execute(body);
  }

  @Get('selection')
  async getSelection(): Promise<TeamSelectionDto | null> {
    const selection = await this.getTeamSelection.execute();
    return this.teamSelectionPresenter.present(selection);
  }
}
