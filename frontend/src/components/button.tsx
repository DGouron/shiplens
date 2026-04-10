import { type ReactNode } from 'react';
import '../styles/button.css';

type ButtonVariant = 'default' | 'accent';

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

export function Button({
  children,
  variant = 'default',
  onClick,
  disabled = false,
  type = 'button',
}: ButtonProps) {
  const className = variant === 'accent' ? 'btn btn-accent' : 'btn';
  return (
    <button
      type={type}
      className={className}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
