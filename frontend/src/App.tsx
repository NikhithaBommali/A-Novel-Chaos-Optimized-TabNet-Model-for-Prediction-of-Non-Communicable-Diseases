import { Database, FileCode2, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { HealthStatusCard } from './components/features/HealthStatusCard';
import { ProjectOverviewCard } from './components/features/ProjectOverviewCard';
import { AppShell } from './components/layout/AppShell';
import { Badge } from './components/ui/Badge';
import { Card, CardContent } from './components/ui/Card';

type HealthResponse = {
  status: 'ok';
};

type Artifact = {
  name: string;
  path: string;
  kind: string;
};

type ProjectSummaryResponse = {
  title: string;
  repositoryType: string;
  summary: string;
  artifacts: Artifact[];
  runNotes: string[];
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';
const THEME_KEY = 'brightcone-theme';

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [project, setProject] = useState<ProjectSummaryResponse | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);
  const [projectLoading, setProjectLoading] = useState(true);
  const [healthError, setHealthError] = useState<string | undefined>();
  const [projectError, setProjectError] = useState<string | undefined>();
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_KEY);
    const shouldUseDark = storedTheme ? storedTheme === 'dark' : true;
    setIsDark(shouldUseDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    window.localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  }, [isDark]);

  const fetchHealth = useCallback(async () => {
    setHealthLoading(true);
    setHealthError(undefined);
    try {
      const response = await fetch(`${API_BASE}/api/health`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: HealthResponse = await response.json();
      setHealth(data);
    } catch (error) {
      setHealthError(error instanceof Error ? error.message : 'Unknown health fetch error');
      setHealth(null);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  const fetchProjectSummary = useCallback(async () => {
    setProjectLoading(true);
    setProjectError(undefined);
    try {
      const response = await fetch(`${API_BASE}/api/project-summary`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: ProjectSummaryResponse = await response.json();
      setProject(data);
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : 'Unknown project fetch error');
      setProject(null);
    } finally {
      setProjectLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchHealth();
    void fetchProjectSummary();
  }, [fetchHealth, fetchProjectSummary, reloadToken]);

  const retryAll = () => setReloadToken((value) => value + 1);

  return (
    <AppShell isDark={isDark} onToggleTheme={() => setIsDark((value) => !value)}>
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-3">
                <Badge variant="outline" className="w-fit gap-2">
                  <Database className="h-3.5 w-3.5" />
                  Repository intelligence
                </Badge>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Chaos-optimized TabNet disease prediction preview</h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
                    This browser preview surfaces research context, backend health, representative artifacts, and run guidance for a repository that combines ML experimentation with API and UI assets.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-2">
                  <FileCode2 className="h-3.5 w-3.5" />
                  Metadata-first preview
                </Badge>
                {projectError || healthError ? (
                  <Badge variant="outline" className="gap-2">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Partial data mode
                  </Badge>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>
        <HealthStatusCard
          status={health?.status}
          isLoading={healthLoading}
          error={healthError}
          onRetry={retryAll}
        />
      </section>

      <ProjectOverviewCard
        data={project ?? undefined}
        isLoading={projectLoading}
        error={projectError}
        onRetry={retryAll}
      />
    </AppShell>
  );
}
