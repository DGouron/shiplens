import { AuditRuleGateway } from '../../entities/audit-rule/audit-rule.gateway.js';
import { type AuditRule } from '../../entities/audit-rule/audit-rule.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingAuditRuleGateway extends AuditRuleGateway {
  async save(_rule: AuditRule): Promise<void> {
    throw new GatewayError('Le dossier de regles configure est introuvable.');
  }

  async findByIdentifier(_identifier: string): Promise<AuditRule | null> {
    throw new GatewayError('Le dossier de regles configure est introuvable.');
  }

  async findAll(): Promise<AuditRule[]> {
    throw new GatewayError('Le dossier de regles configure est introuvable.');
  }
}
