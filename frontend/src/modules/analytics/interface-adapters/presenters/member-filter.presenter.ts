import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type BlockedIssuesResponse } from '../../entities/blocked-issues/blocked-issues.response.ts';
import { type DriftingIssuesResponse } from '../../entities/drifting-issues/drifting-issues.response.ts';
import { formatMemberDisplayName } from './format-member-display-name.ts';
import { type MemberFilterTranslations } from './member-filter.translations.ts';
import {
  type MemberFilterOptionViewModel,
  type MemberFilterViewModel,
} from './member-filter.view-model.schema.ts';

export interface MemberFilterPresenterInput {
  blockedIssues: BlockedIssuesResponse;
  driftingIssues: DriftingIssuesResponse;
}

export class MemberFilterPresenter
  implements Presenter<MemberFilterPresenterInput, MemberFilterViewModel>
{
  constructor(
    private readonly translations: MemberFilterTranslations,
    private readonly selectedMemberName: string | null,
  ) {}

  present(input: MemberFilterPresenterInput): MemberFilterViewModel {
    const memberNames = this.extractMemberNames(input);
    const wholeTeamOption: MemberFilterOptionViewModel = {
      value: '',
      label: this.translations.wholeTeamOption,
      isSelected: this.selectedMemberName === null,
      isWholeTeam: true,
    };
    const memberOptions: MemberFilterOptionViewModel[] = memberNames.map(
      (name) => ({
        value: name,
        label: formatMemberDisplayName(name),
        isSelected: name === this.selectedMemberName,
        isWholeTeam: false,
      }),
    );
    return {
      label: this.translations.label,
      selectedValue: this.selectedMemberName ?? '',
      options: [wholeTeamOption, ...memberOptions],
    };
  }

  private extractMemberNames(input: MemberFilterPresenterInput): string[] {
    const names = new Set<string>();
    for (const alert of input.blockedIssues) {
      if (alert.assigneeName !== null) names.add(alert.assigneeName);
    }
    for (const issue of input.driftingIssues) {
      if (issue.assigneeName !== null) names.add(issue.assigneeName);
    }
    return [...names].sort((left, right) => left.localeCompare(right));
  }
}
