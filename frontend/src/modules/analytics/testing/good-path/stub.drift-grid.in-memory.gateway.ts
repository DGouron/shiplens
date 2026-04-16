import { DriftGridGateway } from '../../entities/drift-grid/drift-grid.gateway.ts';
import { type DriftGridResponse } from '../../entities/drift-grid/drift-grid.response.ts';

export class StubDriftGridGateway extends DriftGridGateway {
  entries: DriftGridResponse = [
    { points: 1, maxBusinessHours: 4 },
    { points: 2, maxBusinessHours: 6 },
    { points: 3, maxBusinessHours: 8 },
    { points: 5, maxBusinessHours: 20 },
  ];

  async getEntries(): Promise<DriftGridResponse> {
    return this.entries;
  }
}
