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
  },
};
