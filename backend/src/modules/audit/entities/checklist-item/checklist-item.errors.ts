import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class MissingChecklistItemIdentifierError extends BusinessRuleViolation {
  constructor() {
    super("L'identifiant de l'element de checklist est obligatoire.");
  }
}

export class MissingChecklistItemNameError extends BusinessRuleViolation {
  constructor() {
    super("Le nom de l'element de checklist est obligatoire.");
  }
}
