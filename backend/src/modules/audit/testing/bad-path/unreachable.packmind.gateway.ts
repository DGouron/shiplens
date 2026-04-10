import { GatewayError } from '@shared/foundation/gateway-error.js';
import { PackmindGateway } from '../../entities/packmind/packmind.gateway.js';
import { type PackmindPractice } from '../../entities/packmind/packmind-practice.js';

export class UnreachablePackmindGateway extends PackmindGateway {
  async fetchPractices(_token: string): Promise<PackmindPractice[]> {
    throw new GatewayError('Packmind est injoignable.');
  }
}
