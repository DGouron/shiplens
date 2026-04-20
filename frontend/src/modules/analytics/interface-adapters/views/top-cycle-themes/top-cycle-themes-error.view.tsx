interface TopCycleThemesErrorViewProps {
  message: string;
}

export function TopCycleThemesErrorView({
  message,
}: TopCycleThemesErrorViewProps) {
  return <p className="top-cycle-themes-error">{message}</p>;
}
