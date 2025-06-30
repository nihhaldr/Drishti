
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeSubscription {
  table: string;
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE';
  callback: (payload: any) => void;
}

export const useRealtime = (subscriptions?: RealtimeSubscription[]) => {
  useEffect(() => {
    if (!subscriptions || subscriptions.length === 0) {
      // Default subscriptions if none provided
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'incidents'
          },
          (payload) => {
            console.log('Incident change detected:', payload);
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'lost_persons'
          },
          (payload) => {
            console.log('Lost person change detected:', payload);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }

    // Handle custom subscriptions
    const channel = supabase.channel('custom-changes');
    
    subscriptions.forEach(({ table, event, callback }) => {
      channel.on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table
        },
        (payload) => {
          callback(payload);
        }
      );
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [subscriptions]);
};
