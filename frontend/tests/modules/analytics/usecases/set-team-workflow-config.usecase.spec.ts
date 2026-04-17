import { describe, expect, it } from 'vitest';
import { StubWorkflowConfigGateway } from '@/modules/analytics/testing/good-path/stub.workflow-config.in-memory.gateway.ts';
import { SetTeamWorkflowConfigUsecase } from '@/modules/analytics/usecases/set-team-workflow-config.usecase.ts';

describe('SetTeamWorkflowConfigUsecase', () => {
  it('persists the workflow config and returns the updated config with source manual', async () => {
    const gateway = new StubWorkflowConfigGateway();
    gateway.configs.set('team-1', {
      startedStatuses: [],
      completedStatuses: [],
      source: 'auto-detected',
      knownStatuses: ['In Dev', 'Done'],
    });
    const usecase = new SetTeamWorkflowConfigUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      startedStatuses: ['In Dev'],
      completedStatuses: ['Done'],
    });

    expect(result.source).toBe('manual');
    expect(result.startedStatuses).toEqual(['In Dev']);
    expect(result.completedStatuses).toEqual(['Done']);
    expect(gateway.configs.get('team-1')?.startedStatuses).toEqual(['In Dev']);
  });

  it('accepts empty configuration', async () => {
    const gateway = new StubWorkflowConfigGateway();
    gateway.configs.set('team-1', {
      startedStatuses: ['In Dev'],
      completedStatuses: ['Done'],
      source: 'manual',
      knownStatuses: ['In Dev', 'Done'],
    });
    const usecase = new SetTeamWorkflowConfigUsecase(gateway);

    const result = await usecase.execute({
      teamId: 'team-1',
      startedStatuses: [],
      completedStatuses: [],
    });

    expect(result.startedStatuses).toEqual([]);
    expect(result.completedStatuses).toEqual([]);
  });
});
