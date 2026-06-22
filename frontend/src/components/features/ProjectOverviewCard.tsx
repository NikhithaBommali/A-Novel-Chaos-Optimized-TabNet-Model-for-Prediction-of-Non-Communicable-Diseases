import { FlaskConical, FolderTree, Rocket, ScrollText } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

type Artifact = {
  name: string;
  path: string;
  kind: string;
};

interface ProjectSummary {
  title: string;
  repositoryType: string;
  summary: string;
  artifacts: Artifact[];
  runNotes: string[];
}

interface ProjectOverviewCardProps {
  data?: ProjectSummary;
  isLoading: boolean;
  error?: string;
  onRetry: () => void;
}

export function ProjectOverviewCard({ data, isLoading, error, onRetry }: ProjectOverviewCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <Badge variant="outline" className="w-fit gap-2">
              <FlaskConical className="h-3.5 w-3.5" />
              Project metadata
            </Badge>
            <CardTitle className="text-2xl sm:text-3xl">{data?.title ?? 'Loading repository preview'}</CardTitle>
            <CardDescription className="max-w-3xl text-sm sm:text-base">
              {data?.summary ?? 'We are collecting project context, detected assets, and research notes for this repository.'}
            </CardDescription>
          </div>
          {data ? <Badge variant="secondary">{data.repositoryType}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-44 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-border bg-surface-secondary p-6">
            <div className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
              <ScrollText className="h-5 w-5 text-primary" />
              Preview metadata unavailable
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              {error}. The preview stays available so you can still inspect backend health and retry metadata loading.
            </p>
            <Button type="button" onClick={onRetry}>
              Reload project summary
            </Button>
          </div>
        ) : data ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoPanel
                icon={<FolderTree className="h-5 w-5 text-primary" />}
                title="Repository type"
                body={data.repositoryType}
              />
              <InfoPanel
                icon={<Rocket className="h-5 w-5 text-primary" />}
                title="Run notes"
                body={`${data.runNotes.length} instruction${data.runNotes.length === 1 ? '' : 's'} discovered`}
              />
              <InfoPanel
                icon={<FlaskConical className="h-5 w-5 text-primary" />}
                title="Artifacts"
                body={`${data.artifacts.length} tracked file${data.artifacts.length === 1 ? '' : 's'}`}
              />
            </div>
            <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-2xl border border-border bg-surface-secondary/70 p-5">
                <h3 className="section-title mb-4">Visible artifacts</h3>
                <ul className="space-y-3">
                  {data.artifacts.length > 0 ? (
                    data.artifacts.map((artifact) => (
                      <li key={`${artifact.path}-${artifact.kind}`} className="rounded-xl border border-border/70 bg-background/60 p-4 transition-colors hover:bg-background/80">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-medium text-foreground">{artifact.name}</p>
                            <p className="text-sm text-muted-foreground">{artifact.path}</p>
                          </div>
                          <Badge variant="outline">{artifact.kind}</Badge>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      No representative artifacts were reported by the backend.
                    </li>
                  )}
                </ul>
              </div>
              <div className="rounded-2xl border border-border bg-surface-secondary/70 p-5">
                <h3 className="section-title mb-4">Run notes & instructions</h3>
                <ol className="space-y-3">
                  {data.runNotes.length > 0 ? (
                    data.runNotes.map((note, index) => (
                      <li key={`${note}-${index}`} className="flex gap-3 rounded-xl border border-border/70 bg-background/60 p-4">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                          {index + 1}
                        </span>
                        <p className="text-sm text-muted-foreground">{note}</p>
                      </li>
                    ))
                  ) : (
                    <li className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
                      No run instructions were returned.
                    </li>
                  )}
                </ol>
              </div>
            </section>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface InfoPanelProps {
  icon: JSX.Element;
  title: string;
  body: string;
}

function InfoPanel({ icon, title, body }: InfoPanelProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface-secondary/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
        {icon}
        {title}
      </div>
      <p className="text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
