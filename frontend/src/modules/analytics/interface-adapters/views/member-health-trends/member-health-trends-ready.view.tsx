import { type MemberHealthTrendsViewModel } from '../../presenters/member-health-trends.view-model.schema.ts';
import { CycleCountSelectorView } from './cycle-count-selector.view.tsx';
import { HealthSignalCardView } from './health-signal-card.view.tsx';

interface MemberHealthTrendsReadyViewProps {
  viewModel: MemberHealthTrendsViewModel;
  onCycleCountChange: (count: number) => void;
}

export function MemberHealthTrendsReadyView({
  viewModel,
  onCycleCountChange,
}: MemberHealthTrendsReadyViewProps) {
  return (
    <main data-testid="member-health-trends-page" className="container">
      <nav className="breadcrumbs" aria-label="Breadcrumbs">
        {viewModel.breadcrumbs.map((crumb) =>
          crumb.href ? (
            <a key={crumb.label} href={crumb.href} className="breadcrumb-link">
              {crumb.label}
            </a>
          ) : (
            <span key={crumb.label} className="breadcrumb-current">
              {crumb.label}
            </span>
          ),
        )}
      </nav>

      <header className="member-health-header">
        <div className="member-health-title-row">
          <h1>{viewModel.pageTitle}</h1>
          <a href={viewModel.backToReportHref} className="back-to-report-link">
            {viewModel.backToReportLabel}
          </a>
        </div>

        <div className="member-health-toolbar">
          <CycleCountSelectorView
            options={viewModel.cycleCountOptions}
            selected={viewModel.selectedCycleCount}
            label={viewModel.completedSprintsLabel}
            onSelect={onCycleCountChange}
          />
        </div>

        <p className="member-health-subtitle">{viewModel.subtitle}</p>
      </header>

      <div className="member-health-notice">
        <p>{viewModel.noticeIntro}</p>
        <p className="member-health-notice-minimum">
          {viewModel.noticeMinimum}
        </p>
      </div>

      <div className="health-signals-grid">
        {viewModel.signals.map((signal) => (
          <HealthSignalCardView key={signal.id} signal={signal} />
        ))}
      </div>

      <footer className="health-legend">
        {viewModel.legendItems.map((item) => (
          <div
            key={item.indicator}
            className="health-legend-item"
            data-indicator={item.indicator}
          >
            <span className="health-legend-dot" />
            <span>{item.label}</span>
          </div>
        ))}
      </footer>
    </main>
  );
}
