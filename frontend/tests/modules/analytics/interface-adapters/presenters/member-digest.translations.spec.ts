import { describe, expect, it } from 'vitest';
import { memberDigestTranslations } from '@/modules/analytics/interface-adapters/presenters/member-digest.translations.ts';

describe('MemberDigestTranslations', () => {
  it('has all required keys for the en locale', () => {
    const en = memberDigestTranslations.en;
    expect(en.sectionTitle).toBe('Member digest');
    expect(en.emptyMessage).toBe('No issues found for this member this cycle');
    expect(en.generateLabel).toBe('Generate digest');
    expect(en.generatingLabel).toBe('Generating digest...');
    expect(en.copyLabel).toBe('Copy');
    expect(en.copyConfirmation).toBe('Digest copied!');
    expect(en.errorLabel).toBe('Failed to generate member digest');
  });

  it('has all required keys for the fr locale', () => {
    const fr = memberDigestTranslations.fr;
    expect(fr.sectionTitle).toBe('Synthese membre');
    expect(fr.generateLabel).toBe('Generer la synthese');
    expect(fr.copyConfirmation).toBe('Synthese copiee !');
  });
});
