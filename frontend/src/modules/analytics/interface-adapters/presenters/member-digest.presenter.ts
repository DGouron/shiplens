import { type Presenter } from '@/shared/foundation/presenter/presenter.ts';
import { type MemberDigestResponse } from '../../entities/member-digest/member-digest.response.ts';
import { type MemberDigestTranslations } from './member-digest.translations.ts';
import { type MemberDigestViewModel } from './member-digest.view-model.schema.ts';

export interface MemberDigestPresenterInput {
  response: MemberDigestResponse | null;
  isGenerating: boolean;
  copyConfirmation: string | null;
  memberName: string;
}

export class MemberDigestPresenter
  implements Presenter<MemberDigestPresenterInput, MemberDigestViewModel>
{
  constructor(private readonly translations: MemberDigestTranslations) {}

  present(input: MemberDigestPresenterInput): MemberDigestViewModel {
    const { response } = input;
    const hasResponse = response !== null;
    const hasDigest = response !== null && response.digest !== null;

    return {
      showDigest: hasDigest,
      showEmpty: hasResponse && !hasDigest,
      showGenerateButton: !hasResponse,
      digestMarkdown: input.response?.digest ?? '',
      emptyMessage: this.translations.emptyMessage,
      generateLabel: this.translations.generateLabel,
      generatingLabel: this.translations.generatingLabel,
      copyLabel: this.translations.copyLabel,
      isGenerating: input.isGenerating,
      copyConfirmation: input.copyConfirmation,
      memberName: input.memberName,
    };
  }
}
