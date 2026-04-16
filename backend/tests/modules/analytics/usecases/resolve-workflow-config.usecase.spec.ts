import { WorkflowConfig } from '@modules/analytics/entities/workflow-config/workflow-config.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('ResolveWorkflowConfigUsecase', () => {
  let workflowConfigGateway: StubWorkflowConfigGateway;
  let availableStatusesGateway: StubAvailableStatusesGateway;
  let usecase: ResolveWorkflowConfigUsecase;

  beforeEach(() => {
    workflowConfigGateway = new StubWorkflowConfigGateway();
    availableStatusesGateway = new StubAvailableStatusesGateway();
    usecase = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
  });

  it('returns persisted config when it exists (manual override)', async () => {
    const existing = WorkflowConfig.create({
      startedStatuses: ['In Dev'],
      completedStatuses: ['Shipped'],
      source: 'manual',
    });
    await workflowConfigGateway.save('team-1', existing);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.startedStatuses).toEqual(['In Dev']);
    expect(result.completedStatuses).toEqual(['Shipped']);
    expect(result.source).toBe('manual');
  });

  it('auto-detects from transition statuses using pattern matching', async () => {
    availableStatusesGateway.transitionStatuses.set('team-1', [
      'In Progress',
      'In Review',
      'Done',
    ]);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.startedStatuses).toEqual(['In Progress']);
    expect(result.completedStatuses).toEqual(['Done']);
    expect(result.source).toBe('auto-detected');
  });

  it('uses fallback when no patterns match', async () => {
    availableStatusesGateway.transitionStatuses.set('team-1', [
      'Phase1',
      'Phase2',
    ]);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.startedStatuses).toEqual(['In Progress', 'Started']);
    expect(result.completedStatuses).toEqual(['Done', 'Completed']);
    expect(result.source).toBe('auto-detected');
  });

  it('persists auto-detected config so subsequent calls return the same result', async () => {
    availableStatusesGateway.transitionStatuses.set('team-1', [
      'In Progress',
      'Done',
    ]);

    await usecase.execute({ teamId: 'team-1' });

    availableStatusesGateway.transitionStatuses.set('team-1', [
      'In Dev',
      'Shipped',
    ]);

    const secondResult = await usecase.execute({ teamId: 'team-1' });

    expect(secondResult.startedStatuses).toEqual(['In Progress']);
    expect(secondResult.completedStatuses).toEqual(['Done']);
  });

  it('uses fallback when team has no transition statuses at all', async () => {
    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.startedStatuses).toEqual(['In Progress', 'Started']);
    expect(result.completedStatuses).toEqual(['Done', 'Completed']);
  });

  it('detects custom workflow statuses like "In Dev"', async () => {
    availableStatusesGateway.transitionStatuses.set('team-1', [
      'In Dev',
      'A Valider',
      'Done',
    ]);

    const result = await usecase.execute({ teamId: 'team-1' });

    expect(result.startedStatuses).toEqual(['In Dev']);
    expect(result.completedStatuses).toEqual(['Done']);
  });
});
