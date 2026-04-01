import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class AlertChannelNotConfiguredError extends BusinessRuleViolation {
  constructor() {
    super(
      "Aucun canal Slack n'est configuré pour les alertes de cette équipe.",
    );
  }
}

export class SlackAlertDeliveryFailedError extends BusinessRuleViolation {
  constructor() {
    super(
      "L'envoi de l'alerte vers Slack a échoué. Veuillez vérifier la configuration du canal.",
    );
  }
}
