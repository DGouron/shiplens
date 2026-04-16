interface SettingsStatusToggleViewProps {
  statusName: string;
  isExcluded: boolean;
  toggleLabel: string;
  onToggle: () => void;
}

export function SettingsStatusToggleView({
  statusName,
  isExcluded,
  toggleLabel,
  onToggle,
}: SettingsStatusToggleViewProps) {
  return (
    <div className="settings-status-toggle">
      <span className="settings-status-name">{statusName}</span>
      <button
        type="button"
        className={`settings-toggle-button ${isExcluded ? 'excluded' : 'included'}`}
        onClick={onToggle}
      >
        {toggleLabel}
      </button>
    </div>
  );
}
