import { describe, expect, it } from 'vitest';
import { StubWorkflowConfigGateway } from '@/modules/analytics/testing/good-path/stub.workflow-config.in-memory.gateway.ts';
import { GetTeamWorkflowConfigUsecase } from '@/modules/analytics/usecases/get-team-workflow-config.usecase.ts';

describe('GetTeamWorkflowConfigUsecase', () => {
  it('returns the persisted workflow config for the team', async () => {
    const gateway = new StubWorkflowConfigGateway();
    gateway.configs.set('team-1', {
      startedStatuses: ['In Progress'],
      completedStatuses: ['Done'],
      source: 'auto-detected',
      knownStatuses: ['Backlog', 'In Progress', 'Done'],
    });
    const usecase = new GetTeamWorkflowConfigUsecase(gateway);

    const result = await usecase.execute('team-1');

    expect(result.startedStatuses).toEqual(['In Progress']);
    expect(result.completedStatuses).toEqual(['Done']);
    expect(result.source).toBe('auto-detected');
    expect(result.knownStatuses).toEqual(['Backlog', 'In Progress', 'Done']);
  });
});
