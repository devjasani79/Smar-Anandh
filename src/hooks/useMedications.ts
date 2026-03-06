import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMedications(seniorId: string) {
  return useQuery({
    queryKey: ['medications', seniorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('senior_id', seniorId)
        .eq('is_active', true);

      if (error) throw error;
      return (data || []).map(m => ({
        ...m,
        times: Array.isArray(m.times) ? (m.times as string[]) : [],
      }));
    },
    enabled: !!seniorId,
  });
}

export function useTodayLogs(seniorId: string) {
  return useQuery({
    queryKey: ['todayLogs', seniorId],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('senior_id', seniorId)
        .gte('scheduled_time', today.toISOString())
        .lt('scheduled_time', tomorrow.toISOString());

      if (error) throw error;
      return data || [];
    },
    enabled: !!seniorId,
    refetchInterval: 60 * 1000,
  });
}

export function usePendingMeds(seniorId: string) {
  return useQuery({
    queryKey: ['pendingMeds', seniorId],
    queryFn: async () => {
      const now = new Date();
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data, error } = await supabase
        .from('medication_logs')
        .select('status, scheduled_time')
        .eq('senior_id', seniorId)
        .eq('status', 'pending')
        .gte('scheduled_time', today.toISOString())
        .lt('scheduled_time', tomorrow.toISOString());

      if (error) throw error;

      const logs = data || [];
      // Only count OVERDUE meds (scheduled in the past)
      const overdueMeds = logs.filter(l => new Date(l.scheduled_time) <= now);
      // Next upcoming med
      const upcomingMeds = logs
        .filter(l => new Date(l.scheduled_time) > now)
        .sort((a, b) => new Date(a.scheduled_time).getTime() - new Date(b.scheduled_time).getTime());

      const nextMedTime = upcomingMeds.length > 0
        ? new Date(upcomingMeds[0].scheduled_time).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })
        : null;

      return {
        overdueCount: overdueMeds.length,
        totalPending: logs.length,
        nextMedTime,
      };
    },
    enabled: !!seniorId,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useTakeMedication(seniorId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (med: { id: string; time: string }) => {
      const scheduledTime = new Date();
      const [h, m] = med.time.split(':').map(Number);
      scheduledTime.setHours(h, m, 0, 0);

      const hourStart = new Date(scheduledTime);
      const hourEnd = new Date(scheduledTime.getTime() + 3600000);

      const { data: existingLog } = await supabase
        .from('medication_logs')
        .select('*')
        .eq('senior_id', seniorId)
        .eq('medication_id', med.id)
        .gte('scheduled_time', hourStart.toISOString())
        .lt('scheduled_time', hourEnd.toISOString())
        .maybeSingle();

      if (existingLog) {
        const { error } = await supabase
          .from('medication_logs')
          .update({ status: 'taken', taken_at: new Date().toISOString() })
          .eq('id', existingLog.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('medication_logs')
          .insert({
            senior_id: seniorId,
            medication_id: med.id,
            scheduled_time: scheduledTime.toISOString(),
            status: 'taken',
            taken_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success('Bahut badhiya! Dawa le li! 💊');
      queryClient.invalidateQueries({ queryKey: ['todayLogs', seniorId] });
      queryClient.invalidateQueries({ queryKey: ['pendingMeds', seniorId] });
    },
    onError: () => {
      toast.error('Dawa mark nahi hua, phir se try karein');
    },
  });
}
