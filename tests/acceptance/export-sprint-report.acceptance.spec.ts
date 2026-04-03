import { ReportNotFoundError } from '@modules/analytics/entities/sprint-report/sprint-report.errors.js';
import { ReportDetailPresenter } from '@modules/analytics/interface-adapters/presenters/report-detail.presenter.js';
import { ReportHistoryPresenter } from '@modules/analytics/interface-adapters/presenters/report-history.presenter.js';
import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { GetReportUsecase } from '@modules/analytics/usecases/get-report.usecase.js';
import { ListTeamReportsUsecase } from '@modules/analytics/usecases/list-team-reports.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { SprintReportBuilder } from '../builders/sprint-report.builder.js';

describe('Export Sprint Report (acceptance)', () => {
  let sprintReportGateway: StubSprintReportGateway;
  let listTeamReports: ListTeamReportsUsecase;
  let getReport: GetReportUsecase;
  let reportHistoryPresenter: ReportHistoryPresenter;
  let reportDetailPresenter: ReportDetailPresenter;

  beforeEach(() => {
    sprintReportGateway = new StubSprintReportGateway();
    listTeamReports = new ListTeamReportsUsecase(sprintReportGateway);
    getReport = new GetReportUsecase(sprintReportGateway);
    reportHistoryPresenter = new ReportHistoryPresenter();
    reportDetailPresenter = new ReportDetailPresenter();
  });

  describe('report is viewable in dashboard with full content', () => {
    it('displays a generated report with its complete content', async () => {
      const report = new SprintReportBuilder()
        .withCycleName('Sprint 12')
        .withLanguage('FR')
        .build();

      await sprintReportGateway.save(report);

      const retrieved = await getReport.execute({ reportId: report.id });
      const detail = reportDetailPresenter.present(retrieved);

      expect(detail.cycleName).toBe('Sprint 12');
      expect(detail.language).toBe('FR');
      expect(detail.markdown).toContain(report.executiveSummary);
      expect(detail.markdown).toContain(report.highlights);
      expect(detail.markdown).toContain(report.risks);
      expect(detail.markdown).toContain(report.recommendations);
      expect(detail.plainText).toContain(report.executiveSummary);
    });
  });

  describe('report can be copied in Markdown or plain text', () => {
    it('provides markdown rendering of the report', async () => {
      const report = new SprintReportBuilder().withLanguage('FR').build();
      await sprintReportGateway.save(report);

      const retrieved = await getReport.execute({ reportId: report.id });
      const detail = reportDetailPresenter.present(retrieved);

      expect(detail.markdown).toContain('#');
      expect(detail.markdown).toContain(report.executiveSummary);
    });

    it('provides plain text rendering of the report', async () => {
      const report = new SprintReportBuilder().withLanguage('FR').build();
      await sprintReportGateway.save(report);

      const retrieved = await getReport.execute({ reportId: report.id });
      const detail = reportDetailPresenter.present(retrieved);

      expect(detail.plainText).not.toContain('#');
      expect(detail.plainText).toContain(report.executiveSummary);
    });
  });

  describe('all generated reports are kept in a history sorted most recent first', () => {
    it('lists 3 reports sorted from most recent to oldest', async () => {
      const report1 = new SprintReportBuilder()
        .withCycleName('Sprint 10')
        .withGeneratedAt('2026-01-01T10:00:00.000Z')
        .build();
      const report2 = new SprintReportBuilder()
        .withCycleName('Sprint 11')
        .withGeneratedAt('2026-01-15T10:00:00.000Z')
        .build();
      const report3 = new SprintReportBuilder()
        .withCycleName('Sprint 12')
        .withGeneratedAt('2026-02-01T10:00:00.000Z')
        .build();

      await sprintReportGateway.save(report1);
      await sprintReportGateway.save(report2);
      await sprintReportGateway.save(report3);

      const reports = await listTeamReports.execute({ teamId: 'team-1' });
      const history = reportHistoryPresenter.present(reports);

      expect(history.reports).toHaveLength(3);
      expect(history.reports[0].cycleName).toBe('Sprint 12');
      expect(history.reports[1].cycleName).toBe('Sprint 11');
      expect(history.reports[2].cycleName).toBe('Sprint 10');
      expect(history.emptyMessage).toBeNull();
    });

    it('shows empty message when team has no reports', async () => {
      const reports = await listTeamReports.execute({ teamId: 'team-1' });
      const history = reportHistoryPresenter.present(reports);

      expect(history.reports).toHaveLength(0);
      expect(history.emptyMessage).toBe(
        "Aucun rapport n'a encore été généré pour cette équipe.",
      );
    });
  });

  describe('opening a report from history displays full content', () => {
    it('retrieves a specific report by id with full content', async () => {
      const report = new SprintReportBuilder()
        .withCycleName('Sprint 12')
        .build();

      await sprintReportGateway.save(report);

      const retrieved = await getReport.execute({ reportId: report.id });
      const detail = reportDetailPresenter.present(retrieved);

      expect(detail.id).toBe(report.id);
      expect(detail.cycleName).toBe('Sprint 12');
      expect(detail.markdown).toBeTruthy();
      expect(detail.plainText).toBeTruthy();
    });

    it('throws error when report does not exist', async () => {
      await expect(
        getReport.execute({ reportId: 'nonexistent-id' }),
      ).rejects.toThrow(ReportNotFoundError);
    });
  });
});
