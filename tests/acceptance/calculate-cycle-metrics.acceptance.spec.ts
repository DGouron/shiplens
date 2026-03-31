import { describe, it, expect, beforeEach } from 'vitest';
import { CalculateCycleMetricsUsecase } from '@modules/analytics/usecases/calculate-cycle-metrics.usecase.js';
import { StubCycleMetricsDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-metrics-data.gateway.js';
import { CycleSnapshotBuilder } from '../builders/cycle-snapshot.builder.js';

describe('Calculate Cycle Metrics (acceptance)', () => {
  let gateway: StubCycleMetricsDataGateway;
  let usecase: CalculateCycleMetricsUsecase;

  beforeEach(() => {
    gateway = new StubCycleMetricsDataGateway();
    usecase = new CalculateCycleMetricsUsecase(gateway);
  });

  describe('metrics are only calculable for completed cycles', () => {
    it('nominal metrics: completed cycle with 8/10 issues done, 21/25 points returns velocity, throughput, completion rate', async () => {
      const completedIssues = Array.from({ length: 8 }, (_, index) => ({
        externalId: `issue-${index}`,
        title: `Issue ${index}`,
        statusName: 'Done',
        points: index < 5 ? 3 : 2,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: '2026-01-10T00:00:00Z',
        startedAt: '2026-01-05T00:00:00Z',
      }));

      const incompleteIssues = Array.from({ length: 2 }, (_, index) => ({
        externalId: `issue-incomplete-${index}`,
        title: `Incomplete Issue ${index}`,
        statusName: 'In Progress',
        points: 2,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: null,
        startedAt: '2026-01-05T00:00:00Z',
      }));

      gateway.snapshotData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        cycleName: 'Sprint 10',
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2026-01-14T00:00:00Z',
        issues: [...completedIssues, ...incompleteIssues],
      };

      const result = await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

      expect(result.velocity.completedPoints).toBe(21);
      expect(result.velocity.plannedPoints).toBe(25);
      expect(result.throughput).toBe(8);
      expect(result.completionRate).toBe(80);
    });

    it('cycle not completed: rejects with error', async () => {
      gateway.snapshotData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        cycleName: 'Sprint 10',
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2099-12-31T00:00:00Z',
        issues: [],
      };

      await expect(
        usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
      ).rejects.toThrow('Les métriques ne sont disponibles que pour les cycles terminés.');
    });

    it('cycle with no issues: rejects with error', async () => {
      gateway.snapshotData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        cycleName: 'Sprint 10',
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2026-01-14T00:00:00Z',
        issues: [],
      };

      await expect(
        usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
      ).rejects.toThrow('Ce cycle ne contient aucune issue. Impossible de calculer les métriques.');
    });
  });

  describe('cycle time and lead time calculations', () => {
    it('computes average cycle time and lead time from issue transitions', async () => {
      const issues = [
        {
          externalId: 'issue-1',
          title: 'Issue 1',
          statusName: 'Done',
          points: 3,
          createdAt: '2026-01-01T00:00:00Z',
          completedAt: '2026-01-10T00:00:00Z',
          startedAt: '2026-01-05T00:00:00Z',
        },
        {
          externalId: 'issue-2',
          title: 'Issue 2',
          statusName: 'Done',
          points: 2,
          createdAt: '2026-01-02T00:00:00Z',
          completedAt: '2026-01-12T00:00:00Z',
          startedAt: '2026-01-06T00:00:00Z',
        },
      ];

      gateway.snapshotData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        cycleName: 'Sprint 10',
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2026-01-14T00:00:00Z',
        issues,
      };

      const result = await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

      expect(result.averageCycleTimeInDays).toBe(5.5);
      expect(result.averageLeadTimeInDays).toBe(9.5);
    });

    it('excludes issues without started transition from cycle time', async () => {
      const issues = [
        {
          externalId: 'issue-1',
          title: 'Issue 1',
          statusName: 'Done',
          points: 3,
          createdAt: '2026-01-01T00:00:00Z',
          completedAt: '2026-01-10T00:00:00Z',
          startedAt: '2026-01-05T00:00:00Z',
        },
        {
          externalId: 'issue-2',
          title: 'Issue 2',
          statusName: 'Done',
          points: 2,
          createdAt: '2026-01-02T00:00:00Z',
          completedAt: '2026-01-08T00:00:00Z',
          startedAt: null,
        },
      ];

      gateway.snapshotData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        cycleName: 'Sprint 10',
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2026-01-14T00:00:00Z',
        issues,
      };

      const result = await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

      expect(result.averageCycleTimeInDays).toBe(5);
    });
  });

  describe('scope creep counts issues added after cycle start', () => {
    it('detects scope creep from issues created after cycle start date', async () => {
      const initialIssues = Array.from({ length: 10 }, (_, index) => ({
        externalId: `issue-${index}`,
        title: `Issue ${index}`,
        statusName: 'Done',
        points: 2,
        createdAt: '2026-01-01T00:00:00Z',
        completedAt: '2026-01-10T00:00:00Z',
        startedAt: '2026-01-05T00:00:00Z',
      }));

      const addedIssues = Array.from({ length: 3 }, (_, index) => ({
        externalId: `issue-added-${index}`,
        title: `Added Issue ${index}`,
        statusName: 'Done',
        points: 1,
        createdAt: '2026-01-05T00:00:00Z',
        completedAt: '2026-01-12T00:00:00Z',
        startedAt: '2026-01-06T00:00:00Z',
      }));

      gateway.snapshotData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        cycleName: 'Sprint 10',
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2026-01-14T00:00:00Z',
        issues: [...initialIssues, ...addedIssues],
      };

      const result = await usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' });

      expect(result.scopeCreep).toBe(3);
    });
  });

  describe('trend requires at least 3 completed cycles', () => {
    it('shows trend when 3 previous cycles are available', async () => {
      const issues = [
        {
          externalId: 'issue-1',
          title: 'Issue 1',
          statusName: 'Done',
          points: 3,
          createdAt: '2026-01-01T00:00:00Z',
          completedAt: '2026-01-10T00:00:00Z',
          startedAt: '2026-01-05T00:00:00Z',
        },
      ];

      gateway.snapshotData = {
        cycleId: 'cycle-4',
        teamId: 'team-1',
        cycleName: 'Sprint 13',
        startsAt: '2026-03-01T00:00:00Z',
        endsAt: '2026-03-14T00:00:00Z',
        issues,
      };

      gateway.previousCompletedCycleCount = 3;
      gateway.previousVelocities = [18, 20, 22];

      const result = await usecase.execute({
        cycleId: 'cycle-4',
        teamId: 'team-1',
        includeTrend: true,
      });

      expect(result.trend).toBeDefined();
      expect(result.trend?.previousVelocities).toEqual([18, 20, 22]);
    });

    it('rejects trend when less than 3 previous cycles are available', async () => {
      const issues = [
        {
          externalId: 'issue-1',
          title: 'Issue 1',
          statusName: 'Done',
          points: 3,
          createdAt: '2026-01-01T00:00:00Z',
          completedAt: '2026-01-10T00:00:00Z',
          startedAt: '2026-01-05T00:00:00Z',
        },
      ];

      gateway.snapshotData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        cycleName: 'Sprint 10',
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2026-01-14T00:00:00Z',
        issues,
      };

      gateway.previousCompletedCycleCount = 2;
      gateway.previousVelocities = [18, 20];

      await expect(
        usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1', includeTrend: true }),
      ).rejects.toThrow('Pas assez d\'historique pour afficher la tendance. Minimum 3 cycles terminés requis.');
    });
  });
});
