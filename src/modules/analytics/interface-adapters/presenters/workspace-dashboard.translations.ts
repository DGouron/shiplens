import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';

export interface WorkspaceDashboardTranslationKeys {
  pageTitle: string;
  breadcrumbDashboard: string;
  navSettings: string;
  themeToggleTitle: string;
  loading: string;
  lastSync: string;
  neverSynced: string;
  resynchronize: string;
  syncInProgress: string;
  syncTeams: string;
  syncReferenceData: string;
  syncIssues: string;
  syncRetry: string;
  syncErrorNoTeams: string;
  syncErrorRetrieveTeams: string;
  syncErrorSelectTeams: string;
  syncNoSelection: string;
  kpiCompletion: string;
  kpiVelocity: string;
  kpiBlockedIssues: string;
  viewReport: string;
  noReportAvailable: string;
  noActiveCycle: string;
  errorUnknown: string;
}

export const workspaceDashboardTranslations: Record<
  Locale,
  WorkspaceDashboardTranslationKeys
> = {
  en: {
    pageTitle: 'Dashboard',
    breadcrumbDashboard: 'Dashboard',
    navSettings: 'Settings',
    themeToggleTitle: 'Toggle theme',
    loading: 'Loading...',
    lastSync: 'Last sync: ',
    neverSynced: 'Never synced',
    resynchronize: 'Resynchronize',
    syncInProgress: 'Synchronization in progress...',
    syncTeams: 'Synchronizing teams...',
    syncReferenceData: 'Reference data...',
    syncIssues: 'Synchronizing issues...',
    syncRetry: 'retry',
    syncErrorNoTeams: 'No teams available in workspace',
    syncErrorRetrieveTeams: 'Unable to retrieve teams',
    syncErrorSelectTeams: 'Unable to select teams',
    syncNoSelection: 'No selection',
    kpiCompletion: 'Completion',
    kpiVelocity: 'Velocity',
    kpiBlockedIssues: 'Blocked issues',
    viewReport: 'View report',
    noReportAvailable: 'No report available',
    noActiveCycle: 'No active cycle',
    errorUnknown: 'Unknown error',
  },
  fr: {
    pageTitle: 'Dashboard',
    breadcrumbDashboard: 'Dashboard',
    navSettings: 'Settings',
    themeToggleTitle: 'Changer de theme',
    loading: 'Chargement...',
    lastSync: 'Derniere sync : ',
    neverSynced: 'Jamais synchronise',
    resynchronize: 'Resynchroniser',
    syncInProgress: 'Synchronisation en cours...',
    syncTeams: 'Synchronisation des equipes en cours...',
    syncReferenceData: 'Donnees de reference...',
    syncIssues: 'Synchronisation des issues...',
    syncRetry: 'tentative',
    syncErrorNoTeams: 'Aucune equipe disponible dans le workspace',
    syncErrorRetrieveTeams: 'Impossible de recuperer les equipes',
    syncErrorSelectTeams: 'Impossible de selectionner les equipes',
    syncNoSelection: 'Aucune selection',
    kpiCompletion: 'Completion',
    kpiVelocity: 'Velocite',
    kpiBlockedIssues: 'Issues bloquees',
    viewReport: 'Voir le rapport',
    noReportAvailable: 'Aucun rapport disponible',
    noActiveCycle: 'Aucun cycle actif',
    errorUnknown: 'Erreur inconnue',
  },
};
