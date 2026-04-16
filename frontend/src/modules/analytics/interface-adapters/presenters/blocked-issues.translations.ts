import { type Locale } from './cycle-metrics.translations.ts';

export interface BlockedIssuesTranslations {
  sectionTitle: string;
  loadingLabel: string;
  errorLabel: string;
  emptyMessage: string;
  severityWarning: string;
  severityCritical: string;
  daysSuffix: string;
}

export const blockedIssuesTranslations: Record<
  Locale,
  BlockedIssuesTranslations
> = {
  en: {
    sectionTitle: 'Blocked issues',
    loadingLabel: 'Loading blocked issues...',
    errorLabel: 'Failed to load blocked issues',
    emptyMessage: 'No blocked issues for this team',
    severityWarning: 'Warning',
    severityCritical: 'Critical',
    daysSuffix: 'days',
  },
  fr: {
    sectionTitle: 'Issues bloquees',
    loadingLabel: 'Chargement des issues bloquees...',
    errorLabel: 'Echec du chargement des issues bloquees',
    emptyMessage: 'Aucune issue bloquee pour cette equipe',
    severityWarning: 'Avertissement',
    severityCritical: 'Critique',
    daysSuffix: 'jours',
  },
};
