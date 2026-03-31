import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class SprintNotSynchronizedError extends BusinessRuleViolation {
  constructor() {
    super(
      'Les données de ce sprint ne sont pas encore synchronisées. Veuillez lancer la synchronisation d\'abord.',
    );
  }
}

export class EmptySprintError extends BusinessRuleViolation {
  constructor() {
    super(
      'Ce sprint ne contient aucune issue. Impossible de générer un rapport.',
    );
  }
}

export class UnsupportedLanguageError extends BusinessRuleViolation {
  constructor() {
    super(
      'Cette langue n\'est pas encore supportée. Langues disponibles : français, anglais.',
    );
  }
}

export class AiProviderUnavailableError extends BusinessRuleViolation {
  constructor() {
    super(
      'Le fournisseur d\'IA sélectionné est indisponible. Veuillez réessayer ou choisir un autre fournisseur.',
    );
  }
}

export class ReportNotFoundError extends BusinessRuleViolation {
  constructor() {
    super('Ce rapport est introuvable.');
  }
}
