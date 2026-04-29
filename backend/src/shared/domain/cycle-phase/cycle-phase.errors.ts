import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class InvalidCyclePhaseRangeError extends BusinessRuleViolation {
  constructor() {
    super('Cycle phase requires endsAt strictly after startsAt.');
  }
}
