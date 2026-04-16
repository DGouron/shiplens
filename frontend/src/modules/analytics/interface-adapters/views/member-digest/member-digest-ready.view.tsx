import { MarkdownContent } from '@/components/markdown-content.tsx';
import { type MemberDigestViewModel } from '../../presenters/member-digest.view-model.schema.ts';

interface MemberDigestReadyViewProps {
  viewModel: MemberDigestViewModel;
  onCopy: () => void;
}

export function MemberDigestReadyView({
  viewModel,
  onCopy,
}: MemberDigestReadyViewProps) {
  return (
    <div className="member-digest-ready">
      <MarkdownContent
        className="member-digest-markdown"
        markdown={viewModel.digestMarkdown}
      />
      <div className="member-digest-actions">
        <button
          type="button"
          className="member-digest-copy-button"
          onClick={onCopy}
        >
          {viewModel.copyLabel}
        </button>
      </div>
      {viewModel.copyConfirmation && (
        <span className="member-digest-copy-confirmation" role="status">
          {viewModel.copyConfirmation}
        </span>
      )}
    </div>
  );
}
