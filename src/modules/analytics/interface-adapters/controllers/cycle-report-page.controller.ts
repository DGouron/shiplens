import { Controller, Get, Header, Param, Query } from '@nestjs/common';
import { GetCycleIssuesUsecase } from '../../usecases/get-cycle-issues.usecase.js';
import { GetWorkspaceLanguageUsecase } from '../../usecases/get-workspace-language.usecase.js';
import { ListTeamCyclesUsecase } from '../../usecases/list-team-cycles.usecase.js';
import {
  type CycleIssuesDto,
  CycleIssuesPresenter,
} from '../presenters/cycle-issues.presenter.js';
import {
  type TeamCyclesDto,
  TeamCyclesPresenter,
} from '../presenters/team-cycles.presenter.js';
import { buildCycleReportPageHtml } from './cycle-report-page.html.js';

@Controller()
export class CycleReportPageController {
  constructor(
    private readonly listTeamCyclesUsecase: ListTeamCyclesUsecase,
    private readonly getCycleIssuesUsecase: GetCycleIssuesUsecase,
    private readonly teamCyclesPresenter: TeamCyclesPresenter,
    private readonly cycleIssuesPresenter: CycleIssuesPresenter,
    private readonly getWorkspaceLanguage: GetWorkspaceLanguageUsecase,
  ) {}

  @Get('analytics/teams/:teamId/cycles')
  async listCycles(@Param('teamId') teamId: string): Promise<TeamCyclesDto> {
    const result = await this.listTeamCyclesUsecase.execute({ teamId });
    return this.teamCyclesPresenter.present(result);
  }

  @Get('analytics/cycles/:cycleId/issues')
  async getCycleIssues(
    @Param('cycleId') cycleId: string,
    @Query('teamId') teamId: string,
  ): Promise<CycleIssuesDto> {
    const result = await this.getCycleIssuesUsecase.execute({
      cycleId,
      teamId,
    });
    return this.cycleIssuesPresenter.present(result);
  }

  @Get('cycle-report')
  @Header('Content-Type', 'text/html')
  async getPage(): Promise<string> {
    const locale = await this.getWorkspaceLanguage.execute();
    return buildCycleReportPageHtml(locale);
  }
}
