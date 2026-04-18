import { type Locale } from './cycle-metrics.translations.ts';

export interface TopCycleAssigneesTranslations {
  cardTitle: string;
  metricCountLabel: string;
  metricPointsLabel: string;
  metricTimeLabel: string;
  emptyNoActiveCycle: string;
  emptyNoCompletedWork: string;
  drawerCloseLabel: string;
  drawerLinearLinkLabel: string;
  drawerPointsUnit: string;
  drawerLoadingMessage: string;
  drawerErrorMessage: string;
  drawerEmptyMessage: string;
  daysSuffix: string;
}

export const topCycleAssigneesTranslations: Record<
  Locale,
  TopCycleAssigneesTranslations
> = {
  en: {
    cardTitle: 'Top 5 cycle assignees',
    metricCountLabel: 'Count',
    metricPointsLabel: 'Points',
    metricTimeLabel: 'Time',
    emptyNoActiveCycle: 'No active cycle for this team.',
    emptyNoCompletedWork: 'No completed work this cycle.',
    drawerCloseLabel: 'Close',
    drawerLinearLinkLabel: 'Open in Linear',
    drawerPointsUnit: 'pts',
    drawerLoadingMessage: 'Loading issues...',
    drawerErrorMessage: 'Failed to load assignee issues',
    drawerEmptyMessage:
      'No issues completed by this assignee in the active cycle.',
    daysSuffix: 'days',
  },
  fr: {
    cardTitle: 'Top 5 assignes du cycle',
    metricCountLabel: 'Nombre',
    metricPointsLabel: 'Points',
    metricTimeLabel: 'Temps',
    emptyNoActiveCycle: 'Pas de cycle actif pour cette equipe.',
    emptyNoCompletedWork: 'Aucun travail termine dans ce cycle.',
    drawerCloseLabel: 'Fermer',
    drawerLinearLinkLabel: 'Ouvrir dans Linear',
    drawerPointsUnit: 'pts',
    drawerLoadingMessage: 'Chargement des issues...',
    drawerErrorMessage: 'Echec du chargement des issues de l assigne',
    drawerEmptyMessage:
      'Aucune issue completee par cet assigne dans le cycle actif.',
    daysSuffix: 'jours',
  },
};
