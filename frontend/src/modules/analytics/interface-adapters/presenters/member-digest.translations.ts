import { type Locale } from './cycle-metrics.translations.ts';

export interface MemberDigestTranslations {
  sectionTitle: string;
  emptyMessage: string;
  generateLabel: string;
  generatingLabel: string;
  copyLabel: string;
  copyConfirmation: string;
  errorLabel: string;
}

export const memberDigestTranslations: Record<
  Locale,
  MemberDigestTranslations
> = {
  en: {
    sectionTitle: 'Member digest',
    emptyMessage: 'No issues found for this member this cycle',
    generateLabel: 'Generate digest',
    generatingLabel: 'Generating digest...',
    copyLabel: 'Copy',
    copyConfirmation: 'Digest copied!',
    errorLabel: 'Failed to generate member digest',
  },
  fr: {
    sectionTitle: 'Synthese membre',
    emptyMessage: 'Aucun probleme trouve pour ce membre ce cycle',
    generateLabel: 'Generer la synthese',
    generatingLabel: 'Generation de la synthese...',
    copyLabel: 'Copier',
    copyConfirmation: 'Synthese copiee !',
    errorLabel: 'Echec de la generation de la synthese membre',
  },
};
