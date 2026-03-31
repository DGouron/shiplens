import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class WorkspaceNotConnectedError extends BusinessRuleViolation {
  constructor() {
    super('Aucun workspace connecté. Veuillez connecter votre workspace Linear.');
  }
}

export class NoTeamsSynchronizedError extends BusinessRuleViolation {
  constructor() {
    super(
      'Aucune équipe synchronisée. Veuillez d\'abord sélectionner des équipes à synchroniser.',
    );
  }
}
