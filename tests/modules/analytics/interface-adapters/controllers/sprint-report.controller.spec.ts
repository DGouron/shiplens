import { describe, it, expect, beforeEach } from 'vitest';
import { SprintReportController } from '@modules/analytics/interface-adapters/controllers/sprint-report.controller.js';
import { GenerateSprintReportUsecase } from '@modules/analytics/usecases/generate-sprint-report.usecase.js';
import { SprintReportPresenter } from '@modules/analytics/interface-adapters/presenters/sprint-report.presenter.js';
import { StubSprintReportDataGateway } from '@modules/analytics/testing/good-path/stub.sprint-report-data.gateway.js';
import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';

describe('SprintReportController', () => {
  let controller: SprintReportController;

  beforeEach(() => {
    const dataGateway = new StubSprintReportDataGateway();
    const aiGateway = new StubAiTextGeneratorGateway();
    const sprintReportGateway = new StubSprintReportGateway();
    const usecase = new GenerateSprintReportUsecase(dataGateway, aiGateway, sprintReportGateway);
    const presenter = new SprintReportPresenter();
    controller = new SprintReportController(usecase, presenter);
  });

  it('returns a formatted sprint report dto', async () => {
    const dto = await controller.generate('cycle-1', {
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(dto.cycleName).toBe('Sprint 10');
    expect(dto.language).toBe('FR');
    expect(dto.executiveSummary).toBeTruthy();
    expect(dto.highlights).toBeTruthy();
    expect(dto.risks).toBeTruthy();
    expect(dto.recommendations).toBeTruthy();
  });

  it('presents null trends with absence message', async () => {
    const dto = await controller.generate('cycle-1', {
      teamId: 'team-1',
      language: 'FR',
      provider: 'OpenAI',
    });

    expect(dto.trends).toBe(
      "Pas d'historique disponible pour comparer la vélocité",
    );
  });
});
