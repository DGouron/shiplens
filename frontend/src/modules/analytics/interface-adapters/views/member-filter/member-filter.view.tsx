import { type ChangeEvent } from 'react';
import { type MemberFilterViewModel } from '../../presenters/member-filter.view-model.schema.ts';

interface MemberFilterViewProps {
  viewModel: MemberFilterViewModel;
  onMemberSelect: (memberName: string | null) => void;
}

export function MemberFilterView({
  viewModel,
  onMemberSelect,
}: MemberFilterViewProps) {
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const selected = event.target.value;
    onMemberSelect(selected === '' ? null : selected);
  };

  return (
    <label className="member-filter">
      <span className="member-filter-label">{viewModel.label}</span>
      <select
        className="member-filter-select"
        value={viewModel.selectedValue}
        onChange={handleChange}
      >
        {viewModel.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
