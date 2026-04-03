import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class NoIssuesForMemberError extends BusinessRuleViolation {
  constructor() {
    super('Aucune issue trouvee pour ce membre sur ce cycle.');
  }
}
