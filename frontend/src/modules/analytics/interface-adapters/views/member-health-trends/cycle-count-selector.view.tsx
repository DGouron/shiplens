interface CycleCountSelectorViewProps {
  options: number[];
  selected: number;
  label: string;
  onSelect: (count: number) => void;
}

export function CycleCountSelectorView({
  options,
  selected,
  label,
  onSelect,
}: CycleCountSelectorViewProps) {
  return (
    <div className="cycle-count-selector">
      <span>{label}</span>
      <select
        value={selected}
        onChange={(event) => onSelect(Number(event.target.value))}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
