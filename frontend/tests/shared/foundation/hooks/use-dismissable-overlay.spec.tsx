import { fireEvent, render, renderHook } from '@testing-library/react';
import { type ReactNode, useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { useDismissableOverlay } from '@/shared/foundation/hooks/use-dismissable-overlay.ts';

interface HarnessProps {
  isOpen: boolean;
  onDismiss: () => void;
  onReady?: (panel: HTMLDivElement | null) => void;
  children?: ReactNode;
}

function OverlayHarness(props: HarnessProps) {
  const { panelRef } = useDismissableOverlay({
    isOpen: props.isOpen,
    onDismiss: props.onDismiss,
  });
  useEffect(() => {
    props.onReady?.(panelRef.current);
  });
  return (
    <div>
      <div data-testid="outside">outside</div>
      <div ref={panelRef} data-testid="panel">
        {props.children ?? 'panel'}
      </div>
    </div>
  );
}

describe('useDismissableOverlay', () => {
  it('returns a panelRef', () => {
    const { result } = renderHook(() =>
      useDismissableOverlay({ isOpen: false, onDismiss: () => {} }),
    );

    expect(result.current.panelRef).toBeDefined();
  });

  it('calls onDismiss when Escape is pressed while open', () => {
    const onDismiss = vi.fn();
    render(<OverlayHarness isOpen={true} onDismiss={onDismiss} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not call onDismiss on Escape when closed', () => {
    const onDismiss = vi.fn();
    render(<OverlayHarness isOpen={false} onDismiss={onDismiss} />);

    fireEvent.keyDown(window, { key: 'Escape' });

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('calls onDismiss when the user clicks outside the panel', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <OverlayHarness isOpen={true} onDismiss={onDismiss} />,
    );

    fireEvent.mouseDown(getByTestId('outside'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('does not call onDismiss when clicking inside the panel', () => {
    const onDismiss = vi.fn();
    const { getByTestId } = render(
      <OverlayHarness isOpen={true} onDismiss={onDismiss} />,
    );

    fireEvent.mouseDown(getByTestId('panel'));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('ignores other keys', () => {
    const onDismiss = vi.fn();
    render(<OverlayHarness isOpen={true} onDismiss={onDismiss} />);

    fireEvent.keyDown(window, { key: 'Enter' });

    expect(onDismiss).not.toHaveBeenCalled();
  });
});
