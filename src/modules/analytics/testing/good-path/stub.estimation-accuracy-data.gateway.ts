import { EstimationAccuracyDataGateway } from '../../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { type EstimationAccuracyProps } from '../../entities/estimation-accuracy/estimation-accuracy.schema.js';

export class StubEstimationAccuracyDataGateway extends EstimationAccuracyDataGateway {
  estimationData: EstimationAccuracyProps = {
    cycleId: 'cycle-1',
    teamId: 'team-1',
    issues: [],
    excludedWithoutEstimation: 0,
    excludedWithoutCycleTime: 0,
  };

  estimationDataByCycle: Record<string, EstimationAccuracyProps> = {};

  completedCycleIds: string[] = [];

  async getEstimationData(cycleId: string): Promise<EstimationAccuracyProps> {
    if (this.estimationDataByCycle[cycleId]) {
      return this.estimationDataByCycle[cycleId];
    }
    return this.estimationData;
  }

  async getCompletedCycleIds(): Promise<string[]> {
    return this.completedCycleIds;
  }
}
