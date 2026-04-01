import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { AuditRuleInFilesystemGateway } from '@modules/audit/interface-adapters/gateways/audit-rule.in-filesystem.gateway.js';
import { AuditRuleBuilder } from '../../../../builders/audit-rule.builder.js';

describe('AuditRuleInFilesystemGateway', () => {
  const testDirectory = join(tmpdir(), `shiplens-audit-test-${Date.now()}`);

  beforeEach(() => {
    if (!existsSync(testDirectory)) {
      mkdirSync(testDirectory, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(testDirectory)) {
      rmSync(testDirectory, { recursive: true, force: true });
    }
  });

  it('saves and retrieves a rule by identifier', async () => {
    const gateway = new AuditRuleInFilesystemGateway(testDirectory);
    const rule = new AuditRuleBuilder().build();

    await gateway.save(rule);

    const retrieved = await gateway.findByIdentifier('CT-MAX-5');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.identifier).toBe('CT-MAX-5');
    expect(retrieved?.name).toBe('Cycle time max 5 jours');
    expect(retrieved?.severity).toBe('warning');
  });

  it('returns null when rule does not exist', async () => {
    const gateway = new AuditRuleInFilesystemGateway(testDirectory);

    const result = await gateway.findByIdentifier('NONEXISTENT');

    expect(result).toBeNull();
  });

  it('retrieves all saved rules', async () => {
    const gateway = new AuditRuleInFilesystemGateway(testDirectory);
    const rule1 = new AuditRuleBuilder().withIdentifier('RULE-1').build();
    const rule2 = new AuditRuleBuilder().withIdentifier('RULE-2').build();

    await gateway.save(rule1);
    await gateway.save(rule2);

    const allRules = await gateway.findAll();
    expect(allRules).toHaveLength(2);
  });

  it('throws when directory does not exist', async () => {
    const gateway = new AuditRuleInFilesystemGateway('/nonexistent/path');

    await expect(gateway.save(new AuditRuleBuilder().build())).rejects.toThrow(
      'Le dossier de regles configure est introuvable.',
    );
  });
});
