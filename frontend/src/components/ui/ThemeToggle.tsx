import { Moon, SunMedium } from 'lucide-react';
import { Button } from './Button';

interface ThemeToggleProps {
  isDark: boolean;
  onToggle: () => void;
}

export function ThemeToggle({ isDark, onToggle }: ThemeToggleProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      iconLeft={isDark ? <SunMedium className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    >
      {isDark ? 'Light mode' : 'Dark mode'}
    </Button>
  );
}
