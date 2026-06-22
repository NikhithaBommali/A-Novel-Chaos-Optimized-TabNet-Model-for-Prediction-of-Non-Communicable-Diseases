import { Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Skeleton } from '../ui/Skeleton';

interface HealthStatusCardProps {
  status?: 'ok';
  isLoading: boolean;
  error?: string;
  onRetry: () => void;
}

export function HealthStatusCard({ status, isLoading, error, onRetry }: HealthStatusCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Backend health
            </CardTitle>
            <CardDescription>Connectivity status for the preview metadata service.</CardDescription>
          </div>
          {!isLoading && !error && status === 'ok' ? <Badge variant="success">Operational</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Health endpoint unavailable
            </div>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry health check
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              API responded with status: {status}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">The backend wrapper is running and ready to provide project metadata.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
