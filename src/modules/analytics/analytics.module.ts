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
import { CycleReportPageController } from './interface-adapters/controllers/cycle-report-page.controller.js';
import { ListTeamCyclesUsecase } from './usecases/list-team-cycles.usecase.js';
import { GetCycleIssuesUsecase } from './usecases/get-cycle-issues.usecase.js';
import { TeamCyclesPresenter } from './interface-adapters/presenters/team-cycles.presenter.js';
import { CycleIssuesPresenter } from './interface-adapters/presenters/cycle-issues.presenter.js';
import { CycleReportPageDataGateway } from './entities/cycle-report-page/cycle-report-page-data.gateway.js';
import { CycleReportPageDataInPrismaGateway } from './interface-adapters/gateways/cycle-report-page-data.in-prisma.gateway.js';
import { WorkspaceDashboardController } from './interface-adapters/controllers/workspace-dashboard.controller.js';
import { GetWorkspaceDashboardUsecase } from './usecases/get-workspace-dashboard.usecase.js';
import { WorkspaceDashboardPresenter } from './interface-adapters/presenters/workspace-dashboard.presenter.js';
import { WorkspaceDashboardDataGateway } from './entities/workspace-dashboard/workspace-dashboard-data.gateway.js';
import { WorkspaceDashboardDataInPrismaGateway } from './interface-adapters/gateways/workspace-dashboard-data.in-prisma.gateway.js';

@Module({
  controllers: [CycleMetricsController, SprintReportController, CycleReportPageController, WorkspaceDashboardController],
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
    ListTeamCyclesUsecase,
    GetCycleIssuesUsecase,
    TeamCyclesPresenter,
    CycleIssuesPresenter,
    {
      provide: CycleReportPageDataGateway,
      useClass: CycleReportPageDataInPrismaGateway,
    },
    GetWorkspaceDashboardUsecase,
    WorkspaceDashboardPresenter,
    {
      provide: WorkspaceDashboardDataGateway,
      useClass: WorkspaceDashboardDataInPrismaGateway,
    },
  ],
})
export class AnalyticsModule {}
