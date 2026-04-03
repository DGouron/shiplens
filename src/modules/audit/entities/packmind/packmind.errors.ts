import { ApplicationRuleViolation } from '@shared/foundation/application-rule-violation.js';

export class InvalidPackmindTokenError extends ApplicationRuleViolation {
  constructor() {
    super(
      'Le token Packmind est invalide. Veuillez verifier votre configuration.',
    );
  }
}

export class MissingPackmindTokenError extends ApplicationRuleViolation {
  constructor() {
    super(
      "Aucun token Packmind configure. Veuillez renseigner votre token d'authentification.",
    );
  }
}

export class NoPracticesFoundError extends ApplicationRuleViolation {
  constructor() {
    super('Aucune pratique trouvee dans votre espace Packmind.');
  }
}

export class PackmindUnreachableWithoutCacheError extends ApplicationRuleViolation {
  constructor() {
    super(
      "Packmind est injoignable et aucune regle n'a ete synchronisee precedemment.",
    );
  }
}
