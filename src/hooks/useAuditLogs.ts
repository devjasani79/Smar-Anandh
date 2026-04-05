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
}

export function useAuditLogs(tableName?: string, recordId?: string) {
  return useQuery({
    queryKey: ['auditLogs', tableName, recordId],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(50);

      if (tableName) query = query.eq('table_name', tableName);
      if (recordId) query = query.eq('record_id', recordId);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AuditLog[];
    },
    staleTime: 5 * 60 * 1000,
  });
}
