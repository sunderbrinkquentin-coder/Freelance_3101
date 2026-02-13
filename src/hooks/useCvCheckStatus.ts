import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';

type CvStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface CvCheckData {
  status: CvStatus;
  error_message?: string | null;
  ats_json?: any | null;
}

interface UseCvCheckStatusResult {
  status: CvStatus;
  isLoading: boolean;
  hasError: boolean;
  errorMessage: string | null;
  data: CvCheckData | null;
}

export function useCvCheckStatus(uploadId?: string | null): UseCvCheckStatusResult {
  const [status, setStatus] = useState<CvStatus>('pending');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [data, setData] = useState<CvCheckData | null>(null);

  const triesRef = useRef(0);
  const timeoutReachedRef = useRef(false);

  useEffect(() => {
    if (!uploadId) {
      setHasError(true);
      setIsLoading(false);
      setErrorMessage('Keine uploadId übergeben. Bitte starte den CV-Check erneut.');
      setStatus('failed');
      return;
    }

    let isCancelled = false;
    const intervalMs = 3000;          // wie beim CV-Generator
    const maxTries = 100;             // 100 * 3s = 300s = 5 Minuten

    const poll = async () => {
      triesRef.current += 1;

      try {
        const { data: row, error } = await supabase
          .from('stored_cvs')
          .select('status, error_message, ats_json')
          .eq('id', uploadId)
          .single();

        if (isCancelled) return;

        if (error) {
          console.error('[useCvCheckStatus] Supabase error:', error);
          setHasError(true);
          setErrorMessage(error.message || 'Datenbank-Fehler beim Laden des Analyse-Status.');
          setStatus('failed');
          setIsLoading(false);
          return;
        }

        if (!row) {
          console.warn('[useCvCheckStatus] Kein Datensatz für uploadId gefunden:', uploadId);
          setHasError(true);
          setErrorMessage('Kein Analyse-Datensatz gefunden. Bitte starte den CV-Check erneut.');
          setStatus('failed');
          setIsLoading(false);
          return;
        }

        setData(row as CvCheckData);
        setStatus(row.status as CvStatus);

        if (row.status === 'completed') {
          console.log('[useCvCheckStatus] Status completed – Analyse abgeschlossen.');
          setIsLoading(false);
          return; // kein weiteres Polling
        }

        if (row.status === 'failed') {
          console.log('[useCvCheckStatus] Status failed – Analyse fehlgeschlagen.');
          setHasError(true);
          setErrorMessage(row.error_message || 'Die Analyse ist fehlgeschlagen.');
          setIsLoading(false);
          return;
        }

        // pending / processing → weiter pollen
        if (triesRef.current >= maxTries) {
          console.warn('[useCvCheckStatus] Timeout – maximale Wartezeit erreicht.');
          timeoutReachedRef.current = true;
          setHasError(true);
          setErrorMessage('Die Analyse dauert zu lange. Bitte versuche es später erneut.');
          setStatus('failed');
          setIsLoading(false);
          return;
        }

        // sonst läuft das Intervall einfach weiter
      } catch (err: any) {
        if (isCancelled) return;
        console.error('[useCvCheckStatus] Unerwarteter Fehler:', err);
        setHasError(true);
        setErrorMessage(err?.message || 'Unerwarteter Fehler beim Polling.');
        setStatus('failed');
        setIsLoading(false);
      }
    };

    // erstes Polling sofort
    poll();
    // dann alle 3 Sekunden
    const id = setInterval(() => {
      if (!timeoutReachedRef.current && !isCancelled) {
        poll();
      }
    }, intervalMs);

    return () => {
      isCancelled = true;
      clearInterval(id);
    };
  }, [uploadId]);

  return {
    status,
    isLoading,
    hasError,
    errorMessage,
    data,
  };
}
