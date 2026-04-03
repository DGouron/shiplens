import { SyncPackmindRulesPresenter } from '@modules/audit/interface-adapters/presenters/sync-packmind-rules.presenter.js';
import { describe, expect, it } from 'vitest';

describe('SyncPackmindRulesPresenter', () => {
  it('presents sync result as view model', () => {
    const presenter = new SyncPackmindRulesPresenter();

    const viewModel = presenter.present({
      createdRulesCount: 3,
      updatedRulesCount: 1,
      checklistItemsCount: 2,
      fromCache: false,
    });

    expect(viewModel).toEqual({
      createdRulesCount: 3,
      updatedRulesCount: 1,
      checklistItemsCount: 2,
      fromCache: false,
    });
  });

  it('includes warning when present', () => {
    const presenter = new SyncPackmindRulesPresenter();

    const viewModel = presenter.present({
      createdRulesCount: 0,
      updatedRulesCount: 0,
      checklistItemsCount: 0,
      fromCache: true,
      warning: 'Packmind est injoignable. Les regles en cache sont utilisees.',
    });

    expect(viewModel.fromCache).toBe(true);
    expect(viewModel.warning).toBe(
      'Packmind est injoignable. Les regles en cache sont utilisees.',
    );
  });
});
