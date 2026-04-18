import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class InsufficientIssuesForThemeDetectionError extends BusinessRuleViolation {
  constructor() {
    super('Not enough issues for theme detection.');
  }
}
