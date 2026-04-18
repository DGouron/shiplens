import { type Locale } from './cycle-metrics.translations.ts';

export interface TopCycleProjectsTranslations {
  cardTitle: string;
  metricCountLabel: string;
  metricPointsLabel: string;
  metricTimeLabel: string;
  emptyNoActiveCycle: string;
  emptyNoActivity: string;
  noProjectBucketLabel: string;
  showMoreLabel: string;
  showLessLabel: string;
  drawerCloseLabel: string;
  drawerLinearLinkLabel: string;
  drawerUnassignedLabel: string;
  drawerPointsUnit: string;
  drawerLoadingMessage: string;
  drawerErrorMessage: string;
  drawerEmptyMessage: string;
  daysSuffix: string;
}

export const topCycleProjectsTranslations: Record<
  Locale,
  TopCycleProjectsTranslations
> = {
  en: {
    cardTitle: 'Top 5 cycle projects',
    metricCountLabel: 'Count',
    metricPointsLabel: 'Points',
    metricTimeLabel: 'Time',
    emptyNoActiveCycle: 'No active cycle for this team.',
    emptyNoActivity: 'No activity in the current cycle.',
    noProjectBucketLabel: 'No project',
    showMoreLabel: 'Show more',
    showLessLabel: 'Show less',
    drawerCloseLabel: 'Close',
    drawerLinearLinkLabel: 'Open in Linear',
    drawerUnassignedLabel: 'Unassigned',
    drawerPointsUnit: 'pts',
    drawerLoadingMessage: 'Loading issues...',
    drawerErrorMessage: 'Failed to load project issues',
    drawerEmptyMessage: 'No issues in this project for the active cycle.',
    daysSuffix: 'days',
  },
  fr: {
    cardTitle: 'Top 5 projets du cycle',
    metricCountLabel: 'Nombre',
    metricPointsLabel: 'Points',
    metricTimeLabel: 'Temps',
    emptyNoActiveCycle: 'Pas de cycle actif pour cette equipe.',
    emptyNoActivity: 'Aucune activite dans le cycle courant.',
    noProjectBucketLabel: 'Sans projet',
    showMoreLabel: 'Voir plus',
    showLessLabel: 'Voir moins',
    drawerCloseLabel: 'Fermer',
    drawerLinearLinkLabel: 'Ouvrir dans Linear',
    drawerUnassignedLabel: 'Non assigne',
    drawerPointsUnit: 'pts',
    drawerLoadingMessage: 'Chargement des issues...',
    drawerErrorMessage: 'Echec du chargement des issues du projet',
    drawerEmptyMessage: 'Aucune issue dans ce projet pour le cycle actif.',
    daysSuffix: 'jours',
  },
};
