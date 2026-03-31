import { StatusThresholdGateway } from '../../entities/status-threshold/status-threshold.gateway.js';
import { type StatusThreshold } from '../../entities/status-threshold/status-threshold.js';

export class StubStatusThresholdGateway extends StatusThresholdGateway {
  thresholds: StatusThreshold[] = [];

  async findByStatusName(statusName: string): Promise<StatusThreshold | null> {
    return this.thresholds.find((t) => t.statusName === statusName) ?? null;
  }

  async findAll(): Promise<StatusThreshold[]> {
    return this.thresholds;
  }

  async save(threshold: StatusThreshold): Promise<void> {
    const existingIndex = this.thresholds.findIndex(
      (t) => t.statusName === threshold.statusName,
    );
    if (existingIndex >= 0) {
      this.thresholds[existingIndex] = threshold;
    } else {
      this.thresholds.push(threshold);
    }
  }
}
