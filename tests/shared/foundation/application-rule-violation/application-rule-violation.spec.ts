import { describe, expect, it } from 'vitest';
import { ApplicationRuleViolation } from '@shared/foundation/application-rule-violation';

class TestApplicationRuleViolation extends ApplicationRuleViolation {
  constructor() {
    super('test application error');
  }
}

describe('ApplicationRuleViolation', () => {
  it('should be an instance of Error', () => {
    const error = new TestApplicationRuleViolation();
    expect(error).toBeInstanceOf(Error);
  });

  it('should be an instance of ApplicationRuleViolation', () => {
    const error = new TestApplicationRuleViolation();
    expect(error).toBeInstanceOf(ApplicationRuleViolation);
  });

  it('should set name to the concrete class name', () => {
    const error = new TestApplicationRuleViolation();
    expect(error.name).toBe('TestApplicationRuleViolation');
  });

  it('should carry the correct message', () => {
    const error = new TestApplicationRuleViolation();
    expect(error.message).toBe('test application error');
  });
});
