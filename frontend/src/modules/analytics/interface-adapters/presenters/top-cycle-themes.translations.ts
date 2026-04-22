import { type Locale } from './cycle-metrics.translations.ts';

export interface TopCycleThemesTranslations {
  cardTitle: string;
  metricCountLabel: string;
  metricPointsLabel: string;
  metricTimeLabel: string;
  refreshLabel: string;
  loadingMessage: string;
  loadingHint: string;
  emptyNoActiveCycle: string;
  emptyBelowThreshold: string;
  emptyAiUnavailable: string;
  drawerCloseLabel: string;
  drawerLinearLinkLabel: string;
  drawerPointsUnit: string;
  drawerLoadingMessage: string;
  drawerErrorMessage: string;
  drawerEmptyMessage: string;
  daysSuffix: string;
}

export const topCycleThemesTranslations: Record<
  Locale,
  TopCycleThemesTranslations
> = {
  en: {
    cardTitle: 'Top 5 cycle themes',
    metricCountLabel: 'Count',
    metricPointsLabel: 'Points',
    metricTimeLabel: 'Time',
    refreshLabel: 'Refresh',
    loadingMessage: 'Detecting cycle themes with AI…',
    loadingHint: 'This can take up to 30 seconds.',
    emptyNoActiveCycle: 'No active cycle for this team.',
    emptyBelowThreshold: 'Not enough issues for theme detection.',
    emptyAiUnavailable: 'Theme detection is temporarily unavailable.',
    drawerCloseLabel: 'Close',
    drawerLinearLinkLabel: 'Open in Linear',
    drawerPointsUnit: 'pts',
    drawerLoadingMessage: 'Loading issues...',
    drawerErrorMessage: 'Failed to load theme issues',
    drawerEmptyMessage: 'No issues classified in this theme.',
    daysSuffix: 'days',
  },
  fr: {
    cardTitle: 'Top 5 themes du cycle',
    metricCountLabel: 'Nombre',
    metricPointsLabel: 'Points',
    metricTimeLabel: 'Temps',
    refreshLabel: 'Rafraichir',
    loadingMessage: 'Detection des themes par l’IA en cours…',
    loadingHint: 'Cela peut prendre jusqu’a 30 secondes.',
    emptyNoActiveCycle: 'Pas de cycle actif pour cette equipe.',
    emptyBelowThreshold: 'Pas assez d issues pour la detection des themes.',
    emptyAiUnavailable:
      'La detection des themes est temporairement indisponible.',
    drawerCloseLabel: 'Fermer',
    drawerLinearLinkLabel: 'Ouvrir dans Linear',
    drawerPointsUnit: 'pts',
    drawerLoadingMessage: 'Chargement des issues...',
    drawerErrorMessage: 'Echec du chargement des issues du theme',
    drawerEmptyMessage: 'Aucune issue classee dans ce theme.',
    daysSuffix: 'jours',
  },
};
