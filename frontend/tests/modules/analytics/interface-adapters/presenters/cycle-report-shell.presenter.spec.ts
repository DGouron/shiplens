import { describe, expect, it } from 'vitest';
import { CycleReportShellPresenter } from '@/modules/analytics/interface-adapters/presenters/cycle-report-shell.presenter.ts';
import { cycleReportShellTranslations } from '@/modules/analytics/interface-adapters/presenters/cycle-report-shell.translations.ts';
import { CycleSummaryResponseBuilder } from '../../../../builders/cycle-summary-response.builder.ts';
import { SyncAvailableTeamResponseBuilder } from '../../../../builders/sync-available-team-response.builder.ts';

function makePresenter(locale: 'en' | 'fr' = 'en') {
  return new CycleReportShellPresenter(cycleReportShellTranslations[locale]);
}

describe('CycleReportShellPresenter', () => {
  it('renders the heading from the translations', () => {
    const viewModel = makePresenter().present({
      availableTeams: [],
      teamCycles: null,
      selectedTeamId: null,
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(viewModel.heading).toBe('Cycle report');
  });

  it('maps available teams to team selector options', () => {
    const viewModel = makePresenter().present({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder()
          .withTeamId('team-1')
          .withTeamName('Alpha')
          .build(),
        new SyncAvailableTeamResponseBuilder()
          .withTeamId('team-2')
          .withTeamName('Bravo')
          .build(),
      ],
      teamCycles: null,
      selectedTeamId: null,
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(viewModel.teamSelector.options).toEqual([
      { teamId: 'team-1', teamName: 'Alpha' },
      { teamId: 'team-2', teamName: 'Bravo' },
    ]);
  });

  it('exposes the selected team id when a team is selected', () => {
    const viewModel = makePresenter().present({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      ],
      teamCycles: null,
      selectedTeamId: 'team-1',
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(viewModel.teamSelector.selectedTeamId).toBe('team-1');
  });

  it('returns a null cycle selector when no team is selected', () => {
    const viewModel = makePresenter().present({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      ],
      teamCycles: null,
      selectedTeamId: null,
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(viewModel.cycleSelector).toBeNull();
  });

  it('maps team cycles to cycle selector options when a team is selected', () => {
    const viewModel = makePresenter().present({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      ],
      teamCycles: {
        cycles: [
          new CycleSummaryResponseBuilder()
            .withExternalId('cycle-1')
            .withName('Cycle 12')
            .build(),
          new CycleSummaryResponseBuilder()
            .withExternalId('cycle-2')
            .withName('Cycle 11')
            .build(),
        ],
      },
      selectedTeamId: 'team-1',
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(viewModel.cycleSelector).not.toBeNull();
    if (viewModel.cycleSelector !== null) {
      expect(viewModel.cycleSelector.options).toEqual([
        {
          cycleId: 'cycle-1',
          label: 'Cycle 12',
          status: 'in_progress',
          startsAt: '2026-04-01T00:00:00.000Z',
        },
        {
          cycleId: 'cycle-2',
          label: 'Cycle 11',
          status: 'in_progress',
          startsAt: '2026-04-01T00:00:00.000Z',
        },
      ]);
    }
  });

  it('exposes the empty prompt when no team is selected', () => {
    const viewModel = makePresenter().present({
      availableTeams: [],
      teamCycles: null,
      selectedTeamId: null,
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(viewModel.emptyPrompt).toBe(
      'Select a team to view the cycle report',
    );
  });

  it('returns a null empty prompt when a team is selected', () => {
    const viewModel = makePresenter().present({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      ],
      teamCycles: { cycles: [] },
      selectedTeamId: 'team-1',
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(viewModel.emptyPrompt).toBeNull();
  });

  it('builds the 6 section placeholders with stable ids and translated titles', () => {
    const viewModel = makePresenter().present({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      ],
      teamCycles: { cycles: [] },
      selectedTeamId: 'team-1',
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(
      viewModel.sectionPlaceholders.map((placeholder) => placeholder.id),
    ).toEqual([
      'metrics',
      'bottlenecks',
      'blocked',
      'estimation',
      'drifting',
      'ai-report',
    ]);
    expect(
      viewModel.sectionPlaceholders.map((placeholder) => placeholder.title),
    ).toEqual([
      'Team metrics',
      'Bottlenecks',
      'Blocked issues',
      'Estimation accuracy',
      'Drifting issues',
      'AI report',
    ]);
  });

  it('switches the metrics title and drops team-only sections when a member is selected', () => {
    const viewModel = makePresenter().present({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      ],
      teamCycles: { cycles: [] },
      selectedTeamId: 'team-1',
      selectedCycleId: 'cycle-1',
      selectedMemberName: 'gauthier@mentorgoal.com',
    });

    expect(viewModel.isMemberMode).toBe(true);
    expect(
      viewModel.sectionPlaceholders.map((placeholder) => placeholder.id),
    ).toEqual(['metrics', 'bottlenecks', 'blocked', 'drifting']);
    const metricsPlaceholder = viewModel.sectionPlaceholders.find(
      (placeholder) => placeholder.id === 'metrics',
    );
    expect(metricsPlaceholder?.title).toBe("Gauthier's metrics");
  });

  it('flags only team-scoped sections as renderable when no cycle is selected', () => {
    const viewModel = makePresenter().present({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      ],
      teamCycles: { cycles: [] },
      selectedTeamId: 'team-1',
      selectedCycleId: null,
      selectedMemberName: null,
    });

    const renderableIds = viewModel.sectionPlaceholders
      .filter((placeholder) => placeholder.canRenderContent)
      .map((placeholder) => placeholder.id);
    expect(renderableIds).toEqual(['blocked', 'drifting']);
  });

  it('flags every section as renderable when both team and cycle are selected', () => {
    const viewModel = makePresenter().present({
      availableTeams: [
        new SyncAvailableTeamResponseBuilder().withTeamId('team-1').build(),
      ],
      teamCycles: { cycles: [] },
      selectedTeamId: 'team-1',
      selectedCycleId: 'cycle-1',
      selectedMemberName: null,
    });

    const notRenderable = viewModel.sectionPlaceholders.filter(
      (placeholder) => !placeholder.canRenderContent,
    );
    expect(notRenderable).toEqual([]);
  });

  it('renders empty section placeholders list when no team is selected', () => {
    const viewModel = makePresenter().present({
      availableTeams: [],
      teamCycles: null,
      selectedTeamId: null,
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(viewModel.sectionPlaceholders).toEqual([]);
  });

  it('uses the French translations when the locale is fr', () => {
    const viewModel = makePresenter('fr').present({
      availableTeams: [],
      teamCycles: null,
      selectedTeamId: null,
      selectedCycleId: null,
      selectedMemberName: null,
    });

    expect(viewModel.heading).toBe('Rapport de cycle');
    expect(viewModel.emptyPrompt).toBe(
      'Selectionner une equipe pour voir le rapport de cycle',
    );
  });
});
