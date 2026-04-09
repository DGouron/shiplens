import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';

export interface SettingsPageTranslationKeys {
  pageTitle: string;
  breadcrumbDashboard: string;
  breadcrumbSettings: string;
  themeToggleTitle: string;
  teamSelectorLoading: string;
  teamSelectorEmpty: string;
  languageTitle: string;
  languageDescription: string;
  timezoneTitle: string;
  timezoneDescription: string;
  timezoneEmptyState: string;
  excludedStatusesTitle: string;
  excludedStatusesDescription: string;
  excludedStatusesEmptyState: string;
  noSyncedStatuses: string;
  statusIncludedLabel: string;
  statusExcludedLabel: string;
  driftGridTitle: string;
  driftGridDescription: string;
  driftGridHeaderPoints: string;
  driftGridHeaderDuration: string;
  driftRow1Hours: string;
  driftRow2Hours: string;
  driftRow3Hours: string;
  driftRow5Hours: string;
  driftGridNote: string;
  toastTimezoneSaved: string;
  toastStatusSaved: string;
  toastLanguageSaved: string;
  errorLoadTeams: string;
  errorLoadTimezone: string;
  errorSaveTimezone: string;
  errorLoadStatuses: string;
  errorSaveSettings: string;
  loading: string;
}

export const settingsPageTranslations: Record<
  Locale,
  SettingsPageTranslationKeys
> = {
  en: {
    pageTitle: 'Settings',
    breadcrumbDashboard: 'Dashboard',
    breadcrumbSettings: 'Settings',
    themeToggleTitle: 'Toggle theme',
    teamSelectorLoading: 'Loading teams...',
    teamSelectorEmpty: 'Select a team...',
    languageTitle: 'Language',
    languageDescription: 'Display language for the entire workspace.',
    timezoneTitle: 'Timezone',
    timezoneDescription:
      'Timezone used for business hours calculation (drift detection).',
    timezoneEmptyState: 'Select a team to configure the timezone.',
    excludedStatusesTitle: 'Blocked issues — Excluded statuses',
    excludedStatusesDescription:
      'Excluded statuses will not be analyzed during blocked issue detection.',
    excludedStatusesEmptyState: 'Select a team to manage excluded statuses.',
    noSyncedStatuses: 'No synced statuses for this team.',
    statusIncludedLabel: 'Analyzed',
    statusExcludedLabel: 'Excluded',
    driftGridTitle: 'Drift grid — Points to duration mapping',
    driftGridDescription:
      'Maximum expected duration in business hours based on point estimation (read only).',
    driftGridHeaderPoints: 'Points',
    driftGridHeaderDuration: 'Max expected duration',
    driftRow1Hours: '4h',
    driftRow2Hours: '6h',
    driftRow3Hours: '8h (1 day)',
    driftRow5Hours: '20h (2-3 days)',
    driftGridNote:
      "Tickets estimated at 8 points or more are flagged 'Needs splitting' as soon as they move to in progress.",
    toastTimezoneSaved: 'Timezone saved',
    toastStatusSaved: 'Settings saved',
    toastLanguageSaved: 'Language saved',
    errorLoadTeams: 'Unable to load teams',
    errorLoadTimezone: 'Unable to load timezone',
    errorSaveTimezone: 'Error saving timezone',
    errorLoadStatuses: 'Unable to load statuses',
    errorSaveSettings: 'Error saving settings',
    loading: 'Loading...',
  },
  fr: {
    pageTitle: 'Settings',
    breadcrumbDashboard: 'Dashboard',
    breadcrumbSettings: 'Settings',
    themeToggleTitle: 'Changer de theme',
    teamSelectorLoading: 'Chargement des equipes...',
    teamSelectorEmpty: 'Selectionnez une equipe...',
    languageTitle: 'Langue',
    languageDescription: "Langue d'affichage pour l'ensemble du workspace.",
    timezoneTitle: 'Fuseau horaire',
    timezoneDescription:
      'Fuseau utilise pour le calcul des heures ouvrees (detection de derive).',
    timezoneEmptyState:
      'Selectionnez une equipe pour configurer le fuseau horaire.',
    excludedStatusesTitle: 'Issues bloquees — Statuts exclus',
    excludedStatusesDescription:
      "Les statuts exclus ne seront pas analyses lors de la detection d'issues bloquees.",
    excludedStatusesEmptyState:
      'Selectionnez une equipe pour gerer les statuts exclus.',
    noSyncedStatuses: 'Aucun statut synchronise pour cette equipe.',
    statusIncludedLabel: 'Analyse',
    statusExcludedLabel: 'Exclu',
    driftGridTitle: 'Grille de derive — Correspondance points / duree',
    driftGridDescription:
      "Duree maximum attendue en heures ouvrees selon l'estimation en points (lecture seule).",
    driftGridHeaderPoints: 'Points',
    driftGridHeaderDuration: 'Duree max attendue',
    driftRow1Hours: '4h',
    driftRow2Hours: '6h',
    driftRow3Hours: '8h (1 jour)',
    driftRow5Hours: '20h (2-3 jours)',
    driftGridNote:
      "Les tickets estimes a 8 points ou plus sont signales 'A redecouper' des qu'ils passent en cours.",
    toastTimezoneSaved: 'Fuseau horaire sauvegarde',
    toastStatusSaved: 'Parametres sauvegardes',
    toastLanguageSaved: 'Langue sauvegardee',
    errorLoadTeams: 'Impossible de charger les equipes',
    errorLoadTimezone: 'Impossible de charger le fuseau horaire',
    errorSaveTimezone: 'Erreur lors de la sauvegarde du fuseau horaire',
    errorLoadStatuses: 'Impossible de charger les statuts',
    errorSaveSettings: 'Erreur lors de la sauvegarde',
    loading: 'Chargement...',
  },
};
