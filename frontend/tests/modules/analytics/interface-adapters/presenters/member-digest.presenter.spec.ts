import { describe, expect, it } from 'vitest';
import { type Locale } from '@/modules/analytics/interface-adapters/presenters/cycle-metrics.translations.ts';
import { MemberDigestPresenter } from '@/modules/analytics/interface-adapters/presenters/member-digest.presenter.ts';
import { memberDigestTranslations } from '@/modules/analytics/interface-adapters/presenters/member-digest.translations.ts';
import { MemberDigestResponseBuilder } from '../../../../builders/member-digest-response.builder.ts';

function makePresenter(locale: Locale = 'en') {
  return new MemberDigestPresenter(memberDigestTranslations[locale]);
}

describe('MemberDigestPresenter', () => {
  it('shows the generate button and hides digest when no response is available', () => {
    const viewModel = makePresenter().present({
      response: null,
      isGenerating: false,
      copyConfirmation: null,
      memberName: 'Alice',
    });

    expect(viewModel.showGenerateButton).toBe(true);
    expect(viewModel.showDigest).toBe(false);
    expect(viewModel.showEmpty).toBe(false);
    expect(viewModel.memberName).toBe('Alice');
    expect(viewModel.generateLabel).toBe('Generate digest');
  });

  it('shows the digest markdown when response contains a digest string', () => {
    const response = new MemberDigestResponseBuilder()
      .withMemberName('Alice')
      .withDigest('# Alice Digest\n\nDetails here.')
      .build();

    const viewModel = makePresenter().present({
      response,
      isGenerating: false,
      copyConfirmation: null,
      memberName: 'Alice',
    });

    expect(viewModel.showDigest).toBe(true);
    expect(viewModel.showEmpty).toBe(false);
    expect(viewModel.showGenerateButton).toBe(false);
    expect(viewModel.digestMarkdown).toBe('# Alice Digest\n\nDetails here.');
  });

  it('shows empty message when response digest is null', () => {
    const response = new MemberDigestResponseBuilder()
      .withMemberName('Alice')
      .withDigest(null)
      .build();

    const viewModel = makePresenter().present({
      response,
      isGenerating: false,
      copyConfirmation: null,
      memberName: 'Alice',
    });

    expect(viewModel.showDigest).toBe(false);
    expect(viewModel.showEmpty).toBe(true);
    expect(viewModel.showGenerateButton).toBe(false);
    expect(viewModel.emptyMessage).toBe(
      'No issues found for this member this cycle',
    );
  });

  it('propagates the isGenerating flag', () => {
    const viewModel = makePresenter().present({
      response: null,
      isGenerating: true,
      copyConfirmation: null,
      memberName: 'Alice',
    });

    expect(viewModel.isGenerating).toBe(true);
  });

  it('propagates the copy confirmation string', () => {
    const response = new MemberDigestResponseBuilder()
      .withDigest('# Content')
      .build();

    const viewModel = makePresenter().present({
      response,
      isGenerating: false,
      copyConfirmation: 'Digest copied!',
      memberName: 'Alice',
    });

    expect(viewModel.copyConfirmation).toBe('Digest copied!');
  });

  it('uses French translations when locale is fr', () => {
    const viewModel = makePresenter('fr').present({
      response: null,
      isGenerating: false,
      copyConfirmation: null,
      memberName: 'Alice',
    });

    expect(viewModel.generateLabel).toBe('Generer la synthese');
  });
});
