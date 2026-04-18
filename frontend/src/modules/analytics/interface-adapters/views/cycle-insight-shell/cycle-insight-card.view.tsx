import { type ReactNode } from 'react';

interface CycleInsightCardViewProps {
  title: string;
  headerAction?: ReactNode;
  metricToggle?: ReactNode;
  children: ReactNode;
}

export function CycleInsightCardView({
  title,
  headerAction,
  metricToggle,
  children,
}: CycleInsightCardViewProps) {
  return (
    <section className="cycle-insight-card">
      <header className="cycle-insight-card__header">
        <h2 className="cycle-insight-card__title">{title}</h2>
        {headerAction}
      </header>
      {metricToggle}
      <div className="cycle-insight-card__body">{children}</div>
    </section>
  );
}
