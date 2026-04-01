import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';
import { ApplicationRuleViolation } from '@shared/foundation/application-rule-violation.js';

export class MissingIdentifierError extends BusinessRuleViolation {
  constructor() {
    super("L'identifiant de la regle est obligatoire.");
  }
}

export class InvalidSeverityError extends BusinessRuleViolation {
  constructor() {
    super('La severite doit etre info, warning ou error.');
  }
}

export class InvalidConditionError extends BusinessRuleViolation {
  constructor() {
    super(
      "La condition de la regle n'est pas reconnue. Formats acceptes : seuil sur metrique, pattern sur labels/statuts, ratio entre metriques.",
    );
  }
}

export class DuplicateIdentifierError extends ApplicationRuleViolation {
  constructor(identifier: string) {
    super(`Une regle avec l'identifiant ${identifier} existe deja.`);
  }
}

export class RuleNotFoundError extends ApplicationRuleViolation {
  constructor(identifier: string) {
    super(`La regle avec l'identifiant ${identifier} est introuvable.`);
  }
}

export class RulesDirectoryNotFoundError extends ApplicationRuleViolation {
  constructor() {
    super('Le dossier de regles configure est introuvable.');
  }
}
