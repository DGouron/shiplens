import { Controller, Get, Param } from '@nestjs/common';
import { DRIFT_GRID } from '../../entities/drifting-issue/drift-grid.js';
import { DetectDriftingIssuesUsecase } from '../../usecases/detect-drifting-issues.usecase.js';
import {
  type DriftingIssueDto,
  DriftingIssuesPresenter,
} from '../presenters/drifting-issues.presenter.js';

@Controller('analytics/drifting-issues')
export class DriftingIssuesController {
  constructor(
    private readonly detectDriftingIssues: DetectDriftingIssuesUsecase,
    private readonly driftingIssuesPresenter: DriftingIssuesPresenter,
  ) {}

  @Get(':teamId')
  async listDriftingIssues(
    @Param('teamId') teamId: string,
  ): Promise<DriftingIssueDto[]> {
    const issues = await this.detectDriftingIssues.execute({ teamId });
    return this.driftingIssuesPresenter.present(issues);
  }

  @Get('drift-grid/entries')
  getDriftGrid(): ReadonlyArray<{ points: number; maxBusinessHours: number }> {
    return DRIFT_GRID;
  }
}
