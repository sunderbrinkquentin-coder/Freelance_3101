import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CareerVisionSection } from '../components/career/CareerVisionSection';
import { GapAnalysisWidget } from '../components/career/GapAnalysisWidget';
import { careerService } from '../services/careerService';
import { LearningPath } from '../types/learningPath';
import { supabase } from '../lib/supabase';

export default function CareerVisionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cvId, setCvId] = useState<string | null>(null);
  const [userPaths, setUserPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    setIsLoading(true);

    try {
      if (user?.id) {
        const { data: cvData } = await supabase
          .from('stored_cvs')
          .select('id')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (cvData) {
          setCvId(cvData.id);
        }

        const paths = await careerService.getUserLearningPaths(user.id);
        setUserPaths(paths);
      }
    } catch (error) {
      console.error('[CareerVision] Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalysisComplete = (pathId: string) => {
    navigate(`/learning-path/${pathId}`);
  };

  const handlePathClick = (pathId: string) => {
    navigate(`/learning-path/${pathId}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white">
      <div className="max-w-6xl mx-auto px-4 py-12 space-y-12">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
            <span>Zurück zum Dashboard</span>
          </button>
        </div>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] mb-4">
            <Target className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold">Career Vision Explorer</h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Definiere deine berufliche Vision und erhalte einen personalisierten Lernpfad zu deinem
            Traumjob
          </p>
        </div>

        {!isLoading && userPaths.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <TrendingUp className="text-[#66c0b6]" />
              Deine Lernpfade
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {userPaths.map((path) => (
                <button
                  key={path.id}
                  onClick={() => handlePathClick(path.id)}
                  className="text-left"
                >
                  <GapAnalysisWidget
                    learningPath={path}
                    onStartLearning={() => handlePathClick(path.id)}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <CareerVisionSection cvId={cvId || undefined} onAnalysisComplete={handleAnalysisComplete} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-gradient-to-br from-[#66c0b6]/10 to-transparent border border-[#66c0b6]/20">
            <div className="w-12 h-12 rounded-xl bg-[#66c0b6]/20 flex items-center justify-center mb-4">
              <Target className="text-[#66c0b6]" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Vision definieren</h3>
            <p className="text-sm text-white/70">
              Beschreibe deine Zielposition in 5-10 Jahren und lass uns die Skill-Gaps analysieren
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4">
              <TrendingUp className="text-blue-400" size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Lernpfad erhalten</h3>
            <p className="text-sm text-white/70">
              Erhalte einen strukturierten Lernplan mit konkreten Ressourcen und Zeitangaben
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center mb-4">
              <svg
                className="text-yellow-400"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2L3 7v9c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z" />
                <path d="M9 12l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Zertifikat erhalten</h3>
            <p className="text-sm text-white/70">
              Nach Abschluss erhältst du ein professionelles Zertifikat für dein Portfolio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
