import { describe, it, expect, beforeEach } from 'vitest';
import { BottleneckAnalysisController } from '@modules/analytics/interface-adapters/controllers/bottleneck-analysis.controller.js';
import { AnalyzeBottlenecksByStatusUsecase } from '@modules/analytics/usecases/analyze-bottlenecks-by-status.usecase.js';
import { BottleneckAnalysisPresenter } from '@modules/analytics/interface-adapters/presenters/bottleneck-analysis.presenter.js';
import { StubBottleneckAnalysisDataGateway } from '@modules/analytics/testing/good-path/stub.bottleneck-analysis-data.gateway.js';

describe('BottleneckAnalysisController', () => {
  let gateway: StubBottleneckAnalysisDataGateway;
  let controller: BottleneckAnalysisController;

  beforeEach(() => {
    gateway = new StubBottleneckAnalysisDataGateway();
    const usecase = new AnalyzeBottlenecksByStatusUsecase(gateway);
    const presenter = new BottleneckAnalysisPresenter();
    controller = new BottleneckAnalysisController(usecase, presenter);
  });

  it('returns formatted bottleneck analysis', async () => {
    const result = await controller.getBottlenecks('cycle-1', 'team-1');

    expect(result.bottleneckStatus).toBeDefined();
    expect(result.statusDistribution.length).toBeGreaterThan(0);
    expect(result.statusDistribution[0].medianHours).toContain('h');
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
