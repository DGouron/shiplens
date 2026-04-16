import { type Locale } from './cycle-metrics.translations.ts';

export interface MemberFilterTranslations {
  label: string;
  wholeTeamOption: string;
}

export const memberFilterTranslations: Record<
  Locale,
  MemberFilterTranslations
> = {
  en: {
    label: 'Filter by member',
    wholeTeamOption: 'Whole team',
  },
  fr: {
    label: 'Filtrer par membre',
    wholeTeamOption: 'Toute l equipe',
  },
};
