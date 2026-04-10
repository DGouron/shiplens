import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GlassCard } from '../../src/components/glass-card.tsx';

describe('GlassCard', () => {
  it('renders children inside a glass container', () => {
    render(
      <GlassCard>
        <span>card content</span>
      </GlassCard>,
    );

    const content = screen.getByText('card content');
    expect(content).toBeInTheDocument();
    expect(content.parentElement).toHaveClass('glass');
  });

  it('appends additional className when provided', () => {
    render(
      <GlassCard className="sync-bar">
        <span>with extra class</span>
      </GlassCard>,
    );

    const content = screen.getByText('with extra class');
    expect(content.parentElement).toHaveClass('glass');
    expect(content.parentElement).toHaveClass('sync-bar');
  });
});
