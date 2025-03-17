
import { useEffect, useState } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

type RealtimeSubscription = {
  table: string;
  schema?: string;
  filter?: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  callback?: (payload: any) => void;
};

// Type definition for the payload
type RealtimePayload = {
  new: Record<string, any> | null;
  old: Record<string, any> | null;
  [key: string]: any;
};

export const useRealtime = (
  subscriptions: RealtimeSubscription[],
  options: { enabled?: boolean } = { enabled: true }
) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!options.enabled) return;
    
    const channelId = `realtime-${Date.now()}`;
    let realtimeChannel = supabase.channel(channelId);
    
    // Add all subscriptions to the channel
    subscriptions.forEach((subscription) => {
      const { table, schema = 'public', filter, event, callback } = subscription;
      
      // Set up the postgres changes subscription
      realtimeChannel = realtimeChannel.on(
        'postgres_changes',
        {
          event: event,
          schema: schema,
          table: table,
          filter: filter,
        } as any,
        (payload: RealtimePayload) => {
          console.log(`Realtime event received for ${table}:`, payload);
          
          // Execute the callback if provided
          if (callback) {
            callback(payload);
          }
          
          // Invalidate related queries
          if (table === 'groups') {
            queryClient.invalidateQueries({ queryKey: ['groups'] });
            if (payload.new && payload.new.id) {
              queryClient.invalidateQueries({ queryKey: ['groups', payload.new.id] });
            }
          } else if (table === 'group_members') {
            if (payload.new && payload.new.group_id) {
              queryClient.invalidateQueries({ queryKey: ['groups', payload.new.group_id, 'members'] });
              queryClient.invalidateQueries({ queryKey: ['groups', payload.new.group_id] });
            }
          } else if (table === 'cycles') {
            if (payload.new && payload.new.group_id) {
              queryClient.invalidateQueries({ queryKey: ['cycles', payload.new.group_id] });
            }
            if (payload.new && payload.new.id) {
              queryClient.invalidateQueries({ queryKey: ['cycles', 'detail', payload.new.id] });
            }
          } else if (table === 'payments') {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            if (payload.new && payload.new.cycle_id) {
              queryClient.invalidateQueries({ queryKey: ['cycles', 'detail', payload.new.cycle_id] });
            }
          } else if (table === 'notifications') {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
          }
        }
      );
    });
    
    // Subscribe to the channel
    realtimeChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log('Subscribed to realtime channel:', channelId);
      } else {
        console.log('Realtime subscription status:', status);
      }
    });
    
    setChannel(realtimeChannel);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up realtime subscription...');
      supabase.removeChannel(realtimeChannel);
    };
  }, [subscriptions, options.enabled, queryClient]);
  
  return { channel };
};
