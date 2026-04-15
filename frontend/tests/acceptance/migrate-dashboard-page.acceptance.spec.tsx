import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App } from '@/app.tsx';
import { DashboardView } from '@/modules/analytics/interface-adapters/views/dashboard.view.tsx';
import { withQueryClient } from '../helpers/query-client-wrapper.tsx';

function renderAtPath(initialPath: string) {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [{ path: 'dashboard', element: <DashboardView /> }],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(withQueryClient(<RouterProvider router={router} />));
}

describe('Migrate dashboard page (acceptance)', () => {
  it('dashboard route renders: navigating to /dashboard shows the Dashboard page heading', () => {
    renderAtPath('/dashboard');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Dashboard' }),
    ).toBeInTheDocument();
  });

  it.skip('nominal dashboard renders 3 team cards', () => {});

  it.skip('empty state not_connected shows the guidance message', () => {});
});
