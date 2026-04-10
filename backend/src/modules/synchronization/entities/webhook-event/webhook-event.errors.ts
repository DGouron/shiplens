import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class UnverifiedWebhookSignatureError extends BusinessRuleViolation {
  constructor() {
    super('Notification ignorée : origine non vérifiée.');
  }
}
