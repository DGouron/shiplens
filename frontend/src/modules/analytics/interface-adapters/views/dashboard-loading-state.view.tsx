import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type DashboardTranslations } from '../presenters/dashboard.translations.ts';

interface DashboardLoadingStateViewProps {
  translations: DashboardTranslations;
}

export function DashboardLoadingStateView({
  translations,
}: DashboardLoadingStateViewProps) {
  return (
    <div
      className="teams-grid"
      role="status"
      aria-live="polite"
      aria-label={translations.loading}
    >
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}
