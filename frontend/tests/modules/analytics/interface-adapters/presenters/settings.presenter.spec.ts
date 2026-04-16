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
});
