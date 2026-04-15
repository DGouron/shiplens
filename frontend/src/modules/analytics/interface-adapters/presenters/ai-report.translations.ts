import { type Locale } from './cycle-metrics.translations.ts';

export interface AiReportTranslations {
  sectionTitle: string;
  loadingLabel: string;
  errorLabel: string;
  emptyMessage: string;
  generateLabel: string;
  generatingLabel: string;
  exportLabel: string;
  copyLabel: string;
  copyConfirmation: string;
  generatedAtPrefix: string;
}

export const aiReportTranslations: Record<Locale, AiReportTranslations> = {
  en: {
    sectionTitle: 'AI report',
    loadingLabel: 'Loading AI report...',
    errorLabel: 'Failed to load AI report',
    emptyMessage: 'No report generated for this cycle',
    generateLabel: 'Generate report',
    generatingLabel: 'Generating report...',
    exportLabel: 'Export',
    copyLabel: 'Copy',
    copyConfirmation: 'Report copied!',
    generatedAtPrefix: 'Generated at',
  },
  fr: {
    sectionTitle: 'Rapport IA',
    loadingLabel: 'Chargement du rapport IA...',
    errorLabel: 'Echec du chargement du rapport IA',
    emptyMessage: 'Aucun rapport genere pour ce cycle',
    generateLabel: 'Generer le rapport',
    generatingLabel: 'Generation du rapport...',
    exportLabel: 'Exporter',
    copyLabel: 'Copier',
    copyConfirmation: 'Rapport copie !',
    generatedAtPrefix: 'Genere le',
  },
};
