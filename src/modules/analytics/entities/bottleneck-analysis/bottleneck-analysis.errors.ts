import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class NoCompletedIssuesError extends BusinessRuleViolation {
  constructor() {
    super(
      "Aucune issue terminée sur cette période. L'analyse nécessite au moins une issue complétée.",
    );
  }
}

export class NoSynchronizedDataError extends BusinessRuleViolation {
  constructor() {
    super('Veuillez d\'abord synchroniser vos données Linear.');
  }
}
