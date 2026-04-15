import { describe, expect, it } from 'vitest';
import { FailingWorkspaceDashboardGateway } from '@/modules/analytics/testing/bad-path/failing.workspace-dashboard.gateway.ts';
import { StubEmptyWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.empty-workspace-dashboard.gateway.ts';
import { StubWorkspaceDashboardGateway } from '@/modules/analytics/testing/good-path/stub.workspace-dashboard.gateway.ts';
import { GetWorkspaceDashboardUsecase } from '@/modules/analytics/usecases/get-workspace-dashboard.usecase.ts';
import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { WorkspaceDashboardDtoBuilder } from '../../../builders/workspace-dashboard-dto.builder.ts';

describe('GetWorkspaceDashboardUsecase', () => {
  it('delegates to the gateway and returns the data DTO', async () => {
    const dto = new WorkspaceDashboardDtoBuilder().build();
    const usecase = new GetWorkspaceDashboardUsecase(
      new StubWorkspaceDashboardGateway({ response: dto }),
    );

    const result = await usecase.execute();

    expect(result).toEqual(dto);
  });

  it('returns the empty DTO verbatim when the gateway returns an empty variant', async () => {
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
