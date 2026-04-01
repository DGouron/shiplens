import { PackmindGateway } from '../../entities/packmind/packmind.gateway.js';
import { type PackmindPractice } from '../../entities/packmind/packmind-practice.js';

export class StubPackmindGateway extends PackmindGateway {
  constructor(private readonly practices: PackmindPractice[]) {
    super();
  }

  async fetchPractices(_token: string): Promise<PackmindPractice[]> {
    return this.practices;
  }
}
