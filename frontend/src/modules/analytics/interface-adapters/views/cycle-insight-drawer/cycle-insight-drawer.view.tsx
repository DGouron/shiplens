import { type ReactNode } from 'react';
import { useDismissableOverlay } from '@/shared/foundation/hooks/use-dismissable-overlay.ts';

interface CycleInsightDrawerViewProps {
  isOpen: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}

export function CycleInsightDrawerView({
  isOpen,
  title,
  closeLabel,
  onClose,
  children,
}: CycleInsightDrawerViewProps) {
  const { panelRef } = useDismissableOverlay({ isOpen, onDismiss: onClose });

  return (
    <div
      className={
        isOpen
          ? 'cycle-insight-drawer cycle-insight-drawer--open'
          : 'cycle-insight-drawer'
      }
      aria-hidden={!isOpen}
    >
      <div
        className="cycle-insight-drawer__overlay"
        data-testid="cycle-insight-drawer-overlay"
      />
      <aside
        ref={panelRef}
        className="cycle-insight-drawer__panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="cycle-insight-drawer__header">
          <h3 className="cycle-insight-drawer__title">{title}</h3>
          <button
            type="button"
            className="cycle-insight-drawer__close"
            onClick={onClose}
          >
            {closeLabel}
          </button>
        </header>
        <div className="cycle-insight-drawer__body">{children}</div>
      </aside>
    </div>
  );
}
