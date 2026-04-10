import { type BlockedIssueAlert } from './blocked-issue-alert.js';

export abstract class BlockedIssueAlertGateway {
  abstract findAllActive(): Promise<BlockedIssueAlert[]>;
  abstract findAll(): Promise<BlockedIssueAlert[]>;
  abstract save(alert: BlockedIssueAlert): Promise<void>;
  abstract saveMany(alerts: BlockedIssueAlert[]): Promise<void>;
}
