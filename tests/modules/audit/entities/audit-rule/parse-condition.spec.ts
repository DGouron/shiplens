import { describe, it, expect } from 'vitest';
import { parseCondition } from '@modules/audit/entities/audit-rule/parse-condition.js';
import { InvalidConditionError } from '@modules/audit/entities/audit-rule/audit-rule.errors.js';

describe('parseCondition', () => {
  describe('threshold conditions', () => {
    it('parses "cycle time > 5 jours" as threshold condition', () => {
      const condition = parseCondition('cycle time > 5 jours');

      expect(condition).toEqual({
        type: 'threshold',
        metric: 'cycle time',
        operator: '>',
        value: 5,
        unit: 'jours',
      });
    });

    it('parses "lead time > 10 jours" as threshold condition', () => {
      const condition = parseCondition('lead time > 10 jours');

      expect(condition).toEqual({
        type: 'threshold',
        metric: 'lead time',
        operator: '>',
        value: 10,
        unit: 'jours',
      });
    });

    it('parses "throughput < 5" as threshold condition without unit', () => {
      const condition = parseCondition('throughput < 5');

      expect(condition).toEqual({
        type: 'threshold',
        metric: 'throughput',
        operator: '<',
        value: 5,
        unit: undefined,
      });
    });
  });

  describe('ratio conditions', () => {
    it('parses "ratio bugs/features > 0.5" as ratio condition', () => {
      const condition = parseCondition('ratio bugs/features > 0.5');

      expect(condition).toEqual({
        type: 'ratio',
        numerator: 'bugs',
        denominator: 'features',
        operator: '>',
        value: 0.5,
      });
    });
  });

  describe('pattern conditions', () => {
    it('parses "label contains urgent" as pattern condition', () => {
      const condition = parseCondition('label contains urgent');

      expect(condition).toEqual({
        type: 'pattern',
        target: 'label',
        matcher: 'contains',
        value: 'urgent',
      });
    });

    it('parses "status equals done" as pattern condition', () => {
      const condition = parseCondition('status equals done');

      expect(condition).toEqual({
        type: 'pattern',
        target: 'status',
        matcher: 'equals',
        value: 'done',
      });
    });
  });

  describe('invalid conditions', () => {
    it('throws InvalidConditionError for unrecognized format', () => {
      expect(() => parseCondition('texte libre incomprehensible')).toThrow(
        InvalidConditionError,
      );
      expect(() => parseCondition('texte libre incomprehensible')).toThrow(
        "La condition de la regle n'est pas reconnue. Formats acceptes : seuil sur metrique, pattern sur labels/statuts, ratio entre metriques.",
      );
    });
  });
});
