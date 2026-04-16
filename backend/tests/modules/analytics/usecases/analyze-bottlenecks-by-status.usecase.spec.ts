import {
  NoCompletedIssuesError,
  NoSynchronizedDataError,
} from '@modules/analytics/entities/bottleneck-analysis/bottleneck-analysis.errors.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubBottleneckAnalysisDataGateway } from '@modules/analytics/testing/good-path/stub.bottleneck-analysis-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { AnalyzeBottlenecksByStatusUsecase } from '@modules/analytics/usecases/analyze-bottlenecks-by-status.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('AnalyzeBottlenecksByStatusUsecase', () => {
  let usecase: AnalyzeBottlenecksByStatusUsecase;
  let gateway: StubBottleneckAnalysisDataGateway;

  beforeEach(() => {
    gateway = new StubBottleneckAnalysisDataGateway();
    const workflowConfigGateway = new StubWorkflowConfigGateway();
    const availableStatusesGateway = new StubAvailableStatusesGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      workflowConfigGateway,
      availableStatusesGateway,
    );
    usecase = new AnalyzeBottlenecksByStatusUsecase(
      gateway,
      resolveWorkflowConfig,
    );
  });

  it('returns status distribution and bottleneck', async () => {
    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
    });

    expect(result.statusDistribution.length).toBeGreaterThan(0);
    expect(result.bottleneckStatus).toBeDefined();
    expect(typeof result.bottleneckStatus).toBe('string');
  });

  it('returns assignee breakdown', async () => {
    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
    });

    expect(result.assigneeBreakdown).toHaveLength(1);
    expect(result.assigneeBreakdown[0].assigneeName).toBe('Alice');
  });

  it('returns comparison when previous cycle exists', async () => {
    gateway.previousCycleId = 'cycle-0';
    gateway.bottleneckData = {
      ...gateway.bottleneckData,
    };

    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      includeComparison: true,
    });

    expect(result.cycleComparison).not.toBeNull();
  });

  it('returns null comparison when no previous cycle', async () => {
    gateway.previousCycleId = null;

    const result = await usecase.execute({
      cycleId: 'cycle-1',
      teamId: 'team-1',
      includeComparison: true,
    });

    expect(result.cycleComparison).toBeNull();
  });

  it('throws NoSynchronizedDataError when no data synced', async () => {
    gateway.hasSyncData = false;

    await expect(
      usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toThrow(NoSynchronizedDataError);
  });

  it('throws NoCompletedIssuesError when no completed issues', async () => {
    gateway.bottleneckData = {
      ...gateway.bottleneckData,
      completedIssues: [],
    };

    await expect(
      usecase.execute({ cycleId: 'cycle-1', teamId: 'team-1' }),
    ).rejects.toThrow(NoCompletedIssuesError);
  });
});
