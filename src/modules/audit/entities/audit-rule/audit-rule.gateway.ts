import { type AuditRule } from './audit-rule.js';

export abstract class AuditRuleGateway {
  abstract save(rule: AuditRule): Promise<void>;
  abstract findByIdentifier(identifier: string): Promise<AuditRule | null>;
  abstract findAll(): Promise<AuditRule[]>;
  abstract findAllByOrigin(origin: string): Promise<AuditRule[]>;
}
