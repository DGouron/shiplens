import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from '../../src/components/theme-toggle.tsx';

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('applies dark theme by default when no localStorage value is present', () => {
    render(<ThemeToggle title="Toggle theme" />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('applies persisted theme from localStorage on mount', () => {
    window.localStorage.setItem('shiplens-theme', 'light');

    render(<ThemeToggle title="Toggle theme" />);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });

  it('toggles theme from dark to light on click and persists to localStorage', () => {
    render(<ThemeToggle title="Toggle theme" />);

    const toggle = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(window.localStorage.getItem('shiplens-theme')).toBe('light');
  });

  it('toggles theme from light to dark on second click', () => {
    render(<ThemeToggle title="Toggle theme" />);

    const toggle = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(toggle);
    fireEvent.click(toggle);

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(window.localStorage.getItem('shiplens-theme')).toBe('dark');
  });

  it('renders with theme-toggle class and the provided title', () => {
    render(<ThemeToggle title="Basculer le thème" />);

    const toggle = screen.getByRole('button', { name: /basculer le thème/i });
    expect(toggle).toHaveClass('theme-toggle');
    expect(toggle).toHaveAttribute('title', 'Basculer le thème');
  });
});
