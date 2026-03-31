import { Module } from '@nestjs/common';
import { CycleMetricsController } from './interface-adapters/controllers/cycle-metrics.controller.js';
import { CalculateCycleMetricsUsecase } from './usecases/calculate-cycle-metrics.usecase.js';
import { CycleMetricsPresenter } from './interface-adapters/presenters/cycle-metrics.presenter.js';
import { CycleMetricsDataGateway } from './entities/cycle-snapshot/cycle-metrics-data.gateway.js';
import { CycleMetricsDataInPrismaGateway } from './interface-adapters/gateways/cycle-metrics-data.in-prisma.gateway.js';
import { SprintReportController } from './interface-adapters/controllers/sprint-report.controller.js';
import { GenerateSprintReportUsecase } from './usecases/generate-sprint-report.usecase.js';
import { SprintReportPresenter } from './interface-adapters/presenters/sprint-report.presenter.js';
import { SprintReportDataGateway } from './entities/sprint-report/sprint-report-data.gateway.js';
import { SprintReportDataInPrismaGateway } from './interface-adapters/gateways/sprint-report-data.in-prisma.gateway.js';
import { AiTextGeneratorGateway } from './entities/sprint-report/ai-text-generator.gateway.js';
import { AiTextGeneratorWithProviderGateway } from './interface-adapters/gateways/ai-text-generator.with-provider.gateway.js';

@Module({
  controllers: [CycleMetricsController, SprintReportController],
  providers: [
    CalculateCycleMetricsUsecase,
    CycleMetricsPresenter,
    {
      provide: CycleMetricsDataGateway,
      useClass: CycleMetricsDataInPrismaGateway,
    },
    GenerateSprintReportUsecase,
    SprintReportPresenter,
    {
      provide: SprintReportDataGateway,
      useClass: SprintReportDataInPrismaGateway,
    },
    {
      provide: AiTextGeneratorGateway,
      useClass: AiTextGeneratorWithProviderGateway,
    },
  ],
})
export class AnalyticsModule {}
