import { describe, it, expect } from 'vitest';
import { CreateAuditRuleUsecase } from '@modules/audit/usecases/create-audit-rule.usecase.js';
import { EvaluateAuditRuleUsecase } from '@modules/audit/usecases/evaluate-audit-rule.usecase.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { AuditRuleBuilder } from '../builders/audit-rule.builder.js';

describe('Define Custom Audit Rules (acceptance)', () => {
  describe('a rule requires identifier, name, severity and condition', () => {
    it('nominal creation: creates rule available for evaluation', async () => {
      const gateway = new StubAuditRuleGateway();
      const createUsecase = new CreateAuditRuleUsecase(gateway);

      await createUsecase.execute({
        identifier: 'CT-MAX-5',
        name: 'Cycle time max 5 jours',
        severity: 'warning',
        conditionExpression: 'cycle time > 5 jours',
      });

      const stored = gateway.rules.get('CT-MAX-5');
      expect(stored).toBeDefined();
      expect(stored?.identifier).toBe('CT-MAX-5');
      expect(stored?.name).toBe('Cycle time max 5 jours');
      expect(stored?.severity).toBe('warning');
    });

    it('missing identifier: rejects with error', async () => {
      const gateway = new StubAuditRuleGateway();
      const createUsecase = new CreateAuditRuleUsecase(gateway);

      await expect(
        createUsecase.execute({
          identifier: '',
          name: 'Ma regle',
          severity: 'warning',
          conditionExpression: 'cycle time > 5 jours',
        }),
      ).rejects.toThrow("L'identifiant de la regle est obligatoire.");
    });

    it('invalid severity: rejects with error', async () => {
      const gateway = new StubAuditRuleGateway();
      const createUsecase = new CreateAuditRuleUsecase(gateway);

      await expect(
        createUsecase.execute({
          identifier: 'TEST-1',
          name: 'Ma regle',
          severity: 'critical',
          conditionExpression: 'cycle time > 5 jours',
        }),
      ).rejects.toThrow('La severite doit etre info, warning ou error.');
    });

    it('invalid condition: rejects with error', async () => {
      const gateway = new StubAuditRuleGateway();
      const createUsecase = new CreateAuditRuleUsecase(gateway);

      await expect(
        createUsecase.execute({
          identifier: 'TEST-1',
          name: 'Ma regle',
          severity: 'warning',
          conditionExpression: 'texte libre incomprehensible',
        }),
      ).rejects.toThrow(
        "La condition de la regle n'est pas reconnue. Formats acceptes : seuil sur metrique, pattern sur labels/statuts, ratio entre metriques.",
      );
    });

    it('duplicate identifier: rejects with error', async () => {
      const gateway = new StubAuditRuleGateway();
      const createUsecase = new CreateAuditRuleUsecase(gateway);

      await createUsecase.execute({
        identifier: 'CT-MAX-5',
        name: 'Cycle time max 5 jours',
        severity: 'warning',
        conditionExpression: 'cycle time > 5 jours',
      });

      await expect(
        createUsecase.execute({
          identifier: 'CT-MAX-5',
          name: 'Autre regle',
          severity: 'error',
          conditionExpression: 'cycle time > 10 jours',
        }),
      ).rejects.toThrow(
        'Une regle avec l\'identifiant CT-MAX-5 existe deja.',
      );
    });
  });

  describe('evaluation produces pass, warn or fail with explanatory message', () => {
    it('evaluation pass: condition not violated returns pass', async () => {
      const gateway = new StubAuditRuleGateway();
      const createUsecase = new CreateAuditRuleUsecase(gateway);
      const evaluateUsecase = new EvaluateAuditRuleUsecase(gateway);

      await createUsecase.execute({
        identifier: 'CT-MAX-5',
        name: 'Cycle time max 5 jours',
        severity: 'warning',
        conditionExpression: 'cycle time > 5 jours',
      });

      const result = await evaluateUsecase.execute({
        identifier: 'CT-MAX-5',
        metrics: {
          averageCycleTimeInDays: 3,
          averageLeadTimeInDays: 5,
          throughput: 10,
          completionRate: 80,
          scopeCreep: 2,
          velocity: 20,
          labelDistribution: {},
          statusDistribution: {},
          metricRatios: {},
        },
      });

      expect(result.outcome).toBe('pass');
      expect(result.message).toBe('Cycle time moyen : 3 jours (seuil : 5 jours)');
    });

    it('evaluation warn: condition violated with warning severity', async () => {
      const gateway = new StubAuditRuleGateway();
      const createUsecase = new CreateAuditRuleUsecase(gateway);
      const evaluateUsecase = new EvaluateAuditRuleUsecase(gateway);

      await createUsecase.execute({
        identifier: 'RATIO-BF',
        name: 'Ratio bugs/features',
        severity: 'warning',
        conditionExpression: 'ratio bugs/features > 0.5',
      });

      const result = await evaluateUsecase.execute({
        identifier: 'RATIO-BF',
        metrics: {
          averageCycleTimeInDays: 3,
          averageLeadTimeInDays: 5,
          throughput: 10,
          completionRate: 80,
          scopeCreep: 2,
          velocity: 20,
          labelDistribution: {},
          statusDistribution: {},
          metricRatios: { 'bugs/features': 0.6 },
        },
      });

      expect(result.outcome).toBe('warn');
      expect(result.message).toBe('Ratio bugs/features : 0.6 (seuil : 0.5)');
    });

    it('evaluation fail: condition violated with error severity', async () => {
      const gateway = new StubAuditRuleGateway();
      const createUsecase = new CreateAuditRuleUsecase(gateway);
      const evaluateUsecase = new EvaluateAuditRuleUsecase(gateway);

      await createUsecase.execute({
        identifier: 'CT-MAX-5',
        name: 'Cycle time max 5 jours',
        severity: 'error',
        conditionExpression: 'cycle time > 5 jours',
      });

      const result = await evaluateUsecase.execute({
        identifier: 'CT-MAX-5',
        metrics: {
          averageCycleTimeInDays: 8,
          averageLeadTimeInDays: 10,
          throughput: 10,
          completionRate: 80,
          scopeCreep: 2,
          velocity: 20,
          labelDistribution: {},
          statusDistribution: {},
          metricRatios: {},
        },
      });

      expect(result.outcome).toBe('fail');
      expect(result.message).toBe('Cycle time moyen : 8 jours (seuil : 5 jours)');
    });
  });
});
