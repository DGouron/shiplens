import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class SlackWebhookNotConfiguredError extends BusinessRuleViolation {
  constructor() {
    super(
      "Aucun webhook Slack n'est configuré pour cette équipe. Veuillez en ajouter un dans les paramètres de notification.",
    );
  }
}

export class InvalidSlackWebhookUrlError extends BusinessRuleViolation {
  constructor() {
    super(
      "L'adresse du webhook Slack est invalide. Veuillez vérifier le format.",
    );
  }
}

export class ReportNotGeneratedError extends BusinessRuleViolation {
  constructor() {
    super(
      "Le rapport de sprint n'a pas encore été généré. Impossible d'envoyer la notification.",
    );
  }
}

export class SlackDeliveryFailedError extends BusinessRuleViolation {
  constructor() {
    super(
      "L'envoi vers Slack a échoué. Veuillez vérifier la configuration du webhook ou réessayer plus tard.",
    );
  }
}
