import { describe, it, expect } from 'vitest';
import { AuditRule } from '@modules/audit/entities/audit-rule/audit-rule.js';
import { type CycleMetrics } from '@modules/audit/entities/audit-rule/cycle-metrics.js';
import { MissingIdentifierError, InvalidSeverityError, InvalidConditionError } from '@modules/audit/entities/audit-rule/audit-rule.errors.js';

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

describe('AuditRule', () => {
  describe('creation', () => {
    it('creates a valid audit rule with threshold condition', () => {
      const rule = AuditRule.create({
        identifier: 'CT-MAX-5',
        name: 'Cycle time max 5 jours',
        severity: 'warning',
        conditionExpression: 'cycle time > 5 jours',
      });

      expect(rule.identifier).toBe('CT-MAX-5');
      expect(rule.name).toBe('Cycle time max 5 jours');
      expect(rule.severity).toBe('warning');
    });

    it('throws MissingIdentifierError when identifier is empty', () => {
      expect(() =>
        AuditRule.create({
          identifier: '',
          name: 'Ma regle',
          severity: 'warning',
          conditionExpression: 'cycle time > 5 jours',
        }),
      ).toThrow(MissingIdentifierError);
    });

    it('throws InvalidSeverityError when severity is not recognized', () => {
      expect(() =>
        AuditRule.create({
          identifier: 'TEST-1',
          name: 'Ma regle',
          severity: 'critical',
          conditionExpression: 'cycle time > 5 jours',
        }),
      ).toThrow(InvalidSeverityError);
    });

    it('throws InvalidConditionError when condition is not parseable', () => {
      expect(() =>
        AuditRule.create({
          identifier: 'TEST-1',
          name: 'Ma regle',
          severity: 'warning',
          conditionExpression: 'texte libre incomprehensible',
        }),
      ).toThrow(InvalidConditionError);
    });
  });

  describe('evaluation - threshold', () => {
    it('returns pass when threshold is not violated', () => {
      const rule = AuditRule.create({
        identifier: 'CT-MAX-5',
        name: 'Cycle time max 5 jours',
        severity: 'warning',
        conditionExpression: 'cycle time > 5 jours',
      });

      const result = rule.evaluate(defaultMetrics({ averageCycleTimeInDays: 3 }));

      expect(result.outcome).toBe('pass');
      expect(result.message).toBe('Cycle time moyen : 3 jours (seuil : 5 jours)');
    });

    it('returns fail when threshold is violated with error severity', () => {
      const rule = AuditRule.create({
        identifier: 'CT-MAX-5',
        name: 'Cycle time max 5 jours',
        severity: 'error',
        conditionExpression: 'cycle time > 5 jours',
      });

      const result = rule.evaluate(defaultMetrics({ averageCycleTimeInDays: 8 }));

      expect(result.outcome).toBe('fail');
      expect(result.message).toBe('Cycle time moyen : 8 jours (seuil : 5 jours)');
    });

    it('returns warn when threshold is violated with warning severity', () => {
      const rule = AuditRule.create({
        identifier: 'CT-MAX-5',
        name: 'Cycle time max 5 jours',
        severity: 'warning',
        conditionExpression: 'cycle time > 5 jours',
      });

      const result = rule.evaluate(defaultMetrics({ averageCycleTimeInDays: 8 }));

      expect(result.outcome).toBe('warn');
    });

    it('returns pass when threshold is violated with info severity', () => {
      const rule = AuditRule.create({
        identifier: 'CT-INFO',
        name: 'Cycle time info',
        severity: 'info',
        conditionExpression: 'cycle time > 5 jours',
      });

      const result = rule.evaluate(defaultMetrics({ averageCycleTimeInDays: 8 }));

      expect(result.outcome).toBe('pass');
    });
  });

  describe('evaluation - ratio', () => {
    it('returns warn when ratio is violated with warning severity', () => {
      const rule = AuditRule.create({
        identifier: 'RATIO-BF',
        name: 'Ratio bugs/features',
        severity: 'warning',
        conditionExpression: 'ratio bugs/features > 0.5',
      });

      const result = rule.evaluate(
        defaultMetrics({ metricRatios: { 'bugs/features': 0.6 } }),
      );

      expect(result.outcome).toBe('warn');
      expect(result.message).toBe('Ratio bugs/features : 0.6 (seuil : 0.5)');
    });

    it('returns pass when ratio is not violated', () => {
      const rule = AuditRule.create({
        identifier: 'RATIO-BF',
        name: 'Ratio bugs/features',
        severity: 'warning',
        conditionExpression: 'ratio bugs/features > 0.5',
      });

      const result = rule.evaluate(
        defaultMetrics({ metricRatios: { 'bugs/features': 0.3 } }),
      );

      expect(result.outcome).toBe('pass');
      expect(result.message).toBe('Ratio bugs/features : 0.3 (seuil : 0.5)');
    });
  });

  describe('evaluation - pattern', () => {
    it('returns pass when label contains the expected value', () => {
      const rule = AuditRule.create({
        identifier: 'LABEL-URG',
        name: 'Label urgent present',
        severity: 'warning',
        conditionExpression: 'label contains urgent',
      });

      const result = rule.evaluate(
        defaultMetrics({ labelDistribution: { urgent: 3 } }),
      );

      expect(result.outcome).toBe('warn');
      expect(result.message).toContain('urgent');
    });

    it('returns pass when label does not contain the expected value', () => {
      const rule = AuditRule.create({
        identifier: 'LABEL-URG',
        name: 'Label urgent present',
        severity: 'warning',
        conditionExpression: 'label contains urgent',
      });

      const result = rule.evaluate(
        defaultMetrics({ labelDistribution: { bug: 2 } }),
      );

      expect(result.outcome).toBe('pass');
    });
  });
});
