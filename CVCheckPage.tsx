// src/pages/CVCheckPage.tsx

import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Loader,
  CheckCircle,
  XCircle,
  Sparkles,
  ArrowLeft,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uploadCvAndCreateRecord } from '../services/cvUploadService';
import { supabase } from '../lib/supabase';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

export default function CVCheckPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  const [sessionId] = useState(() => {
    const stored = sessionStorage.getItem('cv_check_session_id');
    if (stored) return stored;
    const newId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('cv_check_session_id', newId);
    return newId;
  });

  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [existingCheck, setExistingCheck] = useState<any>(null);
  
  // Startet auf true, damit wir nicht flackern, während wir den Auth-Status prüfen
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkExistingAnalysis = async () => {
      // 1. Warte, bis der Auth-Provider weiß, ob ein User da ist oder nicht
      if (authLoading) return;

      // 2. Wenn kein User eingeloggt ist, direkt zum Upload-Formular
      if (!user) {
        if (isMounted) setIsCheckingExisting(false);
        return;
      }

      // 3. Wenn User da ist, in DB nach letztem Check suchen
      try {
        const { data, error: dbError } = await supabase
          .from('stored_cvs')
          .select('*')
          .eq('user_id', user.id)
          .eq('source', 'check')
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (dbError) throw dbError;

        if (data && isMounted) {
          console.log('[CVCheckPage] Found existing CV-Check:', data);
          setExistingCheck(data);
        }
      } catch (err) {
        console.error('[CVCheckPage] Error checking existing analysis:', err);
      } finally {
        if (isMounted) setIsCheckingExisting(false);
      }
    };

    // Sicherheits-Fallback: Falls Supabase/Auth nach 3 Sek nicht antwortet, Loader entfernen
    const fallbackTimeout = setTimeout(() => {
      if (isMounted && isCheckingExisting) {
        console.warn('[CVCheckPage] Fallback: Beende Ladezustand nach Timeout');
        setIsCheckingExisting(false);
      }
    }, 3000);

    checkExistingAnalysis();

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, [user, authLoading]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    const selected = acceptedFiles[0];
    setFile(selected);
    setError(null);
    setUploadState('idle');
    setProgress(0);
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject,
    acceptedFiles,
  } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'application/pdf': ['.pdf'] },
  });

  const handleUpload = async () => {
    if (!file) {
      setError('Bitte wähle zuerst eine PDF-Datei aus.');
      return;
    }

    try {
      setError(null);
      setUploadState('uploading');
      setProgress(10);

      const result = await uploadCvAndCreateRecord(file, {
        source: 'check',
        userId: user?.id || null,
        sessionId,
      });

      if (!result.success) {
        throw new Error(result.error || 'Upload fehlgeschlagen');
      }

      const cvId = result.uploadId;
      if (!cvId) throw new Error('Keine CV-ID erhalten');

      setProgress(100);
      setUploadState('success');
      
      // Kurze Verzögerung für das Erfolgs-Gefühl
      setTimeout(() => {
        navigate(`/cv-result/${cvId}`);
      }, 800);
      
    } catch (err: any) {
      console.error('[CV CHECK] Fehler beim Upload:', err);
      setUploadState('error');
      setProgress(0);
      setError(err?.message || 'Fehler beim Hochladen. Bitte erneut versuchen.');
    }
  };

  const resetState = () => {
    setFile(null);
    setUploadState('idle');
    setError(null);
    setProgress(0);
  };

  const currentFile = file ?? acceptedFiles[0] ?? null;

  // UI: Lade-Zustand (Nur wenn Auth noch lädt ODER die DB-Prüfung läuft)
  if (isCheckingExisting || (authLoading && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
        <div className="text-center">
          <Loader className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Lade CV-Check...</p>
        </div>
      </div>
    );
  }

  // UI: Anzeige, wenn bereits ein Check existiert
  if (existingCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
        <motion.div
          className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-teal-400" />
              <h1 className="text-xl font-semibold text-slate-50">Dein CV-Check</h1>
            </div>
            <button onClick={() => navigate('/')} className="text-sm text-slate-300 hover:text-teal-400 flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Zurück
            </button>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-6 mb-6">
            <h2 className="text-lg font-semibold text-slate-50 mb-2">Du hast bereits einen CV-Check!</h2>
            <p className="text-sm text-slate-400 mb-4">Du kannst deine Analyse jederzeit im Dashboard einsehen.</p>
            <div className="text-xs text-slate-500">
              Letzter Score: <span className="font-semibold text-teal-400">{existingCheck.ats_score || 'N/A'}/100</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/saved-cv-check/${existingCheck.id}`)}
              className="flex-1 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold py-3 rounded-lg transition"
            >
              Analyse ansehen
            </button>
            <button onClick={resetState} className="px-4 py-3 text-sm text-slate-400 hover:text-slate-200">
              Neuen Check starten
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // UI: Das eigentliche Upload-Formular
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
      <motion.div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-semibold text-slate-50">DYD – CV-Check</h1>
          </div>
          <button onClick={() => navigate('/')} className="text-sm text-slate-300 hover:text-teal-400 flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </button>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition ${
            isDragActive ? 'border-teal-400 bg-slate-800/60' : 'border-slate-700 bg-slate-900/60'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="w-8 h-8 text-slate-300 mb-1" />
            <p className="text-sm text-slate-100 font-medium">PDF hierher ziehen oder klicken</p>
            {currentFile && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1">
                <FileText className="w-4 h-4 text-teal-300" />
                <span className="text-xs text-slate-100 truncate max-w-[200px]">{currentFile.name}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {uploadState === 'uploading' && (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Loader className="w-4 h-4 animate-spin" /> <span>Analysiere deinen CV…</span>
            </div>
          )}
          {uploadState === 'error' && error && (
            <div className="flex items-start gap-2 text-xs text-red-400">
              <XCircle className="w-4 h-4 mt-[1px]" /> <span>{error}</span>
            </div>
          )}
          {progress > 0 && (
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="h-1.5 bg-teal-400 transition-[width]" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={handleUpload}
            disabled={!currentFile || uploadState === 'uploading'}
            className="flex-1 bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 font-bold py-2 rounded-lg transition flex items-center justify-center gap-2"
          >
            {uploadState === 'uploading' ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            CV-Check starten
          </button>
          <button onClick={resetState} className="text-xs text-slate-400 hover:text-slate-200">Zurücksetzen</button>
        </div>
      </motion.div>
    </div>
  );
}