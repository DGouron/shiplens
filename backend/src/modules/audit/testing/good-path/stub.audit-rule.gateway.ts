import { AuditRuleGateway } from '../../entities/audit-rule/audit-rule.gateway.js';
import { type AuditRule } from '../../entities/audit-rule/audit-rule.js';

export class StubAuditRuleGateway extends AuditRuleGateway {
  rules: Map<string, AuditRule> = new Map();

  async save(rule: AuditRule): Promise<void> {
    this.rules.set(rule.identifier, rule);
  }

  async findByIdentifier(identifier: string): Promise<AuditRule | null> {
    return this.rules.get(identifier) ?? null;
  }

  async findAll(): Promise<AuditRule[]> {
    return Array.from(this.rules.values());
  }

  async findAllByOrigin(origin: string): Promise<AuditRule[]> {
    return Array.from(this.rules.values()).filter(
      (rule) => rule.origin === origin,
    );
  }
}
