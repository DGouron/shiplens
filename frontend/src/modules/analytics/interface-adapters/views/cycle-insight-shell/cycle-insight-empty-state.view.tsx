interface CycleInsightEmptyStateViewProps {
  message: string;
  tone?: 'neutral' | 'warning';
}

export function CycleInsightEmptyStateView({
  message,
  tone = 'neutral',
}: CycleInsightEmptyStateViewProps) {
  const className =
    tone === 'warning'
      ? 'cycle-insight-empty-state cycle-insight-empty-state--warning'
      : 'cycle-insight-empty-state';
  return (
    <p className={className} role="status">
      {message}
    </p>
  );
}
