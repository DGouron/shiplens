import { createGuard } from '@shared/foundation/guard/guard';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const PersonSchema = z.object({
  name: z.string(),
  age: z.number(),
});

type Person = z.infer<typeof PersonSchema>;

const personGuard = createGuard<Person>(PersonSchema, 'Person');

describe('createGuard', () => {
  describe('isValid', () => {
    it('should return true for valid data', () => {
      expect(personGuard.isValid({ name: 'Alice', age: 30 })).toBe(true);
    });

    it('should return false for invalid data', () => {
      expect(personGuard.isValid({ name: 'Alice' })).toBe(false);
    });
  });

  describe('parse', () => {
    it('should return parsed data for valid input', () => {
      const result = personGuard.parse({ name: 'Alice', age: 30 });
      expect(result).toEqual({ name: 'Alice', age: 30 });
    });

    it('should throw for invalid input', () => {
      expect(() => personGuard.parse({ name: 42 })).toThrow(
        '[Person] Validation failed',
      );
    });
  });

  describe('safeParse', () => {
    it('should return success for valid data', () => {
      const result = personGuard.safeParse({ name: 'Alice', age: 30 });
      expect(result.success).toBe(true);
    });

    it('should return failure for invalid data', () => {
      const result = personGuard.safeParse({ name: 42 });
      expect(result.success).toBe(false);
    });
  });

  describe('isValidCollection', () => {
    it('should return true for a valid array', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      expect(personGuard.isValidCollection(data)).toBe(true);
    });

    it('should return false if any item is invalid', () => {
      const data = [{ name: 'Alice', age: 30 }, { name: 'Bob' }];
      expect(personGuard.isValidCollection(data)).toBe(false);
    });
  });

  describe('parseCollection', () => {
    it('should return parsed array for valid input', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      expect(personGuard.parseCollection(data)).toEqual(data);
    });

    it('should throw for invalid collection', () => {
      expect(() => personGuard.parseCollection([{ name: 'Alice' }])).toThrow(
        '[Person] Collection validation failed',
      );
    });
  });

  describe('filterCollection', () => {
    it('should separate valid and rejected items', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob' },
        { name: 'Charlie', age: 20 },
      ];
      const result = personGuard.filterCollection(data);

      expect(result.valid).toHaveLength(2);
      expect(result.valid[0].name).toBe('Alice');
      expect(result.valid[1].name).toBe('Charlie');
      expect(result.rejected).toHaveLength(1);
      expect(result.rejected[0].rawData).toEqual({ name: 'Bob' });
    });

    it('should return all valid when all items pass', () => {
      const data = [
        { name: 'Alice', age: 30 },
        { name: 'Bob', age: 25 },
      ];
      const result = personGuard.filterCollection(data);

      expect(result.valid).toHaveLength(2);
      expect(result.rejected).toHaveLength(0);
    });
  });
});
