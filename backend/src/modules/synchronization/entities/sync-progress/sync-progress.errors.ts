import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class SyncAlreadyInProgressError extends BusinessRuleViolation {
  constructor() {
    super('Une synchronisation est déjà en cours pour cette équipe.');
  }
}
