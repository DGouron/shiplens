import { describe, expect, it } from 'vitest';
import { CycleAssigneeIssuesDrawerPresenter } from '@/modules/analytics/interface-adapters/presenters/cycle-assignee-issues-drawer.presenter.ts';
import { topCycleAssigneesTranslations } from '@/modules/analytics/interface-adapters/presenters/top-cycle-assignees.translations.ts';
import { CycleAssigneeIssueRowResponseBuilder } from '../../../../builders/cycle-assignee-issue-row-response.builder.ts';

function makePresenter(
  locale: 'en' | 'fr' = 'en',
): CycleAssigneeIssuesDrawerPresenter {
  return new CycleAssigneeIssuesDrawerPresenter(
    topCycleAssigneesTranslations[locale],
  );
}

describe('CycleAssigneeIssuesDrawerPresenter', () => {
  it('returns a closed view model when input kind is closed', () => {
    const viewModel = makePresenter().present({ kind: 'closed' });

    expect(viewModel.isOpen).toBe(false);
    expect(viewModel.showIssues).toBe(false);
    expect(viewModel.showLoading).toBe(false);
    expect(viewModel.showError).toBe(false);
    expect(viewModel.showEmptyMessage).toBe(false);
  });

  it('returns an open loading view model when input kind is loading', () => {
    const viewModel = makePresenter().present({ kind: 'loading' });

    expect(viewModel.isOpen).toBe(true);
    expect(viewModel.showLoading).toBe(true);
    expect(viewModel.loadingMessage).toBe(
      topCycleAssigneesTranslations.en.drawerLoadingMessage,
    );
  });

  it('returns an open error view model when input kind is error', () => {
    const viewModel = makePresenter().present({
      kind: 'error',
      message: 'boom',
    });

    expect(viewModel.isOpen).toBe(true);
    expect(viewModel.showError).toBe(true);
    expect(viewModel.errorMessage).toBe('boom');
  });

  it('maps the issues list using the assignee name as title', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        assigneeName: 'Alice',
        issues: [
          new CycleAssigneeIssueRowResponseBuilder()
            .withExternalId('LIN-1')
            .withTitle('First')
            .withPoints(3)
            .withTotalCycleTimeInHours(12)
            .withStatusName('Done')
            .build(),
        ],
      },
    });

    expect(viewModel.isOpen).toBe(true);
    expect(viewModel.title).toBe('Alice');
    expect(viewModel.showIssues).toBe(true);
    expect(viewModel.issueRows).toHaveLength(1);
    expect(viewModel.issueRows[0].title).toBe('First');
    expect(viewModel.issueRows[0].pointsLabel).toBe('3 pts');
    expect(viewModel.issueRows[0].cycleTimeLabel).toBe('12h');
    expect(viewModel.issueRows[0].linearUrl).toBe(
      'https://linear.app/issue/LIN-1',
    );
    expect(viewModel.issueRows[0].linearLinkLabel).toBe(
      topCycleAssigneesTranslations.en.drawerLinearLinkLabel,
    );
  });

  it('uses a dash as points label when the issue has no points', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        assigneeName: 'Alice',
        issues: [
          new CycleAssigneeIssueRowResponseBuilder().withPoints(null).build(),
        ],
      },
    });

    expect(viewModel.issueRows[0].pointsLabel).toBe('-');
  });

  it('uses a dash as cycle time label when the issue has null cycle time', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        assigneeName: 'Alice',
        issues: [
          new CycleAssigneeIssueRowResponseBuilder()
            .withTotalCycleTimeInHours(null)
            .build(),
        ],
      },
    });

    expect(viewModel.issueRows[0].cycleTimeLabel).toBe('-');
  });

  it('shows the empty drawer message when the assignee has no issues', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        assigneeName: 'Alice',
        issues: [],
      },
    });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.emptyMessage).toBe(
      topCycleAssigneesTranslations.en.drawerEmptyMessage,
    );
  });

  it('shows the no-active-cycle empty message when response status is no_active_cycle', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: { status: 'no_active_cycle' },
    });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.emptyMessage).toBe(
      topCycleAssigneesTranslations.en.emptyNoActiveCycle,
    );
  });
});
