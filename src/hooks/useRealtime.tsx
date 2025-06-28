
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeSubscription {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback: (payload: any) => void;
}

export const useRealtime = (subscriptions: RealtimeSubscription[]) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const channels = subscriptions.map(({ table, event, callback }) => {
      const channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event,
            schema: 'public',
            table
          },
          (payload) => {
            console.log(`Realtime update on ${table}:`, payload);
            callback(payload);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          }
        });

      return channel;
    });

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      setIsConnected(false);
    };
  }, [subscriptions]);

  return { isConnected };
};
