import { ApplicationRuleViolation } from '@/shared/foundation/application-rule-violation.ts';

export class NoTeamsAvailableInWorkspace extends ApplicationRuleViolation {
  constructor() {
    super('No teams available in workspace');
  }
}
