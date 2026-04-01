import { Module } from '@nestjs/common';
import { CreateAuditRuleUsecase } from './usecases/create-audit-rule.usecase.js';
import { EvaluateAuditRuleUsecase } from './usecases/evaluate-audit-rule.usecase.js';
import { AuditRuleGateway } from './entities/audit-rule/audit-rule.gateway.js';
import { AuditRuleInFilesystemGateway } from './interface-adapters/gateways/audit-rule.in-filesystem.gateway.js';

@Module({
  providers: [
    CreateAuditRuleUsecase,
    EvaluateAuditRuleUsecase,
    {
      provide: AuditRuleGateway,
      useFactory: () =>
        new AuditRuleInFilesystemGateway(
          process.env.AUDIT_RULES_DIRECTORY ?? './rules',
        ),
    },
  ],
  exports: [AuditRuleGateway, CreateAuditRuleUsecase, EvaluateAuditRuleUsecase],
})
export class AuditModule {}
