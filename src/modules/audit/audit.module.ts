import { Module } from '@nestjs/common';
import { CreateAuditRuleUsecase } from './usecases/create-audit-rule.usecase.js';
import { EvaluateAuditRuleUsecase } from './usecases/evaluate-audit-rule.usecase.js';
import { SyncPackmindRulesUsecase } from './usecases/sync-packmind-rules.usecase.js';
import { AuditRuleGateway } from './entities/audit-rule/audit-rule.gateway.js';
import { AuditRuleInFilesystemGateway } from './interface-adapters/gateways/audit-rule.in-filesystem.gateway.js';
import { ChecklistItemGateway } from './entities/checklist-item/checklist-item.gateway.js';
import { ChecklistItemInFilesystemGateway } from './interface-adapters/gateways/checklist-item.in-filesystem.gateway.js';
import { PackmindGateway } from './entities/packmind/packmind.gateway.js';
import { PackmindInHttpGateway } from './interface-adapters/gateways/packmind.in-http.gateway.js';
import { SyncPackmindRulesPresenter } from './interface-adapters/presenters/sync-packmind-rules.presenter.js';
import { SyncPackmindRulesController } from './interface-adapters/controllers/sync-packmind-rules.controller.js';

@Module({
  controllers: [SyncPackmindRulesController],
  providers: [
    CreateAuditRuleUsecase,
    EvaluateAuditRuleUsecase,
    SyncPackmindRulesUsecase,
    SyncPackmindRulesPresenter,
    {
      provide: AuditRuleGateway,
      useFactory: () =>
        new AuditRuleInFilesystemGateway(
          process.env.AUDIT_RULES_DIRECTORY ?? './rules',
        ),
    },
    {
      provide: ChecklistItemGateway,
      useFactory: () =>
        new ChecklistItemInFilesystemGateway(
          process.env.CHECKLIST_ITEMS_DIRECTORY ?? './checklist-items',
        ),
    },
    {
      provide: PackmindGateway,
      useFactory: () =>
        new PackmindInHttpGateway(
          process.env.PACKMIND_API_URL ?? 'https://api.packmind.com',
        ),
    },
  ],
  exports: [AuditRuleGateway, ChecklistItemGateway, CreateAuditRuleUsecase, EvaluateAuditRuleUsecase, SyncPackmindRulesUsecase],
})
export class AuditModule {}
