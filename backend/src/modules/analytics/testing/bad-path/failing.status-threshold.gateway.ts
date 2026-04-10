import { GatewayError } from '@shared/foundation/gateway-error.js';
import { StatusThresholdGateway } from '../../entities/status-threshold/status-threshold.gateway.js';
import { type StatusThreshold } from '../../entities/status-threshold/status-threshold.js';

export class FailingStatusThresholdGateway extends StatusThresholdGateway {
  async findByStatusName(): Promise<StatusThreshold | null> {
    throw new GatewayError('Gateway error: unable to fetch status threshold');
  }

  async findAll(): Promise<StatusThreshold[]> {
    throw new GatewayError('Gateway error: unable to fetch status thresholds');
  }

  async save(): Promise<void> {
    throw new GatewayError('Gateway error: unable to save status threshold');
  }
}
