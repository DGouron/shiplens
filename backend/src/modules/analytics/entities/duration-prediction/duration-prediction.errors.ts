import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class InsufficientHistoryError extends BusinessRuleViolation {
  constructor() {
    super(
      "Pas assez d'historique pour activer les prédictions. Minimum 2 cycles terminés requis.",
    );
  }
}

export class NoSimilarIssuesError extends BusinessRuleViolation {
  constructor() {
    super(
      "Aucune issue similaire trouvée dans l'historique. Impossible de prédire la durée.",
    );
  }
}
