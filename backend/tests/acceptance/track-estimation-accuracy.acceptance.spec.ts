import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubEstimationAccuracyDataGateway } from '@modules/analytics/testing/good-path/stub.estimation-accuracy-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { CalculateEstimationAccuracyUsecase } from '@modules/analytics/usecases/calculate-estimation-accuracy.usecase.js';
import { GetEstimationTrendUsecase } from '@modules/analytics/usecases/get-estimation-trend.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('Track Estimation Accuracy (acceptance)', () => {
  let gateway: StubEstimationAccuracyDataGateway;
  let calculateAccuracy: CalculateEstimationAccuracyUsecase;
  let getEstimationTrend: GetEstimationTrendUsecase;

  beforeEach(() => {
    gateway = new StubEstimationAccuracyDataGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      new StubWorkflowConfigGateway(),
      new StubAvailableStatusesGateway(),
    );
    calculateAccuracy = new CalculateEstimationAccuracyUsecase(
      gateway,
      resolveWorkflowConfig,
    );
    getEstimationTrend = new GetEstimationTrendUsecase(
      gateway,
      resolveWorkflowConfig,
    );
  });

  describe('estimation accuracy is measured by comparing estimated points to actual cycle time', () => {
    it('accuracy per issue: computes ratio of points to cycle time in days', async () => {
      gateway.estimationData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'issue-1',
            title: 'Setup CI pipeline',
            points: 3,
            cycleTimeInDays: 2,
            assigneeName: 'Alice',
            labelNames: ['infra'],
          },
        ],
        excludedWithoutEstimation: 0,
        excludedWithoutCycleTime: 0,
      };

      const result = await calculateAccuracy.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
      });
      const ratios = result.ratioPerIssue();

      expect(ratios).toHaveLength(1);
      expect(ratios[0].ratio).toBe(1.5);
      expect(ratios[0].classification).toBe('well-estimated');
    });

    it('accuracy per developer: aggregates score across all developer issues', async () => {
      gateway.estimationData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'issue-1',
            title: 'Task 1',
            points: 3,
            cycleTimeInDays: 2,
            assigneeName: 'Alice',
            labelNames: [],
          },
          {
            externalId: 'issue-2',
            title: 'Task 2',
            points: 2,
            cycleTimeInDays: 3,
            assigneeName: 'Alice',
            labelNames: [],
          },
          {
            externalId: 'issue-3',
            title: 'Task 3',
            points: 5,
            cycleTimeInDays: 4,
            assigneeName: 'Alice',
            labelNames: [],
          },
          {
            externalId: 'issue-4',
            title: 'Task 4',
            points: 1,
            cycleTimeInDays: 1,
            assigneeName: 'Alice',
            labelNames: [],
          },
          {
            externalId: 'issue-5',
            title: 'Task 5',
            points: 4,
            cycleTimeInDays: 3,
            assigneeName: 'Alice',
            labelNames: [],
          },
        ],
        excludedWithoutEstimation: 0,
        excludedWithoutCycleTime: 0,
      };

      const result = await calculateAccuracy.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
      });
      const developerScores = result.scoreByDeveloper();

      expect(developerScores).toHaveLength(1);
      expect(developerScores[0].developerName).toBe('Alice');
      expect(developerScores[0].issueCount).toBe(5);
    });

    it('accuracy per label: aggregates score by label', async () => {
      gateway.estimationData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'issue-1',
            title: 'Task 1',
            points: 3,
            cycleTimeInDays: 2,
            assigneeName: 'Alice',
            labelNames: ['frontend'],
          },
          {
            externalId: 'issue-2',
            title: 'Task 2',
            points: 5,
            cycleTimeInDays: 4,
            assigneeName: 'Bob',
            labelNames: ['frontend'],
          },
          {
            externalId: 'issue-3',
            title: 'Task 3',
            points: 2,
            cycleTimeInDays: 3,
            assigneeName: 'Alice',
            labelNames: ['backend'],
          },
        ],
        excludedWithoutEstimation: 0,
        excludedWithoutCycleTime: 0,
      };

      const result = await calculateAccuracy.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
      });
      const labelScores = result.scoreByLabel();

      const frontendScore = labelScores.find(
        (score) => score.labelName === 'frontend',
      );
      const backendScore = labelScores.find(
        (score) => score.labelName === 'backend',
      );

      expect(frontendScore).toBeDefined();
      expect(frontendScore?.issueCount).toBe(2);
      expect(backendScore).toBeDefined();
      expect(backendScore?.issueCount).toBe(1);
    });

    it('over-estimation detected: high points with low cycle time', async () => {
      gateway.estimationData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'issue-1',
            title: 'Quick fix',
            points: 8,
            cycleTimeInDays: 0.5,
            assigneeName: 'Alice',
            labelNames: [],
          },
        ],
        excludedWithoutEstimation: 0,
        excludedWithoutCycleTime: 0,
      };

      const result = await calculateAccuracy.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
      });
      const ratios = result.ratioPerIssue();

      expect(ratios[0].ratio).toBe(16);
      expect(ratios[0].classification).toBe('over-estimated');
    });

    it('under-estimation detected: low points with high cycle time', async () => {
      gateway.estimationData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'issue-1',
            title: 'Complex task',
            points: 1,
            cycleTimeInDays: 5,
            assigneeName: 'Alice',
            labelNames: [],
          },
        ],
        excludedWithoutEstimation: 0,
        excludedWithoutCycleTime: 0,
      };

      const result = await calculateAccuracy.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
      });
      const ratios = result.ratioPerIssue();

      expect(ratios[0].ratio).toBe(0.2);
      expect(ratios[0].classification).toBe('under-estimated');
    });

    it('team score: aggregates all estimated and completed issues', async () => {
      gateway.estimationData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'issue-1',
            title: 'Task 1',
            points: 3,
            cycleTimeInDays: 2,
            assigneeName: 'Alice',
            labelNames: [],
          },
          {
            externalId: 'issue-2',
            title: 'Task 2',
            points: 2,
            cycleTimeInDays: 3,
            assigneeName: 'Bob',
            labelNames: [],
          },
        ],
        excludedWithoutEstimation: 0,
        excludedWithoutCycleTime: 0,
      };

      const result = await calculateAccuracy.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
      });
      const team = result.teamScore();

      expect(team.issueCount).toBe(2);
      expect(team.averageRatio).toBeCloseTo(1.083, 2);
      expect(team.classification).toBe('well-estimated');
    });

    it('issues without estimation are excluded with mention', async () => {
      gateway.estimationData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'issue-1',
            title: 'Task 1',
            points: 3,
            cycleTimeInDays: 2,
            assigneeName: 'Alice',
            labelNames: [],
          },
        ],
        excludedWithoutEstimation: 4,
        excludedWithoutCycleTime: 0,
      };

      const result = await calculateAccuracy.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
      });

      expect(result.excludedWithoutEstimation).toBe(4);
    });

    it('issues without cycle time are excluded with mention', async () => {
      gateway.estimationData = {
        cycleId: 'cycle-1',
        teamId: 'team-1',
        issues: [
          {
            externalId: 'issue-1',
            title: 'Task 1',
            points: 3,
            cycleTimeInDays: 2,
            assigneeName: 'Alice',
            labelNames: [],
          },
        ],
        excludedWithoutEstimation: 0,
        excludedWithoutCycleTime: 3,
      };

      const result = await calculateAccuracy.execute({
        cycleId: 'cycle-1',
        teamId: 'team-1',
      });

      expect(result.excludedWithoutCycleTime).toBe(3);
    });
  });

  describe('estimation trend requires minimum completed cycles', () => {
    it('trend with 3 completed cycles: shows accuracy evolution cycle by cycle', async () => {
      gateway.completedCycleIds = ['cycle-1', 'cycle-2', 'cycle-3'];
      gateway.estimationDataByCycle = {
        'cycle-1': {
          cycleId: 'cycle-1',
          teamId: 'team-1',
          issues: [
            {
              externalId: 'i-1',
              title: 'T1',
              points: 3,
              cycleTimeInDays: 2,
              assigneeName: 'Alice',
              labelNames: [],
            },
          ],
          excludedWithoutEstimation: 0,
          excludedWithoutCycleTime: 0,
        },
        'cycle-2': {
          cycleId: 'cycle-2',
          teamId: 'team-1',
          issues: [
            {
              externalId: 'i-2',
              title: 'T2',
              points: 2,
              cycleTimeInDays: 2,
              assigneeName: 'Alice',
              labelNames: [],
            },
          ],
          excludedWithoutEstimation: 0,
          excludedWithoutCycleTime: 0,
        },
        'cycle-3': {
          cycleId: 'cycle-3',
          teamId: 'team-1',
          issues: [
            {
              externalId: 'i-3',
              title: 'T3',
              points: 4,
              cycleTimeInDays: 4,
              assigneeName: 'Alice',
              labelNames: [],
            },
          ],
          excludedWithoutEstimation: 0,
          excludedWithoutCycleTime: 0,
        },
      };

      const trend = await getEstimationTrend.execute({ teamId: 'team-1' });

      expect(trend).toHaveLength(3);
      expect(trend[0].cycleId).toBe('cycle-1');
      expect(trend[0].averageRatio).toBe(1.5);
      expect(trend[1].cycleId).toBe('cycle-2');
      expect(trend[1].averageRatio).toBe(1);
      expect(trend[2].cycleId).toBe('cycle-3');
      expect(trend[2].averageRatio).toBe(1);
    });

    it('insufficient history: rejects with error when less than 2 completed cycles', async () => {
      gateway.completedCycleIds = ['cycle-1'];

      await expect(
        getEstimationTrend.execute({ teamId: 'team-1' }),
      ).rejects.toThrow(
        "Pas assez d'historique pour afficher la tendance. Minimum 2 cycles terminés requis.",
      );
    });
  });
});
