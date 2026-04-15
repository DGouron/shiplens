import { MarkdownContent } from '@/components/markdown-content.tsx';
import { type AiReportViewModel } from '../../presenters/ai-report.view-model.schema.ts';

interface AiReportReadyViewProps {
  viewModel: AiReportViewModel;
  onGenerate: () => void;
  onExport: () => void;
  onCopy: () => void;
}

export function AiReportReadyView({
  viewModel,
  onGenerate,
  onExport,
  onCopy,
}: AiReportReadyViewProps) {
  return (
    <div className="ai-report-ready">
      <p className="ai-report-generated-at">{viewModel.generatedAtLabel}</p>
      <MarkdownContent
        className="ai-report-markdown"
        markdown={viewModel.reportMarkdown}
      />
      <div className="ai-report-actions">
        <button
          type="button"
          className="ai-report-export-button"
          onClick={onExport}
        >
          {viewModel.exportLabel}
        </button>
        <button
          type="button"
          className="ai-report-copy-button"
          onClick={onCopy}
        >
          {viewModel.copyLabel}
        </button>
        <button
          type="button"
          className="ai-report-regenerate-button"
          onClick={onGenerate}
          disabled={viewModel.isGenerating}
        >
          {viewModel.isGenerating
            ? viewModel.generatingLabel
            : viewModel.generateLabel}
        </button>
      </div>
      {viewModel.copyConfirmation && (
        <span className="ai-report-copy-confirmation" role="status">
          {viewModel.copyConfirmation}
        </span>
      )}
    </div>
  );
}
