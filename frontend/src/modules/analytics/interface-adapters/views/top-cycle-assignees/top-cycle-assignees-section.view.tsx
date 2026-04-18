import { useTopCycleAssignees } from '../../hooks/use-top-cycle-assignees.ts';
import { CycleInsightCardView } from '../cycle-insight-shell/cycle-insight-card.view.tsx';
import { CycleInsightMetricToggleView } from '../cycle-insight-shell/cycle-insight-metric-toggle.view.tsx';
import { TopCycleAssigneesDrawerView } from './top-cycle-assignees-drawer.view.tsx';
import { TopCycleAssigneesErrorView } from './top-cycle-assignees-error.view.tsx';
import { TopCycleAssigneesLoadingView } from './top-cycle-assignees-loading.view.tsx';
import { TopCycleAssigneesReadyView } from './top-cycle-assignees-ready.view.tsx';

interface TopCycleAssigneesSectionViewProps {
  teamId: string | null;
}

export function TopCycleAssigneesSectionView({
  teamId,
}: TopCycleAssigneesSectionViewProps) {
  const { state, drawerState, onMetricChange, onRowClick, onDrawerClose } =
    useTopCycleAssignees({ teamId });

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
        {state.status === 'loading' && <TopCycleAssigneesLoadingView />}
        {state.status === 'error' && (
          <TopCycleAssigneesErrorView message={state.message} />
        )}
        {state.status === 'ready' && (
          <TopCycleAssigneesReadyView
            viewModel={state.data}
            onRowClick={onRowClick}
          />
        )}
      </CycleInsightCardView>
      <TopCycleAssigneesDrawerView
        viewModel={drawerState}
        onClose={onDrawerClose}
      />
    </>
  );
}
