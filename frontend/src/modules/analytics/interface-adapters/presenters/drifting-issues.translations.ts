import { type Locale } from './cycle-metrics.translations.ts';

export interface DriftingIssuesTranslations {
  sectionTitle: string;
  loadingLabel: string;
  errorLabel: string;
  emptyMessage: string;
  daysSuffix: string;
  elapsedPrefix: string;
  expectedPrefix: string;
  pointsLabel: (points: number) => string;
  pointsUnavailable: string;
  expectedUnavailable: string;
  driftStatusDrifting: string;
  driftStatusNeedsSplitting: string;
}

export const driftingIssuesTranslations: Record<
  Locale,
  DriftingIssuesTranslations
> = {
  en: {
    sectionTitle: 'Drifting issues',
    loadingLabel: 'Loading drifting issues...',
    errorLabel: 'Failed to load drifting issues',
    emptyMessage: 'No drifting issues for this team',
    daysSuffix: 'days',
    elapsedPrefix: 'Elapsed',
    expectedPrefix: 'Expected',
    pointsLabel: (points) => `${points} points`,
    pointsUnavailable: 'No estimation',
    expectedUnavailable: 'Not available',
    driftStatusDrifting: 'Drifting',
    driftStatusNeedsSplitting: 'Needs splitting',
  },
  fr: {
    sectionTitle: 'Issues en derive',
    loadingLabel: 'Chargement des issues en derive...',
    errorLabel: 'Echec du chargement des issues en derive',
    emptyMessage: 'Aucune issue en derive pour cette equipe',
    daysSuffix: 'jours',
    elapsedPrefix: 'Ecoule',
    expectedPrefix: 'Attendu',
    pointsLabel: (points) => `${points} points`,
    pointsUnavailable: 'Sans estimation',
    expectedUnavailable: 'Non disponible',
    driftStatusDrifting: 'En derive',
    driftStatusNeedsSplitting: 'A scinder',
  },
};
