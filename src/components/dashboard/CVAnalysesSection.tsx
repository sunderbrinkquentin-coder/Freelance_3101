import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck, ExternalLink, Calendar, TrendingUp, Target } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface AtsAnalysis {
  id: string;
  upload_id: string;
  ats_score: number;
  category_scores: Record<string, number>;
  feedback: Record<string, string>;
  recommendations: Record<string, string>;
  created_at: string;
  analysis_data: any;
}

export default function CVAnalysesSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [analyses, setAnalyses] = useState<AtsAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    if (!user) {
      setAnalyses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('[CV-ANALYSES] Loading analyses for user:', user.id);

      const { data, error: fetchError } = await supabase
        .from('ats_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        throw fetchError;
      }

      console.log('[CV-ANALYSES] Loaded:', data?.length || 0, 'analyses');
      setAnalyses(data || []);
    } catch (err: any) {
      console.error('[CV-ANALYSES] Error:', err);
      setError('Fehler beim Laden der Analysen');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
          Sehr gut
        </span>
      );
    } else if (score >= 60) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
          Gut
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
          Verbesserungswürdig
        </span>
      );
    }
  };

  const handleOpenAnalysis = (analysis: AtsAnalysis) => {
    console.log('[CV-ANALYSES] Opening analysis:', analysis.id);
    navigate(`/saved-cv-check/${analysis.id}`);
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FileCheck className="text-[#66c0b6]" size={28} />
          Meine CV-Analysen
        </h2>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#66c0b6]/30 border-t-[#66c0b6] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <FileCheck className="text-[#66c0b6]" size={28} />
          Meine CV-Analysen
        </h2>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <FileCheck className="text-[#66c0b6]" size={28} />
        Meine CV-Analysen
      </h2>

      {analyses.length === 0 ? (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 bg-[#66c0b6]/10 rounded-full flex items-center justify-center mx-auto">
              <FileCheck className="text-[#66c0b6]" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Noch keine CV-Analysen
            </h3>
            <p className="text-white/60 leading-relaxed">
              Du hast noch keine CV-Analysen durchgeführt. Starte jetzt und erhalte
              detailliertes Feedback zu deinem Lebenslauf!
            </p>
            <button
              onClick={() => navigate('/cv-check')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <Target size={20} />
              Jetzt CV analysieren
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {analyses.map((analysis) => (
            <div
              key={analysis.id}
              className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#66c0b6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#66c0b6]/10"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate mb-1">
                      CV-Analyse
                    </h3>
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className={getScoreColor(analysis.ats_score)} />
                      <span className={`text-2xl font-bold ${getScoreColor(analysis.ats_score)}`}>
                        {analysis.ats_score}%
                      </span>
                    </div>
                  </div>
                  {getScoreBadge(analysis.ats_score)}
                </div>

                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Calendar size={14} />
                  <span>Erstellt am {formatDate(analysis.created_at)}</span>
                </div>

                <div className="pt-2 border-t border-white/10">
                  <div className="text-xs text-white/60 space-y-1">
                    {Object.entries(analysis.category_scores).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className={getScoreColor(value as number)}>{value}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenAnalysis(analysis)}
                  className="w-full px-4 py-3 bg-[#66c0b6]/10 hover:bg-[#66c0b6]/20 text-[#66c0b6] font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-[#66c0b6]/20 hover:border-[#66c0b6]/40"
                >
                  <ExternalLink size={18} />
                  Details ansehen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
