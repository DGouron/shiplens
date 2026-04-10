import { type StatusThreshold } from './status-threshold.js';

export abstract class StatusThresholdGateway {
  abstract findByStatusName(
    statusName: string,
  ): Promise<StatusThreshold | null>;
  abstract findAll(): Promise<StatusThreshold[]>;
  abstract save(threshold: StatusThreshold): Promise<void>;
}
