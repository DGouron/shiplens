import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type WorkspaceDashboardGateway } from '../entities/workspace-dashboard/workspace-dashboard.gateway.ts';
import { type WorkspaceDashboardResponse } from '../entities/workspace-dashboard/workspace-dashboard.response.ts';

export class GetWorkspaceDashboardUsecase
  implements Usecase<void, WorkspaceDashboardResponse>
{
  constructor(private readonly gateway: WorkspaceDashboardGateway) {}

  async execute(): Promise<WorkspaceDashboardResponse> {
    return this.gateway.fetchDashboard();
  }
}
