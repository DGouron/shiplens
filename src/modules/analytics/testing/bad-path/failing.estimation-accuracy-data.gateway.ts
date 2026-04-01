import { EstimationAccuracyDataGateway } from '../../entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { type EstimationAccuracyProps } from '../../entities/estimation-accuracy/estimation-accuracy.schema.js';

export class FailingEstimationAccuracyDataGateway extends EstimationAccuracyDataGateway {
  async getEstimationData(): Promise<EstimationAccuracyProps> {
    throw new Error('Gateway error: unable to fetch estimation data');
  }

  async getCompletedCycleIds(): Promise<string[]> {
    throw new Error('Gateway error: unable to fetch completed cycle ids');
  }
}
