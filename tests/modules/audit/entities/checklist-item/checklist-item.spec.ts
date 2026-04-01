import { describe, it, expect } from 'vitest';
import { ChecklistItem } from '@modules/audit/entities/checklist-item/checklist-item.js';
import { MissingChecklistItemIdentifierError, MissingChecklistItemNameError } from '@modules/audit/entities/checklist-item/checklist-item.errors.js';

describe('ChecklistItem', () => {
  describe('creation', () => {
    it('creates a valid checklist item with identifier, name and origin', () => {
      const item = ChecklistItem.create({
        identifier: 'PM-COMMIT',
        name: 'Ecrire des messages de commit clairs',
        origin: 'packmind',
      });

      expect(item.identifier).toBe('PM-COMMIT');
      expect(item.name).toBe('Ecrire des messages de commit clairs');
      expect(item.origin).toBe('packmind');
    });

    it('throws when identifier is empty', () => {
      expect(() =>
        ChecklistItem.create({
          identifier: '',
          name: 'Some name',
          origin: 'packmind',
        }),
      ).toThrow(MissingChecklistItemIdentifierError);
    });

    it('throws when name is empty', () => {
      expect(() =>
        ChecklistItem.create({
          identifier: 'PM-1',
          name: '',
          origin: 'packmind',
        }),
      ).toThrow(MissingChecklistItemNameError);
    });
  });
});
