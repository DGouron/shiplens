import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { DuplicateIdentifierError } from '../entities/audit-rule/audit-rule.errors.js';
import { AuditRuleGateway } from '../entities/audit-rule/audit-rule.gateway.js';
import { AuditRule } from '../entities/audit-rule/audit-rule.js';

interface CreateAuditRuleParams {
  identifier: string;
  name: string;
  severity: string;
  conditionExpression: string;
}

@Injectable()
export class CreateAuditRuleUsecase
  implements Usecase<CreateAuditRuleParams, void>
{
  constructor(private readonly auditRuleGateway: AuditRuleGateway) {}

  async execute(params: CreateAuditRuleParams): Promise<void> {
    const rule = AuditRule.create(params);

    const existing = await this.auditRuleGateway.findByIdentifier(
      rule.identifier,
    );
    if (existing) {
      throw new DuplicateIdentifierError(rule.identifier);
    }

    await this.auditRuleGateway.save(rule);
  }
}
