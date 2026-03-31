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
import { ReportExportController } from './interface-adapters/controllers/report-export.controller.js';
import { BottleneckAnalysisController } from './interface-adapters/controllers/bottleneck-analysis.controller.js';
import { AnalyzeBottlenecksByStatusUsecase } from './usecases/analyze-bottlenecks-by-status.usecase.js';
import { BottleneckAnalysisPresenter } from './interface-adapters/presenters/bottleneck-analysis.presenter.js';
import { BottleneckAnalysisDataGateway } from './entities/bottleneck-analysis/bottleneck-analysis-data.gateway.js';
import { BottleneckAnalysisDataInPrismaGateway } from './interface-adapters/gateways/bottleneck-analysis-data.in-prisma.gateway.js';
import { ListTeamReportsUsecase } from './usecases/list-team-reports.usecase.js';
import { GetReportUsecase } from './usecases/get-report.usecase.js';
import { ReportHistoryPresenter } from './interface-adapters/presenters/report-history.presenter.js';
import { ReportDetailPresenter } from './interface-adapters/presenters/report-detail.presenter.js';
import { SprintReportGateway } from './entities/sprint-report/sprint-report.gateway.js';
import { SprintReportInPrismaGateway } from './interface-adapters/gateways/sprint-report.in-prisma.gateway.js';
import { BlockedIssuesController } from './interface-adapters/controllers/blocked-issues.controller.js';
import { BlockedIssueDetectionScheduler } from './interface-adapters/controllers/blocked-issue-detection.scheduler.js';
import { DetectBlockedIssuesUsecase } from './usecases/detect-blocked-issues.usecase.js';
import { GetBlockedIssuesUsecase } from './usecases/get-blocked-issues.usecase.js';
import { GetAlertHistoryUsecase } from './usecases/get-alert-history.usecase.js';
import { SetStatusThresholdUsecase } from './usecases/set-status-threshold.usecase.js';
import { BlockedIssuesPresenter } from './interface-adapters/presenters/blocked-issues.presenter.js';
import { AlertHistoryPresenter } from './interface-adapters/presenters/alert-history.presenter.js';
import { StatusThresholdGateway } from './entities/status-threshold/status-threshold.gateway.js';
import { StatusThresholdInPrismaGateway } from './interface-adapters/gateways/status-threshold.in-prisma.gateway.js';
import { BlockedIssueAlertGateway } from './entities/blocked-issue-alert/blocked-issue-alert.gateway.js';
import { BlockedIssueAlertInPrismaGateway } from './interface-adapters/gateways/blocked-issue-alert.in-prisma.gateway.js';
import { BlockedIssueDetectionDataGateway } from './entities/blocked-issue-alert/blocked-issue-detection-data.gateway.js';
import { BlockedIssueDetectionDataInPrismaGateway } from './interface-adapters/gateways/blocked-issue-detection-data.in-prisma.gateway.js';

@Module({
  controllers: [CycleMetricsController, SprintReportController, ReportExportController, CycleReportPageController, WorkspaceDashboardController, BottleneckAnalysisController, BlockedIssuesController],
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
    {
      provide: SprintReportGateway,
      useClass: SprintReportInPrismaGateway,
    },
    ListTeamReportsUsecase,
    GetReportUsecase,
    ReportHistoryPresenter,
    ReportDetailPresenter,
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
    AnalyzeBottlenecksByStatusUsecase,
    BottleneckAnalysisPresenter,
    {
      provide: BottleneckAnalysisDataGateway,
      useClass: BottleneckAnalysisDataInPrismaGateway,
    },
    DetectBlockedIssuesUsecase,
    GetBlockedIssuesUsecase,
    GetAlertHistoryUsecase,
    SetStatusThresholdUsecase,
    BlockedIssuesPresenter,
    AlertHistoryPresenter,
    BlockedIssueDetectionScheduler,
    {
      provide: StatusThresholdGateway,
      useClass: StatusThresholdInPrismaGateway,
    },
    {
      provide: BlockedIssueAlertGateway,
      useClass: BlockedIssueAlertInPrismaGateway,
    },
    {
      provide: BlockedIssueDetectionDataGateway,
      useClass: BlockedIssueDetectionDataInPrismaGateway,
    },
  ],
})
export class AnalyticsModule {}
