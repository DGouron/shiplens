import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class NoCompletedCyclesError extends BusinessRuleViolation {
  constructor() {
    super('No data available for this member');
  }
}
