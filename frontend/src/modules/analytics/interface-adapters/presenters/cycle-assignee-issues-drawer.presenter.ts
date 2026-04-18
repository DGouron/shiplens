import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import {
  type CycleAssigneeIssueRowResponse,
  type CycleAssigneeIssuesResponse,
} from '../../entities/top-cycle-assignees/top-cycle-assignees.response.ts';
import {
  type CycleAssigneeIssueRowViewModel,
  type CycleAssigneeIssuesDrawerViewModel,
} from './cycle-assignee-issues-drawer.view-model.schema.ts';
import { formatDurationHours } from './format-duration-hours.ts';
import { type TopCycleAssigneesTranslations } from './top-cycle-assignees.translations.ts';

export type CycleAssigneeIssuesDrawerInput =
  | { kind: 'closed' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ready'; response: CycleAssigneeIssuesResponse };

export class CycleAssigneeIssuesDrawerPresenter
  implements
    Presenter<
      CycleAssigneeIssuesDrawerInput,
      CycleAssigneeIssuesDrawerViewModel
    >
{
  constructor(private readonly translations: TopCycleAssigneesTranslations) {}

  present(
    input: CycleAssigneeIssuesDrawerInput,
  ): CycleAssigneeIssuesDrawerViewModel {
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

  private closedViewModel(): CycleAssigneeIssuesDrawerViewModel {
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

  private loadingViewModel(): CycleAssigneeIssuesDrawerViewModel {
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

  private errorViewModel(message: string): CycleAssigneeIssuesDrawerViewModel {
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
    response: CycleAssigneeIssuesResponse,
  ): CycleAssigneeIssuesDrawerViewModel {
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

    if (response.issues.length === 0) {
      return {
        isOpen: true,
        title: response.assigneeName,
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
      title: response.assigneeName,
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
    issue: CycleAssigneeIssueRowResponse,
  ): CycleAssigneeIssueRowViewModel {
    return {
      externalId: issue.externalId,
      title: issue.title,
      pointsLabel:
        issue.points === null
          ? '-'
          : `${issue.points} ${this.translations.drawerPointsUnit}`,
      cycleTimeLabel:
        issue.totalCycleTimeInHours === null
          ? '-'
          : formatDurationHours(issue.totalCycleTimeInHours, {
              daysSuffix: this.translations.daysSuffix,
            }),
      statusName: issue.statusName,
      linearUrl: `https://linear.app/issue/${issue.externalId}`,
      linearLinkLabel: this.translations.drawerLinearLinkLabel,
    };
  }
}
