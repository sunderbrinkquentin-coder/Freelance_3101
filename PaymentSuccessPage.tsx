import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader, Check, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pollCount, setPollCount] = useState(0);

  const cvId = searchParams.get('cvId');
  const sessionCvId = sessionStorage.getItem('pending_cv_id');
  const actualCvId = cvId || sessionCvId;

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setStatus('error');
      setErrorMessage('Authentifizierung erforderlich. Bitte melde dich an.');
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    if (!actualCvId) {
      setStatus('error');
      setErrorMessage('Keine CV-ID gefunden.');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    checkPaymentStatus();
  }, [user, authLoading, actualCvId, navigate]);

  const checkPaymentStatus = async () => {
    try {
      const { data: cvData, error } = await supabase
        .from('stored_cvs')
        .select('is_paid, download_unlocked, ats_json, vision_text')
        .eq('id', actualCvId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!cvData) {
        throw new Error('CV nicht gefunden');
      }

      if (cvData.is_paid && cvData.download_unlocked) {
        console.log('[PaymentSuccess] ✅ Payment confirmed, saving analysis...');

        if (cvData.ats_json) {
          await saveAnalysisToDashboard(cvData.ats_json);
        }

        setStatus('success');
        sessionStorage.removeItem('pending_cv_id');
        sessionStorage.removeItem('pending_cv_source');

        setTimeout(() => {
          navigate(`/dashboard?payment=success&cvId=${actualCvId}`, { replace: true });
        }, 2000);
        return;
      }

      setPollCount(c => c + 1);

      if (pollCount < 30) {
        console.log(`[PaymentSuccess] 🔄 Payment not yet confirmed (attempt ${pollCount + 1}), retrying...`);
        setTimeout(checkPaymentStatus, 1000);
      } else {
        throw new Error('Zahlungsbestätigung hat zu lange gedauert');
      }
    } catch (err: any) {
      console.error('[PaymentSuccess] ❌ Error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Fehler beim Verarbeiten der Zahlung');
      setTimeout(() => navigate(`/cv-paywall?cvId=${actualCvId}`), 3000);
    }
  };

  const saveAnalysisToDashboard = async (atsJson: any) => {
    if (!user) return;

    try {
      const score = Math.max(0, Math.min(100, atsJson.ats_score ?? 0));

      const categories = [
        { key: 'relevanz_fokus', data: atsJson.relevanz_fokus },
        { key: 'erfolge_kpis', data: atsJson.erfolge_kpis },
        { key: 'klarheit_sprache', data: atsJson.klarheit_sprache },
        { key: 'formales', data: atsJson.formales },
        { key: 'usp_skills', data: atsJson.usp_skills },
      ];

      const categoryScores: Record<string, number> = {};
      const feedback: Record<string, string> = {};
      const recommendations: Record<string, string> = {};

      categories.forEach((cat) => {
        if (cat.data) {
          categoryScores[cat.key] = cat.data.score ?? 0;
          if (cat.data.feedback) feedback[cat.key] = cat.data.feedback;
          if (cat.data.verbesserung) recommendations[cat.key] = cat.data.verbesserung;
        }
      });

      await supabase.from('ats_analyses').upsert({
        user_id: user.id,
        upload_id: actualCvId,
        ats_score: score,
        category_scores: categoryScores,
        feedback,
        recommendations,
        analysis_data: atsJson,
        extracted_cv_data: {},
      }, {
        onConflict: 'user_id,upload_id'
      });

      console.log('[PaymentSuccess] ✅ Analysis saved to dashboard');
    } catch (err) {
      console.error('[PaymentSuccess] ❌ Error saving analysis:', err);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Loader className="text-[#66c0b6]" size={48} />
          </motion.div>
          <h2 className="text-xl font-bold text-white">Lädt...</h2>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        {status === 'checking' && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="inline-block mb-6"
            >
              <Loader className="text-[#66c0b6]" size={64} />
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Zahlung wird verarbeitet
            </h2>
            <p className="text-white/60">
              Bitte warten Sie einen Moment...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                <Check className="text-green-400" size={48} />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Zahlung erfolgreich!
            </h2>
            <p className="text-white/60 mb-6">
              Dein CV wird nun freigegeben. Kurz darauf wirst du weitergeleitet...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-block mb-6"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <AlertCircle className="text-red-400" size={48} />
              </div>
            </motion.div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Fehler beim Verarbeiten
            </h2>
            <p className="text-white/60 mb-6">
              {errorMessage}
            </p>
            <p className="text-sm text-white/40">
              Du wirst automatisch zurückgeleitet...
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
