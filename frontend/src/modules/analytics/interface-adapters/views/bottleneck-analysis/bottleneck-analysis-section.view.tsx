import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type BottleneckAnalysisState } from '../../hooks/use-bottleneck-analysis.ts';
import { type BottleneckAnalysisTranslations } from '../../presenters/bottleneck-analysis.translations.ts';
import { BottleneckAnalysisReadyView } from './bottleneck-analysis-ready.view.tsx';

interface BottleneckAnalysisSectionViewProps {
  state: BottleneckAnalysisState;
  translations: BottleneckAnalysisTranslations;
}

export function BottleneckAnalysisSectionView({
  state,
  translations,
}: BottleneckAnalysisSectionViewProps) {
  return (
    <section
      className="cycle-report-section bottleneck-analysis-section"
      data-section-id="bottlenecks"
    >
      <h2>{translations.sectionTitle}</h2>
      {state.status === 'loading' && <SkeletonCard />}
      {state.status === 'error' && (
        <p className="bottleneck-analysis-error">{state.message}</p>
      )}
      {state.status === 'ready' && (
        <BottleneckAnalysisReadyView
          viewModel={state.data}
          translations={translations}
        />
      )}
    </section>
  );
}
