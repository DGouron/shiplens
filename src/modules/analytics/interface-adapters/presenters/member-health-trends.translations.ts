import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';

export interface MemberHealthTrendsTranslationKeys {
  pageTitle: string;
  breadcrumbDashboard: string;
  navSettings: string;
  themeToggleTitle: string;
  backToCycleReport: string;
  healthTrendsSuffix: string;
  healthSignalsSubtitle: string;
  completedSprintsLabel: string;
  noticeIntro: string;
  noticeMinimum: string;
  indicatorFavorable: string;
  indicatorMixed: string;
  indicatorUnfavorable: string;
  indicatorNotEnoughData: string;
  signalEstimationScore: string;
  signalEstimationScoreDescription: string;
  signalUnderestimationRatio: string;
  signalUnderestimationRatioDescription: string;
  signalAverageCycleTime: string;
  signalAverageCycleTimeDescription: string;
  signalDriftingTickets: string;
  signalDriftingTicketsDescription: string;
  signalMedianReviewTime: string;
  signalMedianReviewTimeDescription: string;
  loadingHealthData: string;
  noDataAvailable: string;
  errorMissingParams: string;
  errorLoadFailed: string;
  noteNotApplicable: string;
  noteNotEnoughHistory: string;
}

export const memberHealthTrendsTranslations: Record<
  Locale,
  MemberHealthTrendsTranslationKeys
> = {
  en: {
    pageTitle: 'Health Trends',
    breadcrumbDashboard: 'Dashboard',
    navSettings: 'Settings',
    themeToggleTitle: 'Toggle theme',
    backToCycleReport: 'Back to cycle report',
    healthTrendsSuffix: 'Health Trends',
    healthSignalsSubtitle:
      'Health signals computed over the last <span id="cyclesCount">5</span> completed cycles',
    completedSprintsLabel: 'Completed sprints to analyze:',
    noticeIntro:
      "This dashboard tracks how a team member's work patterns evolve over completed sprints. Each signal compares recent cycles to detect improving or worsening trends.",
    noticeMinimum: '3 completed sprints',
    indicatorFavorable: 'Favorable trend',
    indicatorMixed: 'First deviation or mixed',
    indicatorUnfavorable: 'Unfavorable for 2+ sprints',
    indicatorNotEnoughData: 'Not enough data',
    signalEstimationScore: 'Estimation Score',
    signalEstimationScoreDescription:
      'Percentage of issues correctly estimated — actual effort fell within the expected range. A rising score means the member is getting better at sizing work.',
    signalUnderestimationRatio: 'Underestimation Ratio',
    signalUnderestimationRatioDescription:
      'Percentage of issues that took significantly longer than estimated. A falling ratio means fewer surprises and more predictable sprint delivery.',
    signalAverageCycleTime: 'Average Cycle Time',
    signalAverageCycleTimeDescription:
      'Mean processing time per issue across the sprint. Rising cycle time may indicate increasing complexity, blockers, or context switching.',
    signalDriftingTickets: 'Drifting Tickets',
    signalDriftingTicketsDescription:
      'Number of issues whose actual duration exceeded the expected time based on their estimate. Fewer drifts signal more predictable delivery.',
    signalMedianReviewTime: 'Median Review Time',
    signalMedianReviewTimeDescription:
      'Median time issues spend waiting in review. Long review times create bottlenecks and slow the whole team down.',
    loadingHealthData: 'Loading health data...',
    noDataAvailable: 'No data available for this member',
    errorMissingParams: 'Missing teamId or memberName in URL parameters.',
    errorLoadFailed: 'Failed to load health data',
    noteNotApplicable:
      'Not applicable — this member has no estimated issues in the analyzed sprints',
    noteNotEnoughHistory:
      'Not enough history — at least 3 completed sprints are needed to compute a trend',
  },
  fr: {
    pageTitle: 'Tendances de sante',
    breadcrumbDashboard: 'Dashboard',
    navSettings: 'Settings',
    themeToggleTitle: 'Changer de theme',
    backToCycleReport: 'Retour au rapport de cycle',
    healthTrendsSuffix: 'Tendances de sante',
    healthSignalsSubtitle:
      'Signaux de sante calcules sur les <span id="cyclesCount">5</span> derniers cycles termines',
    completedSprintsLabel: 'Sprints termines a analyser :',
    noticeIntro:
      "Ce tableau de bord suit l'evolution des habitudes de travail d'un membre sur les sprints termines. Chaque signal compare les cycles recents pour detecter les tendances.",
    noticeMinimum: '3 sprints termines',
    indicatorFavorable: 'Tendance favorable',
    indicatorMixed: 'Premiere deviation ou mixte',
    indicatorUnfavorable: 'Defavorable depuis 2+ sprints',
    indicatorNotEnoughData: 'Pas assez de donnees',
    signalEstimationScore: "Score d'estimation",
    signalEstimationScoreDescription:
      "Pourcentage d'issues correctement estimees — l'effort reel est reste dans la fourchette attendue. Un score en hausse indique une meilleure calibration.",
    signalUnderestimationRatio: 'Ratio de sous-estimation',
    signalUnderestimationRatioDescription:
      "Pourcentage d'issues ayant pris significativement plus de temps que prevu. Un ratio en baisse signifie moins de surprises et une livraison plus previsible.",
    signalAverageCycleTime: 'Cycle time moyen',
    signalAverageCycleTimeDescription:
      'Duree moyenne de traitement par issue sur le sprint. Un cycle time en hausse peut indiquer une complexite croissante ou des blocages.',
    signalDriftingTickets: 'Tickets en derive',
    signalDriftingTicketsDescription:
      "Nombre d'issues dont la duree reelle a depasse le temps attendu selon l'estimation. Moins de derives = livraison plus previsible.",
    signalMedianReviewTime: 'Temps median de review',
    signalMedianReviewTimeDescription:
      "Temps median passe en attente de review. Des temps de review longs creent des goulots d'etranglement et ralentissent toute l'equipe.",
    loadingHealthData: 'Chargement des donnees de sante...',
    noDataAvailable: 'Aucune donnee disponible pour ce membre',
    errorMissingParams: "Parametres teamId ou memberName manquants dans l'URL.",
    errorLoadFailed: 'Impossible de charger les donnees de sante',
    noteNotApplicable:
      "Non applicable — ce membre n'a aucune issue estimee dans les sprints analyses",
    noteNotEnoughHistory:
      "Pas assez d'historique — au moins 3 sprints termines sont necessaires pour calculer une tendance",
  },
};
