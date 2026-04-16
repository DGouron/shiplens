import '@/styles/member-digest.css';
import { type MemberDigestState } from '../../hooks/use-member-digest.ts';
import { type MemberDigestTranslations } from '../../presenters/member-digest.translations.ts';
import { MemberDigestEmptyView } from './member-digest-empty.view.tsx';
import { MemberDigestReadyView } from './member-digest-ready.view.tsx';

interface MemberDigestSectionViewProps {
  state: MemberDigestState;
  translations: MemberDigestTranslations;
  onGenerate: () => void;
  onCopy: () => void;
}

export function MemberDigestSectionView({
  state,
  translations,
  onGenerate,
  onCopy,
}: MemberDigestSectionViewProps) {
  return (
    <section
      className="cycle-report-section member-digest-section"
      data-testid="member-digest-section"
    >
      <h2>{translations.sectionTitle}</h2>
      {state.status === 'loading' && <p>{translations.sectionTitle}...</p>}
      {state.status === 'error' && (
        <p className="member-digest-error">{state.message}</p>
      )}
      {state.status === 'ready' && state.data.showGenerateButton && (
        <div className="member-digest-generate">
          <button
            type="button"
            className="member-digest-generate-button"
            onClick={onGenerate}
            disabled={state.data.isGenerating}
          >
            {state.data.isGenerating
              ? state.data.generatingLabel
              : state.data.generateLabel}
          </button>
        </div>
      )}
      {state.status === 'ready' && state.data.showEmpty && (
        <MemberDigestEmptyView viewModel={state.data} />
      )}
      {state.status === 'ready' && state.data.showDigest && (
        <MemberDigestReadyView viewModel={state.data} onCopy={onCopy} />
      )}
    </section>
  );
}
