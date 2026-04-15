export type Locale = 'en' | 'fr';

export interface DashboardTranslations {
  pageTitle: string;
  breadcrumbDashboard: string;
  loading: string;
  errorTitle: string;
  emptyNotConnectedTitle: string;
  emptyNoTeamsTitle: string;
  lastSync: string;
  neverSynced: string;
  resynchronize: string;
  lateWarning: string;
  kpiVelocity: string;
  kpiBlockedIssues: string;
  viewReport: string;
  noReportAvailable: string;
  noActiveCycle: string;
  syncInProgress: string;
  syncStepTeams: string;
  syncStepReference: string;
  syncStepIssues: string;
  syncRetryLabel: string;
  syncErrorRetrieveTeams: string;
  syncErrorNoTeams: string;
  syncErrorSelectTeams: string;
  syncErrorNoSelection: string;
  syncRetryButton: string;
}

export const dashboardTranslations: Record<Locale, DashboardTranslations> = {
  en: {
    pageTitle: 'Dashboard',
    breadcrumbDashboard: 'Dashboard',
    loading: 'Loading...',
    errorTitle: 'Something went wrong',
    emptyNotConnectedTitle: 'Workspace not connected',
    emptyNoTeamsTitle: 'No teams synchronized yet',
    lastSync: 'Last sync: ',
    neverSynced: 'Never synced',
    resynchronize: 'Resynchronize',
    lateWarning: 'Last sync is late',
    kpiVelocity: 'Velocity',
    kpiBlockedIssues: 'Blocked issues',
    viewReport: 'View report',
    noReportAvailable: 'No report available',
    noActiveCycle: 'No active cycle',
    syncInProgress: 'Synchronization in progress...',
    syncStepTeams: 'Synchronizing teams...',
    syncStepReference: 'Reference data...',
    syncStepIssues: 'Synchronizing issues...',
    syncRetryLabel: 'retry',
    syncErrorRetrieveTeams: 'Unable to retrieve teams',
    syncErrorNoTeams: 'No teams available in workspace',
    syncErrorSelectTeams: 'Unable to select teams',
    syncErrorNoSelection: 'No sync selection found',
    syncRetryButton: 'Retry',
  },
  fr: {
    pageTitle: 'Dashboard',
    breadcrumbDashboard: 'Dashboard',
    loading: 'Chargement...',
    errorTitle: 'Une erreur est survenue',
    emptyNotConnectedTitle: 'Workspace non connecte',
    emptyNoTeamsTitle: 'Aucune equipe synchronisee',
    lastSync: 'Derniere sync : ',
    neverSynced: 'Jamais synchronise',
    resynchronize: 'Resynchroniser',
    lateWarning: 'Derniere sync en retard',
    kpiVelocity: 'Velocite',
    kpiBlockedIssues: 'Issues bloquees',
    viewReport: 'Voir le rapport',
    noReportAvailable: 'Aucun rapport disponible',
    noActiveCycle: 'Aucun cycle actif',
    syncInProgress: 'Synchronisation en cours...',
    syncStepTeams: 'Synchronisation des equipes en cours...',
    syncStepReference: 'Donnees de reference...',
    syncStepIssues: 'Synchronisation des issues...',
    syncRetryLabel: 'tentative',
    syncErrorRetrieveTeams: 'Impossible de recuperer les equipes',
    syncErrorNoTeams: 'Aucune equipe disponible dans le workspace',
    syncErrorSelectTeams: 'Impossible de selectionner les equipes',
    syncErrorNoSelection: 'Aucune selection de sync trouvee',
    syncRetryButton: 'Reessayer',
  },
};
