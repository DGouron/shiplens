import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '../../src/components/button.tsx';

describe('Button', () => {
  it('renders default variant with btn class', () => {
    render(<Button>Resynchronize</Button>);

    const button = screen.getByRole('button', { name: 'Resynchronize' });
    expect(button).toHaveClass('btn');
    expect(button).not.toHaveClass('btn-accent');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renders accent variant with btn and btn-accent classes', () => {
    render(<Button variant="accent">Generate report</Button>);

    const button = screen.getByRole('button', { name: 'Generate report' });
    expect(button).toHaveClass('btn');
    expect(button).toHaveClass('btn-accent');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole('button', { name: 'Click me' }));

    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('disables button when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);

    expect(screen.getByRole('button', { name: 'Disabled' })).toBeDisabled();
  });
});
