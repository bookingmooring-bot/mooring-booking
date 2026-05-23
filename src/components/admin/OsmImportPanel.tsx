import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Globe, Download, Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useOsmImportLogs, useTriggerOsmImport, OsmImportResult } from '@/hooks/useOsmImport';
import { format } from 'date-fns';

const REGIONS = [
  { value: 'croatia', label: 'Croatia' },
  { value: 'italy', label: 'Italy' },
  { value: 'greece', label: 'Greece' },
  { value: 'montenegro', label: 'Montenegro' },
  { value: 'slovenia', label: 'Slovenia' },
  { value: 'albania', label: 'Albania' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'spain', label: 'Spain' },
  { value: 'france', label: 'France' },
  { value: 'portugal', label: 'Portugal' },
  { value: 'malta', label: 'Malta' },
  { value: 'cyprus', label: 'Cyprus' },
  { value: 'tunisia', label: 'Tunisia' },
];

const FEATURE_TYPES = [
  { value: 'marina', label: 'Marinas' },
  { value: 'anchorage', label: 'Anchorages' },
  { value: 'harbour', label: 'Harbours' },
  { value: 'pier', label: 'Piers / Docks' },
  { value: 'bay', label: 'Bays / Coves' },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    running: 'bg-warning/20 text-warning border-warning/30',
    completed: 'bg-success/20 text-success border-success/30',
    failed: 'bg-destructive/20 text-destructive border-destructive/30',
  };
  const icons: Record<string, React.ReactNode> = {
    running: <Loader2 className="w-3 h-3 animate-spin" />,
    completed: <CheckCircle2 className="w-3 h-3" />,
    failed: <XCircle className="w-3 h-3" />,
  };
  return (
    <Badge className={`capitalize gap-1 ${map[status] ?? ''}`}>
      {icons[status]}
      {status}
    </Badge>
  );
}

export default function OsmImportPanel() {
  const [region, setRegion] = useState('croatia');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(['marina', 'anchorage', 'harbour', 'pier', 'bay']);
  const [dryRun, setDryRun] = useState(false);
  const [lastResult, setLastResult] = useState<OsmImportResult | null>(null);

  const { data: logs = [], isLoading: logsLoading } = useOsmImportLogs();
  const importMutation = useTriggerOsmImport();
  const { toast } = useToast();

  const toggleFeature = (ft: string) => {
    setSelectedFeatures(prev =>
      prev.includes(ft) ? prev.filter(f => f !== ft) : [...prev, ft]
    );
  };

  const handleImport = async () => {
    if (selectedFeatures.length === 0) {
      toast({ title: 'Select at least one feature type', variant: 'destructive' });
      return;
    }
    try {
      const result = await importMutation.mutateAsync({
        region,
        featureTypes: selectedFeatures,
        dryRun,
      });
      setLastResult(result);
      toast({
        title: dryRun ? 'Dry Run Complete' : 'Import Complete',
        description: dryRun
          ? `Found ${result.mapped} features from ${result.fetched} OSM elements`
          : `Inserted: ${result.inserted}, Updated: ${result.updated}, Skipped: ${result.skipped}`,
      });
    } catch (err) {
      toast({
        title: 'Import Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Import Controls */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-semibold text-lg">OSM Data Import</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Import marinas, anchorages, harbours, piers and bays from OpenStreetMap into the Explore & Navigate layers.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Region</label>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map(r => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Feature Types</label>
            <div className="flex flex-wrap gap-2">
              {FEATURE_TYPES.map(ft => (
                <button
                  key={ft.value}
                  onClick={() => toggleFeature(ft.value)}
                  className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                    selectedFeatures.includes(ft.value)
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted text-muted-foreground border-border hover:bg-accent'
                  }`}
                >
                  {ft.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={dryRun}
              onChange={(e) => setDryRun(e.target.checked)}
              className="rounded"
            />
            Dry Run (preview only)
          </label>

          <Button
            onClick={handleImport}
            disabled={importMutation.isPending}
            className="ml-auto"
          >
            {importMutation.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Importing...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> {dryRun ? 'Preview Import' : 'Start Import'}</>
            )}
          </Button>
        </div>
      </div>

      {/* Last Result */}
      {lastResult && (
        <div className="bg-card rounded-xl p-6 shadow-card">
          <h4 className="font-semibold mb-3">
            {lastResult.dryRun ? 'Dry Run Result' : 'Import Result'} — {lastResult.region}
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{lastResult.fetched}</div>
              <div className="text-xs text-muted-foreground">OSM Elements</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{lastResult.mapped}</div>
              <div className="text-xs text-muted-foreground">Mapped</div>
            </div>
            {!lastResult.dryRun && (
              <>
                <div>
                  <div className="text-2xl font-bold text-success">{lastResult.inserted}</div>
                  <div className="text-xs text-muted-foreground">Inserted</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-warning">{lastResult.updated}</div>
                  <div className="text-xs text-muted-foreground">Updated</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-muted-foreground">{lastResult.skipped}</div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
              </>
            )}
          </div>
          {lastResult.errorDetails && lastResult.errorDetails.length > 0 && (
            <div className="mt-3 p-3 bg-destructive/10 rounded text-xs text-destructive">
              {lastResult.errorDetails.map((e, i) => <div key={i}>{e}</div>)}
            </div>
          )}
        </div>
      )}

      {/* Import History */}
      <div className="bg-card rounded-xl p-6 shadow-card">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <h3 className="font-heading font-semibold text-lg">Import History</h3>
        </div>

        {logsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No imports yet</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead className="text-right">Fetched</TableHead>
                  <TableHead className="text-right">Inserted</TableHead>
                  <TableHead className="text-right">Updated</TableHead>
                  <TableHead className="text-right">Skipped</TableHead>
                  <TableHead className="text-right">Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      {format(new Date(log.started_at), 'dd.MM.yyyy HH:mm')}
                    </TableCell>
                    <TableCell className="capitalize font-medium">{log.region}</TableCell>
                    <TableCell><StatusBadge status={log.status} /></TableCell>
                    <TableCell className="text-xs capitalize">{log.triggered_by.replace('_', ' ')}</TableCell>
                    <TableCell className="text-right">{log.fetched_count}</TableCell>
                    <TableCell className="text-right text-success">{log.inserted_count}</TableCell>
                    <TableCell className="text-right text-warning">{log.updated_count}</TableCell>
                    <TableCell className="text-right">{log.skipped_count}</TableCell>
                    <TableCell className="text-right text-destructive">{log.error_count}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
