import { StatusThresholdGateway } from '../../entities/status-threshold/status-threshold.gateway.js';
import { type StatusThreshold } from '../../entities/status-threshold/status-threshold.js';

export class FailingStatusThresholdGateway extends StatusThresholdGateway {
  async findByStatusName(): Promise<StatusThreshold | null> {
    throw new Error('Gateway error: unable to fetch status threshold');
  }

  async findAll(): Promise<StatusThreshold[]> {
    throw new Error('Gateway error: unable to fetch status thresholds');
  }

  async save(): Promise<void> {
    throw new Error('Gateway error: unable to save status threshold');
  }
}
