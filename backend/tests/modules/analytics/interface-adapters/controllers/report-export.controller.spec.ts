import { ReportNotFoundError } from '@modules/analytics/entities/sprint-report/sprint-report.errors.js';
import { ReportExportController } from '@modules/analytics/interface-adapters/controllers/report-export.controller.js';
import { ReportDetailPresenter } from '@modules/analytics/interface-adapters/presenters/report-detail.presenter.js';
import { ReportHistoryPresenter } from '@modules/analytics/interface-adapters/presenters/report-history.presenter.js';
import { StubSprintReportGateway } from '@modules/analytics/testing/good-path/stub.sprint-report.gateway.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GetReportUsecase } from '@modules/analytics/usecases/get-report.usecase.js';
import { ListTeamReportsUsecase } from '@modules/analytics/usecases/list-team-reports.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';
import { SprintReportBuilder } from '../../../../builders/sprint-report.builder.js';

describe('ReportExportController', () => {
  let controller: ReportExportController;
  let gateway: StubSprintReportGateway;
  let workspaceSettingsGateway: StubWorkspaceSettingsGateway;

  beforeEach(() => {
    gateway = new StubSprintReportGateway();
    workspaceSettingsGateway = new StubWorkspaceSettingsGateway();
    const listTeamReports = new ListTeamReportsUsecase(gateway);
    const getReport = new GetReportUsecase(gateway);
    const reportHistoryPresenter = new ReportHistoryPresenter();
    const reportDetailPresenter = new ReportDetailPresenter();
    controller = new ReportExportController(
      listTeamReports,
      getReport,
      reportHistoryPresenter,
      reportDetailPresenter,
      workspaceSettingsGateway,
    );
  });

  describe('listReports', () => {
    it('returns report history for a team', async () => {
      const report = new SprintReportBuilder()
        .withCycleName('Sprint 12')
        .build();
      await gateway.save(report);

      const result = await controller.listReports('team-1');

      expect(result.reports).toHaveLength(1);
      expect(result.reports[0].cycleName).toBe('Sprint 12');
    });

    it('returns empty list when team has no reports', async () => {
      const result = await controller.listReports('team-1');

      expect(result.reports).toHaveLength(0);
    });
  });

  describe('getReportDetail', () => {
    it('returns report detail with markdown and plain text', async () => {
      const report = new SprintReportBuilder()
        .withCycleName('Sprint 12')
        .build();
      await gateway.save(report);

      const result = await controller.getReportDetail(report.id);

      expect(result.id).toBe(report.id);
      expect(result.cycleName).toBe('Sprint 12');
      expect(result.markdown).toContain('# Sprint 12');
      expect(result.plainText).toContain('Sprint 12');
    });

    it('uses workspace language for labels', async () => {
      workspaceSettingsGateway.storedLanguage = 'en';
      const frenchReport = new SprintReportBuilder()
        .withCycleName('Sprint 12')
        .withLanguage('FR')
        .build();
      await gateway.save(frenchReport);

      const result = await controller.getReportDetail(frenchReport.id);

      expect(result.markdown).toContain('## Summary');
      expect(result.markdown).toContain('## Trends');
    });

    it('throws ReportNotFoundError for unknown report', async () => {
      await expect(
        controller.getReportDetail('nonexistent-id'),
      ).rejects.toThrow(ReportNotFoundError);
    });
  });
});
