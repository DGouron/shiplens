import { type Locale } from './cycle-metrics.translations.ts';

export type EstimationHealthLevel = 'healthy' | 'mixed' | 'needs-calibration';
export type EstimationDriftDirection =
  | 'under-dominant'
  | 'over-dominant'
  | 'balanced';

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
  diagnosisHeadline: (healthLevel: EstimationHealthLevel) => string;
  diagnosisAccuracySummary: (
    wellCount: number,
    total: number,
    percentage: number,
  ) => string;
  diagnosisDriftSummary: (
    direction: EstimationDriftDirection,
    underCount: number,
    overCount: number,
  ) => string;
  diagnosisRecommendation: (
    healthLevel: EstimationHealthLevel,
    driftDirection: EstimationDriftDirection,
  ) => string;
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
    diagnosisHeadline: (healthLevel) => {
      if (healthLevel === 'healthy') return 'Reliable estimations';
      if (healthLevel === 'mixed') return 'Mixed signal';
      return 'Needs calibration';
    },
    diagnosisAccuracySummary: (wellCount, total, percentage) =>
      `${percentage}% of tickets landed on target (${wellCount} out of ${total})`,
    diagnosisDriftSummary: (direction, underCount, overCount) => {
      if (direction === 'under-dominant') {
        return `${underCount} tickets took longer than planned, ${overCount} finished faster`;
      }
      if (direction === 'over-dominant') {
        return `${overCount} tickets finished faster than planned, ${underCount} took longer`;
      }
      return '';
    },
    diagnosisRecommendation: (healthLevel, driftDirection) => {
      if (healthLevel === 'healthy') {
        return 'Keep the current estimation ritual — the team is well calibrated.';
      }
      if (healthLevel === 'mixed') {
        if (driftDirection === 'under-dominant') {
          return 'Review the tickets that overran — look for scope creep, hidden complexity, or unclear requirements.';
        }
        if (driftDirection === 'over-dominant') {
          return 'Check whether the team is padding estimates or over-scoping small tickets.';
        }
        return 'Inspect the outlier tickets to understand what drives the variance.';
      }
      if (driftDirection === 'under-dominant') {
        return 'Most tickets run over. Revisit your estimation ritual and tighten scoping.';
      }
      if (driftDirection === 'over-dominant') {
        return 'Estimates skew too pessimistic. Trim margins and refine ticket breakdown.';
      }
      return 'Accuracy is low with no clear direction. Run a shared estimation workshop.';
    },
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
    diagnosisHeadline: (healthLevel) => {
      if (healthLevel === 'healthy') return 'Estimations fiables';
      if (healthLevel === 'mixed') return 'Signaux mitiges';
      return 'Calibrage a revoir';
    },
    diagnosisAccuracySummary: (wellCount, total, percentage) =>
      `${percentage}% des tickets dans la cible (${wellCount} sur ${total})`,
    diagnosisDriftSummary: (direction, underCount, overCount) => {
      if (direction === 'under-dominant') {
        return `${underCount} tickets ont depasse leur estimation, ${overCount} ont ete boucles plus vite`;
      }
      if (direction === 'over-dominant') {
        return `${overCount} tickets ont ete boucles plus vite que prevu, ${underCount} ont depasse`;
      }
      return '';
    },
    diagnosisRecommendation: (healthLevel, driftDirection) => {
      if (healthLevel === 'healthy') {
        return 'Continuez sur cette dynamique, l equipe est bien calibree.';
      }
      if (healthLevel === 'mixed') {
        if (driftDirection === 'under-dominant') {
          return 'Passez en revue les tickets qui ont deborde : scope flou, complexite cachee, specs a preciser ?';
        }
        if (driftDirection === 'over-dominant') {
          return 'Verifiez si l equipe gonfle les estimations ou surestime les petits tickets.';
        }
        return 'Analysez les tickets hors-cible pour comprendre la variance.';
      }
      if (driftDirection === 'under-dominant') {
        return 'La majorite des tickets deborde. Revisitez votre rituel d estimation et resserrez le decoupage.';
      }
      if (driftDirection === 'over-dominant') {
        return 'Les estimations sont trop pessimistes. Reduisez les marges et affinez le decoupage.';
      }
      return 'La precision est faible, sans direction claire. Organisez un atelier d estimation partage.';
    },
    exclusionWithoutEstimationLabel: (count) =>
      `Exclues (sans estimation) : ${count}`,
    exclusionWithoutCycleTimeLabel: (count) =>
      `Exclues (sans temps de cycle) : ${count}`,
  },
};
