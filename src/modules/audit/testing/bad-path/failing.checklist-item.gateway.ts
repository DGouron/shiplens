import { ChecklistItemGateway } from '../../entities/checklist-item/checklist-item.gateway.js';
import { type ChecklistItem } from '../../entities/checklist-item/checklist-item.js';
import { GatewayError } from '@shared/foundation/gateway-error.js';

export class FailingChecklistItemGateway extends ChecklistItemGateway {
  async save(_item: ChecklistItem): Promise<void> {
    throw new GatewayError('Impossible de sauvegarder les elements de checklist.');
  }

  async findAll(): Promise<ChecklistItem[]> {
    throw new GatewayError('Impossible de lire les elements de checklist.');
  }
}
