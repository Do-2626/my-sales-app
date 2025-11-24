'use client';

import { useState, useCallback, useEffect } from 'react';
import { useIndexedDB } from './useIndexedDB';

export function useSync() {
  const { isDbReady, getUnsyncedData, markDataAsSynced } = useIndexedDB();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const triggerSync = useCallback(async () => {
    if (!isDbReady || isSyncing) return;

    console.log('Starting sync...');
    setIsSyncing(true);
    setError(null);

    try {
      const dataToSync = await getUnsyncedData();
      if (dataToSync.products.length === 0 && dataToSync.sales.length === 0) {
        console.log('No data to sync.');
        setLastSync(new Date());
        setIsSyncing(false);
        return;
      }

      const response = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSync),
      });

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.statusText}`);
      }

      const result = await response.json();
      await markDataAsSynced(result.syncedIds);

      setLastSync(new Date());
      console.log('Sync successful.');
    } catch (err: any) {
      console.error('Sync error:', err);
      setError(err.message);
    } finally {
      setIsSyncing(false);
    }
  }, [isDbReady, isSyncing, getUnsyncedData, markDataAsSynced]);

  useEffect(() => {
    // Optional: Auto-sync every 5 minutes
    const intervalId = setInterval(triggerSync, 5 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [triggerSync]);


  return { isSyncing, lastSync, error, triggerSync };
}