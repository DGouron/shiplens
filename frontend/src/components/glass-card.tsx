import { type ReactNode } from 'react';
import '../styles/glass-card.css';

type GlassCardProps = {
  children: ReactNode;
  className?: string;
};

export function GlassCard({ children, className }: GlassCardProps) {
  const combinedClassName = className ? `glass ${className}` : 'glass';
  return <div className={combinedClassName}>{children}</div>;
}
