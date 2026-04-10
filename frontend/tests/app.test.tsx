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
  it('renders the Shiplens brand link in the navbar on the root route', () => {
    renderWithRouter('/');

    const brand = screen.getByRole('link', { name: 'Shiplens' });
    expect(brand).toBeInTheDocument();
    expect(brand).toHaveAttribute('href', '/dashboard');
  });

  it('renders the Shiplens brand link in the navbar on any unknown route', () => {
    renderWithRouter('/some/unknown/path');

    expect(
      screen.getByRole('link', { name: 'Shiplens' }),
    ).toBeInTheDocument();
  });
});
