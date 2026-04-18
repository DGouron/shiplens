import { describe, expect, it } from 'vitest';
import { CycleProjectIssuesDrawerPresenter } from '@/modules/analytics/interface-adapters/presenters/cycle-project-issues-drawer.presenter.ts';
import { topCycleProjectsTranslations } from '@/modules/analytics/interface-adapters/presenters/top-cycle-projects.translations.ts';
import { CycleProjectIssueRowResponseBuilder } from '../../../../builders/cycle-project-issue-row-response.builder.ts';

function makePresenter(
  locale: 'en' | 'fr' = 'en',
): CycleProjectIssuesDrawerPresenter {
  return new CycleProjectIssuesDrawerPresenter(
    topCycleProjectsTranslations[locale],
  );
}

describe('CycleProjectIssuesDrawerPresenter', () => {
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
      topCycleProjectsTranslations.en.drawerLoadingMessage,
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

  it('maps the issues list using the project name as title', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        projectId: 'proj-a',
        projectName: 'Alpha',
        isNoProjectBucket: false,
        issues: [
          new CycleProjectIssueRowResponseBuilder()
            .withExternalId('LIN-1')
            .withTitle('First')
            .withAssigneeName('Alice')
            .withPoints(3)
            .withStatusName('Done')
            .build(),
        ],
      },
    });

    expect(viewModel.isOpen).toBe(true);
    expect(viewModel.title).toBe('Alpha');
    expect(viewModel.showIssues).toBe(true);
    expect(viewModel.issueRows).toHaveLength(1);
    expect(viewModel.issueRows[0].title).toBe('First');
    expect(viewModel.issueRows[0].assigneeLabel).toBe('Alice');
    expect(viewModel.issueRows[0].pointsLabel).toBe('3 pts');
    expect(viewModel.issueRows[0].linearUrl).toBe(
      'https://linear.app/issue/LIN-1',
    );
    expect(viewModel.issueRows[0].linearLinkLabel).toBe(
      topCycleProjectsTranslations.en.drawerLinearLinkLabel,
    );
  });

  it('uses the translated no-project label as title when project is the bucket', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        projectId: '__no_project__',
        projectName: 'No project',
        isNoProjectBucket: true,
        issues: [],
      },
    });

    expect(viewModel.title).toBe(
      topCycleProjectsTranslations.en.noProjectBucketLabel,
    );
  });

  it('uses the unassigned label when the issue has no assignee', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        projectId: 'proj-a',
        projectName: 'Alpha',
        isNoProjectBucket: false,
        issues: [
          new CycleProjectIssueRowResponseBuilder()
            .withAssigneeName(null)
            .build(),
        ],
      },
    });

    expect(viewModel.issueRows[0].assigneeLabel).toBe(
      topCycleProjectsTranslations.en.drawerUnassignedLabel,
    );
  });

  it('uses a dash as points label when the issue has no points', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        projectId: 'proj-a',
        projectName: 'Alpha',
        isNoProjectBucket: false,
        issues: [
          new CycleProjectIssueRowResponseBuilder().withPoints(null).build(),
        ],
      },
    });

    expect(viewModel.issueRows[0].pointsLabel).toBe('-');
  });

  it('shows the empty drawer message when the project has no issues', () => {
    const viewModel = makePresenter().present({
      kind: 'ready',
      response: {
        status: 'ready',
        cycleId: 'cycle-1',
        projectId: 'proj-a',
        projectName: 'Alpha',
        isNoProjectBucket: false,
        issues: [],
      },
    });

    expect(viewModel.showEmptyMessage).toBe(true);
    expect(viewModel.emptyMessage).toBe(
      topCycleProjectsTranslations.en.drawerEmptyMessage,
    );
  });
});
