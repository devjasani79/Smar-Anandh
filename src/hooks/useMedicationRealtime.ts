import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMedicationRealtime(seniorId: string) {
  const queryClient = useQueryClient();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (!seniorId) return;

    const channel = supabase
      .channel(`medication-logs:${seniorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medication_logs',
          filter: `senior_id=eq.${seniorId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['todayLogs', seniorId] });
          queryClient.invalidateQueries({ queryKey: ['pendingMeds', seniorId] });

          if (payload.eventType === 'UPDATE') {
            const log = payload.new as { status?: string };
            if (log.status === 'taken') {
              toast.success('🎉 Dawa le li! Bahut badhiya!');
            }
          }
        }
      )
      .subscribe((status) => {
        setConnectionStatus(status === 'SUBSCRIBED' ? 'connected' : 'disconnected');
      });

    return () => {
      channel.unsubscribe();
    };
  }, [seniorId, queryClient]);

  return { connectionStatus };
}

export function useMedicationsRealtime(seniorId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!seniorId) return;

    const channel = supabase
      .channel(`medications:${seniorId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medications',
          filter: `senior_id=eq.${seniorId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['medications', seniorId] });
          toast.info('Medicine list updated');
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [seniorId, queryClient]);
}
