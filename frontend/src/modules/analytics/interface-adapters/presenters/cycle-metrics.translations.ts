export type Locale = 'en' | 'fr';

export interface CycleMetricsTranslations {
  sectionTitle: string;
  loadingLabel: string;
  errorLabel: string;
  labelVelocity: string;
  labelThroughput: string;
  labelCompletionRate: string;
  labelScopeCreep: string;
  labelAverageCycleTime: string;
  labelAverageLeadTime: string;
  pointsUnit: string;
  issuesUnit: string;
  issuesAddedUnit: string;
  daysUnit: string;
  notAvailable: string;
  scopeCreepAlert: string;
}

export const cycleMetricsTranslations: Record<
  Locale,
  CycleMetricsTranslations
> = {
  en: {
    sectionTitle: 'Metrics',
    loadingLabel: 'Loading metrics...',
    errorLabel: 'Failed to load metrics',
    labelVelocity: 'Velocity',
    labelThroughput: 'Throughput',
    labelCompletionRate: 'Completion rate',
    labelScopeCreep: 'Scope creep',
    labelAverageCycleTime: 'Average cycle time',
    labelAverageLeadTime: 'Average lead time',
    pointsUnit: 'points',
    issuesUnit: 'issues',
    issuesAddedUnit: 'issues added',
    daysUnit: 'days',
    notAvailable: 'Not available',
    scopeCreepAlert: 'Scope creep above threshold',
  },
  fr: {
    sectionTitle: 'Metriques',
    loadingLabel: 'Chargement des metriques...',
    errorLabel: 'Echec du chargement des metriques',
    labelVelocity: 'Velocite',
    labelThroughput: 'Debit',
    labelCompletionRate: 'Taux d achevement',
    labelScopeCreep: 'Derive de perimetre',
    labelAverageCycleTime: 'Temps de cycle moyen',
    labelAverageLeadTime: 'Delai moyen',
    pointsUnit: 'points',
    issuesUnit: 'issues',
    issuesAddedUnit: 'issues ajoutees',
    daysUnit: 'jours',
    notAvailable: 'Non disponible',
    scopeCreepAlert: 'Derive de perimetre au-dessus du seuil',
  },
};
