import { Controller, Get, Param } from '@nestjs/common';
import { ListTeamReportsUsecase } from '../../usecases/list-team-reports.usecase.js';
import { GetReportUsecase } from '../../usecases/get-report.usecase.js';
import { ReportHistoryPresenter, type ReportHistoryDto } from '../presenters/report-history.presenter.js';
import { ReportDetailPresenter, type ReportDetailDto } from '../presenters/report-detail.presenter.js';

@Controller('analytics')
export class ReportExportController {
  constructor(
    private readonly listTeamReports: ListTeamReportsUsecase,
    private readonly getReport: GetReportUsecase,
    private readonly reportHistoryPresenter: ReportHistoryPresenter,
    private readonly reportDetailPresenter: ReportDetailPresenter,
  ) {}

  @Get('teams/:teamId/reports')
  async listReports(
    @Param('teamId') teamId: string,
  ): Promise<ReportHistoryDto> {
    const reports = await this.listTeamReports.execute({ teamId });
    return this.reportHistoryPresenter.present(reports);
  }

  @Get('reports/:reportId')
  async getReportDetail(
    @Param('reportId') reportId: string,
  ): Promise<ReportDetailDto> {
    const report = await this.getReport.execute({ reportId });
    return this.reportDetailPresenter.present(report);
  }
}
