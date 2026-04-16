import { type HealthSignalViewModel } from '../../presenters/member-health-trends.view-model.schema.ts';

interface HealthSignalCardViewProps {
  signal: HealthSignalViewModel;
}

const TREND_ARROWS: Record<string, string> = {
  rising: '\u2191',
  falling: '\u2193',
  stable: '\u2192',
};

export function HealthSignalCardView({ signal }: HealthSignalCardViewProps) {
  return (
    <article
      className="health-signal-card"
      data-indicator={signal.indicatorColor ?? 'gray'}
      data-testid={`signal-${signal.id}`}
    >
      <div className="health-signal-header">
        <h3 className="health-signal-label">{signal.label}</h3>
        <div className="health-signal-indicator-dot" />
      </div>
      <div className="health-signal-value-row">
        <span className="health-signal-value">{signal.value}</span>
        {signal.trendDirection && (
          <span
            className="health-signal-trend"
            data-trend={signal.trendDirection}
          >
            {TREND_ARROWS[signal.trendDirection]}
          </span>
        )}
      </div>
      <p className="health-signal-description">{signal.description}</p>
      {signal.showNotApplicableNote && (
        <p className="health-signal-note">{signal.notApplicableNote}</p>
      )}
      {signal.showNotEnoughHistoryNote && (
        <p className="health-signal-note">{signal.notEnoughHistoryNote}</p>
      )}
    </article>
  );
}
