import { BlockedIssueAlertGateway } from '../../entities/blocked-issue-alert/blocked-issue-alert.gateway.js';
import { type BlockedIssueAlert } from '../../entities/blocked-issue-alert/blocked-issue-alert.js';

export class StubBlockedIssueAlertGateway extends BlockedIssueAlertGateway {
  alerts: BlockedIssueAlert[] = [];

  async findAllActive(): Promise<BlockedIssueAlert[]> {
    return this.alerts.filter((alert) => alert.active);
  }

  async findAll(): Promise<BlockedIssueAlert[]> {
    return this.alerts;
  }

  async save(alert: BlockedIssueAlert): Promise<void> {
    const existingIndex = this.alerts.findIndex((a) => a.id === alert.id);
    if (existingIndex >= 0) {
      this.alerts[existingIndex] = alert;
    } else {
      this.alerts.push(alert);
    }
  }

  async saveMany(alerts: BlockedIssueAlert[]): Promise<void> {
    for (const alert of alerts) {
      await this.save(alert);
    }
  }
}
