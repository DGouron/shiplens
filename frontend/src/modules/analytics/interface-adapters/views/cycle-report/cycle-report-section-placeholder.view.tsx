import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type SectionPlaceholderViewModel } from '../../presenters/cycle-report-shell.view-model.schema.ts';

interface CycleReportSectionPlaceholderViewProps {
  placeholder: SectionPlaceholderViewModel;
}

export function CycleReportSectionPlaceholderView({
  placeholder,
}: CycleReportSectionPlaceholderViewProps) {
  return (
    <section className="cycle-report-section" data-section-id={placeholder.id}>
      <h2>{placeholder.title}</h2>
      <SkeletonCard />
    </section>
  );
}
