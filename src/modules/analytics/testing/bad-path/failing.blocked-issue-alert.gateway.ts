import { GatewayError } from '@shared/foundation/gateway-error.js';
import { BlockedIssueAlertGateway } from '../../entities/blocked-issue-alert/blocked-issue-alert.gateway.js';
import { type BlockedIssueAlert } from '../../entities/blocked-issue-alert/blocked-issue-alert.js';

export class FailingBlockedIssueAlertGateway extends BlockedIssueAlertGateway {
  async findAllActive(): Promise<BlockedIssueAlert[]> {
    throw new GatewayError('Gateway error: unable to fetch active alerts');
  }

  async findAll(): Promise<BlockedIssueAlert[]> {
    throw new GatewayError('Gateway error: unable to fetch alerts');
  }

  async save(): Promise<void> {
    throw new GatewayError('Gateway error: unable to save alert');
  }

  async saveMany(): Promise<void> {
    throw new GatewayError('Gateway error: unable to save alerts');
  }
}
