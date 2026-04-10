import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import { App, ShiplensShell } from '../src/app.tsx';

function renderWithRouter(initialPath = '/') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <App />,
        children: [
          { index: true, element: <ShiplensShell /> },
          { path: '*', element: <ShiplensShell /> },
        ],
      },
    ],
    { initialEntries: [initialPath] },
  );

  return render(<RouterProvider router={router} />);
}

describe('App', () => {
  it('renders "Shiplens" text on the root route', () => {
    renderWithRouter('/');

    expect(screen.getByText('Shiplens')).toBeInTheDocument();
  });

  it('renders "Shiplens" text on any unknown route', () => {
    renderWithRouter('/some/unknown/path');

    expect(screen.getByText('Shiplens')).toBeInTheDocument();
  });
});
