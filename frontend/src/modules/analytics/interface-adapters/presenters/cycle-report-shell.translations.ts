export type Locale = 'en' | 'fr';

export interface CycleReportShellTranslations {
  pageTitle: string;
  teamSelectorLabel: string;
  teamSelectorPlaceholder: string;
  cycleSelectorLabel: string;
  cycleSelectorPlaceholder: string;
  emptyPrompt: string;
  sectionMetrics: string;
  sectionMemberMetrics: (memberDisplayName: string) => string;
  sectionBottlenecks: string;
  sectionBlocked: string;
  sectionEstimation: string;
  sectionDrifting: string;
  sectionAiReport: string;
}

export const cycleReportShellTranslations: Record<
  Locale,
  CycleReportShellTranslations
> = {
  en: {
    pageTitle: 'Cycle report',
    teamSelectorLabel: 'Team',
    teamSelectorPlaceholder: 'Select a team',
    cycleSelectorLabel: 'Cycle',
    cycleSelectorPlaceholder: 'Select a cycle',
    emptyPrompt: 'Select a team to view the cycle report',
    sectionMetrics: 'Team metrics',
    sectionMemberMetrics: (memberDisplayName) =>
      `${memberDisplayName}'s metrics`,
    sectionBottlenecks: 'Bottlenecks',
    sectionBlocked: 'Blocked issues',
    sectionEstimation: 'Estimation accuracy',
    sectionDrifting: 'Drifting issues',
    sectionAiReport: 'AI report',
  },
  fr: {
    pageTitle: 'Rapport de cycle',
    teamSelectorLabel: 'Equipe',
    teamSelectorPlaceholder: 'Selectionner une equipe',
    cycleSelectorLabel: 'Cycle',
    cycleSelectorPlaceholder: 'Selectionner un cycle',
    emptyPrompt: 'Selectionner une equipe pour voir le rapport de cycle',
    sectionMetrics: 'Metriques d equipe',
    sectionMemberMetrics: (memberDisplayName) =>
      `Metriques de ${memberDisplayName}`,
    sectionBottlenecks: 'Goulots d etranglement',
    sectionBlocked: 'Issues bloquees',
    sectionEstimation: 'Precision d estimation',
    sectionDrifting: 'Issues en derive',
    sectionAiReport: 'Rapport IA',
  },
};
