import { describe, expect, it } from 'vitest';
import { BusinessRuleViolation } from '@shared/foundation/business-rule-violation';

class TestBusinessRuleViolation extends BusinessRuleViolation {
  constructor() {
    super('test violation message');
  }
}

describe('BusinessRuleViolation', () => {
  it('should be an instance of Error', () => {
    const error = new TestBusinessRuleViolation();
    expect(error).toBeInstanceOf(Error);
  });

  it('should be an instance of BusinessRuleViolation', () => {
    const error = new TestBusinessRuleViolation();
    expect(error).toBeInstanceOf(BusinessRuleViolation);
  });

  it('should set name to the concrete class name', () => {
    const error = new TestBusinessRuleViolation();
    expect(error.name).toBe('TestBusinessRuleViolation');
  });

  it('should carry the correct message', () => {
    const error = new TestBusinessRuleViolation();
    expect(error.message).toBe('test violation message');
  });
});
