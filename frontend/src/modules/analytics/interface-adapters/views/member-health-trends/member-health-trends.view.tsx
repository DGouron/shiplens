import '@/styles/member-health-trends.css';
import { useMemberHealthTrends } from '../../hooks/use-member-health-trends.ts';
import { MemberHealthTrendsReadyView } from './member-health-trends-ready.view.tsx';

export function MemberHealthTrendsView() {
  const { state, changeCycleCount } = useMemberHealthTrends();

  if (state.status === 'loading') {
    return (
      <main data-testid="member-health-trends-page" className="container">
        <div className="health-signals-skeleton">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </main>
    );
  }

  if (state.status === 'error') {
    return (
      <main data-testid="member-health-trends-page" className="container">
        <p className="error-message">{state.message}</p>
      </main>
    );
  }

  if (state.status === 'empty') {
    return (
      <main data-testid="member-health-trends-page" className="container">
        <p className="empty-message">{state.message}</p>
      </main>
    );
  }

  return (
    <MemberHealthTrendsReadyView
      viewModel={state.data}
      onCycleCountChange={changeCycleCount}
    />
  );
}
