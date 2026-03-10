/**
 * Saved Analysis Page
 *
 * Display a saved ATS analysis from the dashboard
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { AtsResultDisplay } from '../components/AtsResultDisplay';
import { getAnalysisById, SavedAnalysis } from '../services/atsAnalysisService';
import { useAuth } from '../contexts/AuthContext';

export default function SavedAnalysisPage() {
  const { analysisId } = useParams<{ analysisId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<SavedAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !analysisId) {
      navigate('/dashboard');
      return;
    }

    loadAnalysis();
  }, [user, analysisId]);

  const loadAnalysis = async () => {
    if (!user || !analysisId) return;

    setLoading(true);
    const result = await getAnalysisById(analysisId, user.id);

    if (result.success && result.analysis) {
      setAnalysis(result.analysis);
    } else {
      setError(result.error || 'Analyse konnte nicht geladen werden.');
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="text-teal-400 mx-auto mb-4 animate-spin" size={48} />
          <p className="text-white/70">Lade Analyse...</p>
        </motion.div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="text-red-400 mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white mb-2">
            Analyse nicht gefunden
          </h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-teal-400 to-sky-400 text-slate-950 font-semibold rounded-full hover:shadow-lg transition-all"
          >
            Zurück zum Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050816]">
      {/* Back Button */}
      <div className="max-w-6xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Zurück zum Dashboard</span>
        </button>
      </div>

      {/* Analysis Display */}
      <AtsResultDisplay
        result={analysis.analysis_data}
        uploadId={analysis.upload_id || undefined}
        showActions={false}
        isFromDashboard={true}
      />
    </div>
  );
}
