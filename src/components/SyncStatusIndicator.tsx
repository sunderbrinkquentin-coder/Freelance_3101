import { Check, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { useRealtimeSync } from '../hooks/useRealtimeSync';

export default function SyncStatusIndicator() {
  const { syncState } = useRealtimeSync();

  if (syncState.status === 'idle') {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white bg-opacity-5 border border-white border-opacity-10">
      {syncState.status === 'syncing' && (
        <>
          <div className="w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-text-secondary">Speichert...</span>
        </>
      )}

      {syncState.status === 'synced' && (
        <>
          <Check size={14} className="text-success" />
          <span className="text-xs text-success">Gespeichert</span>
        </>
      )}

      {syncState.status === 'error' && (
        <>
          <AlertCircle size={14} className="text-error" />
          <span className="text-xs text-error">Fehler beim Speichern</span>
        </>
      )}
    </div>
  );
}

export function SyncStatusBadge() {
  const { syncState } = useRealtimeSync();

  if (syncState.status === 'idle' || syncState.status === 'synced') {
    return null;
  }

  return (
    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary animate-pulse" />
  );
}
