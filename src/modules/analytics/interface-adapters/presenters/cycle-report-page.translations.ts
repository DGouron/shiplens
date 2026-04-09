import { type Locale } from '../../entities/workspace-settings/workspace-language.schema.js';

export interface CycleReportPageTranslationKeys {
  pageTitle: string;
  breadcrumbDashboard: string;
  navSettings: string;
  themeToggleTitle: string;
  loadingCycles: string;
  selectCycle: string;
  wholeTeam: string;
  unassigned: string;
  sectionMetrics: string;
  sectionMemberMetrics: string;
  sectionBottlenecks: string;
  sectionBlockedIssues: string;
  sectionEstimation: string;
  sectionDigest: string;
  sectionReport: string;
  metricVelocity: string;
  metricThroughput: string;
  metricCompletionRate: string;
  metricScopeCreep: string;
  metricCycleTime: string;
  metricLeadTime: string;
  tooltipVelocity: string;
  tooltipThroughput: string;
  tooltipCompletionRate: string;
  tooltipScopeCreep: string;
  tooltipCycleTime: string;
  tooltipLeadTime: string;
  headerStatus: string;
  headerMedianTime: string;
  headerPreviousCycle: string;
  headerCurrentCycle: string;
  headerEvolution: string;
  headerAssignee: string;
  headerDeveloper: string;
  headerIssues: string;
  headerDaysPerPoint: string;
  headerClassification: string;
  classificationWellEstimated: string;
  classificationOverEstimated: string;
  classificationUnderEstimated: string;
  buttonGenerateReport: string;
  buttonExport: string;
  buttonCopy: string;
  buttonRegenerate: string;
  buttonRetry: string;
  buttonDetect: string;
  buttonGenerateDigest: string;
  buttonRegenerateDigest: string;
  buttonViewHealthTrends: string;
  reportSummary: string;
  reportTrends: string;
  reportHighlights: string;
  reportRisks: string;
  reportRecommendations: string;
  toastReportCopied: string;
  subtitleBottlenecks: string;
  subtitleBlockedIssues: string;
  subtitleEstimation: string;
  subsectionCycleComparison: string;
  subsectionCycleComparisonDescription: string;
  subsectionAssigneeBreakdown: string;
  subsectionAssigneeBreakdownDescription: string;
  subsectionDeveloperBreakdown: string;
  subsectionDeveloperBreakdownDescription: string;
  estimationExplanation: string;
  loadingMetrics: string;
  loadingBottlenecks: string;
  loadingBlockedIssues: string;
  loadingEstimation: string;
  selectCycleMetrics: string;
  selectCycleBottlenecks: string;
  selectCycleBlockedIssues: string;
  selectCycleEstimation: string;
  selectCycleReport: string;
  selectMemberDigest: string;
  noReportGenerated: string;
  noBottleneckData: string;
  noBottleneckDataMember: string;
  noBlockedIssues: string;
  notEnoughCycles: string;
  notEnoughEstimationData: string;
  noEstimationDataMember: string;
  noIssueMember: string;
  metricsUnavailable: string;
  bottlenecksUnavailable: string;
  blockedIssuesUnavailable: string;
  estimationUnavailable: string;
  errorPrefix: string;
  errorLoadCycles: string;
  errorDetection: string;
  errorExportNoReport: string;
  generatingReport: string;
  generatingDigest: string;
  digestGenerating: string;
  reportGenerating: string;
  digestFailed: string;
  reportGenerationError: string;
  detectionInProgress: string;
  clickToGenerateDigest: string;
  memberMetricInProgress: string;
  memberMetricBlocked: string;
  memberMetricDone: string;
  memberMetricCompletedPoints: string;
  tooltipMemberInProgress: string;
  tooltipMemberBlocked: string;
  tooltipMemberDone: string;
  tooltipMemberCompletedPoints: string;
  teamScore: string;
}

export const cycleReportPageTranslations: Record<
  Locale,
  CycleReportPageTranslationKeys
> = {
  en: {
    pageTitle: 'Cycle Report',
    breadcrumbDashboard: 'Dashboard',
    navSettings: 'Settings',
    themeToggleTitle: 'Toggle theme',
    loadingCycles: 'Loading cycles...',
    selectCycle: 'Select a cycle...',
    wholeTeam: 'Whole team',
    unassigned: 'Unassigned',
    sectionMetrics: 'Metrics',
    sectionMemberMetrics: 'Member metrics',
    sectionBottlenecks: 'Bottlenecks',
    sectionBlockedIssues: 'Blocked issues',
    sectionEstimation: 'Estimation accuracy',
    sectionDigest: 'AI member digest',
    sectionReport: 'AI Report',
    metricVelocity: 'Velocity',
    metricThroughput: 'Throughput',
    metricCompletionRate: 'Completion rate',
    metricScopeCreep: 'Scope creep',
    metricCycleTime: 'Average cycle time',
    metricLeadTime: 'Average lead time',
    tooltipVelocity:
      'Completed points compared to planned points for the cycle.',
    tooltipThroughput: 'Total number of issues completed in the cycle.',
    tooltipCompletionRate:
      'Percentage of initial scope issues completed (excluding scope creep).',
    tooltipScopeCreep:
      'Issues added after the cycle started. High scope creep indicates an unstable perimeter.',
    tooltipCycleTime:
      'Average time between work starting on an issue and its completion.',
    tooltipLeadTime:
      'Average time between issue creation and its completion. Includes wait time before work begins.',
    headerStatus: 'Status',
    headerMedianTime: 'Median time',
    headerPreviousCycle: 'Previous cycle',
    headerCurrentCycle: 'Current cycle',
    headerEvolution: 'Evolution',
    headerAssignee: 'Assignee',
    headerDeveloper: 'Developer',
    headerIssues: 'Issues',
    headerDaysPerPoint: 'Days/point',
    headerClassification: 'Classification',
    classificationWellEstimated: 'Well estimated',
    classificationOverEstimated: 'Over-estimated',
    classificationUnderEstimated: 'Under-estimated',
    buttonGenerateReport: 'Generate report',
    buttonExport: 'Export',
    buttonCopy: 'Copy',
    buttonRegenerate: 'Regenerate',
    buttonRetry: 'Retry',
    buttonDetect: 'Detect',
    buttonGenerateDigest: 'Generate digest',
    buttonRegenerateDigest: 'Regenerate digest',
    buttonViewHealthTrends: 'View health trends',
    reportSummary: 'Summary',
    reportTrends: 'Trends',
    reportHighlights: 'Highlights',
    reportRisks: 'Risks',
    reportRecommendations: 'Recommendations',
    toastReportCopied: 'Report copied!',
    subtitleBottlenecks:
      'Median time spent in each workflow status — identifies where issues accumulate.',
    subtitleBlockedIssues:
      'Issues stuck in the same status beyond the configured threshold — sorted by severity.',
    subtitleEstimation:
      'Gap between point estimation and actual cycle time — by team and by developer.',
    subsectionCycleComparison: 'Comparison with previous cycle',
    subsectionCycleComparisonDescription:
      'Median time evolution per status between the last two cycles.',
    subsectionAssigneeBreakdown: 'Breakdown by assignee',
    subsectionAssigneeBreakdownDescription:
      'Median time per status for each team member.',
    subsectionDeveloperBreakdown: 'Breakdown by developer',
    subsectionDeveloperBreakdownDescription:
      'Estimation accuracy score and trends by member.',
    estimationExplanation:
      'This score represents the average number of days needed to complete 1 story point. For example, a score of 5.0 means a 2-point issue took on average 10 days. The more stable the value across cycles, the better the estimation calibration.',
    loadingMetrics: 'Loading metrics...',
    loadingBottlenecks: 'Loading bottlenecks...',
    loadingBlockedIssues: 'Loading blocked issues...',
    loadingEstimation: 'Loading estimation accuracy...',
    selectCycleMetrics: 'Select a cycle to view metrics.',
    selectCycleBottlenecks: 'Select a cycle to view bottlenecks.',
    selectCycleBlockedIssues: 'Select a cycle to view blocked issues.',
    selectCycleEstimation: 'Select a cycle to view estimation accuracy.',
    selectCycleReport: 'Select a cycle to generate a report.',
    selectMemberDigest: 'Select a member to generate a digest.',
    noReportGenerated: 'No report generated for this cycle.',
    noBottleneckData: 'No bottleneck data available',
    noBottleneckDataMember: 'No bottleneck data for this member',
    noBlockedIssues: 'No blocked issues detected',
    notEnoughCycles: 'Not enough cycles to compare',
    notEnoughEstimationData: 'Not enough data to calculate accuracy',
    noEstimationDataMember: 'No estimation data for this member',
    noIssueMember: 'No issues for this member on this cycle',
    metricsUnavailable: 'Metrics unavailable',
    bottlenecksUnavailable: 'Bottlenecks unavailable',
    blockedIssuesUnavailable: 'Blocked issues unavailable',
    estimationUnavailable: 'Estimation accuracy unavailable',
    errorPrefix: 'Error: ',
    errorLoadCycles: 'Error loading cycles',
    errorDetection: 'Error during detection',
    errorExportNoReport:
      'No report to export. Please generate a report for this cycle first.',
    generatingReport: 'Generating...',
    generatingDigest: 'Generating...',
    digestGenerating: 'Digest is being generated by AI...',
    reportGenerating: 'Report is being generated by AI...',
    digestFailed: 'Digest could not be generated',
    reportGenerationError: 'Error generating report',
    detectionInProgress: 'Detection in progress...',
    clickToGenerateDigest: 'Click the button to generate the digest.',
    memberMetricInProgress: 'In progress',
    memberMetricBlocked: 'Blocked',
    memberMetricDone: 'Done',
    memberMetricCompletedPoints: 'Completed points',
    tooltipMemberInProgress: 'Issues currently in progress for this member.',
    tooltipMemberBlocked: 'Issues blocked beyond the configured threshold.',
    tooltipMemberDone: 'Issues completed on this cycle.',
    tooltipMemberCompletedPoints: 'Total points of completed issues.',
    teamScore: 'Team score',
  },
  fr: {
    pageTitle: 'Rapport de cycle',
    breadcrumbDashboard: 'Dashboard',
    navSettings: 'Settings',
    themeToggleTitle: 'Changer de theme',
    loadingCycles: 'Chargement des cycles...',
    selectCycle: 'Selectionnez un cycle...',
    wholeTeam: "Toute l'equipe",
    unassigned: 'Non assigne',
    sectionMetrics: 'Metriques',
    sectionMemberMetrics: 'Metriques membre',
    sectionBottlenecks: "Goulots d'etranglement",
    sectionBlockedIssues: 'Issues bloquees',
    sectionEstimation: "Precision d'estimation",
    sectionDigest: 'Digest IA membre',
    sectionReport: 'Rapport IA',
    metricVelocity: 'Velocite',
    metricThroughput: 'Throughput',
    metricCompletionRate: 'Taux de completion',
    metricScopeCreep: 'Scope creep',
    metricCycleTime: 'Cycle time moyen',
    metricLeadTime: 'Lead time moyen',
    tooltipVelocity:
      'Points completes par rapport aux points planifies sur le cycle.',
    tooltipThroughput: "Nombre total d'issues terminees dans le cycle.",
    tooltipCompletionRate:
      "Pourcentage d'issues du scope initial terminees (hors scope creep).",
    tooltipScopeCreep:
      'Issues ajoutees apres le debut du cycle. Un scope creep eleve indique un perimetre instable.',
    tooltipCycleTime:
      'Duree moyenne entre le debut du travail sur une issue et sa completion.',
    tooltipLeadTime:
      "Duree moyenne entre la creation d'une issue et sa completion. Inclut le temps d'attente avant le debut du travail.",
    headerStatus: 'Statut',
    headerMedianTime: 'Temps median',
    headerPreviousCycle: 'Cycle precedent',
    headerCurrentCycle: 'Cycle actuel',
    headerEvolution: 'Evolution',
    headerAssignee: 'Assignee',
    headerDeveloper: 'Developpeur',
    headerIssues: 'Issues',
    headerDaysPerPoint: 'Jours/point',
    headerClassification: 'Classification',
    classificationWellEstimated: 'Bien estimee',
    classificationOverEstimated: 'Sur-estimee',
    classificationUnderEstimated: 'Sous-estimee',
    buttonGenerateReport: 'Generer le rapport',
    buttonExport: 'Export',
    buttonCopy: 'Copier',
    buttonRegenerate: 'Regenerer',
    buttonRetry: 'Reessayer',
    buttonDetect: 'Relancer la detection',
    buttonGenerateDigest: 'Generer le digest',
    buttonRegenerateDigest: 'Regenerer le digest',
    buttonViewHealthTrends: 'Voir les tendances de sante',
    reportSummary: 'Resume',
    reportTrends: 'Tendances',
    reportHighlights: 'Points forts',
    reportRisks: 'Risques',
    reportRecommendations: 'Recommandations',
    toastReportCopied: 'Rapport copie !',
    subtitleBottlenecks:
      "Temps median passe dans chaque statut du workflow — identifie ou les issues s'accumulent.",
    subtitleBlockedIssues:
      'Issues restees dans le meme statut au-dela du seuil configure — triees par severite.',
    subtitleEstimation:
      "Ecart entre l'estimation en points et le cycle time reel — par equipe et par developpeur.",
    subsectionCycleComparison: 'Comparaison avec le cycle precedent',
    subsectionCycleComparisonDescription:
      'Evolution du temps median par statut entre les deux derniers cycles.',
    subsectionAssigneeBreakdown: 'Breakdown par assignee',
    subsectionAssigneeBreakdownDescription:
      "Temps median par statut pour chaque membre de l'equipe.",
    subsectionDeveloperBreakdown: 'Breakdown par developpeur',
    subsectionDeveloperBreakdownDescription:
      "Score de precision et tendances d'estimation par membre.",
    estimationExplanation:
      "Ce score represente le nombre moyen de jours necessaires pour completer 1 story point. Par exemple, un score de 5.0 signifie qu'une issue estimee a 2 points a pris en moyenne 10 jours. Plus la valeur est stable d'un cycle a l'autre, meilleure est la calibration des estimations.",
    loadingMetrics: 'Chargement des metriques...',
    loadingBottlenecks: 'Chargement des goulots...',
    loadingBlockedIssues: 'Chargement des issues bloquees...',
    loadingEstimation: "Chargement de la precision d'estimation...",
    selectCycleMetrics: 'Selectionnez un cycle pour voir les metriques.',
    selectCycleBottlenecks: 'Selectionnez un cycle pour voir les goulots.',
    selectCycleBlockedIssues:
      'Selectionnez un cycle pour voir les issues bloquees.',
    selectCycleEstimation:
      "Selectionnez un cycle pour voir la precision d'estimation.",
    selectCycleReport: 'Selectionnez un cycle pour generer un rapport.',
    selectMemberDigest: 'Selectionnez un membre pour generer un digest.',
    noReportGenerated: 'Aucun rapport genere pour ce cycle.',
    noBottleneckData: 'Aucune donnee de goulot disponible',
    noBottleneckDataMember: 'Aucune donnee de goulot pour ce membre',
    noBlockedIssues: 'Aucune issue bloquee detectee',
    notEnoughCycles: 'Pas assez de cycles pour comparer',
    notEnoughEstimationData: 'Pas assez de donnees pour calculer la precision',
    noEstimationDataMember: "Aucune donnee d'estimation pour ce membre",
    noIssueMember: 'Aucune issue pour ce membre sur ce cycle',
    metricsUnavailable: 'Metriques non disponibles',
    bottlenecksUnavailable: 'Goulots non disponibles',
    blockedIssuesUnavailable: 'Issues bloquees non disponibles',
    estimationUnavailable: "Precision d'estimation non disponible",
    errorPrefix: 'Erreur: ',
    errorLoadCycles: 'Erreur lors du chargement des cycles',
    errorDetection: 'Erreur lors de la detection',
    errorExportNoReport:
      "Aucun rapport a exporter. Veuillez d'abord generer un rapport pour ce cycle.",
    generatingReport: 'Generation en cours...',
    generatingDigest: 'Generation en cours...',
    digestGenerating: "Le digest est en cours de generation par l'IA...",
    reportGenerating: "Le rapport est en cours de generation par l'IA...",
    digestFailed: "Le digest n'a pas pu etre genere",
    reportGenerationError: 'Erreur lors de la generation du rapport',
    detectionInProgress: 'Detection en cours...',
    clickToGenerateDigest: 'Cliquez sur le bouton pour generer le digest.',
    memberMetricInProgress: 'En cours',
    memberMetricBlocked: 'Bloquees',
    memberMetricDone: 'Terminees',
    memberMetricCompletedPoints: 'Points completes',
    tooltipMemberInProgress: 'Issues actuellement en cours pour ce membre.',
    tooltipMemberBlocked: 'Issues bloquees au-dela du seuil configure.',
    tooltipMemberDone: 'Issues completees sur ce cycle.',
    tooltipMemberCompletedPoints: 'Total des points des issues terminees.',
    teamScore: 'Score equipe',
  },
};
