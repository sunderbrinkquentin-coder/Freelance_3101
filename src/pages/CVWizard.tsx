import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { sessionManager } from '../utils/sessionManager';
import {
  ExperienceLevelStep,
  PersonalDataStep,
  SchoolEducationStep,
  ProfessionalEducationStep,
  WorkExperienceStep,
  ProjectsStep,
  WorkValuesStep,
  HobbiesStep,
  CompletionStep,
} from '../components/cvbuilder/steps';
import { HardSkillsStep } from '../components/cvbuilder/HardSkillsStep';
import { SoftSkillsStep } from '../components/cvbuilder/SoftSkillsStep';
import { TargetJobStep } from '../components/cvbuilder/steps/TargetJobStep';
import { ProgressBar } from '../components/cvbuilder/ProgressBar';
import { MotivationScreen } from '../components/cvbuilder/MotivationScreen';
import { AvatarSidebar } from '../components/cvbuilder/AvatarSidebar';
import { InsightsPanel } from '../components/cvbuilder/InsightsPanel';
import {
  CVBuilderData,
  PersonalData,
  WorkExperience,
  HardSkill,
  ProfessionalEducation,
} from '../types/cvBuilder';

// ===========================
// Adapter: Parsed CV → CVBuilderData
// ===========================
function adaptParsedCvToBuilderData(parsed: any): CVBuilderData {
  // Check if data is already in CVBuilderData format
  if (parsed && typeof parsed === 'object') {
    // If it has CVBuilderData fields, return as-is (it's a draft)
    if ('personalData' in parsed || 'workExperiences' in parsed || 'experienceLevel' in parsed) {
      console.log('[CVWizard] Data is already in CVBuilderData format, using as-is');
      return {
        ...parsed,
        // Ensure arrays exist
        schoolEducation: Array.isArray(parsed.schoolEducation)
          ? parsed.schoolEducation
          : (parsed.schoolEducation ? [parsed.schoolEducation] : []),
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
          endDate: current ? 'heute' : safe(e?.endDate),
          current,
          startMonth: smy.month,
          startYear: smy.year,
          endMonth: emy.month,
          endYear: emy.year,
          tasks: Array.isArray(e?.responsibilities) ? e.responsibilities : [],
        };
      })
    : [];

  // Skills → HardSkills
  const hardSkills: HardSkill[] = Array.isArray(parsed?.skills)
    ? parsed.skills.map((s: any) => ({
        name: safe(s?.name || s),
        category: 'Fachlich',
        level: 4,
      }))
    : [];

  // Education → professionalEducation
  const professionalEducation: ProfessionalEducation[] = Array.isArray(parsed?.education)
    ? parsed.education.map((ed: any) => ({
        type: 'Hochschulstudium',
        institution: safe(ed?.institution),
        degree: safe(ed?.degree),
        fieldOfStudy: safe(ed?.fieldOfStudy),
        startDate: safe(ed?.startDate),
        endDate: safe(ed?.endDate),
        current: !!ed?.isCurrent,
      }))
    : [];

  // Projects
  const projects = Array.isArray(parsed?.projects)
    ? parsed.projects.map((p: any) => ({
        name: safe(p?.name),
        description: safe(p?.description),
        role: safe(p?.role),
        technologies: Array.isArray(p?.technologies) ? p.technologies : [],
        achievements: [],
        link: '',
        startDate: '',
        endDate: '',
        impact: '',
        duration: '',
      }))
    : [];

  return {
    experienceLevel: workExperiences.length >= 2 ? 'experienced' : 'beginner',
    targetRole: undefined,
    targetIndustry: undefined,
    personalData,
    schoolEducation: [],
    professionalEducation: professionalEducation.length > 0 ? professionalEducation : [],
    workExperiences: workExperiences.length > 0 ? workExperiences : [],
    projects: projects.length > 0 ? projects : [],
    hardSkills: hardSkills.length > 0 ? hardSkills : [],
    softSkills: [],
    workValues: { values: [], workStyle: [] },
    hobbies: { hobbies: [], details: '' },
    jobTarget: undefined,
    targetJob: undefined,
  } as CVBuilderData;
}

// ===========================
// Main CVWizard Component
// ===========================
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
      try {
        setIsLoading(true);

        // Wenn keine cvId vorhanden ist, erstelle eine neue
        if (!cvId) {
          console.log('[CVWizard] No cvId provided, creating new CV entry');

          const sessionId = sessionManager.getSessionId();
          const userId = user?.id || null;

          const { data: newCV, error: createError } = await supabase
            .from('stored_cvs')
            .insert({
              user_id: userId,
              session_id: sessionId,
              cv_data: {},
              status: 'draft',
              source: 'wizard'
            })
            .select('id')
            .single();

          if (createError) {
            console.error('[CVWizard] Failed to create CV entry:', createError);
            throw createError;
          }

          if (newCV?.id) {
            console.log('[CVWizard] Created new CV with ID:', newCV.id);
            setCvId(newCV.id);
          }

          setIsLoading(false);
          return;
        }

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
  }, [cvId, user?.id]);

  // ---- AUTO-SAVE: Bei jeder Änderung speichern ----
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
            user_id: userId,
            session_id: sessionId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cvId);

        if (error) throw error;

        console.log('[CVWizard] Progress saved successfully');
      } catch (err) {
        console.error('[CVWizard] Save error:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [cvId, user?.id]
  );

  // ---- Update CV Data und Auto-Save ----
  const updateCVData = useCallback(
    (field: keyof CVBuilderData, value: any) => {
      setCVData((prev) => {
        const updated = { ...prev, [field]: value };
        saveProgress(updated);
        return updated;
      });
    },
    [saveProgress]
  );

  // ---- Steps Navigation ----
  const nextStep = () => {
    if (currentStep === 4 || currentStep === 6) {
      setShowMotivation(true);
      setMotivationVariant(currentStep === 4 ? 2 : 3);
    } else {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleMotivationComplete = () => {
    setShowMotivation(false);
    if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep === 6) {
      setCurrentStep(7);
    }
  };

  // ---- Completion ----
  const handleComplete = async () => {
    if (!cvId) {
      console.error('[CVWizard] Cannot complete without cvId');
      return;
    }

    try {
      console.log('[CVWizard] Marking CV as completed:', cvId);

      const { error } = await supabase
        .from('stored_cvs')
        .update({
          status: 'completed',
          cv_data: cvData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cvId);

      if (error) throw error;

      console.log('[CVWizard] CV marked as completed, navigating to preview');
      navigate(`/cv-preview/${cvId}`);
    } catch (err) {
      console.error('[CVWizard] Completion error:', err);
    }
  };

  // ---- Steps Definition ----
  const totalSteps = 13;

  // ---- Loading / Error States ----
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-white text-xl">Lade deinen CV...</div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <div className="text-red-400 text-xl">{loadError}</div>
      </div>
    );
  }

  // ---- Motivation Screen ----
  if (showMotivation) {
    return (
      <MotivationScreen
        variant={motivationVariant}
        onContinue={handleMotivationComplete}
      />
    );
  }

  // ---- Main Wizard UI ----
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0a0f2e] to-[#050816] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#66c0b6]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#30E3CA]/5 rounded-full blur-3xl" />
      </div>

      {/* Progress Bar */}
      <ProgressBar currentStep={currentStep + 1} totalSteps={totalSteps} />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="flex gap-6">
          {/* Left: Avatar Sidebar (hidden on mobile) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <AvatarSidebar currentStep={currentStep} />
          </div>

          {/* Center: Step Content */}
          <div className="flex-1 min-w-0">
            {renderStep()}
          </div>

          {/* Right: Insights Panel (hidden on mobile) */}
          <div className="hidden xl:block w-80 flex-shrink-0">
            <InsightsPanel currentStep={currentStep} cvData={cvData} />
          </div>
        </div>
      </div>

      {/* Save Indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 text-white text-sm">
          Speichere...
        </div>
      )}
    </div>
  );

  // ---- Render Current Step ----
  function renderStep() {
    switch (currentStep) {
      case 0:
        return (
          <ExperienceLevelStep
            data={cvData.experienceLevel}
            onChange={(data) => updateCVData('experienceLevel', data)}
            onNext={nextStep}
          />
        );

      case 1:
        return (
          <PersonalDataStep
            data={cvData.personalData}
            onChange={(data) => updateCVData('personalData', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 2:
        return (
          <SchoolEducationStep
            data={cvData.schoolEducation || []}
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
            data={cvData.hardSkills || []}
            onChange={(data) => updateCVData('hardSkills', data)}
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
          <TargetJobStep
            data={cvData.targetJob}
            onChange={(data) => updateCVData('targetJob', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 9:
        return (
          <WorkValuesStep
            data={cvData.workValues}
            onChange={(data) => updateCVData('workValues', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 10:
        return (
          <HobbiesStep
            data={cvData.hobbies}
            onChange={(data) => updateCVData('hobbies', data)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );

      case 11:
      case 12:
        return (
          <CompletionStep
            cvData={cvData}
            onComplete={handleComplete}
            onBack={prevStep}
          />
        );

      default:
        return null;
    }
  }
}
