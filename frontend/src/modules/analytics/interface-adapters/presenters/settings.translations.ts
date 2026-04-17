import { type Locale } from '@/locale-context.tsx';

export interface SettingsTranslationKeys {
  pageTitle: string;
  breadcrumbDashboard: string;
  breadcrumbSettings: string;
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
  driftGridNote: string;
  workflowConfigTitle: string;
  workflowConfigDescription: string;
  workflowSourceAutoDetected: string;
  workflowSourceManual: string;
  workflowEmptyState: string;
  workflowSaveLabel: string;
  workflowTagStarted: string;
  workflowTagCompleted: string;
  workflowTagNotTracked: string;
  toastTimezoneSaved: string;
  toastStatusSaved: string;
  toastLanguageSaved: string;
  toastWorkflowSaved: string;
  toastWorkflowError: string;
  loading: string;
}

export const settingsTranslations: Record<Locale, SettingsTranslationKeys> = {
  en: {
    pageTitle: 'Settings',
    breadcrumbDashboard: 'Dashboard',
    breadcrumbSettings: 'Settings',
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
    driftGridNote:
      "Tickets estimated at 8 points or more are flagged 'Needs splitting' as soon as they move to in progress.",
    workflowConfigTitle: 'Workflow statuses',
    workflowConfigDescription:
      'Tag each status as started, completed, or not tracked to drive cycle time analytics.',
    workflowSourceAutoDetected: 'auto-detected',
    workflowSourceManual: 'manual',
    workflowEmptyState:
      'No workflow statuses detected. Sync your team data first.',
    workflowSaveLabel: 'Save workflow configuration',
    workflowTagStarted: 'Started',
    workflowTagCompleted: 'Completed',
    workflowTagNotTracked: 'Not tracked',
    toastTimezoneSaved: 'Timezone saved',
    toastStatusSaved: 'Settings saved',
    toastLanguageSaved: 'Language saved',
    toastWorkflowSaved: 'Workflow configuration saved',
    toastWorkflowError: 'Could not save workflow configuration',
    loading: 'Loading...',
  },
  fr: {
    pageTitle: 'Settings',
    breadcrumbDashboard: 'Dashboard',
    breadcrumbSettings: 'Settings',
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
    driftGridNote:
      "Les tickets estimes a 8 points ou plus sont signales 'A redecouper' des qu'ils passent en cours.",
    workflowConfigTitle: 'Statuts du workflow',
    workflowConfigDescription:
      'Etiquetez chaque statut comme demarre, termine ou non suivi pour piloter les analyses de cycle.',
    workflowSourceAutoDetected: 'auto-detecte',
    workflowSourceManual: 'manuel',
    workflowEmptyState:
      "Aucun statut de workflow detecte. Synchronisez d'abord les donnees de l'equipe.",
    workflowSaveLabel: 'Enregistrer la configuration du workflow',
    workflowTagStarted: 'Demarre',
    workflowTagCompleted: 'Termine',
    workflowTagNotTracked: 'Non suivi',
    toastTimezoneSaved: 'Fuseau horaire sauvegarde',
    toastStatusSaved: 'Parametres sauvegardes',
    toastLanguageSaved: 'Langue sauvegardee',
    toastWorkflowSaved: 'Configuration du workflow sauvegardee',
    toastWorkflowError:
      'Impossible de sauvegarder la configuration du workflow',
    loading: 'Chargement...',
  },
};
