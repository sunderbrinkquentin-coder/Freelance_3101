/**
 * Unified Button Component
 * Mobile First, High Contrast, Consistent Design
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { designSystem } from '../../styles/designSystem';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  children: ReactNode;
  fullWidth?: boolean;
}

export function UnifiedButton({
  variant = 'primary',
  children,
  fullWidth = false,
  className = '',
  ...props
}: ButtonProps) {
  const baseClass = designSystem.buttons[variant];
  const widthClass = fullWidth ? 'w-full' : 'w-full sm:w-auto';

  return (
    <button
      className={`${baseClass} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
