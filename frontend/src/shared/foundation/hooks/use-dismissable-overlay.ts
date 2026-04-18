import { useEffect, useRef } from 'react';

export interface UseDismissableOverlayParams {
  isOpen: boolean;
  onDismiss: () => void;
}

export interface UseDismissableOverlayResult {
  panelRef: React.RefObject<HTMLDivElement | null>;
}

export function useDismissableOverlay(
  params: UseDismissableOverlayParams,
): UseDismissableOverlayResult {
  const { isOpen, onDismiss } = params;
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onDismiss();
      }
    };

    const handleMouseDown = (event: MouseEvent) => {
      const panel = panelRef.current;
      if (panel === null) return;
      if (!(event.target instanceof Node)) return;
      if (panel.contains(event.target)) return;
      onDismiss();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isOpen, onDismiss]);

  return { panelRef };
}
