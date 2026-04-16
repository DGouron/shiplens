import { type BottleneckAnalysisResponse } from './bottleneck-analysis.response.ts';

export interface FetchBottleneckAnalysisParams {
  teamId: string;
  cycleId: string;
}

export abstract class BottleneckAnalysisGateway {
  abstract fetchBottleneckAnalysis(
    params: FetchBottleneckAnalysisParams,
  ): Promise<BottleneckAnalysisResponse>;
}
