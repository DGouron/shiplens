import { PackmindGateway } from '../../entities/packmind/packmind.gateway.js';
import { type PackmindPractice } from '../../entities/packmind/packmind-practice.js';
import { InvalidPackmindTokenError } from '../../entities/packmind/packmind.errors.js';

export class FailingPackmindGateway extends PackmindGateway {
  async fetchPractices(_token: string): Promise<PackmindPractice[]> {
    throw new InvalidPackmindTokenError();
  }
}
