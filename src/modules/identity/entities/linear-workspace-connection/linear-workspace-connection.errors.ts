import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class LinearConnectionRefusedError extends BusinessRuleViolation {
  constructor() {
    super('La connexion à Linear a été refusée. Veuillez réessayer.');
  }
}

export class InsufficientLinearPermissionsError extends BusinessRuleViolation {
  constructor() {
    super(
      'Les permissions accordées sont insuffisantes. Veuillez autoriser tous les accès demandés.',
    );
  }
}

export class LinearSessionExpiredError extends BusinessRuleViolation {
  constructor() {
    super('Votre session Linear a expiré. Veuillez vous reconnecter.');
  }
}

export class NoLinearConnectionError extends BusinessRuleViolation {
  constructor() {
    super('Aucun workspace Linear n\'est connecté.');
  }
}

export class InvalidLinearApiKeyError extends BusinessRuleViolation {
  constructor() {
    super('La clé API Linear est invalide ou inaccessible.');
  }
}
