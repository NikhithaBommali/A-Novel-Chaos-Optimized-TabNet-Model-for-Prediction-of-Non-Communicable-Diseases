import type { HTMLAttributes } from 'react';
import { cn } from './utils';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success';
}

export function Badge({ variant = 'default', className, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-primary/15 text-primary',
    secondary: 'bg-secondary text-secondary-foreground',
    outline: 'border border-border bg-background/40 text-foreground',
    success: 'bg-emerald-500/15 text-emerald-400 dark:text-emerald-300',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
