import { useEffect, useRef, useState, useCallback } from 'react';
import type { GridApi } from 'ag-grid-community';
import { gridDataClient } from '../api/client';
import { DEFAULT_UPDATE_INTERVAL_MS } from '../constants/config';
import type { RowUpdate } from '../generated/grid_data_pb';

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'paused';

interface UseStreamUpdatesOptions {
  gridApi: GridApi | null;
  enabled?: boolean;
  updateIntervalMs?: number;
  onUpdate?: (update: RowUpdate) => void;
}

// Store for pending updates to batch them
const pendingUpdates = new Map<string, RowUpdate>();

/**
 * Hook to handle real-time streaming updates from the server
 */
export function useStreamUpdates({
  gridApi,
  enabled = true,
  updateIntervalMs = DEFAULT_UPDATE_INTERVAL_MS,
  onUpdate,
}: UseStreamUpdatesOptions) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [isPaused, setIsPaused] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const refreshTimeoutRef = useRef<number | null>(null);

  // Batch refresh the grid to show updates
  const scheduleRefresh = useCallback(() => {
    if (!gridApi || refreshTimeoutRef.current) return;

    refreshTimeoutRef.current = window.setTimeout(() => {
      refreshTimeoutRef.current = null;
      if (pendingUpdates.size > 0) {
        // For infinite row model, we refresh the visible rows
        // Get the row nodes that were updated and refresh them
        const updatedIds = Array.from(pendingUpdates.keys());
        const rowNodes = updatedIds
          .map(id => gridApi.getRowNode(id))
          .filter((node): node is NonNullable<typeof node> => node != null);

        if (rowNodes.length > 0) {
          // Update the data in-place for visible nodes
          for (const node of rowNodes) {
            const update = pendingUpdates.get(node.id!);
            if (update?.row) {
              const newData = {
                id: update.row.id,
                traderName: update.row.traderName,
                symbol: update.row.symbol,
                tradeType: update.row.tradeType,
                quantity: update.row.quantity,
                price: update.row.price,
                totalValue: update.row.totalValue,
                status: update.row.status,
                timestamp: update.row.timestamp,
                region: update.row.region,
                profitLoss: update.row.profitLoss,
                counterparty: update.row.counterparty,
              };
              node.setData(newData);
            }
          }

          // Flash the updated cells
          gridApi.flashCells({
            rowNodes,
            columns: ['price', 'profitLoss', 'status', 'totalValue'],
          });
        }

        pendingUpdates.clear();
      }
    }, 100); // Batch updates every 100ms
  }, [gridApi]);

  const startStreaming = useCallback(async () => {
    if (!gridApi || isPaused) return;

    // Cancel any existing stream
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setStatus('connecting');

    try {
      const stream = gridDataClient.streamUpdates(
        { updateIntervalMs },
        { signal: abortControllerRef.current.signal }
      );

      setStatus('connected');

      for await (const update of stream) {
        if (isPaused) break;

        onUpdate?.(update);

        if (update.row && update.updateType === 'UPDATE') {
          // Queue the update for batch processing
          pendingUpdates.set(update.row.id, update);
          scheduleRefresh();
        }
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Stream was intentionally aborted
        return;
      }
      console.error('Stream error:', err);
      setStatus('disconnected');

      // Auto-reconnect after 3 seconds
      if (enabled && !isPaused) {
        reconnectTimeoutRef.current = window.setTimeout(() => {
          startStreaming();
        }, 3000);
      }
    }
  }, [gridApi, isPaused, updateIntervalMs, onUpdate, enabled, scheduleRefresh]);

  // Start/stop streaming based on enabled state and gridApi
  useEffect(() => {
    if (enabled && gridApi && !isPaused) {
      startStreaming();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [enabled, gridApi, isPaused, startStreaming]);

  // Pause/resume handlers
  const pause = useCallback(() => {
    setIsPaused(true);
    setStatus('paused');
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
    startStreaming();
  }, [startStreaming]);

  const toggle = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, pause, resume]);

  return {
    status,
    isPaused,
    pause,
    resume,
    toggle,
  };
}
