import { Controller, Get, Header } from '@nestjs/common';
import { GetWorkspaceDashboardUsecase } from '../../usecases/get-workspace-dashboard.usecase.js';
import { WorkspaceDashboardPresenter, type WorkspaceDashboardDto } from '../presenters/workspace-dashboard.presenter.js';
import { workspaceDashboardHtml } from './workspace-dashboard.html.js';
import { WorkspaceNotConnectedError, NoTeamsSynchronizedError } from '../../entities/workspace-dashboard/workspace-dashboard.errors.js';

interface DashboardEmptyState {
  status: 'not_connected' | 'no_teams';
  message: string;
}

@Controller()
export class WorkspaceDashboardController {
  constructor(
    private readonly getWorkspaceDashboardUsecase: GetWorkspaceDashboardUsecase,
    private readonly workspaceDashboardPresenter: WorkspaceDashboardPresenter,
  ) {}

  @Get('dashboard/data')
  async getDashboardData(): Promise<WorkspaceDashboardDto | DashboardEmptyState> {
    try {
      const result = await this.getWorkspaceDashboardUsecase.execute();
      return this.workspaceDashboardPresenter.present(result);
    } catch (error) {
      if (error instanceof WorkspaceNotConnectedError) {
        return { status: 'not_connected', message: error.message };
      }
      if (error instanceof NoTeamsSynchronizedError) {
        return { status: 'no_teams', message: error.message };
      }
      throw error;
    }
  }

  @Get('dashboard')
  @Header('Content-Type', 'text/html')
  getDashboardPage(): string {
    return workspaceDashboardHtml;
  }
}
