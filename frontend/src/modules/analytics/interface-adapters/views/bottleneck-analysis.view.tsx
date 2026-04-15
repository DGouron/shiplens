import { SkeletonCard } from '@/components/skeleton-card.tsx';
import { type BottleneckAnalysisState } from '../hooks/use-bottleneck-analysis.ts';
import { type BottleneckAnalysisTranslations } from '../presenters/bottleneck-analysis.translations.ts';
import {
  type BottleneckAnalysisViewModel,
  type BottleneckRowViewModel,
} from '../presenters/bottleneck-analysis.view-model.schema.ts';

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

interface BottleneckAnalysisReadyViewProps {
  viewModel: BottleneckAnalysisViewModel;
  translations: BottleneckAnalysisTranslations;
}

function BottleneckAnalysisReadyView({
  viewModel,
  translations,
}: BottleneckAnalysisReadyViewProps) {
  return (
    <div className="bottleneck-analysis-content">
      <p className="bottleneck-analysis-headline">
        {viewModel.bottleneckHeadline}
      </p>
      {viewModel.emptyMessage !== null && (
        <p className="bottleneck-analysis-empty">{viewModel.emptyMessage}</p>
      )}
      {viewModel.rows.length > 0 && (
        <BottleneckAnalysisTableView
          rows={viewModel.rows}
          statusHeader={translations.tableHeaderStatus}
          medianHeader={translations.tableHeaderMedianTime}
          bottleneckRowLabel={translations.bottleneckRowLabel}
        />
      )}
    </div>
  );
}

interface BottleneckAnalysisTableViewProps {
  rows: BottleneckRowViewModel[];
  statusHeader: string;
  medianHeader: string;
  bottleneckRowLabel: string;
}

function BottleneckAnalysisTableView({
  rows,
  statusHeader,
  medianHeader,
  bottleneckRowLabel,
}: BottleneckAnalysisTableViewProps) {
  return (
    <table className="bottleneck-analysis-table">
      <thead>
        <tr>
          <th scope="col">{statusHeader}</th>
          <th scope="col">{medianHeader}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <BottleneckAnalysisRowView
            key={row.statusName}
            row={row}
            bottleneckRowLabel={bottleneckRowLabel}
          />
        ))}
      </tbody>
    </table>
  );
}

interface BottleneckAnalysisRowViewProps {
  row: BottleneckRowViewModel;
  bottleneckRowLabel: string;
}

function BottleneckAnalysisRowView({
  row,
  bottleneckRowLabel,
}: BottleneckAnalysisRowViewProps) {
  const className = row.isBottleneck
    ? 'bottleneck-analysis-row bottleneck-analysis-row--highlighted'
    : 'bottleneck-analysis-row';
  const highlightedProps = row.isBottleneck
    ? { 'aria-label': bottleneckRowLabel }
    : {};
  return (
    <tr className={className} {...highlightedProps}>
      <td>{row.statusName}</td>
      <td>{row.medianHoursLabel}</td>
    </tr>
  );
}
