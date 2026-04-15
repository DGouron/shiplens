import { type TeamOptionViewModel } from '../presenters/cycle-report-shell.view-model.schema.ts';

interface CycleReportTeamSelectorViewProps {
  label: string;
  placeholder: string;
  selectedTeamId: string | null;
  options: TeamOptionViewModel[];
  onTeamChange: (teamId: string) => void;
}

export function CycleReportTeamSelectorView({
  label,
  placeholder,
  selectedTeamId,
  options,
  onTeamChange,
}: CycleReportTeamSelectorViewProps) {
  return (
    <label className="cycle-report-selector">
      <span>{label}</span>
      <select
        value={selectedTeamId ?? ''}
        onChange={(event) => onTeamChange(event.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.teamId} value={option.teamId}>
            {option.teamName}
          </option>
        ))}
      </select>
    </label>
  );
}
