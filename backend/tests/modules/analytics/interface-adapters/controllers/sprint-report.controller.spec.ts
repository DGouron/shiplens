import { SprintReportController } from '@modules/analytics/interface-adapters/controllers/sprint-report.controller.js';
import { SprintReportPresenter } from '@modules/analytics/interface-adapters/presenters/sprint-report.presenter.js';
import { StubAiTextGeneratorGateway } from '@modules/analytics/testing/good-path/stub.ai-text-generator.gateway.js';
import { StubAvailableStatusesGateway } from '@modules/analytics/testing/good-path/stub.available-statuses.gateway.js';
import { StubCycleMetricsDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-metrics-data.gateway.js';
import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { StubSprintReportDataGateway } from '@modules/analytics/testing/good-path/stub.sprint-report-data.gateway.js';
import { StubWorkflowConfigGateway } from '@modules/analytics/testing/good-path/stub.workflow-config.gateway.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GenerateSprintReportUsecase } from '@modules/analytics/usecases/generate-sprint-report.usecase.js';
import { ResolveWorkflowConfigUsecase } from '@modules/analytics/usecases/resolve-workflow-config.usecase.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { StubChecklistItemGateway } from '@modules/audit/testing/good-path/stub.checklist-item.gateway.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('SprintReportController', () => {
  let controller: SprintReportController;
  let workspaceSettingsGateway: StubWorkspaceSettingsGateway;

  beforeEach(() => {
    const dataGateway = new StubSprintReportDataGateway();
    const aiGateway = new StubAiTextGeneratorGateway();
    const sprintReportGateway = new StubSprintReportGateway();
    const auditRuleGateway = new StubAuditRuleGateway();
    const checklistItemGateway = new StubChecklistItemGateway();
    const cycleMetricsDataGateway = new StubCycleMetricsDataGateway();
    workspaceSettingsGateway = new StubWorkspaceSettingsGateway();
    const resolveWorkflowConfig = new ResolveWorkflowConfigUsecase(
      new StubWorkflowConfigGateway(),
      new StubAvailableStatusesGateway(),
    );
    const usecase = new GenerateSprintReportUsecase(
      dataGateway,
      aiGateway,
      sprintReportGateway,
      auditRuleGateway,
      checklistItemGateway,
      cycleMetricsDataGateway,
      workspaceSettingsGateway,
      resolveWorkflowConfig,
    );
    const presenter = new SprintReportPresenter();
    controller = new SprintReportController(
      usecase,
      presenter,
      workspaceSettingsGateway,
    );
  });

  it('returns a formatted sprint report dto without language in body', async () => {
    workspaceSettingsGateway.storedLanguage = 'en';

    const dto = await controller.generate('cycle-1', {
      teamId: 'team-1',
      provider: 'OpenAI',
    });

    expect(dto.cycleName).toBe('Sprint 10');
    expect(dto.language).toBe('EN');
    expect(dto.executiveSummary).toBeTruthy();
    expect(dto.highlights).toBeTruthy();
    expect(dto.risks).toBeTruthy();
    expect(dto.recommendations).toBeTruthy();
  });

  it('presents null trends with absence message using workspace language', async () => {
    workspaceSettingsGateway.storedLanguage = 'fr';

    const dto = await controller.generate('cycle-1', {
      teamId: 'team-1',
      provider: 'OpenAI',
    });

    expect(dto.trends).toBe(
      "Pas d'historique disponible pour comparer la vélocité",
    );
  });
});
