interface TopCycleAssigneesErrorViewProps {
  message: string;
}

export function TopCycleAssigneesErrorView({
  message,
}: TopCycleAssigneesErrorViewProps) {
  return <p className="top-cycle-assignees-error">{message}</p>;
}
