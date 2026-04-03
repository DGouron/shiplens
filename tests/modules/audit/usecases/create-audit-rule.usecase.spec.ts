import {
  DuplicateIdentifierError,
  InvalidConditionError,
  InvalidSeverityError,
  MissingIdentifierError,
} from '@modules/audit/entities/audit-rule/audit-rule.errors.js';
import { StubAuditRuleGateway } from '@modules/audit/testing/good-path/stub.audit-rule.gateway.js';
import { CreateAuditRuleUsecase } from '@modules/audit/usecases/create-audit-rule.usecase.js';
import { describe, expect, it } from 'vitest';

describe('CreateAuditRuleUsecase', () => {
  it('creates and persists a valid audit rule', async () => {
    const gateway = new StubAuditRuleGateway();
    const usecase = new CreateAuditRuleUsecase(gateway);

    await usecase.execute({
      identifier: 'CT-MAX-5',
      name: 'Cycle time max 5 jours',
      severity: 'warning',
      conditionExpression: 'cycle time > 5 jours',
    });

    const stored = await gateway.findByIdentifier('CT-MAX-5');
    expect(stored).not.toBeNull();
    expect(stored?.identifier).toBe('CT-MAX-5');
  });

  it('rejects duplicate identifier', async () => {
    const gateway = new StubAuditRuleGateway();
    const usecase = new CreateAuditRuleUsecase(gateway);

    await usecase.execute({
      identifier: 'CT-MAX-5',
      name: 'Cycle time max 5 jours',
      severity: 'warning',
      conditionExpression: 'cycle time > 5 jours',
    });

    await expect(
      usecase.execute({
        identifier: 'CT-MAX-5',
        name: 'Autre regle',
        severity: 'error',
        conditionExpression: 'cycle time > 10 jours',
      }),
    ).rejects.toThrow(DuplicateIdentifierError);
  });

  it('propagates MissingIdentifierError from entity', async () => {
    const gateway = new StubAuditRuleGateway();
    const usecase = new CreateAuditRuleUsecase(gateway);

    await expect(
      usecase.execute({
        identifier: '',
        name: 'Ma regle',
        severity: 'warning',
        conditionExpression: 'cycle time > 5 jours',
      }),
    ).rejects.toThrow(MissingIdentifierError);
  });

  it('propagates InvalidSeverityError from entity', async () => {
    const gateway = new StubAuditRuleGateway();
    const usecase = new CreateAuditRuleUsecase(gateway);

    await expect(
      usecase.execute({
        identifier: 'TEST-1',
        name: 'Ma regle',
        severity: 'critical',
        conditionExpression: 'cycle time > 5 jours',
      }),
    ).rejects.toThrow(InvalidSeverityError);
  });

  it('propagates InvalidConditionError from entity', async () => {
    const gateway = new StubAuditRuleGateway();
    const usecase = new CreateAuditRuleUsecase(gateway);

    await expect(
      usecase.execute({
        identifier: 'TEST-1',
        name: 'Ma regle',
        severity: 'warning',
        conditionExpression: 'texte libre incomprehensible',
      }),
    ).rejects.toThrow(InvalidConditionError);
  });
});
