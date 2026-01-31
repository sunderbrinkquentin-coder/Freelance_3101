// src/hooks/useCvOptimizationStatus.ts
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export type OptimizationStatus =
  | 'pending'
  | 'processing'
  | 'ready'
  | 'completed'
  | 'failed'
  | string; // Fallback falls in DB andere Werte landen

export interface StoredCvRecord {
  id: string;
  status: OptimizationStatus | null;
  cv_data: any | null;
  created_at: string;
  updated_at: string | null;
}

export interface UseCvOptimizationStatusResult {
  cvData: StoredCvRecord | null;
  isLoading: boolean;
  isPolling: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  isTimeout: boolean;
  error: string | null;
  elapsedSeconds: number;
  refetch: () => Promise<void>;
}

export interface UseCvOptimizationStatusOptions {
  pollingInterval?: number;
  timeoutSeconds?: number;
  enabled?: boolean;
}

export function useCvOptimizationStatus(
  cvId: string | undefined,
  options: UseCvOptimizationStatusOptions = {}
): UseCvOptimizationStatusResult {
  const {
    pollingInterval = 3000,
    timeoutSeconds = 120,
    enabled = true,
  } = options;

  const [cvData, setCvData] = useState<StoredCvRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolling, setIsPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  const hasContent = !!cvData?.cv_data;

  const isCompleted =
    hasContent ||
    cvData?.status === 'ready' ||
    cvData?.status === 'completed';

  const isFailed = cvData?.status === 'failed';
  const isTimeout = elapsedSeconds >= timeoutSeconds;

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  };

  const fetchCvData = async () => {
    if (!cvId) {
      setError('Keine CV-ID vorhanden');
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('stored_cvs')
        .select('*')
        .eq('id', cvId)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Datenbankfehler: ${fetchError.message}`);
      }

      if (!data) {
        setError('Kein Eintrag in stored_cvs für diese ID gefunden');
        setIsLoading(false);
        stopPolling();
        return;
      }

      console.log('[stored_cvs polling]', cvId, data.status);
      setCvData(data as StoredCvRecord);
      setError(null);
      setIsLoading(false);

      const hasContentNow = !!data.cv_data;
      const finished =
        hasContentNow ||
        data.status === 'ready' ||
        data.status === 'completed' ||
        data.status === 'failed';

      if (finished) {
        console.log('[stored_cvs FINISHED]', cvId, data.status);
        stopPolling();

        if (data.status === 'failed') {
          setError(
            (data as any).error_message ||
              'Die Optimierung ist fehlgeschlagen. Bitte versuche es erneut.'
          );
        }
      }
    } catch (err: any) {
      setError(err.message || 'Fehler beim Laden der Daten');
      setIsLoading(false);
      stopPolling();
    }
  };

  const startPolling = () => {
    if (!cvId) return;

    stopPolling();
    setIsPolling(true);
    startTimeRef.current = Date.now();
    setElapsedSeconds(0);

    fetchCvData();

    intervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedSeconds(elapsed);

      if (elapsed >= timeoutSeconds) {
        setError(
          'Die Optimierung dauert länger als erwartet. Bitte lade die Seite neu oder versuche es später erneut.'
        );
        stopPolling();
        return;
      }

      fetchCvData();
    }, pollingInterval);
  };

  const refetch = async () => {
    setIsLoading(true);
    setError(null);
    await fetchCvData();
  };

  useEffect(() => {
    if (!enabled || !cvId) return;
    startPolling();
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvId, enabled]);

  useEffect(() => {
    if (isCompleted || isFailed || isTimeout) {
      stopPolling();
    }
  }, [isCompleted, isFailed, isTimeout]);

  return {
    cvData,
    isLoading,
    isPolling,
    isCompleted,
    isFailed,
    isTimeout,
    error,
    elapsedSeconds,
    refetch,
  };
}
