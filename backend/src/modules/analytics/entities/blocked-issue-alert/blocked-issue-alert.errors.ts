import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class NoSynchronizedDataError extends BusinessRuleViolation {
  constructor() {
    super("Veuillez d'abord synchroniser vos données Linear.");
  }
}
