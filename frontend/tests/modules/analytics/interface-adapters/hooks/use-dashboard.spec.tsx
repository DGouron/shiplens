import { renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { useDashboard } from '@/modules/analytics/interface-adapters/hooks/use-dashboard.ts';
import { dashboardViewModelSchema } from '@/modules/analytics/interface-adapters/presenters/dashboard.view-model.schema.ts';
import { FailingWorkspaceDashboardGateway } from '@/modules/analytics/testing/bad-path/failing.workspace-dashboard.in-memory.gateway.ts';
import { StubEmptyWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.empty-workspace-dashboard.in-memory.gateway.ts';
import { StubWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.workspace-dashboard.in-memory.gateway.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { WorkspaceDashboardResponseBuilder } from '../../../../builders/workspace-dashboard-response.builder.ts';
import {
  createTestQueryClient,
  withQueryClient,
} from '../../../../helpers/query-client-wrapper.tsx';

function renderDashboardHook() {
  const client = createTestQueryClient();
  return renderHook(() => useDashboard(), {
    wrapper: ({ children }) => withQueryClient(children, client),
  });
}

describe('useDashboard', () => {
  afterEach(() => {
    resetUsecases();
  });

  it('exposes a loading state on first render', () => {
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubWorkspaceDashboardGateway({
          response: new WorkspaceDashboardResponseBuilder().build(),
        }),
      ),
    });

    const { result } = renderDashboardHook();

    expect(result.current.state.status).toBe('loading');
  });

  it('transitions to ready with a parsed view model when the usecase resolves', async () => {
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubWorkspaceDashboardGateway({
          response: new WorkspaceDashboardResponseBuilder().build(),
        }),
      ),
    });

    const { result } = renderDashboardHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    if (result.current.state.status === 'ready') {
      expect(
        dashboardViewModelSchema.safeParse(result.current.state.data).success,
      ).toBe(true);
    }
  });

  it('transitions to empty with kind not_connected when the usecase resolves with that response', async () => {
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubEmptyWorkspaceDashboardGateway({
          status: 'not_connected',
          message: 'Connect your workspace',
        }),
      ),
    });

    const { result } = renderDashboardHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe('empty');
    });
    if (result.current.state.status === 'empty') {
      expect(result.current.state.empty).toEqual({
        kind: 'not_connected',
        message: 'Connect your workspace',
      });
    }
  });

  it('transitions to empty with kind no_teams when the usecase resolves with that response', async () => {
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new StubEmptyWorkspaceDashboardGateway({
          status: 'no_teams',
          message: 'No teams yet',
        }),
      ),
    });

    const { result } = renderDashboardHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe('empty');
    });
    if (result.current.state.status === 'empty') {
      expect(result.current.state.empty.kind).toBe('no_teams');
      expect(result.current.state.empty.message).toBe('No teams yet');
    }
  });

  it('transitions to error with the GatewayError message when the usecase rejects', async () => {
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(
        new FailingWorkspaceDashboardGateway(),
      ),
    });

    const { result } = renderDashboardHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe('error');
    });
    if (result.current.state.status === 'error') {
      expect(result.current.state.message).toBe('Failed to fetch dashboard');
    }
  });

  it('reload triggers a refetch', async () => {
    let callCount = 0;
    const stub = new StubWorkspaceDashboardGateway({
      response: new WorkspaceDashboardResponseBuilder().build(),
    });
    const originalFetch = stub.fetchDashboard.bind(stub);
    stub.fetchDashboard = async () => {
      callCount += 1;
      return originalFetch();
    };
    overrideUsecases({
      getWorkspaceDashboard: new GetWorkspaceDashboardUsecase(stub),
    });

    const { result } = renderDashboardHook();

    await waitFor(() => {
      expect(result.current.state.status).toBe('ready');
    });
    expect(callCount).toBe(1);

    await result.current.reload();

    expect(callCount).toBe(2);
  });
});
