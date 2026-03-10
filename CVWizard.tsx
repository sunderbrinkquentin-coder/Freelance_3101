// src/pages/CVWizard.tsx

import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Loader2 } from 'lucide-react';

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
  PersonalData,
  ProfessionalEducation,
  Project,
  WorkExperience,
  HardSkill,
} from '../types/cvBuilder';

import { useAuth } from '../contexts/AuthContext';

/**
 * Robust mapping function for parsed CV data -> CVBuilderData
 * Also safely returns existing CVBuilderData drafts as-is.
 */
function adaptParsedCvToBuilderData(parsed: any): CVBuilderData {
  if (parsed && typeof parsed === 'object') {
    if ('personalData' in parsed || 'workExperiences' in parsed || 'experienceLevel' in parsed) {
      return {
        ...parsed,
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

  const hardSkills: HardSkill[] = Array.isArray(parsed?.skills)
    ? parsed.skills.map((skill: any) => ({
        skill: typeof skill === 'string' ? skill : safe(skill?.name),
        level: 'intermediate' as const,
        yearsOfExperience: '',
        category: 'other' as const,
      }))
    : [];

  const languages = Array.isArray(parsed?.languages)
    ? parsed.languages.map((lang: any) => ({
        language: typeof lang === 'string' ? lang : safe(lang?.name),
        level: safe(lang?.level) || 'intermediate',
      }))
    : [];

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

function getCvIdFromUrl(): string | null {
  const searchId = new URLSearchParams(window.location.search).get('cvId');
  if (searchId) return searchId;

  const hash = window.location.hash || '';
  const hashQuery = hash.includes('?') ? hash.split('?')[1] : '';
  const hashId = new URLSearchParams(hashQuery).get('cvId');
  if (hashId) return hashId;

  return null;
}

function createInitialCVData(): CVBuilderData {
  return {
    experienceLevel: undefined,
    targetRole: undefined,
    targetIndustry: undefined,
    personalData: {
      firstName: '',
      lastName: '',
      city: '',
      zipCode: '',
      email: '',
      phone: '',
      linkedin: '',
      website: '',
      portfolio: '',
      photoUrl: '',
    },
    schoolEducation: undefined,
    professionalEducation: [],
    workExperiences: [],
    projects: [],
    hardSkills: [],
    softSkills: [],
    workValues: { values: [], workStyle: [] },
    hobbies: { hobbies: [], details: '' },
    jobTarget: undefined,
    targetJob: undefined,
    languages: [],
    summary: undefined,
  };
}

export function CVWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const hasCreatedDraftRef = useRef(false);

  const [cvId, setCvId] = useState<string | null>(
    location.state?.cvId || getCvIdFromUrl()
  );
  const [cvData, setCVData] = useState<CVBuilderData>(createInitialCVData());
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationVariant, setMotivationVariant] = useState<1 | 2 | 3>(1);

  // ---- Load or Create Wizard Data ----
  useEffect(() => {
    const initWizard = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const currentUserId = user?.id || null;

        // Create a new draft automatically if no cvId is provided
        if (!cvId && !hasCreatedDraftRef.current) {
          hasCreatedDraftRef.current = true;

          const initialData = createInitialCVData();

          const insertPayload: Record<string, any> = {
            version_name: 'Draft',
            is_active: true,
            cv_data: initialData,
          };

          if (currentUserId) {
            insertPayload.user_id = currentUserId;
          }

          const { data: createdRow, error: createError } = await supabase
            .from('cv_versions')
            .insert(insertPayload)
            .select('id, cv_data')
            .single();

          if (createError) throw createError;

          setCvId(createdRow.id);
          setCVData((createdRow.cv_data as CVBuilderData) || initialData);

          window.location.replace(
            `${window.location.origin}/#/cv-wizard?cvId=${createdRow.id}`
          );
          return;
        }

        if (!cvId) {
          throw new Error('No cvId available');
        }

        const { data, error } = await supabase
          .from('cv_versions')
          .select('id, cv_data, version_name, user_id')
          .eq('id', cvId)
          .single();

        if (error) throw error;

        if (data?.cv_data) {
          const baseData =
            data.cv_data && typeof data.cv_data === 'object'
              ? adaptParsedCvToBuilderData(data.cv_data)
              : createInitialCVData();

          setCVData(baseData);

          if (Object.keys(baseData).length > 0) {
            setCurrentStep(1);
          }
        } else {
          setCVData(createInitialCVData());
        }
      } catch (err: any) {
        console.error('[CVWizard] Initialization error:', err?.message || err);
        setLoadError('Dein Profil konnte nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    };

    initWizard();
  }, [cvId, user, navigate]);

  // ---- Auto Save ----
  const saveProgress = useCallback(
    async (newData: CVBuilderData) => {
      if (!cvId) {
        console.warn('[CVWizard] Cannot auto-save without cvId');
        return;
      }

      setIsSaving(true);

      try {
        const userId = user?.id || null;

        const payload: Record<string, any> = {
          cv_data: newData,
          version_name: 'Draft',
        };

        if (userId) payload.user_id = userId;

        const { error } = await supabase
          .from('cv_versions')
          .update(payload)
          .eq('id', cvId);

        if (error) throw error;
      } catch (err) {
        console.error('[CVWizard] Auto-save failed:', err);
      } finally {
        setIsSaving(false);
      }
    },
    [cvId, user]
  );

  const updateCVData = <K extends keyof CVBuilderData>(key: K, value: CVBuilderData[K]) => {
    setCVData((prev) => {
      const next = { ...prev, [key]: value };
      saveProgress(next);
      return next;
    });
  };

  // ---- Navigation ----
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

  // ---- Final Save + Continue ----
  const handleGoToJobTargeting = async () => {
    if (!cvId) {
      setLoadError('Keine CV-ID vorhanden');
      return;
    }

    setIsLoading(true);

    try {
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

      const userId = user?.id || null;

      const payload: Record<string, any> = {
        cv_data: finalData,
        version_name: 'Final Draft',
        is_active: true,
      };

      if (userId) payload.user_id = userId;

      const { error: updateError } = await supabase
        .from('cv_versions')
        .update(payload)
        .eq('id', cvId);

      if (updateError) {
        throw new Error('Fehler beim Speichern: ' + updateError.message);
      }

      // Note: Make webhook is triggered by JobTargeting.tsx after job details are entered
      navigate('/job-targeting', {
        state: {
          cvId,
          cvData: finalData,
        },
      });
    } catch (err: any) {
      console.error('[CVWizard] Finalization failed:', err);
      setLoadError('Fehler beim Abschließen: ' + (err.message || 'Unbekannter Fehler'));
    } finally {
      setIsLoading(false);
    }
  };

  const totalSteps = 12;

  const renderStep = () => {
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

  if (showMotivation) {
    return (
      <MotivationScreen variant={motivationVariant} onContinue={handleMotivationContinue} />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white relative">
      {isSaving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/50">
          <Loader2 size={12} className="animate-spin" /> Speichere...
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 z-40 bg-[#020617]/80 backdrop-blur-sm border-b border-white/10">
        <ProgressBar current={currentStep + 1} total={totalSteps} />
      </div>

      <div className="pt-20 min-h-screen flex flex-col">{renderStep()}</div>
    </div>
  );
}