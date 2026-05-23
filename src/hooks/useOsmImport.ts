import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface OsmImportLog {
  id: string;
  region: string;
  bbox: { south: number; west: number; north: number; east: number } | null;
  feature_types: string[];
  fetched_count: number;
  inserted_count: number;
  updated_count: number;
  skipped_count: number;
  error_count: number;
  errors: string[];
  triggered_by: 'admin_manual' | 'cron';
  started_at: string;
  completed_at: string | null;
  status: 'running' | 'completed' | 'failed';
}

export interface OsmImportRequest {
  region: string;
  featureTypes?: string[];
  dryRun?: boolean;
  bbox?: { south: number; west: number; north: number; east: number };
}

export interface OsmImportResult {
  region: string;
  fetched: number;
  mapped: number;
  inserted?: number;
  updated?: number;
  skipped?: number;
  errors?: number;
  errorDetails?: string[];
  logId?: string;
  dryRun?: boolean;
  sample?: Record<string, unknown>[];
}

export function useOsmImportLogs() {
  return useQuery({
    queryKey: ['osm-import-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('osm_import_log')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return (data ?? []) as OsmImportLog[];
    },
  });
}

export function useTriggerOsmImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: OsmImportRequest): Promise<OsmImportResult> => {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/osm-import`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(request),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || `Import failed: ${res.status}`);
      }

      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['osm-import-logs'] });
      queryClient.invalidateQueries({ queryKey: ['moorings'] });
    },
  });
}
