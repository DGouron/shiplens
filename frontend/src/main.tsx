import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router';
import { App, ShiplensShell } from './app.tsx';
import { LocaleProvider } from './locale-context.tsx';
import { queryClient } from './main/query-client.ts';
import { DashboardView } from './modules/analytics/interface-adapters/views/dashboard.view.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardView /> },
      { path: '*', element: <ShiplensShell /> },
    ],
  },
]);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <LocaleProvider>
          <RouterProvider router={router} />
        </LocaleProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
