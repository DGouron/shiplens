import { type Locale } from './cycle-metrics.translations.ts';

export interface BottleneckAnalysisTranslations {
  sectionTitle: string;
  loadingLabel: string;
  errorLabel: string;
  tableHeaderStatus: string;
  tableHeaderMedianTime: string;
  bottleneckHeadline: (statusName: string) => string;
  noBottleneckHeadline: string;
  emptyMessage: string;
  bottleneckRowLabel: string;
  daysSuffix: string;
}

export const bottleneckAnalysisTranslations: Record<
  Locale,
  BottleneckAnalysisTranslations
> = {
  en: {
    sectionTitle: 'Bottlenecks',
    loadingLabel: 'Loading bottlenecks...',
    errorLabel: 'Failed to load bottleneck analysis',
    tableHeaderStatus: 'Status',
    tableHeaderMedianTime: 'Median time',
    bottleneckHeadline: (statusName) => `Main bottleneck: ${statusName}`,
    noBottleneckHeadline: 'No bottleneck detected',
    emptyMessage: 'No tracked statuses for this cycle',
    bottleneckRowLabel: 'Bottleneck status',
    daysSuffix: 'days',
  },
  fr: {
    sectionTitle: 'Goulots d etranglement',
    loadingLabel: 'Chargement des goulots d etranglement...',
    errorLabel: 'Echec du chargement des goulots d etranglement',
    tableHeaderStatus: 'Statut',
    tableHeaderMedianTime: 'Temps median',
    bottleneckHeadline: (statusName) => `Goulot principal : ${statusName}`,
    noBottleneckHeadline: 'Aucun goulot detecte',
    emptyMessage: 'Aucun statut suivi pour ce cycle',
    bottleneckRowLabel: 'Statut goulot',
    daysSuffix: 'jours',
  },
};
