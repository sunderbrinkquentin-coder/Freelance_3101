// src/pages/CVWizard.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';

import { AvatarSidebar } from '../components/cvbuilder/AvatarSidebar';
import { MotivationScreen } from '../components/cvbuilder/MotivationScreen';
import { ProgressBar } from '../components/cvbuilder/ProgressBar';

// Step Components
import { ExperienceLevelStep } from '../components/cvbuilder/steps/ExperienceLevelStep';
import { PersonalDataStep } from '../components/cvbuilder/steps/PersonalDataStep';
import { SchoolEducationStep } from '../components/cvbuilder/steps/SchoolEducationStep';
import { ProfessionalEducationStep } from '../components/cvbuilder/steps/ProfessionalEducationStep';
import { WorkExperienceStep } from '../components/cvbuilder/steps/WorkExperienceStep';
import { ProjectsStep } from '../components/cvbuilder/steps/ProjectsStep';
import { HardSkillsStep } from '../components/cvbuilder/HardSkillsStep';
import { SoftSkillsStep } from '../components/cvbuilder/SoftSkillsStep';
import { WorkValuesStep } from '../components/cvbuilder/steps/WorkValuesStep';
import { HobbiesStep } from '../components/cvbuilder/steps/HobbiesStep';
import { TargetJobStep } from '../components/cvbuilder/steps/TargetJobStep';
import { CompletionStep } from '../components/cvbuilder/steps/CompletionStep';

import {
  CVBuilderData,
  ExperienceLevel,
  PersonalData,
  SchoolEducation,
  ProfessionalEducation,
  Project,
  WorkExperience,
  HardSkill,
  SoftSkill,
  WorkValues,
  Hobbies,
  TargetJob,
} from '../types/cvBuilder';

import { useAuth } from '../contexts/AuthContext';
import { sessionManager } from '../utils/sessionManager';
import { generateOptimizedCV } from '../services/cvGenerationService';

/**
 * 🔧 IMPROVED: Robuste Mapping-Funktion für CV-Check-Daten → CVBuilderData
 * Initialisiert ALLE Felder, vermeidet undefined
 *
 * 🔥 WICHTIG: Prüft ob Daten bereits im CVBuilderData-Format sind
 * um beim Laden von Entwürfen keine Daten zu verlieren
 */
function adaptParsedCvToBuilderData(parsed: any): CVBuilderData {
  // Check if data is already in CVBuilderData format
  if (parsed && typeof parsed === 'object') {
    // If it has CVBuilderData fields, return as-is (it's a draft)
    if ('personalData' in parsed || 'workExperiences' in parsed || 'experienceLevel' in parsed) {
      console.log('[CVWizard] Data is already in CVBuilderData format, using as-is');
      return {
        ...parsed,
        // Ensure arrays exist
        workExperiences: parsed.workExperiences || [],
        projects: parsed.projects || [],
        hardSkills: parsed.hardSkills || [],
        softSkills: parsed.softSkills || [],
        professionalEducation: parsed.professionalEducation || [],
        languages: parsed.languages || [],
        workValues: parsed.workValues || { values: [], workStyle: [] },
        hobbies: parsed.hobbies || { hobbies: [], details: '' },
      } as CVBuilderData;
    }
  }
  const safe = (v: any) => (v == null ? '' : String(v));

  const parseMY = (s: string) => {
    const m = safe(s).match(/^(\d{1,2})\.(\d{4})$/);
    if (!m) return { month: '', year: '' };
    return { month: m[1].padStart(2, '0'), year: m[2] };
  };

  // Personal Info
  const fullName = safe(parsed?.personalInfo?.name).trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

  const personalData: PersonalData = {
    firstName,
    lastName,
    city: safe(parsed?.personalInfo?.location),
    zipCode: '',
    email: safe(parsed?.personalInfo?.email),
    phone: safe(parsed?.personalInfo?.phone),
    linkedin: safe(parsed?.personalInfo?.linkedin),
    website: '',
    portfolio: '',
    photoUrl: '',
  };

  // Work Experiences
  const workExperiences: WorkExperience[] = Array.isArray(parsed?.experience)
    ? parsed.experience.map((e: any) => {
        const startDate = safe(e?.startDate);
        const current = !!e?.isCurrent;
        const smy = parseMY(startDate);
        const emy = parseMY(safe(e?.endDate));

        return {
          jobTitle: safe(e?.title),
          company: safe(e?.company),
          location: safe(e?.location),
          startDate,
          endDate: current ? 'Heute' : safe(e?.endDate),
          current,
          tasks: Array.isArray(e?.bullets) ? e.bullets.filter(Boolean) : [],
          responsibilities: [],
          tools: [],
          kpis: [],
          achievements: [],
          startMonth: smy.month,
          startYear: smy.year,
          endMonth: current ? '' : emy.month,
          endYear: current ? '' : emy.year,
          industry: '',
          roleLevel: '',
          revenue: '',
          budget: '',
          teamSize: '',
          customersMarket: '',
          achievementsRaw: '',
          tasksWithMetrics: [],
          achievementsWithMetrics: [],
          bullets: Array.isArray(e?.bullets) ? e.bullets.filter(Boolean) : [],
        };
      })
    : [];

  // Education
  const professionalEducation: ProfessionalEducation[] = Array.isArray(parsed?.education)
    ? parsed.education.map((edu: any) => ({
        type: 'university' as const,
        institution: safe(edu?.institution),
        degree: safe(edu?.degree),
        startYear: safe(edu?.startYear),
        endYear: safe(edu?.endYear),
        focus: Array.isArray(edu?.focus) ? edu.focus : [],
        projects: [],
        grades: safe(edu?.grades),
      }))
    : [];

  // Skills
  const hardSkills: HardSkill[] = Array.isArray(parsed?.skills)
    ? parsed.skills.map((skill: any) => ({
        skill: typeof skill === 'string' ? skill : safe(skill?.name),
        level: 'intermediate' as const,
        yearsOfExperience: '',
        category: 'other' as const,
      }))
    : [];

  // Languages
  const languages = Array.isArray(parsed?.languages)
    ? parsed.languages.map((lang: any) => ({
        language: typeof lang === 'string' ? lang : safe(lang?.name),
        level: safe(lang?.level) || 'intermediate',
      }))
    : [];

  // Projects
  const projects: Project[] = Array.isArray(parsed?.projects)
    ? parsed.projects.map((proj: any) => ({
        type: 'personal' as const,
        title: safe(proj?.title),
        description: safe(proj?.description),
        role: safe(proj?.role),
        goal: '',
        tools: Array.isArray(proj?.tools) ? proj.tools : [],
        result: safe(proj?.result),
        impact: '',
        duration: '',
      }))
    : [];

  return {
    experienceLevel: workExperiences.length >= 2 ? 'experienced' : 'beginner',
    targetRole: undefined,
    targetIndustry: undefined,
    personalData,
    schoolEducation: undefined,
    professionalEducation: professionalEducation.length > 0 ? professionalEducation : [],
    workExperiences: workExperiences.length > 0 ? workExperiences : [],
    projects: projects.length > 0 ? projects : [],
    hardSkills: hardSkills.length > 0 ? hardSkills : [],
    softSkills: [],
    workValues: { values: [], workStyle: [] },
    hobbies: { hobbies: [], details: '' },
    jobTarget: undefined,
    targetJob: undefined,
    languages: languages.length > 0 ? languages : [],
    summary: undefined,
  };
}

export function CVWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ---- States ----
  const [cvId, setCvId] = useState<string | null>(
    location.state?.cvId || new URLSearchParams(location.search).get('cvId')
  );
  const [cvData, setCVData] = useState<CVBuilderData>({} as CVBuilderData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationVariant, setMotivationVariant] = useState<1 | 2 | 3>(1);

  // ---- Database Sync (Load) ----
  useEffect(() => {
    const initWizard = async () => {
      if (!cvId) {
        console.log('[CVWizard] No cvId provided, starting fresh');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('[CVWizard] Loading CV data for cvId:', cvId);

        const { data, error } = await supabase
          .from('stored_cvs')
          .select('cv_data, status, source')
          .eq('id', cvId)
          .single();

        if (error) {
          console.error('[CVWizard] Load error:', error);
          throw error;
        }

        if (data?.cv_data) {
          console.log('[CVWizard] Loaded cv_data:', {
            status: data.status,
            source: data.source,
            hasData: !!data.cv_data,
          });

          // Falls die Daten vom Check kommen, einmalig mappen
          const baseData =
            data.status === 'pending' || data.status === 'processing'
              ? adaptParsedCvToBuilderData(data.cv_data)
              : (data.cv_data as CVBuilderData);

          console.log('[CVWizard] Mapped data:', {
            hasWorkExperiences: !!baseData.workExperiences,
            workExperiencesCount: baseData.workExperiences?.length || 0,
            hasProjects: !!baseData.projects,
            projectsCount: baseData.projects?.length || 0,
            hasHardSkills: !!baseData.hardSkills,
            hardSkillsCount: baseData.hardSkills?.length || 0,
          });

          setCVData(baseData);
          if (Object.keys(baseData).length > 0) setCurrentStep(1);
        } else {
          console.log('[CVWizard] No cv_data found, starting fresh');
        }
      } catch (err: any) {
        console.error('[CVWizard] Initialization error:', err.message);
        setLoadError('Dein Profil konnte nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    };

    initWizard();
  }, [cvId]);

  // ---- 🔥 AUTO-SAVE: Bei jeder Änderung speichern ----
  const saveProgress = useCallback(
    async (newData: CVBuilderData) => {
      if (!cvId) {
        console.warn('[CVWizard] Cannot auto-save without cvId');
        return;
      }

      setIsSaving(true);
      try {
        console.log('[CVWizard] Auto-saving progress...', {
          cvId,
          hasWorkExperiences: !!newData.workExperiences,
          workExperiencesCount: newData.workExperiences?.length || 0,
        });

        const sessionId = sessionManager.getSessionId();
        const userId = user?.id || null;

        const { error } = await supabase
          .from('stored_cvs')
          .update({
            cv_data: newData,
            session_id: sessionId,
            user_id: userId,
            updated_at: new Date().toISOString(),
            status: 'draft',
          })
          .eq('id', cvId);

        if (error) {
          console.error('[CVWizard] Auto-save error:', error);
          throw error;
        }

        console.log('[CVWizard] ✅ Auto-save successful');
      } catch (err) {
        console.error('[CVWizard] Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [cvId, user]
  );

  // ---- 🔥 UPDATE: Triggert automatisch saveProgress ----
  const updateCVData = <K extends keyof CVBuilderData>(
    key: K,
    value: CVBuilderData[K]
  ) => {
    setCVData((prev) => {
      const next = { ...prev, [key]: value };
      console.log(`[CVWizard] Updating ${String(key)}:`, value);
      saveProgress(next);
      return next;
    });
  };

  // ---- Navigation Logic ----
  const nextStep = () => {
    if ((currentStep + 1) % 3 === 0 && currentStep > 0 && currentStep < 11) {
      setMotivationVariant((((currentStep + 1) / 3) % 3 + 1) as 1 | 2 | 3);
      setShowMotivation(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMotivationContinue = () => {
    setShowMotivation(false);
    setCurrentStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- 🔥 FINALIZING: Status auf 'completed' setzen + Make.com Webhook triggern ----
  const handleGoToJobTargeting = async () => {
    if (!cvId) {
      console.error('[CVWizard] Cannot finalize without cvId');
      setLoadError('Keine CV-ID vorhanden');
      return;
    }

    setIsLoading(true);
    try {
      console.log('[CVWizard] ===== FINALIZING CV =====');

      // 1. Sicherstellen, dass alle Arrays initialisiert sind
      const finalData: CVBuilderData = {
        ...cvData,
        workExperiences: cvData.workExperiences || [],
        projects: cvData.projects || [],
        hardSkills: cvData.hardSkills || [],
        softSkills: cvData.softSkills || [],
        professionalEducation: cvData.professionalEducation || [],
        languages: cvData.languages || [],
        workValues: cvData.workValues || { values: [], workStyle: [] },
        hobbies: cvData.hobbies || { hobbies: [], details: '' },
      };

      console.log('[CVWizard] Final data check:', {
        hasWorkExperiences: !!finalData.workExperiences,
        workExperiencesCount: finalData.workExperiences?.length || 0,
        hasProjects: !!finalData.projects,
        projectsCount: finalData.projects?.length || 0,
        hasHardSkills: !!finalData.hardSkills,
        hardSkillsCount: finalData.hardSkills?.length || 0,
      });

      const sessionId = sessionManager.getSessionId();
      const userId = user?.id || null;

      // 2. Final update mit status='processing' (wird von Make auf 'completed' gesetzt)
      console.log('[CVWizard] Step 1: Saving final data to database...');
      const { error: updateError } = await supabase
        .from('stored_cvs')
        .update({
          cv_data: finalData,
          session_id: sessionId,
          user_id: userId,
          status: 'processing',
          updated_at: new Date().toISOString(),
        })
        .eq('id', cvId);

      if (updateError) {
        console.error('[CVWizard] Database save error:', updateError);
        throw new Error('Fehler beim Speichern: ' + updateError.message);
      }

      console.log('[CVWizard] ✅ Data saved with status=processing');

      // 3. Make.com Webhook aufrufen für CV-Optimierung
      console.log('[CVWizard] Step 2: Triggering Make.com webhook...');

      try {
        const webhookResponse = await generateOptimizedCV({
          session_id: sessionId,
          user_id: userId || '',
          cv_draft: finalData,
        });

        console.log('[CVWizard] Webhook response:', {
          status: webhookResponse.status,
          hasDocumentId: !!webhookResponse.cv_document_id,
          hasEditorData: !!webhookResponse.editor_data,
        });

        if (webhookResponse.status === 'error') {
          console.error('[CVWizard] Make.com webhook error:', webhookResponse.error);
          throw new Error(
            webhookResponse.error || 'Make.com Webhook ist fehlgeschlagen'
          );
        }

        console.log('[CVWizard] ✅ Make.com webhook successful');

        // 4. Status auf 'completed' setzen nach erfolgreichem Webhook
        const { error: completedError } = await supabase
          .from('stored_cvs')
          .update({
            status: 'completed',
            updated_at: new Date().toISOString(),
          })
          .eq('id', cvId);

        if (completedError) {
          console.warn('[CVWizard] Could not update status to completed:', completedError);
          // Nicht kritisch, wir navigieren trotzdem weiter
        }

        console.log('[CVWizard] ===== CV FINALIZATION COMPLETE =====');

        // 5. Navigation zum Job-Targeting
        navigate('/job-targeting', {
          state: {
            cvId,
            cvData: finalData,
            webhookResponse
          }
        });

      } catch (webhookError: any) {
        console.error('[CVWizard] Make.com webhook failed:', webhookError);

        // Webhook fehlgeschlagen, aber Daten sind gespeichert
        // User kann manuell zum Editor gehen
        setLoadError(
          'Die automatische Optimierung ist fehlgeschlagen. ' +
          'Deine Daten wurden aber gespeichert. Möchtest du trotzdem fortfahren?'
        );

        // Fallback: Navigiere trotzdem, aber ohne webhook response
        setTimeout(() => {
          navigate('/job-targeting', {
            state: {
              cvId,
              cvData: finalData,
              webhookError: webhookError.message
            }
          });
        }, 3000);
      }

    } catch (err: any) {
      console.error('[CVWizard] Finalization failed:', err);
      setLoadError(
        'Fehler beim Abschließen: ' + (err.message || 'Unbekannter Fehler')
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Step Configuration ----
  const totalSteps = 12;

  const getStepInfo = (step: number) => {
    const steps = [
      { title: 'Erfahrungslevel', message: 'Lass uns dein Erfahrungslevel bestimmen' },
      { title: 'Persönliche Daten', message: 'Erzähl uns ein bisschen über dich' },
      { title: 'Schulbildung', message: 'Welche Schule hast du besucht?' },
      { title: 'Ausbildung/Studium', message: 'Deine berufliche Ausbildung' },
      { title: 'Berufserfahrung', message: 'Deine praktischen Erfahrungen' },
      { title: 'Projekte', message: 'Besondere Projekte, an denen du gearbeitet hast' },
      { title: 'Hard Skills', message: 'Deine technischen Fähigkeiten' },
      { title: 'Soft Skills', message: 'Deine persönlichen Stärken' },
      { title: 'Werte & Arbeitsstil', message: 'Was ist dir bei der Arbeit wichtig?' },
      { title: 'Hobbies', message: 'Was machst du in deiner Freizeit?' },
      { title: 'Wunschjob', message: 'Auf welche Stelle möchtest du dich bewerben?' },
      { title: 'Fertig!', message: 'Dein CV ist bereit' },
    ];
    return steps[step] || steps[0];
  };

  // ---- Render Step Content ----
  const renderStep = () => {
    const stepInfo = getStepInfo(currentStep);

    switch (currentStep) {
      case 0:
        return (
          <ExperienceLevelStep
            value={cvData.experienceLevel}
            onChange={(value) => updateCVData('experienceLevel', value)}
            onNext={nextStep}
          />
        );

      case 1:
        return (
          <PersonalDataStep
            data={cvData.personalData || {}}
            onChange={(data) => updateCVData('personalData', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 2:
        return (
          <SchoolEducationStep
            data={cvData.schoolEducation}
            onChange={(data) => updateCVData('schoolEducation', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 3:
        return (
          <ProfessionalEducationStep
            data={cvData.professionalEducation || []}
            onChange={(data) => updateCVData('professionalEducation', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 4:
        return (
          <WorkExperienceStep
            data={cvData.workExperiences || []}
            onChange={(data) => updateCVData('workExperiences', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 5:
        return (
          <ProjectsStep
            data={cvData.projects || []}
            onChange={(data) => updateCVData('projects', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 6:
        return (
          <HardSkillsStep
            skills={cvData.hardSkills || []}
            languages={cvData.languages || []}
            onSkillsChange={(skills) => updateCVData('hardSkills', skills)}
            onLanguagesChange={(languages) => updateCVData('languages', languages)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 7:
        return (
          <SoftSkillsStep
            data={cvData.softSkills || []}
            onChange={(data) => updateCVData('softSkills', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 8:
        return (
          <WorkValuesStep
            data={cvData.workValues || { values: [], workStyle: [] }}
            onChange={(data) => updateCVData('workValues', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 9:
        return (
          <HobbiesStep
            data={cvData.hobbies || { hobbies: [], details: '' }}
            onChange={(data) => updateCVData('hobbies', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 10:
        return (
          <TargetJobStep
            data={cvData.targetJob}
            onChange={(data) => updateCVData('targetJob', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 11:
        return (
          <CompletionStep
            cvData={cvData}
            onComplete={handleGoToJobTargeting}
            onBack={prevStep}
          />
        );

      default:
        return null;
    }
  };

  // ---- Loading State ----
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#66c0b6] animate-spin" />
          <p className="text-white/70 font-medium">Dein Profil wird vorbereitet...</p>
        </div>
      </div>
    );
  }

  // ---- Error State ----
  if (loadError) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="max-w-md text-center space-y-4">
          <p className="text-red-400">{loadError}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-[#66c0b6] text-black rounded-xl hover:opacity-90"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    );
  }

  // ---- Motivation Screen ----
  if (showMotivation) {
    return (
      <MotivationScreen variant={motivationVariant} onContinue={handleMotivationContinue} />
    );
  }

  // ---- Main Wizard UI ----
  return (
    <div className="min-h-screen w-full bg-[#020617] text-white relative">
      {/* Auto-Save Indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/50">
          <Loader2 size={12} className="animate-spin" /> Speichere...
        </div>
      )}

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#020617]/80 backdrop-blur-sm border-b border-white/10">
        <ProgressBar current={currentStep + 1} total={totalSteps} />
      </div>

      {/* Step Content */}
      <div className="pt-20 min-h-screen flex flex-col">{renderStep()}</div>
    </div>
  );
}
