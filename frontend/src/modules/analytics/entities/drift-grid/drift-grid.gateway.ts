import { type DriftGridResponse } from './drift-grid.response.ts';

export abstract class DriftGridGateway {
  abstract getEntries(): Promise<DriftGridResponse>;
}
