interface TopCycleProjectsErrorViewProps {
  message: string;
}

export function TopCycleProjectsErrorView({
  message,
}: TopCycleProjectsErrorViewProps) {
  return <p className="top-cycle-projects-error">{message}</p>;
}
