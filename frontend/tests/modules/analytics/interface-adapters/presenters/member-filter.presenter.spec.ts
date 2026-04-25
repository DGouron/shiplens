import { describe, expect, it } from 'vitest';
import { type Locale } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { MemberFilterPresenter } from '@/modules/analytics/interface-adapters/presenters/member-filter.presenter.ts';
import { memberFilterTranslations } from '@/modules/analytics/interface-adapters/presenters/member-filter.translations.ts';
import { BlockedIssueAlertResponseBuilder } from '../../../../builders/blocked-issue-alert-response.builder.ts';
import { DriftingIssueResponseBuilder } from '../../../../builders/drifting-issue-response.builder.ts';

function makePresenter(
  selectedMemberName: string | null = null,
  locale: Locale = 'en',
) {
  return new MemberFilterPresenter(
    memberFilterTranslations[locale],
    selectedMemberName,
  );
}

describe('MemberFilterPresenter', () => {
  it('exposes the translated label from the translations bundle', () => {
    const viewModel = makePresenter().present({
      blockedIssues: [],
      driftingIssues: [],
    });

    expect(viewModel.label).toBe(memberFilterTranslations.en.label);
  });

  it('includes "Whole team" as the first option with an empty value', () => {
    const viewModel = makePresenter().present({
      blockedIssues: [],
      driftingIssues: [],
    });

    expect(viewModel.options[0]).toEqual({
      value: '',
      label: memberFilterTranslations.en.wholeTeamOption,
      isSelected: true,
      isWholeTeam: true,
    });
  });

  it('derives member options as the union of blocked and drifting assignees', () => {
    const viewModel = makePresenter().present({
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder()
          .withAssigneeName('Charlie')
          .build(),
      ],
      driftingIssues: [
        new DriftingIssueResponseBuilder().withAssigneeName('Bob').build(),
      ],
    });

    const memberLabels = viewModel.options
      .filter((option) => !option.isWholeTeam)
      .map((option) => option.label);
    expect(memberLabels).toEqual(['Bob', 'Charlie']);
  });

  it('dedupes members that appear in both blocked and drifting sources', () => {
    const viewModel = makePresenter().present({
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder()
          .withAssigneeName('Alice')
          .build(),
      ],
      driftingIssues: [
        new DriftingIssueResponseBuilder().withAssigneeName('Alice').build(),
      ],
    });

    const aliceOptions = viewModel.options.filter(
      (option) => option.label === 'Alice',
    );
    expect(aliceOptions).toHaveLength(1);
  });

  it('sorts members alphabetically', () => {
    const viewModel = makePresenter().present({
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder()
          .withAssigneeName('Charlie')
          .build(),
        new BlockedIssueAlertResponseBuilder()
          .withAssigneeName('Alice')
          .build(),
      ],
      driftingIssues: [
        new DriftingIssueResponseBuilder().withAssigneeName('Bob').build(),
      ],
    });

    const memberLabels = viewModel.options
      .filter((option) => !option.isWholeTeam)
      .map((option) => option.label);
    expect(memberLabels).toEqual(['Alice', 'Bob', 'Charlie']);
  });

  it('excludes entries without an assignee', () => {
    const viewModel = makePresenter().present({
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder().withAssigneeName(null).build(),
      ],
      driftingIssues: [
        new DriftingIssueResponseBuilder().withAssigneeName(null).build(),
      ],
    });

    const memberOptions = viewModel.options.filter(
      (option) => !option.isWholeTeam,
    );
    expect(memberOptions).toEqual([]);
  });

  it('marks the option matching the selectedMemberName as selected', () => {
    const viewModel = makePresenter('Alice').present({
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder()
          .withAssigneeName('Alice')
          .build(),
      ],
      driftingIssues: [],
    });

    expect(viewModel.selectedValue).toBe('Alice');
    const aliceOption = viewModel.options.find(
      (option) => option.value === 'Alice',
    );
    expect(aliceOption?.isSelected).toBe(true);
    expect(viewModel.options[0]?.isSelected).toBe(false);
  });

  it('reports "Whole team" as selected when selectedMemberName is null', () => {
    const viewModel = makePresenter(null).present({
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder()
          .withAssigneeName('Alice')
          .build(),
      ],
      driftingIssues: [],
    });

    expect(viewModel.selectedValue).toBe('');
    expect(viewModel.options[0]?.isSelected).toBe(true);
  });

  it('formats email member names into capitalized display labels while keeping the raw email as the option value', () => {
    const viewModel = makePresenter('gauthier@mentorgoal.com').present({
      blockedIssues: [
        new BlockedIssueAlertResponseBuilder()
          .withAssigneeName('gauthier@mentorgoal.com')
          .build(),
      ],
      driftingIssues: [],
    });

    const memberOption = viewModel.options.find(
      (option) => option.value === 'gauthier@mentorgoal.com',
    );
    expect(memberOption?.label).toBe('Gauthier');
    expect(memberOption?.value).toBe('gauthier@mentorgoal.com');
  });

  it('uses French labels under the fr locale', () => {
    const viewModel = makePresenter(null, 'fr').present({
      blockedIssues: [],
      driftingIssues: [],
    });

    expect(viewModel.label).toBe(memberFilterTranslations.fr.label);
    expect(viewModel.options[0]?.label).toBe(
      memberFilterTranslations.fr.wholeTeamOption,
    );
  });
});
