import { type CycleOptionViewModel } from '../presenters/cycle-report-shell.view-model.schema.ts';

interface CycleReportCycleSelectorViewProps {
  label: string;
  placeholder: string;
  selectedCycleId: string | null;
  options: CycleOptionViewModel[];
  onCycleChange: (cycleId: string) => void;
}

export function CycleReportCycleSelectorView({
  label,
  placeholder,
  selectedCycleId,
  options,
  onCycleChange,
}: CycleReportCycleSelectorViewProps) {
  return (
    <label className="cycle-report-selector">
      <span>{label}</span>
      <select
        value={selectedCycleId ?? ''}
        onChange={(event) => onCycleChange(event.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.cycleId} value={option.cycleId}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
