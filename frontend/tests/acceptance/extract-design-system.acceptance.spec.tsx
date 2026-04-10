import { fireEvent, render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ShiplensShell } from '../../src/app.tsx';
import { AppLayout } from '../../src/components/app-layout.tsx';

function renderApp(initialPath = '/') {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <AppLayout />,
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

describe('Extract design system (acceptance)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  describe('theme defaults and persistence', () => {
    it('dark theme by default: no localStorage value, app loads with data-theme="dark"', () => {
      renderApp('/');

      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });

    it('persisted light theme: localStorage "shiplens-theme" = "light", app loads with data-theme="light"', () => {
      window.localStorage.setItem('shiplens-theme', 'light');

      renderApp('/');

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    });

    it('toggle theme: user clicks theme toggle, switches dark to light and persists to localStorage', () => {
      renderApp('/');

      const toggle = screen.getByRole('button', { name: /toggle theme/i });
      fireEvent.click(toggle);

      expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      expect(window.localStorage.getItem('shiplens-theme')).toBe('light');
    });
  });

  describe('navbar structure', () => {
    it('navbar renders brand: "Shiplens" brand link visible, links to /dashboard', () => {
      renderApp('/');

      const brand = screen.getByRole('link', { name: 'Shiplens' });
      expect(brand).toBeInTheDocument();
      expect(brand).toHaveAttribute('href', '/dashboard');
    });

    it('navbar renders settings link: "Settings" link visible in nav-right area', () => {
      renderApp('/');

      const settingsLink = screen.getByRole('link', { name: /settings/i });
      expect(settingsLink).toBeInTheDocument();
    });
  });

  describe('layout wraps page', () => {
    it('layout wraps page: navbar at top plus page content below', () => {
      renderApp('/');

      expect(
        screen.getByRole('link', { name: 'Shiplens' }),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Shiplens', { selector: 'p' }),
      ).toBeInTheDocument();
    });
  });
});
