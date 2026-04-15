import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type EstimationAccuracyState } from '../../hooks/use-estimation-accuracy.ts';
import { type EstimationAccuracyTranslations } from '../../presenters/estimation-accuracy.translations.ts';
import { EstimationAccuracyReadyView } from './estimation-accuracy-ready.view.tsx';

interface EstimationAccuracySectionViewProps {
  state: EstimationAccuracyState;
  translations: EstimationAccuracyTranslations;
}

export function EstimationAccuracySectionView({
  state,
  translations,
}: EstimationAccuracySectionViewProps) {
  return (
    <section
      className="cycle-report-section estimation-accuracy-section"
      data-section-id="estimation"
    >
      <h2>{translations.sectionTitle}</h2>
      {state.status === 'loading' && <SkeletonCard />}
      {state.status === 'error' && (
        <p className="estimation-accuracy-error">{state.message}</p>
      )}
      {state.status === 'ready' && (
        <EstimationAccuracyReadyView
          viewModel={state.data}
          translations={translations}
        />
      )}
    </section>
  );
}
