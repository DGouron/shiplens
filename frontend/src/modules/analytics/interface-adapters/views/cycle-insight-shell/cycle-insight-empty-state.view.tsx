interface CycleInsightEmptyStateViewProps {
  message: string;
}

export function CycleInsightEmptyStateView({
  message,
}: CycleInsightEmptyStateViewProps) {
  return (
    <p className="cycle-insight-empty-state" role="status">
      {message}
    </p>
  );
}
