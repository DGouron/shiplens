import { Module } from '@nestjs/common';
import { AuditModule } from '../audit/audit.module.js';
import { IdentityModule } from '../identity/identity.module.js';
import { BlockedIssueAlertGateway } from './entities/blocked-issue-alert/blocked-issue-alert.gateway.js';
import { BlockedIssueDetectionDataGateway } from './entities/blocked-issue-alert/blocked-issue-detection-data.gateway.js';
import { BottleneckAnalysisDataGateway } from './entities/bottleneck-analysis/bottleneck-analysis-data.gateway.js';
import { CycleReportPageDataGateway } from './entities/cycle-report-page/cycle-report-page-data.gateway.js';
import { CycleMetricsDataGateway } from './entities/cycle-snapshot/cycle-metrics-data.gateway.js';
import { DriftingIssueDetectionDataGateway } from './entities/drifting-issue/drifting-issue-detection-data.gateway.js';
import { DurationPredictionDataGateway } from './entities/duration-prediction/duration-prediction-data.gateway.js';
import { EstimationAccuracyDataGateway } from './entities/estimation-accuracy/estimation-accuracy-data.gateway.js';
import { MemberDigestDataGateway } from './entities/member-digest/member-digest-data.gateway.js';
import { MemberHealthDataGateway } from './entities/member-health/member-health-data.gateway.js';
import { AiTextGeneratorGateway } from './entities/sprint-report/ai-text-generator.gateway.js';
import { SprintReportGateway } from './entities/sprint-report/sprint-report.gateway.js';
import { SprintReportDataGateway } from './entities/sprint-report/sprint-report-data.gateway.js';
import { StatusThresholdGateway } from './entities/status-threshold/status-threshold.gateway.js';
import { AvailableStatusesGateway } from './entities/team-settings/available-statuses.gateway.js';
import { TeamSettingsGateway } from './entities/team-settings/team-settings.gateway.js';
import { TopCycleAssigneesDataGateway } from './entities/top-cycle-assignees/top-cycle-assignees-data.gateway.js';
import { TopCycleProjectsDataGateway } from './entities/top-cycle-projects/top-cycle-projects-data.gateway.js';
import { WorkflowConfigGateway } from './entities/workflow-config/workflow-config.gateway.js';
import { WorkspaceDashboardDataGateway } from './entities/workspace-dashboard/workspace-dashboard-data.gateway.js';
import { WorkspaceSettingsGateway } from './entities/workspace-settings/workspace-settings.gateway.js';
import { BlockedIssueDetectionScheduler } from './interface-adapters/controllers/blocked-issue-detection.scheduler.js';
import { BlockedIssuesController } from './interface-adapters/controllers/blocked-issues.controller.js';
import { BottleneckAnalysisController } from './interface-adapters/controllers/bottleneck-analysis.controller.js';
import { CycleMetricsController } from './interface-adapters/controllers/cycle-metrics.controller.js';
import { CycleReportPageController } from './interface-adapters/controllers/cycle-report-page.controller.js';
import { DriftingIssuesController } from './interface-adapters/controllers/drifting-issues.controller.js';
import { DurationPredictionController } from './interface-adapters/controllers/duration-prediction.controller.js';
import { EstimationAccuracyController } from './interface-adapters/controllers/estimation-accuracy.controller.js';
import { MemberDigestController } from './interface-adapters/controllers/member-digest.controller.js';
import { MemberHealthController } from './interface-adapters/controllers/member-health.controller.js';
import { ReportExportController } from './interface-adapters/controllers/report-export.controller.js';
import { SprintReportController } from './interface-adapters/controllers/sprint-report.controller.js';
import { TeamSettingsController } from './interface-adapters/controllers/team-settings.controller.js';
import { TopCycleAssigneesController } from './interface-adapters/controllers/top-cycle-assignees.controller.js';
import { TopCycleProjectsController } from './interface-adapters/controllers/top-cycle-projects.controller.js';
import { WorkflowConfigController } from './interface-adapters/controllers/workflow-config.controller.js';
import { WorkspaceDashboardController } from './interface-adapters/controllers/workspace-dashboard.controller.js';
import { WorkspaceLanguageController } from './interface-adapters/controllers/workspace-language.controller.js';
import { AiTextGeneratorWithClaudeCliGateway } from './interface-adapters/gateways/ai-text-generator.with-claude-cli.gateway.js';
import { AiTextGeneratorWithProviderGateway } from './interface-adapters/gateways/ai-text-generator.with-provider.gateway.js';
import { AvailableStatusesInPrismaGateway } from './interface-adapters/gateways/available-statuses.in-prisma.gateway.js';
import { BlockedIssueAlertInPrismaGateway } from './interface-adapters/gateways/blocked-issue-alert.in-prisma.gateway.js';
import { BlockedIssueDetectionDataInPrismaGateway } from './interface-adapters/gateways/blocked-issue-detection-data.in-prisma.gateway.js';
import { BottleneckAnalysisDataInPrismaGateway } from './interface-adapters/gateways/bottleneck-analysis-data.in-prisma.gateway.js';
import { CycleMetricsDataInPrismaGateway } from './interface-adapters/gateways/cycle-metrics-data.in-prisma.gateway.js';
import { CycleReportPageDataInPrismaGateway } from './interface-adapters/gateways/cycle-report-page-data.in-prisma.gateway.js';
import { DriftingIssueDetectionDataInPrismaGateway } from './interface-adapters/gateways/drifting-issue-detection-data.in-prisma.gateway.js';
import { DurationPredictionDataInPrismaGateway } from './interface-adapters/gateways/duration-prediction-data.in-prisma.gateway.js';
import { EstimationAccuracyDataInPrismaGateway } from './interface-adapters/gateways/estimation-accuracy-data.in-prisma.gateway.js';
import { MemberDigestDataInPrismaGateway } from './interface-adapters/gateways/member-digest-data.in-prisma.gateway.js';
import { MemberHealthDataInPrismaGateway } from './interface-adapters/gateways/member-health-data.in-prisma.gateway.js';
import { SprintReportInPrismaGateway } from './interface-adapters/gateways/sprint-report.in-prisma.gateway.js';
import { SprintReportDataInPrismaGateway } from './interface-adapters/gateways/sprint-report-data.in-prisma.gateway.js';
import { StatusThresholdInPrismaGateway } from './interface-adapters/gateways/status-threshold.in-prisma.gateway.js';
import { TeamSettingsInFileGateway } from './interface-adapters/gateways/team-settings.in-file.gateway.js';
import { TopCycleAssigneesDataInPrismaGateway } from './interface-adapters/gateways/top-cycle-assignees-data.in-prisma.gateway.js';
import { TopCycleProjectsDataInPrismaGateway } from './interface-adapters/gateways/top-cycle-projects-data.in-prisma.gateway.js';
import { WorkflowConfigInPrismaGateway } from './interface-adapters/gateways/workflow-config.in-prisma.gateway.js';
import { WorkspaceDashboardDataInPrismaGateway } from './interface-adapters/gateways/workspace-dashboard-data.in-prisma.gateway.js';
import { WorkspaceSettingsInFileGateway } from './interface-adapters/gateways/workspace-settings.in-file.gateway.js';
import { AlertHistoryPresenter } from './interface-adapters/presenters/alert-history.presenter.js';
import { BlockedIssuesPresenter } from './interface-adapters/presenters/blocked-issues.presenter.js';
import { BottleneckAnalysisPresenter } from './interface-adapters/presenters/bottleneck-analysis.presenter.js';
import { CycleAssigneeIssuesPresenter } from './interface-adapters/presenters/cycle-assignee-issues.presenter.js';
import { CycleIssuesPresenter } from './interface-adapters/presenters/cycle-issues.presenter.js';
import { CycleMetricsPresenter } from './interface-adapters/presenters/cycle-metrics.presenter.js';
import { CycleProjectIssuesPresenter } from './interface-adapters/presenters/cycle-project-issues.presenter.js';
import { DriftingIssuesPresenter } from './interface-adapters/presenters/drifting-issues.presenter.js';
import { DurationPredictionPresenter } from './interface-adapters/presenters/duration-prediction.presenter.js';
import { EstimationAccuracyPresenter } from './interface-adapters/presenters/estimation-accuracy.presenter.js';
import { MemberHealthPresenter } from './interface-adapters/presenters/member-health.presenter.js';
import { ReportDetailPresenter } from './interface-adapters/presenters/report-detail.presenter.js';
import { ReportHistoryPresenter } from './interface-adapters/presenters/report-history.presenter.js';
import { SprintReportPresenter } from './interface-adapters/presenters/sprint-report.presenter.js';
import { TeamCyclesPresenter } from './interface-adapters/presenters/team-cycles.presenter.js';
import { TopCycleAssigneesPresenter } from './interface-adapters/presenters/top-cycle-assignees.presenter.js';
import { TopCycleProjectsPresenter } from './interface-adapters/presenters/top-cycle-projects.presenter.js';
import { WorkflowConfigPresenter } from './interface-adapters/presenters/workflow-config.presenter.js';
import { WorkspaceDashboardPresenter } from './interface-adapters/presenters/workspace-dashboard.presenter.js';
import { AnalyzeBottlenecksByStatusUsecase } from './usecases/analyze-bottlenecks-by-status.usecase.js';
import { CalculateCycleMetricsUsecase } from './usecases/calculate-cycle-metrics.usecase.js';
import { CalculateEstimationAccuracyUsecase } from './usecases/calculate-estimation-accuracy.usecase.js';
import { DetectBlockedIssuesUsecase } from './usecases/detect-blocked-issues.usecase.js';
import { DetectDriftingIssuesUsecase } from './usecases/detect-drifting-issues.usecase.js';
import { GenerateMemberDigestUsecase } from './usecases/generate-member-digest.usecase.js';
import { GenerateSprintReportUsecase } from './usecases/generate-sprint-report.usecase.js';
import { GetAlertHistoryUsecase } from './usecases/get-alert-history.usecase.js';
import { GetBlockedIssuesUsecase } from './usecases/get-blocked-issues.usecase.js';
import { GetCycleIssuesUsecase } from './usecases/get-cycle-issues.usecase.js';
import { GetCycleIssuesForAssigneeUsecase } from './usecases/get-cycle-issues-for-assignee.usecase.js';
import { GetCycleIssuesForProjectUsecase } from './usecases/get-cycle-issues-for-project.usecase.js';
import { GetEstimationTrendUsecase } from './usecases/get-estimation-trend.usecase.js';
import { GetMemberHealthUsecase } from './usecases/get-member-health.usecase.js';
import { GetReportUsecase } from './usecases/get-report.usecase.js';
import { GetTeamExcludedStatusesUsecase } from './usecases/get-team-excluded-statuses.usecase.js';
import { GetTopCycleAssigneesUsecase } from './usecases/get-top-cycle-assignees.usecase.js';
import { GetTopCycleProjectsUsecase } from './usecases/get-top-cycle-projects.usecase.js';
import { GetWorkflowConfigUsecase } from './usecases/get-workflow-config.usecase.js';
import { GetWorkspaceDashboardUsecase } from './usecases/get-workspace-dashboard.usecase.js';
import { GetWorkspaceLanguageUsecase } from './usecases/get-workspace-language.usecase.js';
import { ListTeamCyclesUsecase } from './usecases/list-team-cycles.usecase.js';
import { ListTeamReportsUsecase } from './usecases/list-team-reports.usecase.js';
import { PredictIssueDurationUsecase } from './usecases/predict-issue-duration.usecase.js';
import { ResolveWorkflowConfigUsecase } from './usecases/resolve-workflow-config.usecase.js';
import { SetStatusThresholdUsecase } from './usecases/set-status-threshold.usecase.js';
import { SetTeamExcludedStatusesUsecase } from './usecases/set-team-excluded-statuses.usecase.js';
import { SetWorkflowConfigUsecase } from './usecases/set-workflow-config.usecase.js';
import { SetWorkspaceLanguageUsecase } from './usecases/set-workspace-language.usecase.js';

@Module({
  imports: [AuditModule, IdentityModule],
  controllers: [
    CycleMetricsController,
    SprintReportController,
    ReportExportController,
    CycleReportPageController,
    WorkspaceDashboardController,
    BottleneckAnalysisController,
    BlockedIssuesController,
    EstimationAccuracyController,
    DurationPredictionController,
    TeamSettingsController,
    MemberDigestController,
    DriftingIssuesController,
    MemberHealthController,
    WorkflowConfigController,
    WorkspaceLanguageController,
    TopCycleProjectsController,
    TopCycleAssigneesController,
  ],
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
      useClass: process.env.ANTHROPIC_API_KEY
        ? AiTextGeneratorWithProviderGateway
        : AiTextGeneratorWithClaudeCliGateway,
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
    GetTeamExcludedStatusesUsecase,
    SetTeamExcludedStatusesUsecase,
    {
      provide: TeamSettingsGateway,
      useClass: TeamSettingsInFileGateway,
    },
    {
      provide: AvailableStatusesGateway,
      useClass: AvailableStatusesInPrismaGateway,
    },
    CalculateEstimationAccuracyUsecase,
    GetEstimationTrendUsecase,
    EstimationAccuracyPresenter,
    {
      provide: EstimationAccuracyDataGateway,
      useClass: EstimationAccuracyDataInPrismaGateway,
    },
    PredictIssueDurationUsecase,
    DurationPredictionPresenter,
    {
      provide: DurationPredictionDataGateway,
      useClass: DurationPredictionDataInPrismaGateway,
    },
    GenerateMemberDigestUsecase,
    {
      provide: MemberDigestDataGateway,
      useClass: MemberDigestDataInPrismaGateway,
    },
    DetectDriftingIssuesUsecase,
    DriftingIssuesPresenter,
    {
      provide: DriftingIssueDetectionDataGateway,
      useClass: DriftingIssueDetectionDataInPrismaGateway,
    },
    GetMemberHealthUsecase,
    MemberHealthPresenter,
    {
      provide: MemberHealthDataGateway,
      useClass: MemberHealthDataInPrismaGateway,
    },
    ResolveWorkflowConfigUsecase,
    GetWorkflowConfigUsecase,
    SetWorkflowConfigUsecase,
    WorkflowConfigPresenter,
    {
      provide: WorkflowConfigGateway,
      useClass: WorkflowConfigInPrismaGateway,
    },
    GetWorkspaceLanguageUsecase,
    SetWorkspaceLanguageUsecase,
    {
      provide: WorkspaceSettingsGateway,
      useClass: WorkspaceSettingsInFileGateway,
    },
    GetTopCycleProjectsUsecase,
    GetCycleIssuesForProjectUsecase,
    TopCycleProjectsPresenter,
    CycleProjectIssuesPresenter,
    {
      provide: TopCycleProjectsDataGateway,
      useClass: TopCycleProjectsDataInPrismaGateway,
    },
    GetTopCycleAssigneesUsecase,
    GetCycleIssuesForAssigneeUsecase,
    TopCycleAssigneesPresenter,
    CycleAssigneeIssuesPresenter,
    {
      provide: TopCycleAssigneesDataGateway,
      useClass: TopCycleAssigneesDataInPrismaGateway,
    },
  ],
  exports: [SprintReportGateway],
})
export class AnalyticsModule {}
