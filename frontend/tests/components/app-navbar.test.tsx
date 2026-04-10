import { render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AppNavbar } from '../../src/components/app-navbar.tsx';

function renderWithRouter(element: React.ReactElement) {
  const router = createMemoryRouter([{ path: '/', element }], {
    initialEntries: ['/'],
  });
  return render(<RouterProvider router={router} />);
}

describe('AppNavbar', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders the Shiplens brand link pointing to /dashboard', () => {
    renderWithRouter(
      <AppNavbar
        breadcrumbs={[]}
        settingsLabel="Settings"
        themeToggleTitle="Toggle theme"
      />,
    );

    const brand = screen.getByRole('link', { name: 'Shiplens' });
    expect(brand).toHaveAttribute('href', '/dashboard');
    expect(brand).toHaveClass('nav-brand');
  });

  it('renders provided breadcrumbs', () => {
    renderWithRouter(
      <AppNavbar
        breadcrumbs={[{ label: 'Dashboard', active: true }]}
        settingsLabel="Settings"
        themeToggleTitle="Toggle theme"
      />,
    );

    const active = screen.getByText('Dashboard');
    expect(active).toHaveClass('nav-crumb-active');
  });

  it('renders the settings link with provided label', () => {
    renderWithRouter(
      <AppNavbar
        breadcrumbs={[]}
        settingsLabel="Settings"
        themeToggleTitle="Toggle theme"
      />,
    );

    const settingsLink = screen.getByRole('link', { name: 'Settings' });
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('renders the theme toggle button', () => {
    renderWithRouter(
      <AppNavbar
        breadcrumbs={[]}
        settingsLabel="Settings"
        themeToggleTitle="Toggle theme"
      />,
    );

    expect(
      screen.getByRole('button', { name: /toggle theme/i }),
    ).toBeInTheDocument();
  });

  it('hides settings link when showSettings is false', () => {
    renderWithRouter(
      <AppNavbar
        breadcrumbs={[]}
        settingsLabel="Settings"
        themeToggleTitle="Toggle theme"
        showSettings={false}
      />,
    );

    expect(
      screen.queryByRole('link', { name: 'Settings' }),
    ).not.toBeInTheDocument();
  });

  it('groups brand and breadcrumbs inside nav-left', () => {
    const { container } = renderWithRouter(
      <AppNavbar
        breadcrumbs={[{ label: 'Dashboard', active: true }]}
        settingsLabel="Settings"
        themeToggleTitle="Toggle theme"
      />,
    );

    const navLeft = container.querySelector('.nav-left');
    expect(navLeft).not.toBeNull();
    if (navLeft instanceof HTMLElement) {
      expect(
        within(navLeft).getByRole('link', { name: 'Shiplens' }),
      ).toBeInTheDocument();
      expect(within(navLeft).getByText('Dashboard')).toBeInTheDocument();
    }
  });
});
