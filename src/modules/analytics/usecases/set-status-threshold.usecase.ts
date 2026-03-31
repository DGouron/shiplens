import { Injectable } from '@nestjs/common';
import { type Usecase } from '@shared/foundation/usecase/usecase.js';
import { StatusThresholdGateway } from '../entities/status-threshold/status-threshold.gateway.js';
import { StatusThreshold } from '../entities/status-threshold/status-threshold.js';

interface SetStatusThresholdParams {
  statusName: string;
  thresholdHours: number;
}

@Injectable()
export class SetStatusThresholdUsecase
  implements Usecase<SetStatusThresholdParams, void>
{
  constructor(
    private readonly statusThresholdGateway: StatusThresholdGateway,
  ) {}

  async execute(params: SetStatusThresholdParams): Promise<void> {
    const existing = await this.statusThresholdGateway.findByStatusName(
      params.statusName,
    );

    const threshold = StatusThreshold.create({
      id: existing?.id ?? crypto.randomUUID(),
      statusName: params.statusName,
      thresholdHours: params.thresholdHours,
    });

    await this.statusThresholdGateway.save(threshold);
  }
}
