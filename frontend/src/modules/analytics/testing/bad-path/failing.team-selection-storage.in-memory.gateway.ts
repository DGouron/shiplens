import { GatewayError } from '@/shared/foundation/gateway-error.ts';
import { TeamSelectionStorageGateway } from '../../entities/team-selection/team-selection.gateway.ts';

export class FailingTeamSelectionStorageGateway extends TeamSelectionStorageGateway {
  read(): never {
    throw new GatewayError('localStorage unavailable');
  }

  write(): never {
    throw new GatewayError('localStorage unavailable');
  }
}
