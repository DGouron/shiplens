import {
  InvalidPackmindTokenError,
  MissingPackmindTokenError,
  NoPracticesFoundError,
  PackmindUnreachableWithoutCacheError,
} from '@modules/audit/entities/packmind/packmind.errors.js';
import { type PackmindPractice } from '@modules/audit/entities/packmind/packmind-practice.js';
import { FailingPackmindGateway } from '@modules/audit/testing/bad-path/failing.packmind.gateway.js';
import { UnreachablePackmindGateway } from '@modules/audit/testing/bad-path/unreachable.packmind.gateway.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { StubChecklistItemGateway } from '@modules/audit/testing/good-path/stub.checklist-item.gateway.js';
import { StubPackmindGateway } from '@modules/audit/testing/good-path/stub.packmind.gateway.js';
import { SyncPackmindRulesUsecase } from '@modules/audit/usecases/sync-packmind-rules.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { AuditRuleBuilder } from '../../../builders/audit-rule.builder.js';

describe('SyncPackmindRulesUsecase', () => {
  let auditRuleGateway: StubAuditRuleGateway;
  let checklistItemGateway: StubChecklistItemGateway;

  beforeEach(() => {
    auditRuleGateway = new StubAuditRuleGateway();
    checklistItemGateway = new StubChecklistItemGateway();
  });

  describe('nominal sync', () => {
    it('converts measurable practices to audit rules and qualitative to checklist items', async () => {
      const practices: PackmindPractice[] = [
        {
          identifier: 'PM-1',
          name: 'Cycle time sous 5 jours',
          measurable: true,
          conditionExpression: 'cycle time > 5 jours',
          severity: 'warning',
        },
        {
          identifier: 'PM-2',
          name: 'Lead time sous 10 jours',
          measurable: true,
          conditionExpression: 'lead time > 10 jours',
          severity: 'error',
        },
        {
          identifier: 'PM-3',
          name: 'Throughput minimum',
          measurable: true,
          conditionExpression: 'throughput < 5',
          severity: 'warning',
        },
        {
          identifier: 'PM-4',
          name: 'Ecrire des messages de commit clairs',
          measurable: false,
        },
        {
          identifier: 'PM-5',
          name: 'Faire des code reviews constructives',
          measurable: false,
        },
      ];
      const packmindGateway = new StubPackmindGateway(practices);
      const usecase = new SyncPackmindRulesUsecase(
        auditRuleGateway,
        checklistItemGateway,
        packmindGateway,
      );

      const result = await usecase.execute({ token: 'valid-token' });

      expect(result.createdRulesCount).toBe(3);
      expect(result.checklistItemsCount).toBe(2);
      expect(result.fromCache).toBe(false);
      const rules = await auditRuleGateway.findAllByOrigin('packmind');
      expect(rules).toHaveLength(3);
    });
  });

  describe('measurable practice conversion', () => {
    it('creates audit rule with correct condition and origin', async () => {
      const practices: PackmindPractice[] = [
        {
          identifier: 'PM-REVIEW',
          name: 'PR review sous 24h',
          measurable: true,
          conditionExpression: 'lead time > 1 jours',
          severity: 'warning',
        },
      ];
      const packmindGateway = new StubPackmindGateway(practices);
      const usecase = new SyncPackmindRulesUsecase(
        auditRuleGateway,
        checklistItemGateway,
        packmindGateway,
      );

      await usecase.execute({ token: 'valid-token' });

      const rule = await auditRuleGateway.findByIdentifier('PM-REVIEW');
      expect(rule).not.toBeNull();
      expect(rule?.name).toBe('PR review sous 24h');
      expect(rule?.origin).toBe('packmind');
    });
  });

  describe('qualitative practice conservation', () => {
    it('creates checklist item, not an audit rule', async () => {
      const practices: PackmindPractice[] = [
        {
          identifier: 'PM-COMMIT',
          name: 'Ecrire des messages de commit clairs',
          measurable: false,
        },
      ];
      const packmindGateway = new StubPackmindGateway(practices);
      const usecase = new SyncPackmindRulesUsecase(
        auditRuleGateway,
        checklistItemGateway,
        packmindGateway,
      );

      const result = await usecase.execute({ token: 'valid-token' });

      expect(result.checklistItemsCount).toBe(1);
      expect(result.createdRulesCount).toBe(0);
      const items = await checklistItemGateway.findAll();
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Ecrire des messages de commit clairs');
      expect(items[0].origin).toBe('packmind');
    });
  });

  describe('resynchronization', () => {
    it('updates existing rules and adds new ones', async () => {
      const existingRule = new AuditRuleBuilder()
        .withIdentifier('PM-1')
        .withName('Old name')
        .withOrigin('packmind')
        .build();
      await auditRuleGateway.save(existingRule);

      const practices: PackmindPractice[] = [
        {
          identifier: 'PM-1',
          name: 'Updated name',
          measurable: true,
          conditionExpression: 'cycle time > 5 jours',
          severity: 'warning',
        },
        {
          identifier: 'PM-2',
          name: 'New rule',
          measurable: true,
          conditionExpression: 'lead time > 10 jours',
          severity: 'error',
        },
      ];
      const packmindGateway = new StubPackmindGateway(practices);
      const usecase = new SyncPackmindRulesUsecase(
        auditRuleGateway,
        checklistItemGateway,
        packmindGateway,
      );

      const result = await usecase.execute({ token: 'valid-token' });

      expect(result.updatedRulesCount).toBe(1);
      expect(result.createdRulesCount).toBe(1);
      const updatedRule = await auditRuleGateway.findByIdentifier('PM-1');
      expect(updatedRule?.name).toBe('Updated name');
    });
  });

  describe('Packmind unreachable', () => {
    it('returns cached rules with warning when cache exists', async () => {
      const cachedRule = new AuditRuleBuilder()
        .withIdentifier('PM-1')
        .withOrigin('packmind')
        .build();
      await auditRuleGateway.save(cachedRule);

      const packmindGateway = new UnreachablePackmindGateway();
      const usecase = new SyncPackmindRulesUsecase(
        auditRuleGateway,
        checklistItemGateway,
        packmindGateway,
      );

      const result = await usecase.execute({ token: 'valid-token' });

      expect(result.fromCache).toBe(true);
      expect(result.warning).toBe(
        'Packmind est injoignable. Les regles en cache sont utilisees.',
      );
    });

    it('rejects when unreachable and no cache', async () => {
      const packmindGateway = new UnreachablePackmindGateway();
      const usecase = new SyncPackmindRulesUsecase(
        auditRuleGateway,
        checklistItemGateway,
        packmindGateway,
      );

      await expect(usecase.execute({ token: 'valid-token' })).rejects.toThrow(
        PackmindUnreachableWithoutCacheError,
      );
    });
  });

  describe('token validation', () => {
    it('rejects invalid token', async () => {
      const packmindGateway = new FailingPackmindGateway();
      const usecase = new SyncPackmindRulesUsecase(
        auditRuleGateway,
        checklistItemGateway,
        packmindGateway,
      );

      await expect(usecase.execute({ token: 'invalid-token' })).rejects.toThrow(
        InvalidPackmindTokenError,
      );
    });

    it('rejects missing token', async () => {
      const packmindGateway = new StubPackmindGateway([]);
      const usecase = new SyncPackmindRulesUsecase(
        auditRuleGateway,
        checklistItemGateway,
        packmindGateway,
      );

      await expect(usecase.execute({ token: '' })).rejects.toThrow(
        MissingPackmindTokenError,
      );
    });
  });

  describe('no practices available', () => {
    it('rejects when Packmind has no practices', async () => {
      const packmindGateway = new StubPackmindGateway([]);
      const usecase = new SyncPackmindRulesUsecase(
        auditRuleGateway,
        checklistItemGateway,
        packmindGateway,
      );

      await expect(usecase.execute({ token: 'valid-token' })).rejects.toThrow(
        NoPracticesFoundError,
      );
    });
  });
});
