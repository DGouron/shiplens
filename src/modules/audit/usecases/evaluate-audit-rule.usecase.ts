import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { AuditRuleGateway } from '../entities/audit-rule/audit-rule.gateway.js';
import { type EvaluationResult } from '../entities/audit-rule/audit-rule.js';
import { type CycleMetrics } from '../entities/audit-rule/cycle-metrics.js';
import { RuleNotFoundError } from '../entities/audit-rule/audit-rule.errors.js';

interface EvaluateAuditRuleParams {
  identifier: string;
  metrics: CycleMetrics;
}

@Injectable()
export class EvaluateAuditRuleUsecase implements Usecase<EvaluateAuditRuleParams, EvaluationResult> {
  constructor(private readonly auditRuleGateway: AuditRuleGateway) {}

  async execute(params: EvaluateAuditRuleParams): Promise<EvaluationResult> {
    const rule = await this.auditRuleGateway.findByIdentifier(params.identifier);
    if (!rule) {
      throw new RuleNotFoundError(params.identifier);
    }

    return rule.evaluate(params.metrics);
  }
}
