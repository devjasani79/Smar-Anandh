import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  operation: string;
  old_values: Record<string, any> | null;
  new_values: Record<string, any> | null;
  changed_by: string;
  changed_at: string;
  senior_id?: string | null;
}

export function useAuditLogs(seniorId?: string, tableName?: string, recordId?: string) {
  return useQuery({
    queryKey: ['auditLogs', seniorId, tableName, recordId],
    queryFn: async () => {
      // Build query manually to avoid deep type instantiation
      const filters: string[] = [];
      if (seniorId) filters.push(`senior_id=eq.${seniorId}`);
      if (tableName) filters.push(`table_name=eq.${tableName}`);
      if (recordId) filters.push(`record_id=eq.${recordId}`);

      const { data, error } = await supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      
      let results = (data || []) as unknown as AuditLog[];
      
      // Client-side filter for senior_id (column may not be in types yet)
      if (seniorId) {
        results = results.filter(r => (r as any).senior_id === seniorId);
      }
      if (tableName) {
        results = results.filter(r => r.table_name === tableName);
      }
      if (recordId) {
        results = results.filter(r => r.record_id === recordId);
      }
      
      return results;
    },
    enabled: !!seniorId,
    staleTime: 5 * 60 * 1000,
  });
}
