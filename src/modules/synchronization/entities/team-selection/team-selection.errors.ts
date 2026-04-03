import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class NoTeamSelectedError extends BusinessRuleViolation {
  constructor() {
    super('Veuillez sélectionner au moins une équipe.');
  }
}

export class WorkspaceNotConnectedError extends BusinessRuleViolation {
  constructor() {
    super("Veuillez d'abord connecter votre workspace Linear.");
  }
}

export class NoTeamsFoundError extends BusinessRuleViolation {
  constructor() {
    super('Aucune équipe trouvée dans votre workspace Linear.');
  }
}
