import { WorkspaceDashboardInHttpGateway } from '@/modules/analytics/interface-adapters/gateways/workspace-dashboard.in-http.gateway.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';

const workspaceDashboardGateway = new WorkspaceDashboardInHttpGateway();

export const usecases = {
  getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
    workspaceDashboardGateway,
  ),
};

export function overrideUsecases(overrides: Partial<typeof usecases>): void {
  Object.assign(usecases, overrides);
}

export function resetUsecases(): void {
  usecases.getWorkspaceDashboard = new GetWorkspaceDashboardUsecase(
    workspaceDashboardGateway,
  );
}
