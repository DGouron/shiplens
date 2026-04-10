import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it } from 'vitest';
import {
  Breadcrumb,
  type BreadcrumbItem,
} from '../../src/components/breadcrumb.tsx';

function renderWithRouter(items: BreadcrumbItem[]) {
  const router = createMemoryRouter(
    [{ path: '/', element: <Breadcrumb items={items} /> }],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('Breadcrumb', () => {
  it('renders a single active item without a separator', () => {
    renderWithRouter([{ label: 'Dashboard', active: true }]);

    const active = screen.getByText('Dashboard');
    expect(active).toHaveClass('nav-crumb-active');
    expect(screen.queryByText('/')).not.toBeInTheDocument();
  });

  it('renders multiple items with slash separators between them', () => {
    renderWithRouter([
      { label: 'Dashboard', href: '/dashboard' },
      { label: 'Team', href: '/dashboard/team' },
      { label: 'Cycle', active: true },
    ]);

    const separators = screen.getAllByText('/');
    expect(separators.length).toBe(2);

    const dashboardLink = screen.getByRole('link', { name: 'Dashboard' });
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(dashboardLink).toHaveClass('nav-crumb');

    const activeItem = screen.getByText('Cycle');
    expect(activeItem).toHaveClass('nav-crumb-active');
  });

  it('renders items without href as plain text with nav-crumb class', () => {
    renderWithRouter([{ label: 'Static', active: false }]);

    const item = screen.getByText('Static');
    expect(item).toHaveClass('nav-crumb');
    expect(item.tagName).toBe('SPAN');
  });
});
