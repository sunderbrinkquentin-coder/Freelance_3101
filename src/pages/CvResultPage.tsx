// src/pages/CvResultPage.tsx

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Home, RefreshCw, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { parseAtsJson, AtsResult } from '../types/ats';
import { AtsResultDisplay } from '../components/AtsResultDisplay';
import { useAuth } from '../contexts/AuthContext';

type RouteParams = {
  uploadId: string;
};

export default function CvResultPage() {
  const navigate = useNavigate();
  const { uploadId } = useParams<RouteParams>();
  const { user } = useAuth();

  // ---- State ----
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [timeoutError, setTimeoutError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [atsResult, setAtsResult] = useState<AtsResult | null>(null);
  const [visionText, setVisionText] = useState<string>('');

  // Debug
  const [rawPreview, setRawPreview] = useState<string>('');

  // ✅ NEU: Payment-Status aus DB
  const [isPaid, setIsPaid] = useState(false);

  // ---- Poll stored_cvs ----
  useEffect(() => {
    if (!uploadId) {
      setErrorMessage('Keine Upload-ID gefunden.');
      setIsAnalyzing(false);
      return;
    }

    let cancelled = false;
    let attempt = 1;
    const MAX_ATTEMPTS = 60;
    const INTERVAL_MS = 2000;

    const poll = async () => {
      if (cancelled) return;

      console.log(`[CvResultPage] 🔁 Poll attempt ${attempt}/${MAX_ATTEMPTS}`, {
        uploadId,
        elapsed: `${(attempt * INTERVAL_MS / 1000).toFixed(0)}s`,
      });

      const { data, error } = await supabase
        .from('stored_cvs')
        .select('id, status, is_paid, ats_json, vision_text, error_message, created_at, updated_at')
        .eq('id', uploadId)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.error('[CvResultPage] ❌ Supabase-Fehler:', error);
        setErrorMessage(`Fehler beim Laden der Analyse: ${error.message}`);
        setIsAnalyzing(false);
        return;
      }

      if (!data) {
        console.warn(`[CvResultPage] ⏳ Attempt ${attempt}: Kein Datensatz gefunden (noch nicht eingefügt)`);
        if (attempt < MAX_ATTEMPTS) {
          attempt++;
          setTimeout(poll, INTERVAL_MS);
        } else {
          setTimeoutError(true);
          setIsAnalyzing(false);
          setErrorMessage('Die Analyse konnte nicht gestartet werden. Bitte versuche es erneut.');
        }
        return;
      }

      console.log(`[CvResultPage] 📥 Attempt ${attempt}: Status=${data.status}`, {
        has_ats_json: !!data.ats_json,
        has_error: !!data.error_message,
      });

      // ✅ NEU: is_paid aus DB in State übernehmen
      setIsPaid(data.is_paid === true);

      const status = (data.status as string | null)?.toLowerCase() || 'processing';

      if (status === 'failed') {
        const errorMsg = data.error_message || 'Die Analyse ist fehlgeschlagen';
        console.error('[CvResultPage] ❌ Analysis failed:', errorMsg);
        setErrorMessage(`${errorMsg}. Bitte versuche es erneut.`);
        setIsAnalyzing(false);
        return;
      }

      if (status !== 'completed') {
        // Noch in Bearbeitung
        if (attempt < MAX_ATTEMPTS) {
          attempt++;
          setTimeout(poll, INTERVAL_MS);
        } else {
          setTimeoutError(true);
          setIsAnalyzing(false);
          setErrorMessage('Die Analyse dauert länger als erwartet. Bitte versuche es später erneut.');
        }
        return;
      }

      // ---- Hier: status = completed ----
      let rawAts: any = data.ats_json ?? null;

      try {
        if (rawAts) {
          if (typeof rawAts === 'string') {
            setRawPreview(rawAts.substring(0, 200));
          } else {
            const str = JSON.stringify(rawAts);
            setRawPreview(str.substring(0, 200));
          }

          // parseAtsJson kümmert sich um alle Sonderfälle
          const parsed = parseAtsJson(rawAts);
          console.log('[CvResultPage] �� Parsing result:', parsed);

          if (parsed) {
            setAtsResult(parsed);

            // ✅ NEU: Link CV to user if logged in
            if (user) {
              console.log('[CvResultPage] 🔗 User is logged in, linking CV to user...');
              const { cvCheckService } = await import('../services/cvCheckService');
              await cvCheckService.linkCVToUser(uploadId!, user.id);
              console.log('[CvResultPage] ✅ CV linked to user successfully');
            }
          } else {
            console.warn('[CvResultPage] ⚠️ parseAtsJson gab null zurück');
            setErrorMessage('Die Analyse konnte nicht interpretiert werden.');
          }
        } else {
          console.warn('[CvResultPage] ⚠️ Kein ats_json vorhanden');
          setErrorMessage('Keine Analyse-Daten vorhanden.');
        }
      } catch (e) {
        console.error('[CvResultPage] ❌ Fehler beim Parsen von ats_json:', e);
        setErrorMessage('Fehler beim Verarbeiten der Analyse-Daten.');
      }

      setVisionText(data.vision_text || '');
      setIsAnalyzing(false);
      setTimeoutError(false);
    };

    poll();

    return () => {
      cancelled = true;
    };
  }, [uploadId]);

  // ---- Handle Successful Payment ----
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const paymentStatus = params.get('payment');

    if (paymentStatus === 'success') {
      console.log('[CvResultPage] 💳 Payment successful, redirecting to dashboard');
      console.log('[CvResultPage] ℹ️ Webhook will handle saving analysis to dashboard');

      // Webhook speichert die Analyse automatisch
      // Wir warten kurz und redirecten dann zum Dashboard
      setTimeout(() => {
        navigate('/dashboard?source=cv-check-save');
      }, 2000);
    }
  }, [navigate]);

  // ---- UI: Error State ----
  if (errorMessage && !isAnalyzing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0a0a0f] to-[#050507] text-white flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-black/40 border border-red-500/40 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-red-500" size={28} />
            <h1 className="text-2xl font-bold">Analyse-Fehler</h1>
          </div>
          <p className="text-white/70 mb-2">{errorMessage}</p>
          <p className="text-white/50 text-sm mb-6">
            Upload ID: <code className="bg-black/40 px-2 py-1 rounded text-xs">{uploadId}</code>
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition font-semibold"
            >
              <RefreshCw size={16} />
              Nochmal versuchen
            </button>
            <button
              onClick={() => navigate('/cv-check')}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#66c0b6] text-black font-semibold hover:opacity-90 transition"
            >
              <Home size={16} />
              Zurück zum CV-Check
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- UI: Loading / Analyzing ----
  if (isAnalyzing || (!atsResult && !errorMessage && !timeoutError)) {
    const categories = [
      {
        title: 'Relevanz & Fokus',
        description: 'Passt dein CV zur Stelle?',
        icon: '🎯',
        details: 'Wir prüfen, ob deine Erfahrungen und Skills zur Position passen',
        delay: 0
      },
      {
        title: 'Erfolge & KPIs',
        description: 'Messbare Ergebnisse erkennbar?',
        icon: '📊',
        details: 'Zahlen und konkrete Erfolge machen deinen CV überzeugend',
        delay: 0.2
      },
      {
        title: 'Klarheit der Sprache',
        description: 'Verständlich formuliert?',
        icon: '💬',
        details: 'Klare Formulierungen helfen HR und ATS-Systemen gleichermaßen',
        delay: 0.4
      },
      {
        title: 'Formales',
        description: 'Professionelle Struktur?',
        icon: '📋',
        details: 'Format, Layout und Vollständigkeit sind entscheidend',
        delay: 0.6
      },
      {
        title: 'USP & Skills',
        description: 'Einzigartige Stärken sichtbar?',
        icon: '⭐',
        details: 'Deine Alleinstellungsmerkmale heben dich von anderen ab',
        delay: 0.8
      }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0a0a0f] to-[#050507] text-white px-4 py-8 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-6"
            >
              <Loader2 className="h-16 w-16 text-[#66c0b6]" />
            </motion.div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent">
              Dein CV wird jetzt analysiert
            </h1>

            <p className="text-lg text-white/70 mb-8 max-w-2xl mx-auto">
              Unser KI-gestütztes System prüft deinen Lebenslauf nach professionellen Standards
              und gibt dir konkrete Verbesserungsvorschläge.
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-6">
              <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden shadow-inner">
                <motion.div
                  className="h-3 bg-gradient-to-r from-[#66c0b6] via-[#30E3CA] to-[#66c0b6]"
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'linear'
                  }}
                />
              </div>
            </div>
          </motion.div>

          {/* Why is CV Check Important Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12 bg-gradient-to-br from-[#66c0b6]/10 to-[#30E3CA]/5 border border-[#66c0b6]/20 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3">
              <span className="text-3xl">💡</span>
              Warum ist ein CV-Check wichtig?
            </h2>
            <div className="grid md:grid-cols-3 gap-4 text:white/80">
              <div className="flex gap-3">
                <span className="text-2xl">🤖</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">ATS-Optimierung</h3>
                  <p className="text-sm">90% der Unternehmen nutzen ATS-Systeme. Dein CV muss diese passieren.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">⚡</span>
                <div>
                  <h3 className="font-semibold text-white mb-1">Schneller Erfolg</h3>
                  <p className="text-sm">Ein optimierter CV erhöht deine Chancen auf ein Interview um 40%.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold text:white mb-1">Professioneller Eindruck</h3>
                  <p className="text-sm">Zeige HR-Manager, dass du es ernst meinst mit deiner Karriere.</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Categories Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {categories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }}
                transition={{
                  delay: category.delay,
                  duration: 0.5
                }}
                className="relative"
              >
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(102, 192, 182, 0.1)',
                      '0 0 30px rgba(102, 192, 182, 0.3)',
                      '0 0 20px rgba(102, 192, 182, 0.1)',
                    ]
                  }}
                  transition={{
                    duration: 2,
                    delay: category.delay,
                    repeat: Infinity,
                  }}
                  className="h-full bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl p-6 hover:border-[#66c0b6]/40 transition-all duration-300 backdrop-blur-sm"
                >
                  {/* Animated Check Indicator */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      delay: category.delay + 1,
                      duration: 0.5,
                      type: 'spring'
                    }}
                    className="absolute top-4 right-4"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#66c0b6]/20 border border-[#66c0b6]/40 flex items-center justify-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          delay: category.delay + 1.5,
                          repeat: Infinity,
                          ease: 'linear'
                        }}
                      >
                        <Loader2 className="w-4 h-4 text-[#66c0b6]" />
                      </motion.div>
                    </div>
                  </motion.div>

                  <div className="text-4xl mb-3">{category.icon}</div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {category.title}
                  </h3>

                  <p className="text-[#66c0b6] text-sm font-medium mb-3">
                    {category.description}
                  </p>

                  <p className="text-white/60 text-sm leading-relaxed">
                    {category.details}
                  </p>

                  {/* Animated Progress Dots */}
                  <div className="flex gap-1 mt-4">
                    {[0, 1, 2].map((dot) => (
                      <motion.div
                        key={dot}
                        animate={{
                          opacity: [0.3, 1, 0.3],
                          scale: [1, 1.2, 1]
                        }}
                        transition={{
                          duration: 1.5,
                          delay: category.delay + dot * 0.2,
                          repeat: Infinity,
                        }}
                        className="w-2 h-2 rounded-full bg-[#66c0b6]"
                      />
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Footer Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="text-center text-white/40 text-sm"
          >
            <p className="mb-2">Die Analyse dauert in der Regel 20-30 Sekunden</p>
            <p className="text-xs font-mono">Upload-ID: {uploadId}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  // ---- UI: Timeout ohne Daten ----
  if (timeoutError && !atsResult && !errorMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0a0a0f] to-[#050507] text:white flex items-center justify-center px-4">
        <div className="max-w-lg w-full bg-black/40 border border-yellow-500/40 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="text-yellow-400" size={28} />
            <h1 className="text-2xl font-bold">Analyse dauert ungewöhnlich lange</h1>
          </div>
          <p className="text-white/70 mb-6">
            Deine Analyse konnte nicht rechtzeitig abgeschlossen werden. Bitte lade die Seite neu
            oder starte den CV-Check noch einmal.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg.white/10 hover:bg.white/20 transition"
            >
              <RefreshCw size={16} />
              Neu laden
            </button>
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#66c0b6] text-black font-semibold hover:opacity-90 transition"
            >
              <Home size={16} />
              Zur Startseite
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- UI: Ergebnis vorhanden ----
  return (
    <AnimatePresence>
      {atsResult ? (
        <AtsResultDisplay
          result={atsResult}
          visionText={visionText}
          uploadId={uploadId}
          showActions={true}
          // ✅ NEU: Payment-Status an die Analyse-Komponente geben
          isPaid={isPaid}
        />
      ) : (
        <div className="min-h-screen bg-[#050816] flex items-center justify-center">
          <div className="text-center text-white/60">
            Keine auswertbaren Daten gefunden.
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
