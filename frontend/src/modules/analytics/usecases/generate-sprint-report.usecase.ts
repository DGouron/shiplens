import { type Usecase } from '@/shared/foundation/usecase/usecase.ts';
import {
  type GenerateSprintReportParams,
  type SprintReportGateway,
} from '../entities/sprint-report/sprint-report.gateway.ts';

export class GenerateSprintReportUsecase
  implements Usecase<GenerateSprintReportParams, void>
{
  constructor(private readonly gateway: SprintReportGateway) {}

  async execute(params: GenerateSprintReportParams): Promise<void> {
    await this.gateway.generate(params);
  }
}
