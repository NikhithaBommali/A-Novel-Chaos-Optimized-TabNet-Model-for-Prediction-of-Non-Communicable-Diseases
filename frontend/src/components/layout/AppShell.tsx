import type { ReactNode } from 'react';
import { BrainCircuit, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { ThemeToggle } from '../ui/ThemeToggle';

interface AppShellProps {
  children: ReactNode;
  isDark: boolean;
  onToggleTheme: () => void;
}

export function AppShell({ children, isDark, onToggleTheme }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-divider/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow">
              <BrainCircuit className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-semibold sm:text-lg">BrightWorks Repository Preview</h1>
                <Badge variant="success" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  Live metadata
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Research project summary with health and artifact visibility.</p>
            </div>
          </div>
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </header>
      <main className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
