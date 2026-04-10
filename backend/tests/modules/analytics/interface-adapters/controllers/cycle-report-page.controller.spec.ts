import { CycleReportPageController } from '@modules/analytics/interface-adapters/controllers/cycle-report-page.controller.js';
import { CycleIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-issues.presenter.js';
import { TeamCyclesPresenter } from '@modules/analytics/interface-adapters/presenters/team-cycles.presenter.js';
import { StubCycleReportPageDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-report-page-data.gateway.js';
import { StubWorkspaceSettingsGateway } from '@modules/analytics/testing/good-path/stub.workspace-settings.gateway.js';
import { GetCycleIssuesUsecase } from '@modules/analytics/usecases/get-cycle-issues.usecase.js';
import { GetWorkspaceLanguageUsecase } from '@modules/analytics/usecases/get-workspace-language.usecase.js';
import { ListTeamCyclesUsecase } from '@modules/analytics/usecases/list-team-cycles.usecase.js';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CycleReportPageController', () => {
  let gateway: StubCycleReportPageDataGateway;
  let settingsGateway: StubWorkspaceSettingsGateway;
  let controller: CycleReportPageController;

  beforeEach(() => {
    gateway = new StubCycleReportPageDataGateway();
    settingsGateway = new StubWorkspaceSettingsGateway();
    const listCyclesUsecase = new ListTeamCyclesUsecase(gateway);
    const getCycleIssuesUsecase = new GetCycleIssuesUsecase(gateway);
    const teamCyclesPresenter = new TeamCyclesPresenter();
    const cycleIssuesPresenter = new CycleIssuesPresenter();
    const getLanguage = new GetWorkspaceLanguageUsecase(settingsGateway);
    controller = new CycleReportPageController(
      listCyclesUsecase,
      getCycleIssuesUsecase,
      teamCyclesPresenter,
      cycleIssuesPresenter,
      getLanguage,
    );
  });

  it('returns formatted cycles list', async () => {
    gateway.cycles = [
      {
        externalId: 'cycle-1',
        teamId: 'team-1',
        name: 'Sprint 10',
        startsAt: '2026-01-01T00:00:00Z',
        endsAt: '2026-01-14T00:00:00Z',
        issueCount: 10,
        isActive: false,
      },
    ];

    const result = await controller.listCycles('team-1');

    expect(result.cycles).toHaveLength(1);
    expect(result.cycles[0].name).toBe('Sprint 10');
  });

  it('returns formatted issues for a cycle', async () => {
    gateway.issues = [
      {
        externalId: 'issue-1',
        title: 'Fix bug',
        statusName: 'Done',
        points: 3,
        assigneeName: 'Alice',
      },
    ];

    const result = await controller.getCycleIssues('cycle-1', 'team-1');

    expect(result.issues).toHaveLength(1);
    expect(result.issues[0].points).toBe('3 pts');
  });

  it('returns HTML page content with default english locale', async () => {
    const result = await controller.getPage();

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Shiplens');
    expect(result).toContain('lang="en"');
  });

  it('returns HTML with french locale when preference is french', async () => {
    settingsGateway.storedLanguage = 'fr';

    const result = await controller.getPage();

    expect(result).toContain('lang="fr"');
    expect(result).toContain("Goulots d'etranglement");
  });

  it('HTML page contains bottlenecks section', async () => {
    const result = await controller.getPage();

    expect(result).toContain('id="bottlenecksSection"');
    expect(result).toContain('Bottlenecks');
  });

  it('HTML page contains blocked issues section', async () => {
    const result = await controller.getPage();

    expect(result).toContain('id="blockedIssuesSection"');
    expect(result).toContain('Blocked issues');
    expect(result).toContain('Detect');
  });

  it('HTML page contains estimation section', async () => {
    const result = await controller.getPage();

    expect(result).toContain('id="estimationSection"');
    expect(result).toContain('Estimation accuracy');
  });

  it('HTML page does not contain issues table section', async () => {
    const result = await controller.getPage();

    expect(result).not.toContain('id="issuesSection"');
  });

  it('HTML page contains piloting JS functions', async () => {
    const result = await controller.getPage();

    expect(result).toContain('function loadBottlenecks');
    expect(result).toContain('function loadBlockedIssues');
    expect(result).toContain('function detectBlockedIssues');
    expect(result).toContain('function loadEstimationAccuracy');
  });

  it('HTML page does not contain loadIssues function', async () => {
    const result = await controller.getPage();

    expect(result).not.toContain('function loadIssues');
  });

  it('HTML page contains health trends link in digest section', async () => {
    const result = await controller.getPage();

    expect(result).toContain('id="healthTrendsLink"');
    expect(result).toContain('View health trends');
    expect(result).toContain('/member-health-trends');
  });
});
