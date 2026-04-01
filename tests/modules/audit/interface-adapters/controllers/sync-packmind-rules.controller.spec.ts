import { describe, it, expect } from 'vitest';
import { SyncPackmindRulesController } from '@modules/audit/interface-adapters/controllers/sync-packmind-rules.controller.js';
import { SyncPackmindRulesUsecase } from '@modules/audit/usecases/sync-packmind-rules.usecase.js';
import { SyncPackmindRulesPresenter } from '@modules/audit/interface-adapters/presenters/sync-packmind-rules.presenter.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { StubChecklistItemGateway } from '@modules/audit/testing/good-path/stub.checklist-item.gateway.js';
import { StubPackmindGateway } from '@modules/audit/testing/good-path/stub.packmind.gateway.js';
import { type PackmindPractice } from '@modules/audit/entities/packmind/packmind-practice.js';

describe('SyncPackmindRulesController', () => {
  it('delegates to use case and presenter, returns view model', async () => {
    const practices: PackmindPractice[] = [
      { identifier: 'PM-1', name: 'Cycle time', measurable: true, conditionExpression: 'cycle time > 5 jours', severity: 'warning' },
      { identifier: 'PM-2', name: 'Commit clairs', measurable: false },
    ];
    const usecase = new SyncPackmindRulesUsecase(
      new StubAuditRuleGateway(),
      new StubChecklistItemGateway(),
      new StubPackmindGateway(practices),
    );
    const presenter = new SyncPackmindRulesPresenter();
    const controller = new SyncPackmindRulesController(usecase, presenter);

    const result = await controller.syncPackmindRules({ token: 'valid-token' });

    expect(result.createdRulesCount).toBe(1);
    expect(result.checklistItemsCount).toBe(1);
    expect(result.fromCache).toBe(false);
  });
});
