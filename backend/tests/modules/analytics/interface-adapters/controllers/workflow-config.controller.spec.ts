import { WorkflowConfigController } from '@modules/analytics/interface-adapters/controllers/workflow-config.controller.js';
import { WorkflowConfigPresenter } from '@modules/analytics/interface-adapters/presenters/workflow-config.presenter.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetWorkflowConfigUsecase } from '@modules/analytics/usecases/get-workflow-config.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { SetWorkflowConfigUsecase } from '@modules/analytics/usecases/set-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('WorkflowConfigController', () => {
  let workflowConfigGateway: StubWorkflowConfigGateway;
  let availableStatusesGateway: StubAvailableStatusesGateway;
  let controller: WorkflowConfigController;

  beforeEach(() => {
    workflowConfigGateway = new StubWorkflowConfigGateway();
    availableStatusesGateway = new StubAvailableStatusesGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    const getWorkflowConfig = new GetWorkflowConfigUsecase(
      resolveWorkflowConfig,
    );
    const setWorkflowConfig = new SetWorkflowConfigUsecase(
      workflowConfigGateway,
    );
    const presenter = new WorkflowConfigPresenter();
    controller = new WorkflowConfigController(
      getWorkflowConfig,
      setWorkflowConfig,
      availableStatusesGateway,
      presenter,
    );
  });

  it('GET returns auto-detected workflow config with known statuses from transition history', async () => {
    availableStatusesGateway.transitionStatuses.set('team-1', [
      'Backlog',
      'In Progress',
      'Done',
    ]);

    const result = await controller.get('team-1');

    expect(result).toEqual({
      startedStatuses: ['In Progress'],
      completedStatuses: ['Done'],
      source: 'auto-detected',
      knownStatuses: ['Backlog', 'In Progress', 'Done'],
    });
  });

  it('GET returns empty known statuses when no transition history', async () => {
    const result = await controller.get('team-1');

    expect(result.knownStatuses).toEqual([]);
  });

  it('PUT sets manual workflow config and returns it with known statuses', async () => {
    availableStatusesGateway.transitionStatuses.set('team-1', [
      'In Dev',
      'Shipped',
      'Backlog',
    ]);

    const result = await controller.set('team-1', {
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
    });

    expect(result).toEqual({
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
      source: 'manual',
      knownStatuses: ['In Dev', 'Shipped', 'Backlog'],
    });
  });

  it('GET after PUT returns the manual config with known statuses', async () => {
    availableStatusesGateway.transitionStatuses.set('team-1', [
      'In Progress',
      'Done',
      'In Dev',
      'Shipped',
    ]);

    await controller.set('team-1', {
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
    });

    const result = await controller.get('team-1');

    expect(result).toEqual({
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
      source: 'manual',
      knownStatuses: ['In Progress', 'Done', 'In Dev', 'Shipped'],
    });
  });
});
