import { useEffect } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { connectWebSocket, disconnectWebSocket } from '../websocket/orderSocket';

/**
 * Realtime orders hook.
 *
 * Strategy: React Query owns the cache. WebSocket pushes mutate the cache
 * directly, so the UI re-renders without a refetch. Optimistic updates on
 * status changes give zero-latency feel.
 */
export const useRealtimeOrders = () => {
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const { data } = await api.get('/orders');
      return [...data].reverse(); // newest first, copy to avoid mutating axios buffer
    },
  });

  // WebSocket -> cache bridge. Lives at the hook level so it survives
  // route changes (the QueryClient is global).
  useEffect(() => {
    let active = true;
    connectWebSocket((incoming) => {
      if (!active) return;
      qc.setQueryData(['orders'], (prev = []) => {
        const idx = prev.findIndex((o) => o.id === incoming.id);
        if (idx >= 0) {
          const next = prev.slice();
          next[idx] = incoming;
          return next;
        }
        return [incoming, ...prev];
      });
      // Also keep the dashboard stats fresh
      qc.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
    });
    return () => {
      active = false;
      disconnectWebSocket();
    };
  }, [qc]);

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }) => {
      await api.put(`/orders/${id}/status?status=${status}`);
      return { id, status };
    },
    onMutate: async ({ id, status }) => {
      // Optimistic update - UI flips instantly
      await qc.cancelQueries({ queryKey: ['orders'] });
      const previous = qc.getQueryData(['orders']);
      qc.setQueryData(['orders'], (prev = []) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(['orders'], ctx.previous);
    },
    // No onSettled refetch - WebSocket broadcast will reconcile if needed.
  });

  return {
    orders: query.data || [],
    loading: query.isLoading,
    error: query.error,
    refresh: () => qc.invalidateQueries({ queryKey: ['orders'] }),
    updateStatus: (id, status) => updateStatus.mutate({ id, status }),
  };
};
