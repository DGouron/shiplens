import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { SetWorkflowConfigUsecase } from '@modules/analytics/usecases/set-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('SetWorkflowConfigUsecase', () => {
  let workflowConfigGateway: StubWorkflowConfigGateway;
  let usecase: SetWorkflowConfigUsecase;

  beforeEach(() => {
    workflowConfigGateway = new StubWorkflowConfigGateway();
    usecase = new SetWorkflowConfigUsecase(workflowConfigGateway);
  });

  it('persists workflow config with manual source', async () => {
    const result = await usecase.execute({
      teamId: 'team-1',
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
    });

    expect(result.startedStatuses).toEqual(['In Dev']);
    expect(result.completedStatuses).toEqual(['Shipped']);
    expect(result.source).toBe('manual');
  });

  it('persisted config can be retrieved from gateway', async () => {
    await usecase.execute({
      teamId: 'team-1',
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
    });

    const persisted = await workflowConfigGateway.findByTeamId('team-1');

    expect(persisted).not.toBeNull();
    expect(persisted?.startedStatuses).toEqual(['In Dev']);
    expect(persisted?.completedStatuses).toEqual(['Shipped']);
    expect(persisted?.source).toBe('manual');
  });

  it('overwrites previously set config', async () => {
    await usecase.execute({
      teamId: 'team-1',
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
    });

    await usecase.execute({
      teamId: 'team-1',
      startedStatuses: ['Doing'],
      completedStatuses: ['Released'],
    });

    const persisted = await workflowConfigGateway.findByTeamId('team-1');
    expect(persisted?.startedStatuses).toEqual(['Doing']);
    expect(persisted?.completedStatuses).toEqual(['Released']);
  });
});
