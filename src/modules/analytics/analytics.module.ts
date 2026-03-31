import { Module } from '@nestjs/common';
import { CycleMetricsController } from './interface-adapters/controllers/cycle-metrics.controller.js';
import { CalculateCycleMetricsUsecase } from './usecases/calculate-cycle-metrics.usecase.js';
import { CycleMetricsPresenter } from './interface-adapters/presenters/cycle-metrics.presenter.js';
import { CycleMetricsDataGateway } from './entities/cycle-snapshot/cycle-metrics-data.gateway.js';
import { CycleMetricsDataInPrismaGateway } from './interface-adapters/gateways/cycle-metrics-data.in-prisma.gateway.js';

@Module({
  controllers: [CycleMetricsController],
  providers: [
    CalculateCycleMetricsUsecase,
    CycleMetricsPresenter,
    {
      provide: CycleMetricsDataGateway,
      useClass: CycleMetricsDataInPrismaGateway,
    },
  ],
})
export class AnalyticsModule {}
