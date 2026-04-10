import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class NegativeThresholdError extends BusinessRuleViolation {
  constructor() {
    super('Le seuil doit être une durée positive.');
  }
}
