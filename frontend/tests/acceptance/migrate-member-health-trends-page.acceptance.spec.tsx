import { render, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, describe, expect, it } from 'vitest';
import { App } from '@/app.tsx';
import { overrideUsecases, resetUsecases } from '@/main/dependencies.ts';
import { MemberHealthTrendsView } from '@/modules/analytics/interface-adapters/views/member-health-trends/member-health-trends.view.tsx';
import { FailingMemberHealthGateway } from '@/modules/analytics/testing/bad-path/failing.member-health.in-memory.gateway.ts';
import { StubMemberHealthGateway } from '@/modules/analytics/testing/good-path/stub.member-health.in-memory.gateway.ts';
import { GetMemberHealthUsecase } from '@/modules/analytics/usecases/get-member-health.usecase.ts';
import { MemberHealthResponseBuilder } from '../builders/member-health-response.builder.ts';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

function renderAtPath(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [
          {
            path: 'member-health-trends',
            element: <MemberHealthTrendsView />,
          },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(withQueryClient(<RouterProvider router={router} />));
}

describe('Migrate member health trends page (acceptance)', () => {
  afterEach(() => {
    resetUsecases();
  });

  describe('nominal health signals', () => {
    it('renders 5 signal cards with correct labels and values when data is available', async () => {
      const gateway = new StubMemberHealthGateway({
        response: new MemberHealthResponseBuilder()
          .withEstimationScore({
            value: '78%',
            trend: 'rising',
            indicator: 'green',
          })
          .withUnderestimationRatio({
            value: '12%',
            trend: 'falling',
            indicator: 'green',
          })
          .withAverageCycleTime({
            value: '2.3d',
            trend: 'stable',
            indicator: 'green',
          })
          .withDriftingTickets({
            value: '1',
            trend: 'falling',
            indicator: 'green',
          })
          .withMedianReviewTime({
            value: '4h',
            trend: 'stable',
            indicator: 'green',
          })
          .build(),
      });
      overrideUsecases({
        getMemberHealth: new GetMemberHealthUsecase(gateway),
      });

      renderAtPath('/member-health-trends?teamId=team-1&memberName=Alice');

      await waitFor(() => {
        expect(screen.getByText('78%')).toBeInTheDocument();
      });
      expect(screen.getByText('12%')).toBeInTheDocument();
      expect(screen.getByText('2.3d')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('4h')).toBeInTheDocument();
      expect(screen.getByText('Estimation Score')).toBeInTheDocument();
      expect(screen.getByText('Underestimation Ratio')).toBeInTheDocument();
      expect(screen.getByText('Average Cycle Time')).toBeInTheDocument();
      expect(screen.getByText('Drifting Tickets')).toBeInTheDocument();
      expect(screen.getByText('Median Review Time')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('displays "No data available for this member" when the gateway returns null', async () => {
      const gateway = new StubMemberHealthGateway({ response: null });
      overrideUsecases({
        getMemberHealth: new GetMemberHealthUsecase(gateway),
      });

      renderAtPath('/member-health-trends?teamId=team-1&memberName=Bob');

      await waitFor(() => {
        expect(
          screen.getByText('No data available for this member'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('displays an error message when the gateway fails', async () => {
      overrideUsecases({
        getMemberHealth: new GetMemberHealthUsecase(
          new FailingMemberHealthGateway(),
        ),
      });

      renderAtPath('/member-health-trends?teamId=team-1&memberName=Charlie');

      await waitFor(() => {
        expect(
          screen.getByText('Failed to fetch member health data'),
        ).toBeInTheDocument();
      });
    });
  });

  describe('not-applicable signal', () => {
    it('displays the not-applicable note on a signal with not-applicable indicator', async () => {
      const gateway = new StubMemberHealthGateway({
        response: new MemberHealthResponseBuilder()
          .withEstimationScore({
            value: 'Not applicable',
            trend: null,
            indicator: 'not-applicable',
          })
          .build(),
      });
      overrideUsecases({
        getMemberHealth: new GetMemberHealthUsecase(gateway),
      });

      renderAtPath('/member-health-trends?teamId=team-1&memberName=Dave');

      await waitFor(() => {
        expect(
          screen.getByText(
            'Not applicable — this member has no estimated issues in the analyzed sprints',
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('not-enough-history signal', () => {
    it('displays the not-enough-history note on a signal with not-enough-history indicator', async () => {
      const gateway = new StubMemberHealthGateway({
        response: new MemberHealthResponseBuilder()
          .withEstimationScore({
            value: '60%',
            trend: null,
            indicator: 'not-enough-history',
          })
          .build(),
      });
      overrideUsecases({
        getMemberHealth: new GetMemberHealthUsecase(gateway),
      });

      renderAtPath('/member-health-trends?teamId=team-1&memberName=Eve');

      await waitFor(() => {
        expect(
          screen.getByText(
            'Not enough history — at least 3 completed sprints are needed to compute a trend',
          ),
        ).toBeInTheDocument();
      });
    });
  });

  describe('back navigation', () => {
    it('renders a back link to /cycle-report?teamId=xxx', async () => {
      const gateway = new StubMemberHealthGateway();
      overrideUsecases({
        getMemberHealth: new GetMemberHealthUsecase(gateway),
      });

      renderAtPath('/member-health-trends?teamId=team-42&memberName=Alice');

      await waitFor(() => {
        expect(screen.getByText('Back to cycle report')).toBeInTheDocument();
      });
      const link = screen.getByText('Back to cycle report').closest('a');
      expect(link).toHaveAttribute('href', '/cycle-report?teamId=team-42');
    });
  });
});
