import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router';
import { App, ShiplensShell } from './app.tsx';
import { LocaleProvider } from './locale-context.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <ShiplensShell /> },
      { path: '*', element: <ShiplensShell /> },
    ],
  },
]);

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <LocaleProvider>
        <RouterProvider router={router} />
      </LocaleProvider>
    </StrictMode>,
  );
}
