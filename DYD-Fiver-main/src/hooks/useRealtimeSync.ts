import { useState, useEffect, useCallback } from 'react';
import { dbService } from '../services/databaseService';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error';

interface SyncState {
  status: SyncStatus;
  lastSyncedAt: Date | null;
  error: Error | null;
}

export function useRealtimeSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    status: 'idle',
    lastSyncedAt: null,
    error: null,
  });

  const updateStatus = useCallback((status: SyncStatus, error: Error | null = null) => {
    setSyncState({
      status,
      lastSyncedAt: status === 'synced' ? new Date() : syncState.lastSyncedAt,
      error,
    });
  }, [syncState.lastSyncedAt]);

  const syncProfile = useCallback(async (data: any) => {
    try {
      updateStatus('syncing');
      await dbService.debouncedUpdateProfile(data);
      updateStatus('synced');
    } catch (error) {
      console.error('Failed to sync profile:', error);
      updateStatus('error', error as Error);
    }
  }, [updateStatus]);

  const syncAgentResponse = useCallback(async (section: string, data: any) => {
    try {
      updateStatus('syncing');
      await dbService.debouncedUpdateAgentResponse(section, data);
      updateStatus('synced');
    } catch (error) {
      console.error(`Failed to sync ${section}:`, error);
      updateStatus('error', error as Error);
    }
  }, [updateStatus]);

  const syncBaseData = useCallback(async (data: any) => {
    try {
      updateStatus('syncing');
      await dbService.debouncedSaveAgentDataToBaseData(data);
      updateStatus('synced');
    } catch (error) {
      console.error('Failed to sync base data:', error);
      updateStatus('error', error as Error);
    }
  }, [updateStatus]);

  const checkPendingUpdates = useCallback(() => {
    const hasPending = dbService.hasPendingUpdates();
    if (hasPending && syncState.status !== 'syncing') {
      updateStatus('syncing');
    }
  }, [syncState.status, updateStatus]);

  useEffect(() => {
    const interval = setInterval(checkPendingUpdates, 500);
    return () => clearInterval(interval);
  }, [checkPendingUpdates]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dbService.hasPendingUpdates()) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    syncState,
    syncProfile,
    syncAgentResponse,
    syncBaseData,
  };
}
