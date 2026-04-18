import { useTopCycleProjects } from '../../hooks/use-top-cycle-projects.ts';
import { CycleInsightCardView } from '../cycle-insight-shell/cycle-insight-card.view.tsx';
import { CycleInsightMetricToggleView } from '../cycle-insight-shell/cycle-insight-metric-toggle.view.tsx';
import { TopCycleProjectsDrawerView } from './top-cycle-projects-drawer.view.tsx';
import { TopCycleProjectsErrorView } from './top-cycle-projects-error.view.tsx';
import { TopCycleProjectsLoadingView } from './top-cycle-projects-loading.view.tsx';
import { TopCycleProjectsReadyView } from './top-cycle-projects-ready.view.tsx';

interface TopCycleProjectsSectionViewProps {
  teamId: string | null;
}

export function TopCycleProjectsSectionView({
  teamId,
}: TopCycleProjectsSectionViewProps) {
  const {
    state,
    drawerState,
    onMetricChange,
    onRowClick,
    onDrawerClose,
    onToggleExpand,
  } = useTopCycleProjects({ teamId });

  if (teamId === null) {
    return null;
  }

  const title = state.status === 'ready' ? state.data.title : '';
  const metricToggle =
    state.status === 'ready' ? (
      <CycleInsightMetricToggleView
        activeMetric={state.data.metricToggle.activeMetric}
        countLabel={state.data.metricToggle.countLabel}
        pointsLabel={state.data.metricToggle.pointsLabel}
        timeLabel={state.data.metricToggle.timeLabel}
        onChange={onMetricChange}
      />
    ) : null;

  return (
    <>
      <CycleInsightCardView title={title} metricToggle={metricToggle}>
        {state.status === 'loading' && <TopCycleProjectsLoadingView />}
        {state.status === 'error' && (
          <TopCycleProjectsErrorView message={state.message} />
        )}
        {state.status === 'ready' && (
          <TopCycleProjectsReadyView
            viewModel={state.data}
            onRowClick={onRowClick}
            onToggleExpand={onToggleExpand}
          />
        )}
      </CycleInsightCardView>
      <TopCycleProjectsDrawerView
        viewModel={drawerState}
        onClose={onDrawerClose}
      />
    </>
  );
}
