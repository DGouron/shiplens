import { describe, expect, it } from 'vitest';
import { FailingWorkspaceDashboardGateway } from '@/modules/analytics/testing/bad-path/failing.workspace-dashboard.in-memory.gateway.ts';
import { StubEmptyWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.empty-workspace-dashboard.in-memory.gateway.ts';
import { StubWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.workspace-dashboard.in-memory.gateway.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { WorkspaceDashboardResponseBuilder } from '../../../builders/workspace-dashboard-response.builder.ts';

describe('GetWorkspaceDashboardUsecase', () => {
  it('delegates to the gateway and returns the data response', async () => {
    const dto = new WorkspaceDashboardResponseBuilder().build();
    const usecase = new GetWorkspaceDashboardUsecase(
      new StubWorkspaceDashboardGateway({ response: dto }),
    );

    const result = await usecase.execute();

    expect(result).toEqual(dto);
  });

  it('returns the empty response verbatim when the gateway returns an empty variant', async () => {
    const usecase = new GetWorkspaceDashboardUsecase(
      new StubEmptyWorkspaceDashboardGateway({
        status: 'not_connected',
        message: 'Connect your workspace',
      }),
    );

    const result = await usecase.execute();

    expect(result).toEqual({
      status: 'not_connected',
      message: 'Connect your workspace',
    });
  });

  it('propagates GatewayError from the gateway', async () => {
    const usecase = new GetWorkspaceDashboardUsecase(
      new FailingWorkspaceDashboardGateway(),
    );

    await expect(usecase.execute()).rejects.toBeInstanceOf(GatewayError);
  });
});
