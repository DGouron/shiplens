import { describe, it, expect, beforeEach } from 'vitest';
import { CycleReportPageController } from '@modules/analytics/interface-adapters/controllers/cycle-report-page.controller.js';
import { ListTeamCyclesUsecase } from '@modules/analytics/usecases/list-team-cycles.usecase.js';
import { GetCycleIssuesUsecase } from '@modules/analytics/usecases/get-cycle-issues.usecase.js';
import { TeamCyclesPresenter } from '@modules/analytics/interface-adapters/presenters/team-cycles.presenter.js';
import { CycleIssuesPresenter } from '@modules/analytics/interface-adapters/presenters/cycle-issues.presenter.js';
import { StubCycleReportPageDataGateway } from '@modules/analytics/testing/good-path/stub.cycle-report-page-data.gateway.js';

describe('CycleReportPageController', () => {
  let gateway: StubCycleReportPageDataGateway;
  let controller: CycleReportPageController;

  beforeEach(() => {
    gateway = new StubCycleReportPageDataGateway();
    const listCyclesUsecase = new ListTeamCyclesUsecase(gateway);
    const getCycleIssuesUsecase = new GetCycleIssuesUsecase(gateway);
    const teamCyclesPresenter = new TeamCyclesPresenter();
    const cycleIssuesPresenter = new CycleIssuesPresenter();
    controller = new CycleReportPageController(
      listCyclesUsecase,
      getCycleIssuesUsecase,
      teamCyclesPresenter,
      cycleIssuesPresenter,
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
    expect(result.cycles[0].status).toBe('Terminé');
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

  it('returns HTML page content', () => {
    const result = controller.getPage();

    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('Shiplens');
  });

  it('HTML page contains bottlenecks section', () => {
    const result = controller.getPage();

    expect(result).toContain('id="bottlenecksSection"');
    expect(result).toContain("Goulots d'etranglement");
  });

  it('HTML page contains blocked issues section', () => {
    const result = controller.getPage();

    expect(result).toContain('id="blockedIssuesSection"');
    expect(result).toContain('Issues bloquees');
    expect(result).toContain('Relancer la detection');
  });

  it('HTML page contains estimation section', () => {
    const result = controller.getPage();

    expect(result).toContain('id="estimationSection"');
    expect(result).toContain("Precision d'estimation");
  });

  it('HTML page does not contain issues table section', () => {
    const result = controller.getPage();

    expect(result).not.toContain('id="issuesSection"');
    expect(result).not.toContain('Issues du cycle');
  });

  it('HTML page contains piloting JS functions', () => {
    const result = controller.getPage();

    expect(result).toContain('function loadBottlenecks');
    expect(result).toContain('function loadBlockedIssues');
    expect(result).toContain('function detectBlockedIssues');
    expect(result).toContain('function loadEstimationAccuracy');
  });

  it('HTML page does not contain loadIssues function', () => {
    const result = controller.getPage();

    expect(result).not.toContain('function loadIssues');
  });
});
