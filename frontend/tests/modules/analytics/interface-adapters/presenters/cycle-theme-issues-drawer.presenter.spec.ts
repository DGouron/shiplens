import { describe, expect, it } from 'vitest';
import { CycleThemeIssuesDrawerPresenter } from '@/modules/analytics/interface-adapters/presenters/cycle-theme-issues-drawer.presenter.ts';
import { topCycleThemesTranslations } from '@/modules/analytics/interface-adapters/presenters/top-cycle-themes.translations.ts';
import { CycleThemeIssueRowResponseBuilder } from '../../../../builders/cycle-theme-issue-row-response.builder.ts';

function makePresenter(
  locale: 'en' | 'fr' = 'en',
): CycleThemeIssuesDrawerPresenter {
  return new CycleThemeIssuesDrawerPresenter(
    topCycleThemesTranslations[locale],
  );
}

describe('CycleThemeIssuesDrawerPresenter', () => {
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
      topCycleThemesTranslations.en.drawerLoadingMessage,
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

  it('maps the issues list using the theme name as title', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        themeName: 'Auth refactor',
        issues: [
          new CycleThemeIssueRowResponseBuilder()
            .withExternalId('LIN-1')
            .withTitle('Fix auth flow')
            .withAssigneeName('Alice')
            .withPoints(3)
            .withStatusName('Done')
            .withLinearUrl('https://linear.app/issue/LIN-1')
            .build(),
        ],
      },
    });

    expect(viewModel.isOpen).toBe(true);
    expect(viewModel.title).toBe('Auth refactor');
    expect(viewModel.showIssues).toBe(true);
    expect(viewModel.issueRows).toHaveLength(1);
    expect(viewModel.issueRows[0].title).toBe('Fix auth flow');
    expect(viewModel.issueRows[0].assigneeLabel).toBe('Alice');
    expect(viewModel.issueRows[0].pointsLabel).toBe('3 pts');
    expect(viewModel.issueRows[0].linearUrl).toBe(
      'https://linear.app/issue/LIN-1',
    );
    expect(viewModel.issueRows[0].showLinearLink).toBe(true);
    expect(viewModel.issueRows[0].linearLinkLabel).toBe(
      topCycleThemesTranslations.en.drawerLinearLinkLabel,
    );
  });

  it('uses a dash as points label when the issue has no points', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        themeName: 'Auth refactor',
        issues: [
          new CycleThemeIssueRowResponseBuilder().withPoints(null).build(),
        ],
      },
    });

    expect(viewModel.issueRows[0].pointsLabel).toBe('-');
  });

  it('uses a dash as assignee label when the issue has no assignee', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        themeName: 'Auth refactor',
        issues: [
          new CycleThemeIssueRowResponseBuilder()
            .withAssigneeName(null)
            .build(),
        ],
      },
    });

    expect(viewModel.issueRows[0].assigneeLabel).toBe('-');
  });

  it('hides the linear link when the issue has no linear url', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        themeName: 'Auth refactor',
        issues: [
          new CycleThemeIssueRowResponseBuilder().withLinearUrl(null).build(),
        ],
      },
    });

    expect(viewModel.issueRows[0].showLinearLink).toBe(false);
  });

  it('shows the empty drawer message when the theme has no issues', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        cycleName: 'Cycle 1',
        themeName: 'Auth refactor',
        issues: [],
      },
    });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.emptyMessage).toBe(
      topCycleThemesTranslations.en.drawerEmptyMessage,
    );
  });

  it('shows the no-active-cycle empty message when response status is no_active_cycle', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: { status: 'no_active_cycle' },
    });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.emptyMessage).toBe(
      topCycleThemesTranslations.en.emptyNoActiveCycle,
    );
  });

  it('shows the empty drawer message when response status is theme_not_found', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: { status: 'theme_not_found' },
    });

    expect(viewModel.isOpen).toBe(true);
    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.emptyMessage).toBe(
      topCycleThemesTranslations.en.drawerEmptyMessage,
    );
  });
});
