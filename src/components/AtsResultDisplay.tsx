import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, ArrowRight, Save, FileText, Loader2, BarChart3, FileCheck, Lock } from 'lucide-react';
import { AtsResult } from '../types/ats';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { getScoreLabel } from '../utils/atsHelpers';
import { CircularScore } from './ats/CircularScore';
import { CategoryRow } from './ats/CategoryRow';
import { DetailCard } from './ats/DetailCard';

type Props = {
  result: AtsResult | null;
  uploadId?: string;
  showActions?: boolean;
  isFromDashboard?: boolean;
  autoSave?: boolean;
  onSaveComplete?: () => void;
  onOptimize?: () => void;
  isPaid?: boolean; // 🔥 Entscheidend für Freischaltung
};

export const AtsResultDisplay: React.FC<Props> = ({
  result,
  uploadId,
  showActions = true,
  isFromDashboard = false,
  autoSave = false,
  onSaveComplete,
  onOptimize,
  isPaid = false, // 🔥 default = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'detail'>('overview'); // ✅ NEU

  if (!result) {
    return (
      <div className="max-w-xl mx-auto px-4 py-6">
        <div className="rounded-3xl bg-[#0b1220] border border-white/5 p-6 text-center">
          <p className="text-white/70">Die Analyse-Daten konnten nicht geladen werden.</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------
  // SCORE + DATA
  // --------------------------------------------------
  const score = Math.max(0, Math.min(100, result.ats_score ?? 0));
  const todos = result.top_todos ?? {};
  const scoreLabel = getScoreLabel(score);

  const categories = [
    { key: 'relevanz_fokus', title: 'Relevanz & Fokus', data: result.relevanz_fokus },
    { key: 'erfolge_kpis', title: 'Erfolge & KPIs', data: result.erfolge_kpis },
    { key: 'klarheit_sprache', title: 'Klarheit der Sprache', data: result.klarheit_sprache },
    { key: 'formales', title: 'Formales', data: result.formales },
    { key: 'usp_skills', title: 'USP & Skills', data: result.usp_skills },
  ];

  // --------------------------------------------------
  // SPEICHERN IM DASHBOARD (kein Paywall mehr!)
  // --------------------------------------------------
  const handleSaveToDashboard = async () => {
    if (!user) {
      const currentPath = `/cv-result/${uploadId}`;
      navigate(`/login?redirect=${encodeURIComponent(currentPath)}`);
      return;
    }

    setIsSaving(true);

    const { error } = await supabase.from('ats_analyses').insert({
      user_id: user.id,
      upload_id: uploadId,
      result_json: result,
    });

    if (!error) {
      setSaveSuccess(true);
      onSaveComplete?.();
    }

    setIsSaving(false);
  };


  // --------------------------------------------------
  // UI RENDER
  // --------------------------------------------------

  return (
    <div className="min-h-screen bg-[#050816]">
      <div className="max-w-7xl mx-auto px-3 py-4 space-y-4 sm:px-4 sm:py-6">

        {/* HEADER */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center lg:text-left"
        >
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1">
            Dein ATS-Score
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Score + Top-Empfehlungen für bessere Ergebnisse
          </p>
        </motion.header>

        <div className="lg:grid lg:grid-cols-[1.5fr,1fr] lg:gap-6">

          {/* LEFT COLUMN */}
          <div className="space-y-4 sm:space-y-6">

            {/* SCORE CARD */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl bg-[#0b1220] border border-white/5 shadow-xl p-4"
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <CircularScore score={score} />
                <div>
                  <p className="text-lg md:text-xl font-bold text-white mb-1">
                    {scoreLabel}
                  </p>
                  <p className="text-sm text-white/60">
                    Dein CV hat einen ATS-Score von {score}/100
                  </p>
                </div>
              </div>
            </motion.div>

            {/* 🔥 HARTE PAYWALL: Falls nicht bezahlt, zeige nur Score + Unlock-Button */}
            {!isPaid ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-center max-w-2xl mx-auto p-8 rounded-2xl bg-[#0b1220] border border-[#66c0b6]/30 shadow-2xl"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] flex items-center justify-center mx-auto mb-6">
                  <Lock size={36} className="text-black" />
                </div>

                <h3 className="text-2xl font-bold text-white mb-3">
                  Detailanalyse freischalten
                </h3>

                <p className="text-white/70 mb-6 text-lg">
                  Erhalte Zugriff auf detaillierte Kategorien-Bewertungen, konkretes Feedback und Verbesserungsvorschläge für deinen Lebenslauf.
                </p>

                <div className="bg-white/5 rounded-xl p-6 mb-6">
                  <h4 className="text-white font-semibold mb-3">Das bekommst du:</h4>
                  <ul className="text-left text-white/80 space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle size={20} className="text-[#66c0b6] flex-shrink-0 mt-0.5" />
                      <span>Detaillierte Bewertung in 5 Kategorien</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={20} className="text-[#66c0b6] flex-shrink-0 mt-0.5" />
                      <span>Individuelles Feedback zu jeder Kategorie</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={20} className="text-[#66c0b6] flex-shrink-0 mt-0.5" />
                      <span>Konkrete Verbesserungsvorschläge</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle size={20} className="text-[#66c0b6] flex-shrink-0 mt-0.5" />
                      <span>Top-3 Prioritäten für sofortige Optimierung</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => {
                    if (!user) {
                      const redirectTarget = `/cv-paywall?cvId=${uploadId}&source=cv_unlock`;
                      navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`);
                    } else {
                      navigate(`/cv-paywall?cvId=${uploadId}&source=cv_unlock`);
                    }
                  }}
                  className="w-full px-8 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:opacity-90 transition-all shadow-lg"
                >
                  Jetzt für 9,99€ freischalten
                </button>

                {/* Blurred Preview */}
                <div className="blur-md opacity-30 mt-8 pointer-events-none">
                  <div className="rounded-2xl bg-[#0b1220] border border-white/5 p-4 space-y-3">
                    <div className="h-4 bg-white/10 rounded w-1/3"></div>
                    <div className="h-20 bg-white/10 rounded"></div>
                    <div className="h-20 bg-white/10 rounded"></div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                {/* TABS - nur wenn bezahlt */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="flex gap-2 sm:gap-3"
                >
                  <button
                    onClick={() => setActiveTab('overview')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                      activeTab === 'overview'
                        ? 'bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <BarChart3 size={18} /> Übersicht
                  </button>

                  <button
                    onClick={() => setActiveTab('detail')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-full font-semibold transition-all ${
                      activeTab === 'detail'
                        ? 'bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    <FileCheck size={18} /> Ausführlich
                  </button>
                </motion.div>

                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="rounded-2xl bg-[#0b1220] border border-white/5 shadow-lg p-4 space-y-4"
                  >
                    <h2 className="text-lg font-semibold text-white">ATS-Bewertung (Übersicht)</h2>
                    {categories.map((cat, idx) =>
                      cat.data ? (
                        <CategoryRow
                          key={cat.key}
                          title={cat.title}
                          score={Math.max(0, Math.min(100, cat.data.score ?? 0))}
                          delay={0.3 + idx * 0.1}
                        />
                      ) : null
                    )}
                  </motion.div>
                )}

                {/* DETAIL TAB */}
                {activeTab === 'detail' && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <h2 className="text-lg font-semibold text-white mb-4">
                      Detailbewertung
                    </h2>

                    <div className="space-y-4">
                      {categories.map((cat, idx) => (
                        <DetailCard
                          key={cat.key}
                          title={cat.title}
                          category={cat.data}
                          delay={0.2 + idx * 0.08}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4 sm:space-y-6 mt-6 lg:mt-0">
            
            {/* Top To-Dos */}
            {Object.keys(todos).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="rounded-2xl bg-[#0b1220] border border:white/5 shadow-lg p-4 space-y-3"
              >
                <h2 className="text-lg font-semibold text-white">Top-3 To-dos</h2>

                {Object.entries(todos).map(([key, value], index) => (
                  <div key={key} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-teal-400 to-sky-400 flex items-center justify-center text-black font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-teal-400">{key}</p>
                      <p className="text-sm text-white/80">{value}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Time Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl bg-[#0b1220] border border:white/5 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center">
                  <Clock className="text-teal-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white/90">Zeitaufwand</p>
                  <p className="text-sm text-white/60">
                    Die nächsten Schritte dauern ca. 2–3 Minuten
                  </p>
                </div>
              </div>
            </motion.div>

            {/* SAVE BUTTON */}
            {showActions && !isFromDashboard && (
              <>
                {!saveSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-3"
                  >
                    <button
                      onClick={handleSaveToDashboard}
                      disabled={isSaving}
                      className="w-full rounded-full bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold py-3 flex items-center justify-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Speichere...
                        </>
                      ) : (
                        <>
                          <Save />
                          Im Dashboard speichern
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => navigate('/cv-wizard')}
                      className="w-full rounded-full bg-white/10 border border:white/20 text-white font-semibold py-3 flex items-center justify-center gap-2 hover:bg-white/20"
                    >
                      <FileText />
                      CV erstellen
                    </button>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
