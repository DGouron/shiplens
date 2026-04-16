import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { GetWorkflowConfigUsecase } from '@modules/analytics/usecases/get-workflow-config.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { SetWorkflowConfigUsecase } from '@modules/analytics/usecases/set-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Auto-detect team workflow statuses (acceptance)', () => {
  let workflowConfigGateway: StubWorkflowConfigGateway;
  let availableStatusesGateway: StubAvailableStatusesGateway;
  let resolveWorkflowConfig: ResolveWorkflowConfigUsecase;
  let getWorkflowConfig: GetWorkflowConfigUsecase;
  let setWorkflowConfig: SetWorkflowConfigUsecase;

  beforeEach(() => {
    workflowConfigGateway = new StubWorkflowConfigGateway();
    availableStatusesGateway = new StubAvailableStatusesGateway();
    resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    getWorkflowConfig = new GetWorkflowConfigUsecase(resolveWorkflowConfig);
    setWorkflowConfig = new SetWorkflowConfigUsecase(workflowConfigGateway);
  });

  describe('hybrid resolution strategy: manual override > pattern matching > fallback', () => {
    it('auto-detect standard workflow: team with "In Progress" and "Done" transitions', async () => {
      availableStatusesGateway.transitionStatuses.set('team-1', [
        'In Progress',
        'Done',
      ]);

      const config = await getWorkflowConfig.execute({ teamId: 'team-1' });

      expect(config.startedStatuses).toEqual(['In Progress']);
      expect(config.completedStatuses).toEqual(['Done']);
      expect(config.source).toBe('auto-detected');
    });

    it('auto-detect custom workflow: team with "In Dev", "In Review", "A Valider", "Done" transitions', async () => {
      availableStatusesGateway.transitionStatuses.set('team-1', [
        'In Dev',
        'In Review',
        'A Valider',
        'Done',
      ]);

      const config = await getWorkflowConfig.execute({ teamId: 'team-1' });

      expect(config.startedStatuses).toEqual(['In Dev']);
      expect(config.completedStatuses).toEqual(['Done']);
      expect(config.source).toBe('auto-detected');
    });

    it('auto-detect multiple matches: team with "In Progress", "In Dev", "Started" transitions', async () => {
      availableStatusesGateway.transitionStatuses.set('team-1', [
        'In Progress',
        'In Dev',
        'Started',
      ]);

      const config = await getWorkflowConfig.execute({ teamId: 'team-1' });

      expect(config.startedStatuses).toEqual([
        'In Progress',
        'In Dev',
        'Started',
      ]);
      expect(config.completedStatuses).toEqual([]);
      expect(config.source).toBe('auto-detected');
    });

    it('pattern matching is case-insensitive: "IN PROGRESS" and "done" match', async () => {
      availableStatusesGateway.transitionStatuses.set('team-1', [
        'IN PROGRESS',
        'done',
      ]);

      const config = await getWorkflowConfig.execute({ teamId: 'team-1' });

      expect(config.startedStatuses).toEqual(['IN PROGRESS']);
      expect(config.completedStatuses).toEqual(['done']);
      expect(config.source).toBe('auto-detected');
    });

    it('fallback when no match: team with non-matching transitions uses defaults', async () => {
      availableStatusesGateway.transitionStatuses.set('team-1', [
        'Phase1',
        'Phase2',
        'Phase3',
      ]);

      const config = await getWorkflowConfig.execute({ teamId: 'team-1' });

      expect(config.startedStatuses).toEqual(['In Progress', 'Started']);
      expect(config.completedStatuses).toEqual(['Done', 'Completed']);
      expect(config.source).toBe('auto-detected');
    });

    it('manual override takes precedence over auto-detection', async () => {
      availableStatusesGateway.transitionStatuses.set('team-1', [
        'In Progress',
        'Done',
      ]);

      await setWorkflowConfig.execute({
        teamId: 'team-1',
        startedStatuses: ['In Dev'],
        completedStatuses: ['Shipped'],
      });

      const config = await getWorkflowConfig.execute({ teamId: 'team-1' });

      expect(config.startedStatuses).toEqual(['In Dev']);
      expect(config.completedStatuses).toEqual(['Shipped']);
      expect(config.source).toBe('manual');
    });
  });

  describe('configuration is persisted per team so auto-detection only runs once', () => {
    it('auto-detected config is persisted and returned on subsequent access', async () => {
      availableStatusesGateway.transitionStatuses.set('team-1', [
        'In Progress',
        'Done',
      ]);

      const firstAccess = await getWorkflowConfig.execute({
        teamId: 'team-1',
      });
      expect(firstAccess.source).toBe('auto-detected');

      availableStatusesGateway.transitionStatuses.set('team-1', [
        'In Dev',
        'Shipped',
      ]);

      const secondAccess = await getWorkflowConfig.execute({
        teamId: 'team-1',
      });
      expect(secondAccess.startedStatuses).toEqual(['In Progress']);
      expect(secondAccess.completedStatuses).toEqual(['Done']);
    });

    it('manual override persists and is returned on subsequent access', async () => {
      await setWorkflowConfig.execute({
        teamId: 'team-1',
        startedStatuses: ['In Dev'],
        completedStatuses: ['Shipped'],
      });

      const config = await getWorkflowConfig.execute({ teamId: 'team-1' });

      expect(config.startedStatuses).toEqual(['In Dev']);
      expect(config.completedStatuses).toEqual(['Shipped']);
      expect(config.source).toBe('manual');
    });
  });
});
