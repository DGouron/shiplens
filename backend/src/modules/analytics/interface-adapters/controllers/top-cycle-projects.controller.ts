import { Controller, Get, Param } from '@nestjs/common';
import { GetCycleIssuesForProjectUsecase } from '../../usecases/get-cycle-issues-for-project.usecase.js';
import { GetTopCycleProjectsUsecase } from '../../usecases/get-top-cycle-projects.usecase.js';
import {
  type CycleProjectIssuesDto,
  CycleProjectIssuesPresenter,
} from '../presenters/cycle-project-issues.presenter.js';
import {
  type TopCycleProjectsDto,
  TopCycleProjectsPresenter,
} from '../presenters/top-cycle-projects.presenter.js';

@Controller('analytics/top-cycle-projects')
export class TopCycleProjectsController {
  constructor(
    private readonly getTopCycleProjects: GetTopCycleProjectsUsecase,
    private readonly getCycleIssuesForProject: GetCycleIssuesForProjectUsecase,
    private readonly topProjectsPresenter: TopCycleProjectsPresenter,
    private readonly issuesPresenter: CycleProjectIssuesPresenter,
  ) {}

  @Get(':teamId')
  async getTopProjects(
    @Param('teamId') teamId: string,
  ): Promise<TopCycleProjectsDto> {
    const result = await this.getTopCycleProjects.execute({ teamId });
    return this.topProjectsPresenter.present(result);
  }

  @Get(':teamId/projects/:projectId/issues')
  async getProjectIssues(
    @Param('teamId') teamId: string,
    @Param('projectId') projectId: string,
  ): Promise<CycleProjectIssuesDto> {
    const result = await this.getCycleIssuesForProject.execute({
      teamId,
      projectId,
    });
    return this.issuesPresenter.present(result);
  }
}
