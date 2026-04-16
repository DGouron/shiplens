import { type AiReportViewModel } from '../../presenters/ai-report.view-model.schema.ts';

interface AiReportEmptyViewProps {
  viewModel: AiReportViewModel;
  onGenerate: () => void;
}

export function AiReportEmptyView({
  viewModel,
  onGenerate,
}: AiReportEmptyViewProps) {
  return (
    <div className="ai-report-empty">
      <p className="ai-report-empty-message" role="status">
        {viewModel.emptyMessage}
      </p>
      <button
        type="button"
        className="ai-report-generate-button"
        onClick={onGenerate}
        disabled={viewModel.isGenerating}
      >
        {viewModel.isGenerating
          ? viewModel.generatingLabel
          : viewModel.generateLabel}
      </button>
    </div>
  );
}
