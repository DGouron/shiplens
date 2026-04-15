import { type Locale } from './cycle-metrics.translations.ts';

export interface EstimationAccuracyTranslations {
  sectionTitle: string;
  loadingLabel: string;
  errorLabel: string;
  emptyMessage: string;
  wellEstimatedLabel: string;
  overEstimatedLabel: string;
  underEstimatedLabel: string;
  totalLabel: (total: number) => string;
  bucketLabel: (label: string, count: number, percentage: number) => string;
  classificationWellEstimated: string;
  classificationOverEstimated: string;
  classificationUnderEstimated: string;
  teamScoreHeading: string;
  teamScoreClassificationLabel: (classificationLabel: string) => string;
  teamScoreDaysPerPointLabel: (daysPerPoint: number) => string;
  teamScoreIssueCountLabel: (issueCount: number) => string;
  exclusionWithoutEstimationLabel: (count: number) => string;
  exclusionWithoutCycleTimeLabel: (count: number) => string;
}

export const estimationAccuracyTranslations: Record<
  Locale,
  EstimationAccuracyTranslations
> = {
  en: {
    sectionTitle: 'Estimation accuracy',
    loadingLabel: 'Loading estimation accuracy...',
    errorLabel: 'Failed to load estimation accuracy',
    emptyMessage: 'No estimation data for this cycle',
    wellEstimatedLabel: 'Well estimated',
    overEstimatedLabel: 'Over-estimated',
    underEstimatedLabel: 'Under-estimated',
    totalLabel: (total) => `Total: ${total} issues`,
    bucketLabel: (label, count, percentage) =>
      `${label}: ${count} (${percentage}%)`,
    classificationWellEstimated: 'Well estimated',
    classificationOverEstimated: 'Over-estimated',
    classificationUnderEstimated: 'Under-estimated',
    teamScoreHeading: 'Team score',
    teamScoreClassificationLabel: (classificationLabel) =>
      `Classification: ${classificationLabel}`,
    teamScoreDaysPerPointLabel: (daysPerPoint) =>
      `Days per point: ${daysPerPoint.toFixed(2)}`,
    teamScoreIssueCountLabel: (issueCount) => `Issues analysed: ${issueCount}`,
    exclusionWithoutEstimationLabel: (count) =>
      `Excluded (no estimation): ${count}`,
    exclusionWithoutCycleTimeLabel: (count) =>
      `Excluded (no cycle time): ${count}`,
  },
  fr: {
    sectionTitle: 'Precision des estimations',
    loadingLabel: 'Chargement des estimations...',
    errorLabel: 'Echec du chargement des estimations',
    emptyMessage: 'Aucune donnee d estimation pour ce cycle',
    wellEstimatedLabel: 'Bien estimees',
    overEstimatedLabel: 'Surestimees',
    underEstimatedLabel: 'Sous-estimees',
    totalLabel: (total) => `Total : ${total} issues`,
    bucketLabel: (label, count, percentage) =>
      `${label} : ${count} (${percentage}%)`,
    classificationWellEstimated: 'Bien estimees',
    classificationOverEstimated: 'Surestimees',
    classificationUnderEstimated: 'Sous-estimees',
    teamScoreHeading: 'Score de l equipe',
    teamScoreClassificationLabel: (classificationLabel) =>
      `Classification : ${classificationLabel}`,
    teamScoreDaysPerPointLabel: (daysPerPoint) =>
      `Jours par point : ${daysPerPoint.toFixed(2)}`,
    teamScoreIssueCountLabel: (issueCount) =>
      `Issues analysees : ${issueCount}`,
    exclusionWithoutEstimationLabel: (count) =>
      `Exclues (sans estimation) : ${count}`,
    exclusionWithoutCycleTimeLabel: (count) =>
      `Exclues (sans temps de cycle) : ${count}`,
  },
};
