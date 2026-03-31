import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class CycleNotCompletedError extends BusinessRuleViolation {
  constructor() {
    super('Les métriques ne sont disponibles que pour les cycles terminés.');
  }
}

export class NoCycleIssuesError extends BusinessRuleViolation {
  constructor() {
    super(
      'Ce cycle ne contient aucune issue. Impossible de calculer les métriques.',
    );
  }
}

export class InsufficientHistoryError extends BusinessRuleViolation {
  constructor() {
    super(
      "Pas assez d'historique pour afficher la tendance. Minimum 3 cycles terminés requis.",
    );
  }
}
