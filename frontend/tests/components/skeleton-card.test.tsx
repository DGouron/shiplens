import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SkeletonCard } from '../../src/components/skeleton-card.tsx';

describe('SkeletonCard', () => {
  it('renders with default 3 skeleton lines inside a skeleton-card container', () => {
    const { container } = render(<SkeletonCard />);

    const card = container.querySelector('.skeleton-card');
    expect(card).not.toBeNull();

    const lines = container.querySelectorAll('.skeleton-line');
    expect(lines.length).toBe(3);
  });

  it('renders with a custom number of skeleton lines', () => {
    const { container } = render(<SkeletonCard lines={5} />);

    const lines = container.querySelectorAll('.skeleton-line');
    expect(lines.length).toBe(5);
  });
});
