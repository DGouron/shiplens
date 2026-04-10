import { RuleNotFoundError } from '@modules/audit/entities/audit-rule/audit-rule.errors.js';
import { type CycleMetrics } from '@modules/audit/entities/audit-rule/cycle-metrics.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { EvaluateAuditRuleUsecase } from '@modules/audit/usecases/evaluate-audit-rule.usecase.js';
import { describe, expect, it } from 'vitest';
import { AuditRuleBuilder } from '../../../builders/audit-rule.builder.js';

function defaultMetrics(overrides: Partial<CycleMetrics> = {}): CycleMetrics {
  return {
    averageCycleTimeInDays: 3,
    averageLeadTimeInDays: 5,
    throughput: 10,
    completionRate: 80,
    scopeCreep: 2,
    velocity: 20,
    labelDistribution: {},
    statusDistribution: {},
    metricRatios: {},
    ...overrides,
  };
}

describe('EvaluateAuditRuleUsecase', () => {
  it('evaluates a rule and returns the result', async () => {
    const gateway = new StubAuditRuleGateway();
    const rule = new AuditRuleBuilder().build();
    await gateway.save(rule);

    const usecase = new EvaluateAuditRuleUsecase(gateway);

    const result = await usecase.execute({
      identifier: 'CT-MAX-5',
      metrics: defaultMetrics({ averageCycleTimeInDays: 3 }),
    });

    expect(result.outcome).toBe('pass');
    expect(result.message).toContain('3');
  });

  it('throws RuleNotFoundError when rule does not exist', async () => {
    const gateway = new StubAuditRuleGateway();
    const usecase = new EvaluateAuditRuleUsecase(gateway);

    await expect(
      usecase.execute({
        identifier: 'NONEXISTENT',
        metrics: defaultMetrics(),
      }),
    ).rejects.toThrow(RuleNotFoundError);
  });
});
