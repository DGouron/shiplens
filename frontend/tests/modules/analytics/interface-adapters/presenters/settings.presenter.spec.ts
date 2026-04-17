import { describe, expect, it } from 'vitest';
import {
  SettingsPresenter,
  type SettingsPresenterInput,
} from '@/modules/analytics/interface-adapters/presenters/settings.presenter.ts';

describe('SettingsPresenter', () => {
  const presenter = new SettingsPresenter();

  const defaultInput: SettingsPresenterInput = {
    locale: 'en',
    currentLanguage: 'en',
    teams: [
      { teamId: 'team-1', teamName: 'Frontend' },
      { teamId: 'team-2', teamName: 'Backend' },
    ],
    selectedTeamId: 'team-1',
    timezone: 'Europe/Paris',
    availableStatuses: ['Backlog', 'Todo', 'In Progress', 'Done'],
    excludedStatuses: ['Backlog'],
    driftGridEntries: [
      { points: 1, maxBusinessHours: 4 },
      { points: 2, maxBusinessHours: 6 },
      { points: 3, maxBusinessHours: 8 },
      { points: 5, maxBusinessHours: 20 },
    ],
    workflowConfig: null,
    pendingWorkflowTags: null,
    toastMessage: null,
  };

  it('presents page title and breadcrumbs', () => {
    const viewModel = presenter.present(defaultInput);

    expect(viewModel.pageTitle).toBe('Settings');
    expect(viewModel.breadcrumbs).toEqual([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Settings', href: null },
    ]);
  });

  it('presents language section with current language and options', () => {
    const viewModel = presenter.present(defaultInput);

    expect(viewModel.language.currentLanguage).toBe('en');
    expect(viewModel.language.options).toHaveLength(2);
    expect(viewModel.language.title).toBe('Language');
  });

  it('presents team selector with teams', () => {
    const viewModel = presenter.present(defaultInput);

    expect(viewModel.teamSelector.teams).toHaveLength(2);
    expect(viewModel.teamSelector.selectedTeamId).toBe('team-1');
    expect(viewModel.teamSelector.showLoading).toBe(false);
  });

  it('shows loading placeholder when teams are null', () => {
    const viewModel = presenter.present({ ...defaultInput, teams: null });

    expect(viewModel.teamSelector.showLoading).toBe(true);
    expect(viewModel.teamSelector.placeholder).toBe('Loading teams...');
  });

  it('shows empty state for timezone when no team selected', () => {
    const viewModel = presenter.present({
      ...defaultInput,
      selectedTeamId: null,
    });

    expect(viewModel.timezone.showEmptyState).toBe(true);
  });

  it('presents timezone for selected team', () => {
    const viewModel = presenter.present(defaultInput);

    expect(viewModel.timezone.currentTimezone).toBe('Europe/Paris');
    expect(viewModel.timezone.showEmptyState).toBe(false);
  });

  it('presents excluded statuses with toggle labels', () => {
    const viewModel = presenter.present(defaultInput);

    expect(viewModel.excludedStatuses.statusToggles).toHaveLength(4);
    const backlogToggle = viewModel.excludedStatuses.statusToggles[0];
    expect(backlogToggle.statusName).toBe('Backlog');
    expect(backlogToggle.isExcluded).toBe(true);
    expect(backlogToggle.toggleLabel).toBe('Excluded');

    const todoToggle = viewModel.excludedStatuses.statusToggles[1];
    expect(todoToggle.isExcluded).toBe(false);
    expect(todoToggle.toggleLabel).toBe('Analyzed');
  });

  it('shows no statuses message when team has no available statuses', () => {
    const viewModel = presenter.present({
      ...defaultInput,
      availableStatuses: [],
    });

    expect(viewModel.excludedStatuses.showNoStatusesMessage).toBe(true);
  });

  it('shows empty state for statuses when no team selected', () => {
    const viewModel = presenter.present({
      ...defaultInput,
      selectedTeamId: null,
    });

    expect(viewModel.excludedStatuses.showEmptyState).toBe(true);
    expect(viewModel.excludedStatuses.showNoStatusesMessage).toBe(false);
  });

  it('presents drift grid rows with formatted durations', () => {
    const viewModel = presenter.present(defaultInput);

    expect(viewModel.driftGrid.rows).toEqual([
      { points: 1, maxDuration: '4h' },
      { points: 2, maxDuration: '6h' },
      { points: 3, maxDuration: '8h (1 day)' },
      { points: 5, maxDuration: '20h (2-3 days)' },
    ]);
    expect(viewModel.driftGrid.note).toContain('8 points');
  });

  it('presents drift grid in French locale', () => {
    const viewModel = presenter.present({ ...defaultInput, locale: 'fr' });

    expect(viewModel.driftGrid.rows[2].maxDuration).toBe('8h (1 jour)');
    expect(viewModel.driftGrid.rows[3].maxDuration).toBe('20h (2-3 jours)');
  });

  it('presents toast message when present', () => {
    const viewModel = presenter.present({
      ...defaultInput,
      toastMessage: 'Timezone saved',
    });

    expect(viewModel.toastMessage).toBe('Timezone saved');
  });

  it('presents null toast when no message', () => {
    const viewModel = presenter.present(defaultInput);

    expect(viewModel.toastMessage).toBeNull();
  });

  describe('workflowConfig section', () => {
    it('shows empty state when no team selected', () => {
      const viewModel = presenter.present({
        ...defaultInput,
        selectedTeamId: null,
      });

      expect(viewModel.workflowConfig.showEmptyState).toBe(true);
      expect(viewModel.workflowConfig.rows).toHaveLength(0);
      expect(viewModel.workflowConfig.canSave).toBe(false);
    });

    it('shows empty state when team has no known statuses', () => {
      const viewModel = presenter.present({
        ...defaultInput,
        workflowConfig: {
          startedStatuses: [],
          completedStatuses: [],
          source: 'auto-detected',
          knownStatuses: [],
        },
      });

      expect(viewModel.workflowConfig.showEmptyState).toBe(true);
      expect(viewModel.workflowConfig.rows).toHaveLength(0);
      expect(viewModel.workflowConfig.emptyStateMessage).toContain(
        'No workflow statuses detected',
      );
    });

    it('tags rows from persisted auto-detected config', () => {
      const viewModel = presenter.present({
        ...defaultInput,
        workflowConfig: {
          startedStatuses: ['In Progress'],
          completedStatuses: ['Done'],
          source: 'auto-detected',
          knownStatuses: ['Backlog', 'Todo', 'In Progress', 'Done'],
        },
      });

      const rows = viewModel.workflowConfig.rows;
      expect(rows).toHaveLength(4);
      expect(rows.find((row) => row.statusName === 'In Progress')?.tag).toBe(
        'started',
      );
      expect(rows.find((row) => row.statusName === 'Done')?.tag).toBe(
        'completed',
      );
      expect(rows.find((row) => row.statusName === 'Backlog')?.tag).toBe(
        'not_tracked',
      );
      expect(viewModel.workflowConfig.isAutoDetected).toBe(true);
      expect(viewModel.workflowConfig.isManual).toBe(false);
    });

    it('marks source as manual when persisted source is manual', () => {
      const viewModel = presenter.present({
        ...defaultInput,
        workflowConfig: {
          startedStatuses: ['In Dev'],
          completedStatuses: ['Shipped'],
          source: 'manual',
          knownStatuses: ['In Dev', 'Shipped'],
        },
      });

      expect(viewModel.workflowConfig.isManual).toBe(true);
      expect(viewModel.workflowConfig.isAutoDetected).toBe(false);
    });

    it('applies pending tags over persisted config', () => {
      const pending = new Map<
        string,
        'started' | 'completed' | 'not_tracked'
      >();
      pending.set('In Progress', 'completed');
      const viewModel = presenter.present({
        ...defaultInput,
        workflowConfig: {
          startedStatuses: ['In Progress'],
          completedStatuses: [],
          source: 'auto-detected',
          knownStatuses: ['In Progress', 'Done'],
        },
        pendingWorkflowTags: pending,
      });

      const row = viewModel.workflowConfig.rows.find(
        (current) => current.statusName === 'In Progress',
      );
      expect(row?.tag).toBe('completed');
      expect(viewModel.workflowConfig.canSave).toBe(true);
    });

    it('canSave false when pending equals persisted config', () => {
      const viewModel = presenter.present({
        ...defaultInput,
        workflowConfig: {
          startedStatuses: ['In Dev'],
          completedStatuses: ['Done'],
          source: 'manual',
          knownStatuses: ['In Dev', 'Done'],
        },
      });

      expect(viewModel.workflowConfig.canSave).toBe(false);
    });

    it('canSave true when all rows set to not tracked but persisted had tags', () => {
      const pending = new Map<
        string,
        'started' | 'completed' | 'not_tracked'
      >();
      pending.set('In Dev', 'not_tracked');
      pending.set('Done', 'not_tracked');
      const viewModel = presenter.present({
        ...defaultInput,
        workflowConfig: {
          startedStatuses: ['In Dev'],
          completedStatuses: ['Done'],
          source: 'manual',
          knownStatuses: ['In Dev', 'Done'],
        },
        pendingWorkflowTags: pending,
      });

      expect(viewModel.workflowConfig.canSave).toBe(true);
    });

    it('ignores persisted statuses not in knownStatuses (silent skip)', () => {
      const viewModel = presenter.present({
        ...defaultInput,
        workflowConfig: {
          startedStatuses: ['Ghost Status'],
          completedStatuses: ['Done'],
          source: 'manual',
          knownStatuses: ['Done'],
        },
      });

      expect(viewModel.workflowConfig.rows).toHaveLength(1);
      expect(viewModel.workflowConfig.rows[0].statusName).toBe('Done');
    });

    it('exposes semantic booleans per row', () => {
      const viewModel = presenter.present({
        ...defaultInput,
        workflowConfig: {
          startedStatuses: ['In Progress'],
          completedStatuses: ['Done'],
          source: 'auto-detected',
          knownStatuses: ['Backlog', 'In Progress', 'Done'],
        },
      });

      const inProgress = viewModel.workflowConfig.rows.find(
        (row) => row.statusName === 'In Progress',
      );
      expect(inProgress?.isStarted).toBe(true);
      expect(inProgress?.isCompleted).toBe(false);
      expect(inProgress?.isNotTracked).toBe(false);

      const done = viewModel.workflowConfig.rows.find(
        (row) => row.statusName === 'Done',
      );
      expect(done?.isCompleted).toBe(true);

      const backlog = viewModel.workflowConfig.rows.find(
        (row) => row.statusName === 'Backlog',
      );
      expect(backlog?.isNotTracked).toBe(true);
    });
  });
});
