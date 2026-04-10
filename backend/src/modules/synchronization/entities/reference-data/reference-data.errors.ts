import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class NoTeamSelectedForSyncError extends BusinessRuleViolation {
  constructor() {
    super(
      'Veuillez sélectionner au moins une équipe avant de lancer la synchronisation.',
    );
  }
}
