import { describe, it, expect } from 'vitest';
import { SyncPackmindRulesUsecase } from '@modules/audit/usecases/sync-packmind-rules.usecase.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { StubChecklistItemGateway } from '@modules/audit/testing/good-path/stub.checklist-item.gateway.js';
import { StubPackmindGateway } from '@modules/audit/testing/good-path/stub.packmind.gateway.js';
import { FailingPackmindGateway } from '@modules/audit/testing/bad-path/failing.packmind.gateway.js';
import { UnreachablePackmindGateway } from '@modules/audit/testing/bad-path/unreachable.packmind.gateway.js';
import { AuditRuleBuilder } from '../builders/audit-rule.builder.js';
import { type PackmindPractice } from '@modules/audit/entities/packmind/packmind-practice.js';

describe('Import Packmind Rules (acceptance)', () => {
  describe('measurable practices are converted to audit rules, qualitative to checklist items', () => {
    it('nominal sync: 3 measurable practices become audit rules, 2 qualitative become checklist items', async () => {
      const auditRuleGateway = new StubAuditRuleGateway();
      const checklistItemGateway = new StubChecklistItemGateway();
      const practices: PackmindPractice[] = [
        { identifier: 'PM-1', name: 'Cycle time sous 5 jours', measurable: true, conditionExpression: 'cycle time > 5 jours', severity: 'warning' },
        { identifier: 'PM-2', name: 'Lead time sous 10 jours', measurable: true, conditionExpression: 'lead time > 10 jours', severity: 'error' },
        { identifier: 'PM-3', name: 'Throughput minimum', measurable: true, conditionExpression: 'throughput < 5', severity: 'warning' },
        { identifier: 'PM-4', name: 'Ecrire des messages de commit clairs', measurable: false },
        { identifier: 'PM-5', name: 'Faire des code reviews constructives', measurable: false },
      ];
      const packmindGateway = new StubPackmindGateway(practices);
      const usecase = new SyncPackmindRulesUsecase(auditRuleGateway, checklistItemGateway, packmindGateway);

      const result = await usecase.execute({ token: 'valid-token' });

      expect(result.createdRulesCount).toBe(3);
      expect(result.checklistItemsCount).toBe(2);
      expect(result.fromCache).toBe(false);
      const rules = await auditRuleGateway.findAllByOrigin('packmind');
      expect(rules).toHaveLength(3);
      expect(rules[0].origin).toBe('packmind');
    });

    it('measurable practice converted: creates audit rule with condition', async () => {
      const auditRuleGateway = new StubAuditRuleGateway();
      const checklistItemGateway = new StubChecklistItemGateway();
      const practices: PackmindPractice[] = [
        { identifier: 'PM-REVIEW', name: 'PR review sous 24h', measurable: true, conditionExpression: 'lead time > 1 jours', severity: 'warning' },
      ];
      const packmindGateway = new StubPackmindGateway(practices);
      const usecase = new SyncPackmindRulesUsecase(auditRuleGateway, checklistItemGateway, packmindGateway);

      const result = await usecase.execute({ token: 'valid-token' });

      expect(result.createdRulesCount).toBe(1);
      const rule = await auditRuleGateway.findByIdentifier('PM-REVIEW');
      expect(rule).not.toBeNull();
      expect(rule?.name).toBe('PR review sous 24h');
    });

    it('qualitative practice conserved: creates checklist item, not an audit rule', async () => {
      const auditRuleGateway = new StubAuditRuleGateway();
      const checklistItemGateway = new StubChecklistItemGateway();
      const practices: PackmindPractice[] = [
        { identifier: 'PM-COMMIT', name: 'Ecrire des messages de commit clairs', measurable: false },
      ];
      const packmindGateway = new StubPackmindGateway(practices);
      const usecase = new SyncPackmindRulesUsecase(auditRuleGateway, checklistItemGateway, packmindGateway);

      const result = await usecase.execute({ token: 'valid-token' });

      expect(result.checklistItemsCount).toBe(1);
      expect(result.createdRulesCount).toBe(0);
      const items = await checklistItemGateway.findAll();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Ecrire des messages de commit clairs');
      expect(items[0].origin).toBe('packmind');
    });
  });

  describe('resynchronization updates existing rules and adds new ones', () => {
    it('resync: updates 3 existing rules, adds 2 new ones', async () => {
      const auditRuleGateway = new StubAuditRuleGateway();
      const checklistItemGateway = new StubChecklistItemGateway();

      const existingRule1 = new AuditRuleBuilder().withIdentifier('PM-1').withName('Old name 1').withOrigin('packmind').build();
      const existingRule2 = new AuditRuleBuilder().withIdentifier('PM-2').withName('Old name 2').withOrigin('packmind').build();
      const existingRule3 = new AuditRuleBuilder().withIdentifier('PM-3').withName('Old name 3').withOrigin('packmind').build();
      await auditRuleGateway.save(existingRule1);
      await auditRuleGateway.save(existingRule2);
      await auditRuleGateway.save(existingRule3);

      const practices: PackmindPractice[] = [
        { identifier: 'PM-1', name: 'Updated name 1', measurable: true, conditionExpression: 'cycle time > 5 jours', severity: 'warning' },
        { identifier: 'PM-2', name: 'Updated name 2', measurable: true, conditionExpression: 'lead time > 10 jours', severity: 'error' },
        { identifier: 'PM-3', name: 'Updated name 3', measurable: true, conditionExpression: 'throughput < 5', severity: 'warning' },
        { identifier: 'PM-4', name: 'New rule 4', measurable: true, conditionExpression: 'velocity < 10', severity: 'info' },
        { identifier: 'PM-5', name: 'New rule 5', measurable: true, conditionExpression: 'scope creep > 5', severity: 'error' },
      ];
      const packmindGateway = new StubPackmindGateway(practices);
      const usecase = new SyncPackmindRulesUsecase(auditRuleGateway, checklistItemGateway, packmindGateway);

      const result = await usecase.execute({ token: 'valid-token' });

      expect(result.createdRulesCount).toBe(2);
      expect(result.updatedRulesCount).toBe(3);
      const allRules = await auditRuleGateway.findAllByOrigin('packmind');
      expect(allRules).toHaveLength(5);
    });
  });

  describe('Packmind unreachable: uses cached rules', () => {
    it('unreachable with cache: returns cached rules with warning', async () => {
      const auditRuleGateway = new StubAuditRuleGateway();
      const checklistItemGateway = new StubChecklistItemGateway();

      const cachedRule1 = new AuditRuleBuilder().withIdentifier('PM-1').withOrigin('packmind').build();
      const cachedRule2 = new AuditRuleBuilder().withIdentifier('PM-2').withOrigin('packmind').build();
      const cachedRule3 = new AuditRuleBuilder().withIdentifier('PM-3').withOrigin('packmind').build();
      await auditRuleGateway.save(cachedRule1);
      await auditRuleGateway.save(cachedRule2);
      await auditRuleGateway.save(cachedRule3);

      const packmindGateway = new UnreachablePackmindGateway();
      const usecase = new SyncPackmindRulesUsecase(auditRuleGateway, checklistItemGateway, packmindGateway);

      const result = await usecase.execute({ token: 'valid-token' });

      expect(result.fromCache).toBe(true);
      expect(result.warning).toBe('Packmind est injoignable. Les regles en cache sont utilisees.');
      expect(result.createdRulesCount).toBe(0);
      expect(result.updatedRulesCount).toBe(0);
    });

    it('unreachable without cache: rejects with error', async () => {
      const auditRuleGateway = new StubAuditRuleGateway();
      const checklistItemGateway = new StubChecklistItemGateway();
      const packmindGateway = new UnreachablePackmindGateway();
      const usecase = new SyncPackmindRulesUsecase(auditRuleGateway, checklistItemGateway, packmindGateway);

      await expect(usecase.execute({ token: 'valid-token' })).rejects.toThrow(
        "Packmind est injoignable et aucune regle n'a ete synchronisee precedemment.",
      );
    });
  });

  describe('token validation', () => {
    it('invalid token: rejects with error', async () => {
      const auditRuleGateway = new StubAuditRuleGateway();
      const checklistItemGateway = new StubChecklistItemGateway();
      const packmindGateway = new FailingPackmindGateway();
      const usecase = new SyncPackmindRulesUsecase(auditRuleGateway, checklistItemGateway, packmindGateway);

      await expect(usecase.execute({ token: 'invalid-token' })).rejects.toThrow(
        'Le token Packmind est invalide. Veuillez verifier votre configuration.',
      );
    });

    it('missing token: rejects with error', async () => {
      const auditRuleGateway = new StubAuditRuleGateway();
      const checklistItemGateway = new StubChecklistItemGateway();
      const packmindGateway = new StubPackmindGateway([]);
      const usecase = new SyncPackmindRulesUsecase(auditRuleGateway, checklistItemGateway, packmindGateway);

      await expect(usecase.execute({ token: '' })).rejects.toThrow(
        "Aucun token Packmind configure. Veuillez renseigner votre token d'authentification.",
      );
    });
  });

  describe('no practices available', () => {
    it('no practices: rejects with error', async () => {
      const auditRuleGateway = new StubAuditRuleGateway();
      const checklistItemGateway = new StubChecklistItemGateway();
      const packmindGateway = new StubPackmindGateway([]);
      const usecase = new SyncPackmindRulesUsecase(auditRuleGateway, checklistItemGateway, packmindGateway);

      await expect(usecase.execute({ token: 'valid-token' })).rejects.toThrow(
        'Aucune pratique trouvee dans votre espace Packmind.',
      );
    });
  });
});
