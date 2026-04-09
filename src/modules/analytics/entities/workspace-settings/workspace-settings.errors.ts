import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation.js';

export class UnsupportedLocaleError extends BusinessRuleViolation {
  constructor(locale: string) {
    super(`Unsupported locale: ${locale}. Supported locales: en, fr`);
  }
}
