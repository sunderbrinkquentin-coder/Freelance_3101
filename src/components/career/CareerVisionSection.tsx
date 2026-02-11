import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Target, TrendingUp, Loader2, Check, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { sessionManager } from '../../utils/sessionManager';
import { careerService } from '../../services/careerService';
import { supabase } from '../../lib/supabase';
import { Skill, SkillAssessment } from '../../types/learningPath';

interface CareerVisionSectionProps {
  cvId?: string;
  onAnalysisComplete?: (pathId: string) => void;
}

export function CareerVisionSection({ cvId, onAnalysisComplete }: CareerVisionSectionProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [targetJob, setTargetJob] = useState('');
  const [targetCompany, setTargetCompany] = useState('');
  const [visionDescription, setVisionDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showSkillAssessment, setShowSkillAssessment] = useState(false);
  const [requiredSkills, setRequiredSkills] = useState<Skill[]>([]);
  const [skillAssessments, setSkillAssessments] = useState<SkillAssessment[]>([]);
  const [isGeneratingCurriculum, setIsGeneratingCurriculum] = useState(false);

  const [hasCvData, setHasCvData] = useState(false);
  const [cvData, setCvData] = useState<any>(null);

  useEffect(() => {
    if (cvId) {
      loadCvData();
    }
  }, [cvId]);

  const loadCvData = async () => {
    if (!cvId) return;

    try {
      const { data, error } = await supabase
        .from('stored_cvs')
        .select('cv_data')
        .eq('id', cvId)
        .single();

      if (error) throw error;

      if (data?.cv_data) {
        setCvData(data.cv_data);
        setHasCvData(true);
        console.log('[CareerVision] CV data loaded for gap analysis');
      }
    } catch (err) {
      console.error('[CareerVision] Failed to load CV data:', err);
    }
  };

  const handleAnalyze = async () => {
    if (!targetJob.trim()) {
      setError('Bitte gib eine Zielposition ein');
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const sessionId = sessionManager.getSessionId();

      const analysisResult = await careerService.analyzeVision({
        target_job: targetJob,
        target_company: targetCompany || undefined,
        vision_description: visionDescription || undefined,
        cv_data: cvData || undefined,
        cv_id: cvId,
        user_id: user?.id,
        session_id: sessionId,
      });

      console.log('[CareerVision] Analysis complete:', analysisResult);

      if (hasCvData) {
        const pathId = await careerService.createLearningPath({
          userId: user?.id,
          sessionId,
          cvId,
          targetJob,
          targetCompany: targetCompany || undefined,
          visionDescription: visionDescription || undefined,
          missingSkills: analysisResult.missing_skills || [],
          currentSkills: analysisResult.current_skills || [],
        });

        console.log('[CareerVision] Learning path created:', pathId);

        if (onAnalysisComplete) {
          onAnalysisComplete(pathId);
        } else {
          navigate(`/learning-path/${pathId}`);
        }
      } else {
        setRequiredSkills(analysisResult.missing_skills || []);
        setSkillAssessments(
          (analysisResult.missing_skills || []).map((skill) => ({
            skill: skill.name,
            hasSkill: false,
            proficiencyLevel: undefined,
          }))
        );
        setShowSkillAssessment(true);
      }
    } catch (err: any) {
      console.error('[CareerVision] Analysis failed:', err);
      setError(err.message || 'Die Analyse ist fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSkillToggle = (skillName: string) => {
    setSkillAssessments((prev) =>
      prev.map((assessment) =>
        assessment.skill === skillName
          ? { ...assessment, hasSkill: !assessment.hasSkill }
          : assessment
      )
    );
  };

  const handleGenerateLearningPath = async () => {
    setIsGeneratingCurriculum(true);
    setError(null);

    try {
      const { missingSkills, currentSkills } = await careerService.processSkillAssessment(
        targetJob,
        requiredSkills,
        skillAssessments
      );

      const sessionId = sessionManager.getSessionId();

      const pathId = await careerService.createLearningPath({
        userId: user?.id,
        sessionId,
        targetJob,
        targetCompany: targetCompany || undefined,
        visionDescription: visionDescription || undefined,
        missingSkills,
        currentSkills,
      });

      const curriculumResult = await careerService.generateCurriculum({
        missing_skills: missingSkills,
        target_job: targetJob,
        current_skills: currentSkills,
        timeframe: '12_months',
        learning_style: 'balanced',
      });

      await careerService.updateLearningPath(pathId, {
        curriculum: curriculumResult.curriculum,
        status: 'curriculum_ready',
      });

      console.log('[CareerVision] ✅ Learning path with curriculum created:', pathId);

      if (onAnalysisComplete) {
        onAnalysisComplete(pathId);
      } else {
        navigate(`/learning-path/${pathId}`);
      }
    } catch (err: any) {
      console.error('[CareerVision] Curriculum generation failed:', err);
      setError(
        err.message || 'Die Lernpfad-Erstellung ist fehlgeschlagen. Bitte versuche es erneut.'
      );
    } finally {
      setIsGeneratingCurriculum(false);
    }
  };

  if (showSkillAssessment) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white">Top Skills für {targetJob}</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Markiere die Skills, die du bereits beherrschst. Wir erstellen dann einen personalisierten
            Lernpfad für die fehlenden Fähigkeiten.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillAssessments.map((assessment) => {
              const skill = requiredSkills.find((s) => s.name === assessment.skill);
              return (
                <button
                  key={assessment.skill}
                  onClick={() => handleSkillToggle(assessment.skill)}
                  className={`
                    group relative p-4 rounded-xl border-2 text-left transition-all
                    ${
                      assessment.hasSkill
                        ? 'bg-[#66c0b6]/10 border-[#66c0b6] shadow-lg'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                      flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                      ${
                        assessment.hasSkill
                          ? 'bg-[#66c0b6] border-[#66c0b6]'
                          : 'border-white/30'
                      }
                    `}
                    >
                      {assessment.hasSkill && <Check className="w-4 h-4 text-white" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white mb-1">{assessment.skill}</h4>
                      {skill?.priority && (
                        <span
                          className={`
                          inline-block px-2 py-0.5 rounded-full text-xs font-medium
                          ${
                            skill.priority === 'high'
                              ? 'bg-red-500/20 text-red-300'
                              : skill.priority === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-300'
                              : 'bg-blue-500/20 text-blue-300'
                          }
                        `}
                        >
                          {skill.priority === 'high'
                            ? 'Hoch'
                            : skill.priority === 'medium'
                            ? 'Mittel'
                            : 'Niedrig'}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
            <X size={20} />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setShowSkillAssessment(false)}
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all"
          >
            Zurück
          </button>

          <button
            onClick={handleGenerateLearningPath}
            disabled={isGeneratingCurriculum}
            className="group px-12 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
          >
            {isGeneratingCurriculum ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Erstelle Lernpfad...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Lernpfad erstellen
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] mb-4">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-white">Deine Vision 2030/2035</h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Definiere deine Traumposition in 5-10 Jahren. Wir analysieren die Skill-Gaps und erstellen
          einen personalisierten Lernpfad.
        </p>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            Zielposition <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={targetJob}
            onChange={(e) => setTargetJob(e.target.value)}
            placeholder="z.B. Senior Product Manager, Tech Lead, VP Engineering..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#66c0b6] focus:outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">Zielunternehmen (optional)</label>
          <input
            type="text"
            value={targetCompany}
            onChange={(e) => setTargetCompany(e.target.value)}
            placeholder="z.B. Google, Amazon, Startup im FinTech..."
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#66c0b6] focus:outline-none transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-white/80">
            Deine Vision (optional)
          </label>
          <textarea
            value={visionDescription}
            onChange={(e) => setVisionDescription(e.target.value)}
            placeholder="Beschreibe deine beruflichen Ziele und was du erreichen möchtest..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/40 focus:border-[#66c0b6] focus:outline-none transition-all resize-none"
          />
        </div>

        {hasCvData && (
          <div className="flex items-center gap-2 px-4 py-3 bg-[#66c0b6]/10 border border-[#66c0b6]/20 rounded-xl text-[#66c0b6]">
            <Check size={20} />
            <span className="text-sm">
              CV erkannt – Gap-Analyse wird automatisch durchgeführt
            </span>
          </div>
        )}

        {!hasCvData && (
          <div className="flex items-center gap-2 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300">
            <TrendingUp size={20} />
            <span className="text-sm">
              Ohne CV erhältst du die Top 10 Skills für deinen Wunschjob
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300">
            <X size={20} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing || !targetJob.trim()}
          className="group px-12 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analysiere Vision...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Vision analysieren
            </>
          )}
        </button>
      </div>
    </div>
  );
}
