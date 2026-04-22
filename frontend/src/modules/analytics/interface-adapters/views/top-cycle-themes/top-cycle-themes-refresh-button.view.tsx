interface TopCycleThemesRefreshButtonViewProps {
  label: string;
  onClick: () => void;
}

export function TopCycleThemesRefreshButtonView({
  label,
  onClick,
}: TopCycleThemesRefreshButtonViewProps) {
  return (
    <button
      type="button"
      className="top-cycle-themes-refresh-button"
      onClick={onClick}
    >
      {label}
    </button>
  );
}
