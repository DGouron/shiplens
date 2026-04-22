interface TopCycleThemesLoadingViewProps {
  message: string;
  hint: string;
}

export function TopCycleThemesLoadingView({
  message,
  hint,
}: TopCycleThemesLoadingViewProps) {
  return (
    <div className="top-cycle-themes-loading" role="status" aria-live="polite">
      <div className="top-cycle-themes-loading__pulse" aria-hidden="true">
        <span className="top-cycle-themes-loading__dot" />
        <span className="top-cycle-themes-loading__dot" />
        <span className="top-cycle-themes-loading__dot" />
      </div>
      <p className="top-cycle-themes-loading__message">{message}</p>
      <p className="top-cycle-themes-loading__hint">{hint}</p>
    </div>
  );
}
