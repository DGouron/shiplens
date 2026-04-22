import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type CycleThemeIssueRowResponse,
  type CycleThemeIssuesResponse,
} from '../../entities/top-cycle-themes/top-cycle-themes.response.ts';
import {
  type CycleThemeIssueRowViewModel,
  type CycleThemeIssuesDrawerViewModel,
} from './cycle-theme-issues-drawer.view-model.schema.ts';
import { type TopCycleThemesTranslations } from './top-cycle-themes.translations.ts';

export type CycleThemeIssuesDrawerInput =
  | { kind: 'closed' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; response: CycleThemeIssuesResponse };

export class CycleThemeIssuesDrawerPresenter
  implements
    Presenter<CycleThemeIssuesDrawerInput, CycleThemeIssuesDrawerViewModel>
{
  constructor(private readonly translations: TopCycleThemesTranslations) {}

  present(input: CycleThemeIssuesDrawerInput): CycleThemeIssuesDrawerViewModel {
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

  private closedViewModel(): CycleThemeIssuesDrawerViewModel {
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

  private loadingViewModel(): CycleThemeIssuesDrawerViewModel {
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

  private errorViewModel(message: string): CycleThemeIssuesDrawerViewModel {
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
    response: CycleThemeIssuesResponse,
  ): CycleThemeIssuesDrawerViewModel {
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

    if (response.status === 'theme_not_found') {
      return {
        isOpen: true,
        title: '',
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

    if (response.issues.length === 0) {
      return {
        isOpen: true,
        title: response.themeName,
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
      title: response.themeName,
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
    issue: CycleThemeIssueRowResponse,
  ): CycleThemeIssueRowViewModel {
    return {
      externalId: issue.externalId,
      title: issue.title,
      assigneeLabel: issue.assigneeName ?? '-',
      pointsLabel:
        issue.points === null
          ? '-'
          : `${issue.points} ${this.translations.drawerPointsUnit}`,
      statusName: issue.statusName,
      linearUrl: issue.linearUrl ?? '',
      linearLinkLabel: this.translations.drawerLinearLinkLabel,
      showLinearLink: issue.linearUrl !== null,
    };
  }
}
