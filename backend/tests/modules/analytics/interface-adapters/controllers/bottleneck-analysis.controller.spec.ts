import { BottleneckAnalysisController } from '@modules/analytics/interface-adapters/controllers/bottleneck-analysis.controller.js';
import { BottleneckAnalysisPresenter } from '@modules/analytics/interface-adapters/presenters/bottleneck-analysis.presenter.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubBottleneckAnalysisDataGateway } from '@modules/analytics/testing/good-path/stub.bottleneck-analysis-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { AnalyzeBottlenecksByStatusUsecase } from '@modules/analytics/usecases/analyze-bottlenecks-by-status.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('BottleneckAnalysisController', () => {
  let gateway: StubBottleneckAnalysisDataGateway;
  let controller: BottleneckAnalysisController;

  beforeEach(() => {
    gateway = new StubBottleneckAnalysisDataGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      new StubWorkflowConfigGateway(),
      new StubAvailableStatusesGateway(),
    );
    const usecase = new AnalyzeBottlenecksByStatusUsecase(
      gateway,
      resolveWorkflowConfig,
    );
    const presenter = new BottleneckAnalysisPresenter();
    controller = new BottleneckAnalysisController(usecase, presenter);
  });

  it('returns bottleneck analysis with numeric median hours', async () => {
    const result = await controller.getBottlenecks('cycle-1', 'team-1');

    expect(result.bottleneckStatus).toBeDefined();
    expect(result.statusDistribution.length).toBeGreaterThan(0);
    expect(typeof result.statusDistribution[0].medianHours).toBe('number');
  });

  it('includes comparison when requested', async () => {
    gateway.previousCycleId = 'cycle-0';

    const result = await controller.getBottlenecks('cycle-1', 'team-1', 'true');

    expect(result.cycleComparison).not.toBeNull();
  });

  it('returns null comparison by default', async () => {
    const result = await controller.getBottlenecks('cycle-1', 'team-1');

    expect(result.cycleComparison).toBeNull();
  });
});
