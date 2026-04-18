import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type CycleProjectIssueRowResponse,
  type CycleProjectIssuesResponse,
} from '../../entities/top-cycle-projects/top-cycle-projects.response.ts';
import {
  type CycleProjectIssueRowViewModel,
  type CycleProjectIssuesDrawerViewModel,
} from './cycle-project-issues-drawer.view-model.schema.ts';
import { type TopCycleProjectsTranslations } from './top-cycle-projects.translations.ts';

export type CycleProjectIssuesDrawerInput =
  | { kind: 'closed' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; response: CycleProjectIssuesResponse };

export class CycleProjectIssuesDrawerPresenter
  implements
    Presenter<CycleProjectIssuesDrawerInput, CycleProjectIssuesDrawerViewModel>
{
  constructor(private readonly translations: TopCycleProjectsTranslations) {}

  present(
    input: CycleProjectIssuesDrawerInput,
  ): CycleProjectIssuesDrawerViewModel {
    if (input.kind === 'closed') {
      return this.closedViewModel();
    }
    if (input.kind === 'loading') {
      return this.loadingViewModel();
    }
    if (input.kind === 'error') {
      return this.errorViewModel(input.message);
    }
    return this.readyViewModel(input.response);
  }

  private closedViewModel(): CycleProjectIssuesDrawerViewModel {
    return {
      isOpen: false,
      title: '',
      closeLabel: this.translations.drawerCloseLabel,
      issueRows: [],
      emptyMessage: null,
      showIssues: false,
      showEmptyMessage: false,
      showLoading: false,
      showError: false,
      errorMessage: null,
      loadingMessage: null,
    };
  }

  private loadingViewModel(): CycleProjectIssuesDrawerViewModel {
    return {
      isOpen: true,
      title: '',
      closeLabel: this.translations.drawerCloseLabel,
      issueRows: [],
      emptyMessage: null,
      showIssues: false,
      showEmptyMessage: false,
      showLoading: true,
      showError: false,
      errorMessage: null,
      loadingMessage: this.translations.drawerLoadingMessage,
    };
  }

  private errorViewModel(message: string): CycleProjectIssuesDrawerViewModel {
    return {
      isOpen: true,
      title: '',
      closeLabel: this.translations.drawerCloseLabel,
      issueRows: [],
      emptyMessage: null,
      showIssues: false,
      showEmptyMessage: false,
      showLoading: false,
      showError: true,
      errorMessage: message,
      loadingMessage: null,
    };
  }

  private readyViewModel(
    response: CycleProjectIssuesResponse,
  ): CycleProjectIssuesDrawerViewModel {
    if (response.status === 'no_active_cycle') {
      return {
        isOpen: true,
        title: '',
        closeLabel: this.translations.drawerCloseLabel,
        issueRows: [],
        emptyMessage: this.translations.emptyNoActiveCycle,
        showIssues: false,
        showEmptyMessage: true,
        showLoading: false,
        showError: false,
        errorMessage: null,
        loadingMessage: null,
      };
    }

    const title = response.isNoProjectBucket
      ? this.translations.noProjectBucketLabel
      : response.projectName;

    if (response.issues.length === 0) {
      return {
        isOpen: true,
        title,
        closeLabel: this.translations.drawerCloseLabel,
        issueRows: [],
        emptyMessage: this.translations.drawerEmptyMessage,
        showIssues: false,
        showEmptyMessage: true,
        showLoading: false,
        showError: false,
        errorMessage: null,
        loadingMessage: null,
      };
    }

    return {
      isOpen: true,
      title,
      closeLabel: this.translations.drawerCloseLabel,
      issueRows: response.issues.map((issue) => this.toIssueRow(issue)),
      emptyMessage: null,
      showIssues: true,
      showEmptyMessage: false,
      showLoading: false,
      showError: false,
      errorMessage: null,
      loadingMessage: null,
    };
  }

  private toIssueRow(
    issue: CycleProjectIssueRowResponse,
  ): CycleProjectIssueRowViewModel {
    return {
      externalId: issue.externalId,
      title: issue.title,
      assigneeLabel:
        issue.assigneeName ?? this.translations.drawerUnassignedLabel,
      pointsLabel:
        issue.points === null
          ? '-'
          : `${issue.points} ${this.translations.drawerPointsUnit}`,
      statusName: issue.statusName,
      linearUrl: `https://linear.app/issue/${issue.externalId}`,
      linearLinkLabel: this.translations.drawerLinearLinkLabel,
    };
  }
}
