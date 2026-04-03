import { InvalidConditionError } from './audit-rule.errors.js';
import {
  type Condition,
  patternConditionSchema,
  ratioConditionSchema,
  thresholdConditionSchema,
} from './condition.schema.js';

const THRESHOLD_PATTERN = /^(.+?)\s*(>|<|>=|<=)\s*(\d+(?:\.\d+)?)\s*(.+)?$/;
const RATIO_PATTERN = /^ratio\s+(\w+)\/(\w+)\s*(>|<|>=|<=)\s*(\d+(?:\.\d+)?)$/;
const PATTERN_PATTERN = /^(label|status)\s+(contains|equals)\s+(.+)$/;

export function parseCondition(expression: string): Condition {
  const ratioMatch = expression.match(RATIO_PATTERN);
  if (ratioMatch) {
    return ratioConditionSchema.parse({
      type: 'ratio',
      numerator: ratioMatch[1],
      denominator: ratioMatch[2],
      operator: ratioMatch[3],
      value: Number(ratioMatch[4]),
    });
  }

  const patternMatch = expression.match(PATTERN_PATTERN);
  if (patternMatch) {
    return patternConditionSchema.parse({
      type: 'pattern',
      target: patternMatch[1],
      matcher: patternMatch[2],
      value: patternMatch[3],
    });
  }

  const thresholdMatch = expression.match(THRESHOLD_PATTERN);
  if (thresholdMatch) {
    return thresholdConditionSchema.parse({
      type: 'threshold',
      metric: thresholdMatch[1].trim(),
      operator: thresholdMatch[2],
      value: Number(thresholdMatch[3]),
      unit: thresholdMatch[4]?.trim(),
    });
  }

  throw new InvalidConditionError();
}
