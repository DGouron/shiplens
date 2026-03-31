import { Controller, Get, Header } from '@nestjs/common';
import { GetWorkspaceDashboardUsecase } from '../../usecases/get-workspace-dashboard.usecase.js';
import { WorkspaceDashboardPresenter, type WorkspaceDashboardDto } from '../presenters/workspace-dashboard.presenter.js';
import { workspaceDashboardHtml } from './workspace-dashboard.html.js';

@Controller()
export class WorkspaceDashboardController {
  constructor(
    private readonly getWorkspaceDashboardUsecase: GetWorkspaceDashboardUsecase,
    private readonly workspaceDashboardPresenter: WorkspaceDashboardPresenter,
  ) {}

  @Get('dashboard/data')
  async getDashboardData(): Promise<WorkspaceDashboardDto> {
    const result = await this.getWorkspaceDashboardUsecase.execute();
    return this.workspaceDashboardPresenter.present(result);
  }

  @Get('dashboard')
  @Header('Content-Type', 'text/html')
  getDashboardPage(): string {
    return workspaceDashboardHtml;
  }
}
