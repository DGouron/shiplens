import { type PackmindPractice } from './packmind-practice.js';

export abstract class PackmindGateway {
  abstract fetchPractices(token: string): Promise<PackmindPractice[]>;
}
