import { Controller, Get, Param } from '@nestjs/common';
import { GetCycleIssuesForAssigneeUsecase } from '../../usecases/get-cycle-issues-for-assignee.usecase.js';
import { GetTopCycleAssigneesUsecase } from '../../usecases/get-top-cycle-assignees.usecase.js';
import {
  type CycleAssigneeIssuesDto,
  CycleAssigneeIssuesPresenter,
} from '../presenters/cycle-assignee-issues.presenter.js';
import {
  type TopCycleAssigneesDto,
  TopCycleAssigneesPresenter,
} from '../presenters/top-cycle-assignees.presenter.js';

@Controller('analytics/top-cycle-assignees')
export class TopCycleAssigneesController {
  constructor(
    private readonly getTopCycleAssignees: GetTopCycleAssigneesUsecase,
    private readonly getCycleIssuesForAssignee: GetCycleIssuesForAssigneeUsecase,
    private readonly topAssigneesPresenter: TopCycleAssigneesPresenter,
    private readonly issuesPresenter: CycleAssigneeIssuesPresenter,
  ) {}

  @Get(':teamId')
  async getTopAssignees(
    @Param('teamId') teamId: string,
  ): Promise<TopCycleAssigneesDto> {
    const result = await this.getTopCycleAssignees.execute({ teamId });
    return this.topAssigneesPresenter.present(result);
  }

  @Get(':teamId/assignees/:assigneeName/issues')
  async getAssigneeIssues(
    @Param('teamId') teamId: string,
    @Param('assigneeName') assigneeName: string,
  ): Promise<CycleAssigneeIssuesDto> {
    const result = await this.getCycleIssuesForAssignee.execute({
      teamId,
      assigneeName,
    });
    return this.issuesPresenter.present(result);
  }
}
