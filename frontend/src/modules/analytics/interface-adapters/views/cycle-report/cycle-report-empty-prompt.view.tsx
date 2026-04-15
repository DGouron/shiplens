interface CycleReportEmptyPromptViewProps {
  message: string;
}

export function CycleReportEmptyPromptView({
  message,
}: CycleReportEmptyPromptViewProps) {
  return (
    <div className="empty-state">
      <p>{message}</p>
    </div>
  );
}
