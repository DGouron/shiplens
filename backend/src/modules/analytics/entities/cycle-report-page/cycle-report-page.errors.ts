import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class DataNotSynchronizedError extends BusinessRuleViolation {
  constructor() {
    super(
      'Les données de ce cycle ne sont pas encore synchronisées. Veuillez lancer la synchronisation.',
    );
  }
}
