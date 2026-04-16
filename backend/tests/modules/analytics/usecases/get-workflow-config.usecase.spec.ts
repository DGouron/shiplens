import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetWorkflowConfigUsecase } from '@modules/analytics/usecases/get-workflow-config.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('GetWorkflowConfigUsecase', () => {
  let workflowConfigGateway: StubWorkflowConfigGateway;
  let availableStatusesGateway: StubAvailableStatusesGateway;
  let usecase: GetWorkflowConfigUsecase;

  beforeEach(() => {
    workflowConfigGateway = new StubWorkflowConfigGateway();
    availableStatusesGateway = new StubAvailableStatusesGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    usecase = new GetWorkflowConfigUsecase(resolveWorkflowConfig);
  });

  it('returns resolved workflow config for a team', async () => {
    availableStatusesGateway.transitionStatuses.set('team-1', [
      'In Progress',
      'Done',
    ]);

    const config = await usecase.execute({ teamId: 'team-1' });

    expect(config.startedStatuses).toEqual(['In Progress']);
    expect(config.completedStatuses).toEqual(['Done']);
    expect(config.source).toBe('auto-detected');
  });
});
