import { type MemberDigestViewModel } from '../../presenters/member-digest.view-model.schema.ts';

interface MemberDigestEmptyViewProps {
  viewModel: MemberDigestViewModel;
}

export function MemberDigestEmptyView({
  viewModel,
}: MemberDigestEmptyViewProps) {
  return (
    <div className="member-digest-empty">
      <p className="member-digest-empty-message" role="status">
        {viewModel.emptyMessage}
      </p>
    </div>
  );
}
