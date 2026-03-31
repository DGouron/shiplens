import { describe, it, expect } from 'vitest';
import { SyncProgressPresenter } from '@modules/synchronization/interface-adapters/presenters/sync-progress.presenter.js';

describe('SyncProgressPresenter', () => {
  const presenter = new SyncProgressPresenter();

  it('presents sync progress with percentage and status', () => {
    const result = presenter.present({
      teamId: 'team-1',
      progressPercentage: 40,
      status: 'in_progress',
    });

    expect(result).toEqual({
      teamId: 'team-1',
      progressPercentage: 40,
      status: 'in_progress',
    });
  });

  it('presents not started progress', () => {
    const result = presenter.present({
      teamId: 'team-1',
      progressPercentage: 0,
      status: 'not_started',
    });

    expect(result).toEqual({
      teamId: 'team-1',
      progressPercentage: 0,
      status: 'not_started',
    });
  });
});
