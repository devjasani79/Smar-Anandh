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
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('changed_at', { ascending: false })
        .limit(50);

      // Filter by senior_id for data isolation
      if (seniorId) query = query.eq('senior_id', seniorId) as any;
      if (tableName) query = query.eq('table_name', tableName);
      if (recordId) query = query.eq('record_id', recordId);

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as AuditLog[];
    },
    enabled: !!seniorId, // Only fetch when seniorId is provided
    staleTime: 5 * 60 * 1000,
  });
}
