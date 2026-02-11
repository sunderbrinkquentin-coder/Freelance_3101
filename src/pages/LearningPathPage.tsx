import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LearningPathDashboard } from '../components/career/LearningPathDashboard';
import { GapAnalysisWidget } from '../components/career/GapAnalysisWidget';
import { careerService } from '../services/careerService';
import { certificateService } from '../services/certificateService';
import { LearningPath } from '../types/learningPath';

export default function LearningPathPage() {
  const { pathId } = useParams<{ pathId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [learningPath, setLearningPath] = useState<LearningPath | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingCertificate, setIsGeneratingCertificate] = useState(false);

  useEffect(() => {
    if (pathId) {
      loadLearningPath();
    }
  }, [pathId]);

  const loadLearningPath = async () => {
    if (!pathId) return;

    setIsLoading(true);
    setError(null);

    try {
      const path = await careerService.getLearningPath(pathId);

      if (!path) {
        setError('Lernpfad nicht gefunden');
        return;
      }

      setLearningPath(path);
    } catch (err: any) {
      console.error('[LearningPath] Load error:', err);
      setError(err.message || 'Fehler beim Laden des Lernpfads');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCertificateRequest = async () => {
    if (!learningPath) return;

    const recipientName =
      user?.email?.split('@')[0] || learningPath.user_id?.substring(0, 8) || 'Teilnehmer';

    setIsGeneratingCertificate(true);

    try {
      await certificateService.issueCertificate(learningPath, recipientName);
      await loadLearningPath();
    } catch (err: any) {
      console.error('[Certificate] Generation error:', err);
      alert('Fehler beim Erstellen des Zertifikats: ' + err.message);
    } finally {
      setIsGeneratingCertificate(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#66c0b6] animate-spin" />
          <p className="text-white/70 font-medium">Lade Lernpfad...</p>
        </div>
      </div>
    );
  }

  if (error || !learningPath) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto" />
          <p className="text-red-400">{error || 'Lernpfad nicht gefunden'}</p>
          <button
            onClick={() => navigate('/career-vision')}
            className="px-6 py-3 bg-[#66c0b6] text-black rounded-xl hover:opacity-90"
          >
            Zurück zur Career Vision
          </button>
        </div>
      </div>
    );
  }

  const showDashboard = learningPath.curriculum && (learningPath.is_paid || learningPath.curriculum.modules.length > 0);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/career-vision')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
            <span>Zurück</span>
          </button>

          {learningPath.status === 'completed' && (
            <div className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#66c0b6]/20 to-[#30E3CA]/20 border border-[#66c0b6]/30">
              <span className="text-[#66c0b6] font-semibold">✓ Abgeschlossen</span>
            </div>
          )}
        </div>

        {!showDashboard ? (
          <div className="max-w-3xl mx-auto">
            <GapAnalysisWidget
              learningPath={learningPath}
              onStartLearning={() => {
                console.log('Start learning clicked');
              }}
            />
          </div>
        ) : (
          <LearningPathDashboard
            learningPath={learningPath}
            onCertificateRequest={handleCertificateRequest}
          />
        )}

        {isGeneratingCertificate && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-[#020617] border border-white/10 rounded-2xl p-8 max-w-md text-center space-y-4">
              <Loader2 className="w-16 h-16 text-[#66c0b6] animate-spin mx-auto" />
              <h3 className="text-xl font-bold text-white">Erstelle Zertifikat...</h3>
              <p className="text-white/70">
                Dein Zertifikat wird generiert und automatisch heruntergeladen.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
