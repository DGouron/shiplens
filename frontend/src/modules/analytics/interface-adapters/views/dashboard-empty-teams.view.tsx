interface DashboardEmptyTeamsViewProps {
  message: string;
}

export function DashboardEmptyTeamsView({
  message,
}: DashboardEmptyTeamsViewProps) {
  return (
    <div className="empty-state dashboard-empty-teams" role="status">
      <p>{message}</p>
    </div>
  );
}
