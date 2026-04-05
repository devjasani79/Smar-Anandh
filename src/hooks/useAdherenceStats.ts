import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdherenceStat {
  senior_id: string;
  adherence_date: string;
  meds_taken: number;
  meds_missed: number;
  meds_total: number;
  adherence_percentage: number;
}

export function useAdherenceStats(seniorId: string) {
  return useQuery({
    queryKey: ['adherenceStats', seniorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medication_adherence_stats')
        .select('*')
        .eq('senior_id', seniorId)
        .order('adherence_date', { ascending: false })
        .limit(30);

      if (error) throw error;
      return (data || []) as unknown as AdherenceStat[];
    },
    enabled: !!seniorId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRefreshAdherence() {
  return async () => {
    await supabase.rpc('refresh_adherence_stats' as any);
  };
}
