import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type WorkspaceDashboardDto } from '../entities/workspace-dashboard/workspace-dashboard.dto.ts';
import { type WorkspaceDashboardGateway } from '../entities/workspace-dashboard/workspace-dashboard.gateway.ts';

export class GetWorkspaceDashboardUsecase
  implements Usecase<void, WorkspaceDashboardDto>
{
  constructor(private readonly gateway: WorkspaceDashboardGateway) {}

  async execute(): Promise<WorkspaceDashboardDto> {
    return this.gateway.fetchDashboard();
  }
}
