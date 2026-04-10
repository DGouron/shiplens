import { GatewayError } from '@shared/foundation/gateway-error.js';
import {
  CycleMetricsDataGateway,
  type TrendData,
} from '../../entities/cycle-snapshot/cycle-metrics-data.gateway.js';
import { type CycleSnapshotProps } from '../../entities/cycle-snapshot/cycle-snapshot.schema.js';

export class FailingCycleMetricsDataGateway extends CycleMetricsDataGateway {
  async getSnapshotData(): Promise<CycleSnapshotProps> {
    throw new GatewayError('Gateway error: unable to fetch cycle data');
  }

  async getTrendData(): Promise<TrendData> {
    throw new GatewayError('Gateway error: unable to fetch trend data');
  }
}
