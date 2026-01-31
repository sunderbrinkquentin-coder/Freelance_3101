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
  const { user } = useAuth();
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
  const [isCheckingExisting, setIsCheckingExisting] = useState(true);

  useEffect(() => {
    const checkExistingAnalysis = async () => {
      if (!user) {
        setIsCheckingExisting(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('ats_analyses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('[CVCheckPage] Error checking existing analysis:', error);
          setIsCheckingExisting(false);
          return;
        }

        if (data) {
          console.log('[CVCheckPage] Found existing CV-Check:', data);
          setExistingCheck(data);
        }

        setIsCheckingExisting(false);
      } catch (err) {
        console.error('[CVCheckPage] Error:', err);
        setIsCheckingExisting(false);
      }
    };

    checkExistingAnalysis();
  }, [user]);

  // ⬇️ Datei-Auswahl via Drag & Drop
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
    accept: {
      'application/pdf': ['.pdf'],
    },
  });

  // ⬇️ Upload + Supabase-Record + Navigation zur Ergebnis-Seite
  const handleUpload = async () => {
    if (!file) {
      setError('Bitte wähle zuerst eine PDF-Datei aus.');
      return;
    }

    try {
      setError(null);
      setUploadState('uploading');
      setProgress(10);

      console.log('[CV CHECK] 🚀 Starte uploadCvAndCreateRecord', {
        name: file.name,
        size: file.size,
        type: file.type,
        userId: user?.id || 'anonymous',
        sessionId,
      });

      const result = await uploadCvAndCreateRecord(file, {
        source: 'check',
        userId: user?.id || null,
        sessionId,
      });

      console.log(
        '[CV CHECK] ✅ Antwort von uploadCvAndCreateRecord (roh):',
        result
      );

      // Prüfe ob Upload erfolgreich war
      if (!result.success) {
        throw new Error(result.error || 'Upload fehlgeschlagen');
      }

      // uploadId aus dem Result holen
      const cvId = result.uploadId;

      if (!cvId) {
        console.error(
          '[CV CHECK] ❌ Konnte keine CV-ID aus der Antwort extrahieren. Vollständige Antwort:',
          result
        );
        setError(
          'Es konnte keine CV-ID aus dem Upload-Service ermittelt werden. Bitte versuche es erneut.'
        );
        setUploadState('error');
        setProgress(0);
        return;
      }

      console.log('[CV CHECK] ✅ CV-Upload erfolgreich, ID (cvId):', cvId);

      setProgress(100);
      setUploadState('success');

      // Optional: erst Login, dann Result-Seite
      // if (!user) {
      //   navigate(`/login?redirect=/cv-result/${cvId}`);
      //   return;
      // }

      // Direkt zur CvResultPage navigieren
      navigate(`/cv-result/${cvId}`);
    } catch (err: any) {
      console.error('[CV CHECK] ❌ Fehler beim Upload:', err);
      setUploadState('error');
      setProgress(0);
      setError(
        err?.message ||
          'Beim Hochladen und Analysieren deines CV ist ein Fehler aufgetreten. Bitte versuche es erneut.'
      );
    }
  };

  const resetState = () => {
    setFile(null);
    setUploadState('idle');
    setError(null);
    setProgress(0);
  };

  const currentFile = file ?? acceptedFiles[0] ?? null;

  if (isCheckingExisting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
        <div className="text-center">
          <Loader className="w-8 h-8 text-teal-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Lade...</p>
        </div>
      </div>
    );
  }

  if (existingCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
        <motion.div
          className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-teal-400" />
              <h1 className="text-xl font-semibold text-slate-50">
                Dein CV-Check
              </h1>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-teal-400 hover:bg-slate-800/60 rounded-lg transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zurück</span>
            </button>
          </div>

          <div className="bg-slate-800/40 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-teal-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-slate-50 mb-2">
                  Du hast bereits einen CV-Check!
                </h2>
                <p className="text-sm text-slate-400 mb-4">
                  Du hast bereits einen CV-Check durchgeführt und im Dashboard gespeichert.
                  Du kannst jederzeit deine Analyse im Dashboard einsehen.
                </p>
                <div className="text-xs text-slate-500">
                  ATS-Score: <span className="font-semibold text-teal-400">{existingCheck.ats_score}/100</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                if (existingCheck.id) {
                  navigate(`/saved-cv-check/${existingCheck.id}`);
                } else {
                  navigate('/dashboard');
                }
              }}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-semibold px-4 py-3 transition"
            >
              <BarChart3 className="w-4 h-4" />
              Analyse ansehen
            </button>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-3 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-lg transition"
            >
              Zur Startseite
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-8">
      <motion.div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <h1 className="text-xl font-semibold text-slate-50">
              DYD – CV-Check
            </h1>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-slate-300 hover:text-teal-400 hover:bg-slate-800/60 rounded-lg transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Zurück</span>
          </button>
        </div>

        {/* Upload-Zone */}
        <div
          {...getRootProps()}
          className={[
            'border-2 border-dashed rounded-xl p-6 cursor-pointer transition',
            isDragActive
              ? 'border-teal-400 bg-slate-800/60'
              : 'border-slate-700 bg-slate-900/60',
            isDragReject ? 'border-red-500' : '',
          ].join(' ')}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2 text-center">
            <Upload className="w-8 h-8 text-slate-300 mb-1" />
            <p className="text-sm text-slate-100 font-medium">
              PDF hierher ziehen oder klicken, um eine Datei auszuwählen
            </p>
            <p className="text-xs text-slate-400">
              Unterstützt: <span className="font-mono">.pdf</span> (max. ein
              Dokument)
            </p>
            {currentFile && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1">
                <FileText className="w-4 h-4 text-teal-300" />
                <span className="text-xs text-slate-100 truncate max-w-[220px]">
                  {currentFile.name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Progress / Status */}
        <div className="mt-4 space-y-2">
          {uploadState === 'uploading' && (
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Dein CV wird hochgeladen und analysiert…</span>
            </div>
          )}
          {uploadState === 'success' && (
            <div className="flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="w-4 h-4" />
              <span>
                Upload erfolgreich – du wirst zur Ergebnis-Seite
                weitergeleitet…
              </span>
            </div>
          )}
          {uploadState === 'error' && error && (
            <div className="flex items-start gap-2 text-xs text-red-400">
              <XCircle className="w-4 h-4 mt-[1px]" />
              <span>{error}</span>
            </div>
          )}

          {progress > 0 && (
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
              <div
                className="h-1.5 bg-teal-400 transition-[width]"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleUpload}
            disabled={!currentFile || uploadState === 'uploading'}
            className="inline-flex items-center justify-center rounded-lg bg-teal-500 hover:bg-teal-400 disabled:bg-slate-700 disabled:text-slate-400 text-slate-950 text-sm font-semibold px-4 py-2 transition"
          >
            {uploadState === 'uploading' ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Wird hochgeladen…
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                CV-Check starten
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetState}
            className="text-xs text-slate-400 hover:text-slate-200 transition"
          >
            Zurücksetzen
          </button>
        </div>

        {user && (
          <p className="mt-3 text-[11px] text-slate-500">
            Eingeloggt als <span className="font-medium">{user.email}</span>.
          </p>
        )}
      </motion.div>
    </div>
  );
}
