import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class InsufficientHistoryForTrendError extends BusinessRuleViolation {
  constructor() {
    super(
      "Pas assez d'historique pour afficher la tendance. Minimum 2 cycles terminés requis.",
    );
  }
}
