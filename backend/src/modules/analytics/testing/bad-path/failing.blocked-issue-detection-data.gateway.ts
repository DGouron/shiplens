import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  BlockedIssueDetectionDataGateway,
  type IssueWithCurrentStatus,
} from '../../entities/blocked-issue-alert/blocked-issue-detection-data.gateway.js';

export class FailingBlockedIssueDetectionDataGateway extends BlockedIssueDetectionDataGateway {
  async hasSynchronizedData(): Promise<boolean> {
    throw new GatewayError('Gateway error: unable to check synchronized data');
  }

  async getIssuesWithCurrentStatus(): Promise<IssueWithCurrentStatus[]> {
    throw new GatewayError('Gateway error: unable to fetch issues');
  }
}
