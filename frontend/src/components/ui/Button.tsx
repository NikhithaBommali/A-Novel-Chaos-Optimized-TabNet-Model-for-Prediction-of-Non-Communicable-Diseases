import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from './utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  iconLeft,
  className,
  children,
  ...props
}: ButtonProps) {
  const variants = {
    primary: 'bg-gradient-primary text-primary-foreground hover:opacity-95 active:scale-[0.99] shadow-glow',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.99]',
    outline: 'border border-border bg-background/70 text-foreground hover:bg-secondary active:scale-[0.99]',
    ghost: 'text-foreground hover:bg-secondary active:scale-[0.99]',
  };

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-11 px-5 text-base',
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {iconLeft}
      {children}
    </button>
  );
}
