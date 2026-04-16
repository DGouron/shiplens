import { type Locale } from '@/locale-context.tsx';
import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type DriftGridEntry } from '../../entities/drift-grid/drift-grid.response.ts';
import { settingsTranslations } from './settings.translations.ts';
import { type SettingsViewModel } from './settings.view-model.schema.ts';

interface TeamInfo {
  teamId: string;
  teamName: string;
}

export interface SettingsPresenterInput {
  locale: Locale;
  currentLanguage: string;
  teams: TeamInfo[] | null;
  selectedTeamId: string | null;
  timezone: string | null;
  availableStatuses: string[] | null;
  excludedStatuses: string[] | null;
  driftGridEntries: DriftGridEntry[] | null;
  toastMessage: string | null;
}

const LANGUAGE_OPTIONS = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
];

const DRIFT_DURATION_LABELS: Record<Locale, Record<number, string>> = {
  en: { 4: '4h', 6: '6h', 8: '8h (1 day)', 20: '20h (2-3 days)' },
  fr: { 4: '4h', 6: '6h', 8: '8h (1 jour)', 20: '20h (2-3 jours)' },
};

export class SettingsPresenter
  implements Presenter<SettingsPresenterInput, SettingsViewModel>
{
  present(input: SettingsPresenterInput): SettingsViewModel {
    const translations = settingsTranslations[input.locale];
    const hasTeamSelected = input.selectedTeamId !== null;

    return {
      pageTitle: translations.pageTitle,
      breadcrumbs: [
        { label: translations.breadcrumbDashboard, href: '/dashboard' },
        { label: translations.breadcrumbSettings, href: null },
      ],
      language: {
        title: translations.languageTitle,
        description: translations.languageDescription,
        currentLanguage: input.currentLanguage,
        options: LANGUAGE_OPTIONS,
      },
      teamSelector: {
        placeholder:
          input.teams === null
            ? translations.teamSelectorLoading
            : translations.teamSelectorEmpty,
        showLoading: input.teams === null,
        teams: (input.teams ?? []).map((team) => ({
          teamId: team.teamId,
          teamName: team.teamName,
        })),
        selectedTeamId: input.selectedTeamId,
      },
      timezone: {
        title: translations.timezoneTitle,
        description: translations.timezoneDescription,
        currentTimezone: input.timezone ?? 'Europe/Paris',
        showEmptyState: !hasTeamSelected,
        emptyStateMessage: translations.timezoneEmptyState,
      },
      excludedStatuses: {
        title: translations.excludedStatusesTitle,
        description: translations.excludedStatusesDescription,
        showEmptyState: !hasTeamSelected,
        emptyStateMessage: translations.excludedStatusesEmptyState,
        showNoStatusesMessage:
          hasTeamSelected &&
          input.availableStatuses !== null &&
          input.availableStatuses.length === 0,
        noStatusesMessage: translations.noSyncedStatuses,
        statusToggles: (input.availableStatuses ?? []).map((statusName) => ({
          statusName,
          isExcluded: (input.excludedStatuses ?? []).includes(statusName),
          toggleLabel: (input.excludedStatuses ?? []).includes(statusName)
            ? translations.statusExcludedLabel
            : translations.statusIncludedLabel,
        })),
      },
      driftGrid: {
        title: translations.driftGridTitle,
        description: translations.driftGridDescription,
        headerPoints: translations.driftGridHeaderPoints,
        headerDuration: translations.driftGridHeaderDuration,
        rows: this.presentDriftGridRows(input.driftGridEntries, input.locale),
        note: translations.driftGridNote,
      },
      toastMessage: input.toastMessage,
    };
  }

  private presentDriftGridRows(
    entries: DriftGridEntry[] | null,
    locale: Locale,
  ): SettingsViewModel['driftGrid']['rows'] {
    const labels = DRIFT_DURATION_LABELS[locale];
    return (entries ?? []).map((entry) => ({
      points: entry.points,
      maxDuration:
        labels[entry.maxBusinessHours] ?? `${entry.maxBusinessHours}h`,
    }));
  }
}
