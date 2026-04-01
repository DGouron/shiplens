import { ChecklistItemGateway } from '../../entities/checklist-item/checklist-item.gateway.js';
import { type ChecklistItem } from '../../entities/checklist-item/checklist-item.js';

export class StubChecklistItemGateway extends ChecklistItemGateway {
  items: Map<string, ChecklistItem> = new Map();

  async save(item: ChecklistItem): Promise<void> {
    this.items.set(item.identifier, item);
  }

  async findAll(): Promise<ChecklistItem[]> {
    return Array.from(this.items.values());
  }
}
