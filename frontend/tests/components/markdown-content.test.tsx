import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { MarkdownContent } from '../../src/components/markdown-content.tsx';

describe('MarkdownContent', () => {
  it('renders markdown headings as html headings', () => {
    const { container } = render(
      <MarkdownContent markdown={'# Title\n\nBody.'} />,
    );

    const heading = container.querySelector('h1');
    expect(heading?.textContent).toBe('Title');
  });

  it('renders markdown paragraphs', () => {
    const { container } = render(
      <MarkdownContent markdown={'Plain paragraph.'} />,
    );

    const paragraph = container.querySelector('p');
    expect(paragraph?.textContent).toBe('Plain paragraph.');
  });

  it('applies the className to the container', () => {
    const { container } = render(
      <MarkdownContent markdown={'content'} className="custom-wrapper" />,
    );

    const wrapper = container.querySelector('.custom-wrapper');
    expect(wrapper).not.toBeNull();
  });
});
