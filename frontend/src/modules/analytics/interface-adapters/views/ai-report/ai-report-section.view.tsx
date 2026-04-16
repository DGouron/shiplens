import '@/styles/ai-report.css';
import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type AiReportState } from '../../hooks/use-ai-report.ts';
import { type AiReportTranslations } from '../../presenters/ai-report.translations.ts';
import { AiReportEmptyView } from './ai-report-empty.view.tsx';
import { AiReportReadyView } from './ai-report-ready.view.tsx';

interface AiReportSectionViewProps {
  state: AiReportState;
  translations: AiReportTranslations;
  onGenerate: () => void;
  onExport: () => void;
  onCopy: () => void;
}

export function AiReportSectionView({
  state,
  translations,
  onGenerate,
  onExport,
  onCopy,
}: AiReportSectionViewProps) {
  return (
    <section
      className="cycle-report-section ai-report-section"
      data-section-id="ai-report"
    >
      <h2>{translations.sectionTitle}</h2>
      {state.status === 'loading' && <SkeletonCard />}
      {state.status === 'error' && (
        <p className="ai-report-error">{state.message}</p>
      )}
      {state.status === 'ready' && state.data.showEmpty && (
        <AiReportEmptyView viewModel={state.data} onGenerate={onGenerate} />
      )}
      {state.status === 'ready' && state.data.showReport && (
        <AiReportReadyView
          viewModel={state.data}
          onGenerate={onGenerate}
          onExport={onExport}
          onCopy={onCopy}
        />
      )}
    </section>
  );
}
