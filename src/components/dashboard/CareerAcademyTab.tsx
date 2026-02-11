import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  TrendingUp,
  Sparkles,
  BookOpen,
  Award,
  Clock,
  ArrowRight,
  Plus,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { careerService } from '../../services/careerService';
import { LearningPath } from '../../types/learningPath';
import { supabase } from '../../lib/supabase';

export function CareerAcademyTab() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPaths: 0,
    inProgress: 0,
    completed: 0,
    totalSkills: 0,
  });

  useEffect(() => {
    if (user?.id) {
      loadLearningPaths();
    }
  }, [user?.id]);

  const loadLearningPaths = async () => {
    if (!user?.id) return;

    setIsLoading(true);

    try {
      const paths = await careerService.getUserLearningPaths(user.id);
      setLearningPaths(paths);

      const stats = {
        totalPaths: paths.length,
        inProgress: paths.filter((p) => p.status === 'in_progress').length,
        completed: paths.filter((p) => p.status === 'completed').length,
        totalSkills: paths.reduce((acc, p) => acc + (p.missing_skills?.length || 0), 0),
      };

      setStats(stats);
    } catch (error) {
      console.error('[CareerAcademy] Failed to load paths:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-[#66c0b6]/20 to-[#30E3CA]/20 border-[#66c0b6]/30 text-[#66c0b6]';
      case 'in_progress':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-400';
      case 'curriculum_ready':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400';
      default:
        return 'from-white/5 to-white/10 border-white/20 text-white/70';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Abgeschlossen';
      case 'in_progress':
        return 'In Bearbeitung';
      case 'curriculum_ready':
        return 'Bereit';
      case 'analyzing':
        return 'Wird analysiert';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-12 h-12 text-[#66c0b6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Career Academy</h2>
          <p className="text-white/60">
            Definiere deine Vision und erhalte personalisierte Lernpfade zu deinem Traumjob
          </p>
        </div>

        <button
          onClick={() => navigate('/career-vision')}
          className="group flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold hover:scale-105 transition-all"
        >
          <Plus size={20} />
          Neue Vision erstellen
          <ArrowRight
            size={20}
            className="group-hover:translate-x-1 transition-transform"
          />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-[#66c0b6]/10 to-transparent border border-[#66c0b6]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#66c0b6]/20 flex items-center justify-center">
              <Target className="text-[#66c0b6]" size={20} />
            </div>
            <span className="text-sm font-medium text-white/70">Lernpfade</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalPaths}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BookOpen className="text-blue-400" size={20} />
            </div>
            <span className="text-sm font-medium text-white/70">In Bearbeitung</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.inProgress}</div>
        </div>

        <div className="bg-gradient-to-br from-[#66c0b6]/10 to-transparent border border-[#66c0b6]/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#66c0b6]/20 flex items-center justify-center">
              <CheckCircle2 className="text-[#66c0b6]" size={20} />
            </div>
            <span className="text-sm font-medium text-white/70">Abgeschlossen</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.completed}</div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Sparkles className="text-yellow-400" size={20} />
            </div>
            <span className="text-sm font-medium text-white/70">Skills gesamt</span>
          </div>
          <div className="text-3xl font-bold text-white">{stats.totalSkills}</div>
        </div>
      </div>

      {learningPaths.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-12 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-[#66c0b6]/20 to-[#30E3CA]/20 border border-[#66c0b6]/30 mb-4">
            <Target className="w-10 h-10 text-[#66c0b6]" />
          </div>

          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-2xl font-bold text-white">
              Starte deinen ersten Lernpfad
            </h3>
            <p className="text-white/70">
              Definiere deine berufliche Vision für die nächsten 5-10 Jahre und erhalte einen
              personalisierten Lernpfad mit konkreten Ressourcen, Zeitplan und Zertifikat nach
              Abschluss.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
              <TrendingUp className="text-[#66c0b6] mb-4" size={32} />
              <h4 className="text-lg font-bold text-white mb-2">Gap-Analyse</h4>
              <p className="text-sm text-white/70">
                KI analysiert deine Skills vs. Zielposition und zeigt dir konkrete Gaps
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
              <BookOpen className="text-blue-400 mb-4" size={32} />
              <h4 className="text-lg font-bold text-white mb-2">Strukturierter Lernplan</h4>
              <p className="text-sm text-white/70">
                5-10 Module mit kuratierten Ressourcen und klarem Zeitplan
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 text-left">
              <Award className="text-yellow-400 mb-4" size={32} />
              <h4 className="text-lg font-bold text-white mb-2">Zertifikat</h4>
              <p className="text-sm text-white/70">
                Professionelles PDF-Zertifikat nach Abschluss für dein Portfolio
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/career-vision')}
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:scale-105 transition-all"
          >
            <Sparkles size={24} />
            Jetzt Vision definieren
            <ArrowRight
              size={24}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white">Deine Lernpfade</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {learningPaths.map((path) => {
              const completionPercentage = careerService.calculateCompletionPercentage(path);
              const modulesCount = path.curriculum?.modules?.length || 0;
              const completedModules =
                Object.values(path.progress || {}).filter((p: any) => p.status === 'completed')
                  .length;

              return (
                <button
                  key={path.id}
                  onClick={() => navigate(`/learning-path/${path.id}`)}
                  className="group text-left bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#66c0b6]/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 bg-gradient-to-r ${getStatusColor(
                          path.status
                        )} border`}
                      >
                        {path.status === 'completed' && <CheckCircle2 size={14} />}
                        {getStatusText(path.status)}
                      </div>

                      <h4 className="text-xl font-bold text-white mb-2 group-hover:text-[#66c0b6] transition-colors">
                        {path.target_job}
                      </h4>

                      {path.target_company && (
                        <p className="text-sm text-white/60 mb-3">@ {path.target_company}</p>
                      )}

                      {path.vision_description && (
                        <p className="text-sm text-white/70 line-clamp-2 mb-4">
                          {path.vision_description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-white/50" />
                      <span className="text-sm text-white/70">
                        {completedModules}/{modulesCount} Module
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-white/50" />
                      <span className="text-sm text-white/70">
                        {path.missing_skills?.length || 0} Skills
                      </span>
                    </div>

                    {path.curriculum?.totalDuration && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-white/50" />
                        <span className="text-sm text-white/70">
                          {path.curriculum.totalDuration}
                        </span>
                      </div>
                    )}

                    {path.certificate_url && (
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-yellow-400" />
                        <span className="text-sm text-yellow-400 font-medium">Zertifiziert</span>
                      </div>
                    )}
                  </div>

                  {modulesCount > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white/50">Fortschritt</span>
                        <span className="text-white/70 font-medium">{completionPercentage}%</span>
                      </div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] transition-all duration-500"
                          style={{ width: `${completionPercentage}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end mt-4 text-[#66c0b6] font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Details anzeigen</span>
                    <ArrowRight
                      size={16}
                      className="ml-2 group-hover:translate-x-1 transition-transform"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
