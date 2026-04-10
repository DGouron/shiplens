import { type ChecklistItem } from './checklist-item.js';

export abstract class ChecklistItemGateway {
  abstract save(item: ChecklistItem): Promise<void>;
  abstract findAll(): Promise<ChecklistItem[]>;
}
