import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import { type DriftGridGateway } from '../entities/drift-grid/drift-grid.gateway.ts';
import { type DriftGridResponse } from '../entities/drift-grid/drift-grid.response.ts';

export class GetDriftGridEntriesUsecase
  implements Usecase<void, DriftGridResponse>
{
  constructor(private readonly gateway: DriftGridGateway) {}

  async execute(): Promise<DriftGridResponse> {
    return this.gateway.getEntries();
  }
}
