// src/pages/CVWizard.tsx

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, ArrowLeft, Check, Plus } from 'lucide-react';

import { AvatarSidebar } from '../components/cvbuilder/AvatarSidebar';
import { MotivationScreen } from '../components/cvbuilder/MotivationScreen';
import { ProgressBar } from '../components/cvbuilder/ProgressBar';
import { DateDropdowns, formatDateRange } from '../components/cvbuilder/DateDropdowns';
import { ChipsInput } from '../components/cvbuilder/ChipsInput';
import { HardSkillsStep } from '../components/cvbuilder/HardSkillsStep';
import { SoftSkillsStep } from '../components/cvbuilder/SoftSkillsStep';
import { WizardStepLayout } from '../components/cvbuilder/WizardStepLayout';
import { WorkExperienceStep } from '../components/cvbuilder/steps/WorkExperienceStep';

import {
  CVBuilderData,
  ExperienceLevel,
  IndustryType,
  PersonalData,
  SchoolEducation,
  ProfessionalEducation,
  Project,
  WorkValues,
  Hobbies,
  WorkExperience,
  HardSkill,
} from '../types/cvBuilder';

import {
  WORK_VALUES,
  WORK_STYLES,
  HOBBIES_SUGGESTIONS,
} from '../config/cvBuilderConstants';

import { useAuth } from '../contexts/AuthContext';

function adaptParsedCvToBuilderData(parsed: any): CVBuilderData {
  const safe = (v: any) => (v == null ? '' : String(v));

  // "MM.YYYY" parser für WorkExperienceStep (startMonth/startYear etc.)
  const parseMY = (s: string) => {
    const m = safe(s).match(/^(\d{1,2})\.(\d{4})$/);
    if (!m) return { month: '', year: '' };
    return { month: m[1].padStart(2, '0'), year: m[2] };
  };

  // ── PersonalData ─────────────────────────────
  const fullName = safe(parsed?.personalInfo?.name).trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

  const personalData: PersonalData = {
    firstName,
    lastName,
    city: safe(parsed?.personalInfo?.location),
    email: safe(parsed?.personalInfo?.email),
    phone: safe(parsed?.personalInfo?.phone),
    linkedin: safe(parsed?.personalInfo?.linkedin),
  };

  // ── WorkExperiences ──────────────────────────
  const workExperiences: WorkExperience[] = Array.isArray(parsed?.experience)
    ? parsed.experience.map((e: any) => {
        const startDate = safe(e?.startDate);
        const endDateRaw = safe(e?.endDate);
        const current = !!e?.isCurrent;
        const endDate = current ? 'Heute' : endDateRaw;

        const smy = parseMY(startDate);
        const emy = parseMY(endDateRaw);

        const bullets = Array.isArray(e?.bullets) ? e.bullets.filter(Boolean) : [];

        const we: any = {
          jobTitle: safe(e?.title),
          company: safe(e?.company),
          location: safe(e?.location),
          startDate,
          endDate,
          current,

          // Pflichtfelder laut Typ:
          tasks: bullets,                 // best effort: bullets als Tasks-Basis
          responsibilities: [],
          tools: [],
          kpis: [],
          achievements: [],

          // Optional:
          bullets,
          achievementsRaw: '',
          industry: safe(e?.industry),
          roleLevel: safe(e?.roleLevel),
          revenue: safe(e?.revenue),
          budget: safe(e?.budget),
          teamSize: safe(e?.teamSize),
          customersMarket: safe(e?.customersMarket),
          tasksWithMetrics: Array.isArray(e?.tasksWithMetrics) ? e.tasksWithMetrics : [],
          achievementsWithMetrics: Array.isArray(e?.achievementsWithMetrics) ? e.achievementsWithMetrics : [],
        };

        // WorkExperienceStep nutzt diese Felder via (exp as any)
        we.startMonth = smy.month;
        we.startYear = smy.year;
        we.endMonth = current ? '' : emy.month;
        we.endYear = current ? '' : emy.year;

        return we as WorkExperience;
      })
    : [];

  // ── ProfessionalEducation ────────────────────
  const professionalEducation: ProfessionalEducation[] = Array.isArray(parsed?.education)
    ? parsed.education.map((ed: any) => {
        const s = safe(ed?.startDate);
        const e = safe(ed?.endDate);
        const sy = s.match(/\b(19|20)\d{2}\b/)?.[0] ?? '';
        const ey = e.match(/\b(19|20)\d{2}\b/)?.[0] ?? '';

        return {
          type: 'university', // fallback (du kannst später smarter mappen)
          institution: safe(ed?.institution),
          degree: safe(ed?.degree),
          startYear: sy,
          endYear: ey,
          focus: [],
          projects: [],
          grades: safe(ed?.grade),
        } as ProfessionalEducation;
      })
    : [];

  // ── HardSkills ───────────────────────────────
  const hardSkills: HardSkill[] = Array.isArray(parsed?.skills)
    ? Array.from(new Set(parsed.skills.filter(Boolean).map((s: any) => String(s).trim())))
        .filter(Boolean)
        .map((s) => ({ skill: s } as HardSkill))
    : [];

  // ── Languages ────────────────────────────────
  const languages = Array.isArray(parsed?.languages)
    ? parsed.languages.map((l: any) => ({
        language: safe(l?.language),
        level: safe(l?.level),
      }))
    : [];

  const experienceLevel: ExperienceLevel =
    workExperiences.length >= 2 ? 'experienced' :
    workExperiences.length === 1 ? 'some-experience' : 'beginner';

  return {
    experienceLevel,
    personalData,
    workExperiences,
    professionalEducation,
    hardSkills,
    languages,
  } as CVBuilderData;
}
export function CVWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ---- URL / State-Parameter ----
  const searchParams = new URLSearchParams(location.search);
  const modeFromQuery = (searchParams.get('mode') as 'new' | 'check' | 'unlock' | 'update' | null) ?? null;
  const cvIdFromQuery = searchParams.get('cvId');

  const modeFromState = location.state?.mode as 'new' | 'check' | 'unlock' | 'update' | undefined;
  const initialDataFromCheck = location.state?.initialData as CVBuilderData | undefined;
  const cvIdFromState = location.state?.cvId as string | undefined;

  const mode: 'new' | 'check' | 'unlock' | 'update' = modeFromQuery ?? modeFromState ?? 'new';
  const [cvId, setCvId] = useState<string | null>(cvIdFromQuery ?? cvIdFromState ?? null);

  const [cvData, setCVData] = useState<CVBuilderData>(() => initialDataFromCheck ?? ({} as CVBuilderData));
  const [isLoadingFromDb, setIsLoadingFromDb] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [currentStep, setCurrentStep] = useState(() => {
    if (
      (initialDataFromCheck || Object.keys(cvData).length > 0) &&
      (mode === 'check' || mode === 'unlock' || mode === 'update')
    ) {
      return (cvData as CVBuilderData).experienceLevel ? 1 : 0;
    }
    return 0;
  });

  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationVariant, setMotivationVariant] = useState<1 | 2 | 3>(1);

  // ---- Helper: CV Data Update ----
  const updateCVData = <K extends keyof CVBuilderData>(key: K, value: CVBuilderData[K]) => {
    console.log('[CVWizard] 🔥 updateCVData:', key);
    setCVData((prev) => {
      const next = { ...prev, [key]: value };
      console.log('[CVWizard] 🔥 New cvData snapshot:', {
        hasProjects: !!next.projects,
        projectsCount: Array.isArray(next.projects) ? next.projects.length : 0,
        hasWorkExperiences: !!next.workExperiences,
        workExperiencesCount: Array.isArray(next.workExperiences) ? next.workExperiences.length : 0,
      });
      return next;
    });
  };

  // ---- CV aus Supabase nachladen, wenn cvId vorhanden ----
  useEffect(() => {
    if (!cvId) return;

    const loadCvFromSupabase = async () => {
      try {
        setIsLoadingFromDb(true);
        setLoadError(null);

        console.log('[CVWizard] Loading CV from Supabase:', cvId);

        const { data, error } = await supabase
          .from('stored_cvs')
          .select('cv_data, cv_data_final, is_paid')
          .eq('id', cvId)
          .maybeSingle();

        if (error) {
          console.error('[CVWizard] Error loading CV:', error);
          setLoadError('CV konnte nicht geladen werden.');
          return;
        }

        if (!data) {
          console.error('[CVWizard] No CV found for ID:', cvId);
          setLoadError('CV nicht gefunden.');
          return;
        }

        console.log('[CVWizard] CV loaded:', data);
const raw = (data as any).cv_data_final ?? (data as any).cv_data ?? {};
setCVData(adaptParsedCvToBuilderData(raw));


        if (mode === 'unlock' && data.is_paid === false) {
          console.log('[CVWizard] Setting is_paid to true in stored_cvs');
          await supabase
            .from('stored_cvs')
            .update({ is_paid: true })
            .eq('id', cvId);
        }
      } catch (err: any) {
        console.error('[CVWizard] Unexpected error loading CV:', err);
        setLoadError('Ein unerwarteter Fehler ist aufgetreten.');
      } finally {
        setIsLoadingFromDb(false);
      }
    };

    loadCvFromSupabase();
  }, [cvId, initialDataFromCheck, mode]);

  // ---- Schrittwechsel ----
  const getTotalSteps = () => 12;

  const nextStep = () => {
    console.log('[nextStep] currentStep:', currentStep);

    // Motivation Screens einstreuen (optional)
    if ((currentStep + 1) % 3 === 0 && currentStep > 0 && currentStep <= 10) {
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

  const handleMotivationComplete = () => {
    setShowMotivation(false);
    setCurrentStep((prev) => prev + 1);
  };

  // ---- Step Renderer ----
  const renderStep = () => {
    if (showMotivation) {
      return <MotivationScreen onContinue={handleMotivationComplete} variant={motivationVariant} />;
    }

    switch (currentStep) {
      case 0:
        return <Step0_ExperienceLevel />;
      case 1:
        return <Step1_PersonalData />;
      case 2:
        return <Step2_SchoolEducation />;
      case 3:
        return <Step3_ProfessionalEducation />;
      case 4:
        return <Step4_WorkExperience />;
      case 5:
        return <Step5_Projects />;
      case 6:
        return <Step6_HardSkills />;
      case 7:
        return <Step7_SoftSkills />;
      case 8:
        return <Step8_WorkValues />;
      case 9:
        return <Step9_WorkStyle />;
      case 10:
        return <Step10_Hobbies />;
      case 11:
        return <Step11_Completion />;
      default:
        return null;
    }
  };

  // ─────────────────────────────
  // Step 0 – Experience Level
  // ─────────────────────────────

  function Step0_ExperienceLevel() {
    const options = [
      {
        id: 'beginner',
        title: 'Ich stehe am Anfang meiner Karriere',
        description: 'Schüler, Studierende, Absolventen ohne Berufserfahrung',
        benefit: '✨ Wir fokussieren auf Ausbildung & Projekte',
      },
      {
        id: 'some-experience',
        title: 'Ich habe erste praktische Erfahrungen gesammelt',
        description: 'Praktika, Werkstudententätigkeit, Nebenjobs (0–3 Jahre)',
        benefit: '🚀 Wir heben deine Erfahrungen optimal hervor',
      },
      {
        id: 'experienced',
        title: 'Ich bringe relevante Berufserfahrung mit',
        description: '3–10+ Jahre Erfahrung in meinem Bereich',
        benefit: '💼 Wir machen deine Erfolge messbar & konkret',
      },
    ];

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <div className="inline-block px-4 py-2 rounded-full bg-[#66c0b6]/10 border border-[#66c0b6]/30 text-[#66c0b6] text-sm font-semibold mb-4">
              Schritt 1 von {getTotalSteps()}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Wo stehst du gerade in deiner Karriere?
            </h1>
            <p className="text-xl text-white/70 leading-relaxed">
              Wir passen alle Fragen individuell an deine Situation an.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  updateCVData('experienceLevel', option.id as ExperienceLevel);
                  nextStep();
                }}
                className="group relative rounded-3xl border border-white/10 bg-white/5 p-8 hover:bg-white/10 hover:border-[#66c0b6]/40 transition-all duration-300 shadow-2xl hover:shadow-[0_0_60px_rgba(102,192,182,0.4)] cursor-pointer text-left hover:scale-[1.02]"
              >
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#66c0b6]/20 to-[#30E3CA]/20 flex items-center justify-center border border-[#66c0b6]/30 group-hover:scale-110 transition-transform flex-shrink-0">
                    <Check size={32} className="text-[#66c0b6]" />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-[#66c0b6] transition-colors">
                      {option.title}
                    </h3>
                    <p className="text-base text-white/80 mb-3">{option.description}</p>
                    <p className="text-sm text-[#66c0b6] font-medium">{option.benefit}</p>
                  </div>

                  <ArrowRight
                    size={32}
                    className="text-[#66c0b6] group-hover:translate-x-2 transition-transform flex-shrink-0"
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-white/50">
              💡 Deine Antworten bleiben bei dir und werden nicht an Dritte weitergegeben.
            </p>
          </div>
        </div>

        <div className="lg:block hidden">
          <AvatarSidebar
            message="Deine Antwort hilft uns, die perfekten Fragen und Empfehlungen für deinen CV zu geben."
            stepInfo="Jeder Karriereweg ist einzigartig – wir passen uns deiner Situation an."
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────
  // Step 1 – Personal Data
  // ─────────────────────────────

  function Step1_PersonalData() {
    const [data, setData] = useState<PersonalData>(cvData.personalData || ({} as PersonalData));
useEffect(() => {
  setData(cvData.personalData || ({} as PersonalData));
}, [cvData.personalData]);

    const isValid = data.firstName && data.lastName && data.city && data.email && data.phone;

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-3xl mx-auto w-full">
          <ProgressBar currentStep={1} totalSteps={getTotalSteps()} />

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Wie können Recruiter dich erreichen?
            </h1>
            <p className="text-xl text-white/70">
              Nur die wichtigsten Kontaktdaten – keine vollständige Adresse nötig.
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Vorname *
                </label>
                <input
                  type="text"
                  value={data.firstName || ''}
                  onChange={(e) => setData({ ...data, firstName: e.target.value })}
                  placeholder="Max"
                  className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Nachname *
                </label>
                <input
                  type="text"
                  value={data.lastName || ''}
                  onChange={(e) => setData({ ...data, lastName: e.target.value })}
                  placeholder="Mustermann"
                  className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Stadt *
              </label>
              <input
                type="text"
                value={data.city || ''}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                placeholder="Berlin"
                className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  E-Mail *
                </label>
                <input
                  type="email"
                  value={data.email || ''}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  placeholder="max@example.com"
                  className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Telefon *
                </label>
                <input
                  type="tel"
                  value={data.phone || ''}
                  onChange={(e) => setData({ ...data, phone: e.target.value })}
                  placeholder="+49 151 12345678"
                  className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                LinkedIn (optional)
              </label>
              <input
                type="url"
                value={data.linkedin || ''}
                onChange={(e) => setData({ ...data, linkedin: e.target.value })}
                placeholder="linkedin.com/in/dein-profil"
                className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>
            <button
              onClick={() => {
                updateCVData('personalData', data);
                nextStep();
              }}
              disabled={!isValid}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:scale-105"
            >
              Weiter
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="lg:block hidden">
          <AvatarSidebar
            message="Recruiter möchten dich schnell kontaktieren können."
            stepInfo="Datenschutz ist wichtig – vollständige Adresse ist nicht nötig, Stadt reicht aus."
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────
  // Step 2 – Schulische Ausbildung
  // (unverändert im Kern, nur Design konsistent)
  // ─────────────────────────────
  function Step2_SchoolEducation() {
    const [educations, setEducations] = useState<SchoolEducation[]>(
      cvData.schoolEducation ? [cvData.schoolEducation] : []
    );
    const [isAdding, setIsAdding] = useState(educations.length === 0);
    const [currentEdit, setCurrentEdit] = useState<SchoolEducation>({
      type: '',
      school: '',
      graduation: '',
      year: '',
      focus: [],
      projects: [],
    });

    const [startMonth, setStartMonth] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endMonth, setEndMonth] = useState('');
    const [endYear, setEndYear] = useState('');
    const [isCurrent, setIsCurrent] = useState(false);
    const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
    const [customFocus, setCustomFocus] = useState<string[]>([]);
    const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);
    const [customAchievements, setCustomAchievements] = useState<string[]>([]);
    const [showOtherField, setShowOtherField] = useState(false);
    const [otherGraduation, setOtherGraduation] = useState('');

    const SCHOOL_TYPES = [
      'Hauptschulabschluss',
      'Mittlere Reife / Realschulabschluss',
      'Fachhochschulreife',
      'Allgemeine Hochschulreife (Abitur)',
      'International Baccalaureate',
      'Anderer Abschluss',
    ];

    const FOCUS_OPTIONS = ['Wirtschaft', 'Technik', 'Sprachen', 'Naturwissenschaften', 'Medien/Gestaltung'];

    const ACHIEVEMENT_OPTIONS = ['Ehrenamt', 'Jahrgangsbestleistung', 'Schulpreis', 'AGs', 'Wettbewerbe'];

    const isValid =
      currentEdit.type && currentEdit.school && startMonth && startYear && (isCurrent || (endMonth && endYear));

    const handleSave = () => {
      const finalEducation: SchoolEducation = {
        type: currentEdit.type === 'Anderer Abschluss' ? otherGraduation : currentEdit.type,
        school: currentEdit.school,
        graduation: currentEdit.type === 'Anderer Abschluss' ? otherGraduation : currentEdit.type,
        year: formatDateRange(startMonth, startYear, endMonth, endYear, isCurrent),
        focus: [...selectedFocus],
        projects: [...selectedAchievements],
      };

      setEducations([...educations, finalEducation]);
      resetForm();
      setIsAdding(false);
    };

    const resetForm = () => {
      setCurrentEdit({
        type: '',
        school: '',
        graduation: '',
        year: '',
        focus: [],
        projects: [],
      });
      setStartMonth('');
      setStartYear('');
      setEndMonth('');
      setEndYear('');
      setIsCurrent(false);
      setSelectedFocus([]);
      setCustomFocus([]);
      setSelectedAchievements([]);
      setCustomAchievements([]);
      setShowOtherField(false);
      setOtherGraduation('');
    };

    const handleDelete = (index: number) => {
      setEducations(educations.filter((_, i) => i !== index));
    };

    const handleContinue = () => {
      if (educations.length > 0) {
        updateCVData('schoolEducation', educations[0]);
      }
      nextStep();
    };

    return (
      <div className="h-full espirit flex flex-col lg:flex-row lg:gap-8 lg:p-6 lg:max-w-7xl lg:mx-auto">
        <div className="flex-1 flex flex-col h-full lg:h-auto">
          {/* Mobile Header */}
          <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#020617]/95 backdrop-blur-md z-50 px-4 pt-4 pb-3 border-b border-white/5">
            <ProgressBar currentStep={2} totalSteps={getTotalSteps()} />
            <p className="mt-2 text-sm font-semibold text-white">
              Schulische Ausbildung
            </p>
          </div>

          {/* Desktop Progress */}
          <div className="hidden lg:block mb-8">
            <ProgressBar currentStep={2} totalSteps={getTotalSteps()} />
          </div>

          {/* Inhalt */}
          <div className="flex-1 overflow-y-auto lg:overflow-visible px-4 lg:px-0 pt-32 pb-36 lg:pt-0 lg:pb-0">
            <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">
              <div className="text-center space-y-3 lg:space-y-4 animate-fade-in">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight px-2">
                  Schulische Ausbildung
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-white/70 px-2">
                  Gib deinen höchsten Schulabschluss und die wichtigsten Details ein.
                </p>
              </div>

              {!isAdding && educations.length > 0 && (
                <div className="space-y-4 animate-fade-in">
                  <h3 className="text-lg font-semibold text-white">Deine schulische Ausbildung</h3>
                  {educations.map((edu, index) => (
                    <div
                      key={index}
                      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-bold text-white mb-1">{edu.type}</h4>
                          <p className="text-white/70">{edu.school}</p>
                          <p className="text-sm text-[#66c0b6] mt-2">{edu.year}</p>
                          {edu.focus && edu.focus.length > 0 && (
                            <p className="text-sm text-white/60 mt-2">
                              Schwerpunkte: {edu.focus.join(', ')}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(index)}
                          className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          Löschen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {isAdding && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Höchster Schulabschluss *
                    </label>
                    <select
                      value={currentEdit.type}
                      onChange={(e) => {
                        setCurrentEdit({ ...currentEdit, type: e.target.value });
                        setShowOtherField(e.target.value === 'Anderer Abschluss');
                      }}
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer"
                    >
                      <option value="" className="bg-[#020617]">
                        Bitte wählen
                      </option>
                      {SCHOOL_TYPES.map((type) => (
                        <option key={type} value={type} className="bg-[#020617]">
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  {showOtherField && (
                    <div>
                      <label className="block text-sm font-semibold text-white/90 mb-2">
                        Bitte Abschluss angeben *
                      </label>
                      <input
                        type="text"
                        value={otherGraduation}
                        onChange={(e) => setOtherGraduation(e.target.value)}
                        placeholder="z.B. Berufsschulabschluss"
                        className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-2">
                      Name der Schule *
                    </label>
                    <input
                      type="text"
                      value={currentEdit.school}
                      onChange={(e) =>
                        setCurrentEdit({ ...currentEdit, school: e.target.value })
                      }
                      placeholder="z.B. Gymnasium am Musterplatz"
                      className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-3">
                      Zeitraum *
                    </label>
                    <DateDropdowns
                      startMonth={startMonth}
                      startYear={startYear}
                      endMonth={endMonth}
                      endYear={endYear}
                      isCurrent={isCurrent}
                      onStartChange={(month, year) => {
                        setStartMonth(month);
                        setStartYear(year);
                      }}
                      onEndChange={(month, year) => {
                        setEndMonth(month);
                        setEndYear(year);
                      }}
                      onCurrentChange={setIsCurrent}
                      showCurrentCheckbox={true}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-3">
                      Schwerpunkt (optional)
                    </label>
                    <ChipsInput
                      suggestedItems={FOCUS_OPTIONS}
                      selectedItems={selectedFocus}
                      customItems={customFocus}
                      onToggle={(item) =>
                        setSelectedFocus((prev) =>
                          prev.includes(item)
                            ? prev.filter((i) => i !== item)
                            : [...prev, item]
                        )
                      }
                      onAddCustom={(item) => {
                        setCustomFocus((prev) => [...prev, item]);
                        setSelectedFocus((prev) => [...prev, item]);
                      }}
                      onRemoveCustom={(item) => {
                        setCustomFocus((prev) => prev.filter((i) => i !== item));
                        setSelectedFocus((prev) => prev.filter((i) => i !== item));
                      }}
                      placeholder="Eigenen Schwerpunkt hinzufügen..."
                      title="Wähle deine Schwerpunkte"
                      customTitle="Deine eigenen Schwerpunkte"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/90 mb-3">
                      Besondere Leistungen (optional)
                    </label>
                    <ChipsInput
                      suggestedItems={ACHIEVEMENT_OPTIONS}
                      selectedItems={selectedAchievements}
                      customItems={customAchievements}
                      onToggle={(item) =>
                        setSelectedAchievements((prev) =>
                          prev.includes(item)
                            ? prev.filter((i) => i !== item)
                            : [...prev, item]
                        )
                      }
                      onAddCustom={(item) => {
                        setCustomAchievements((prev) => [...prev, item]);
                        setSelectedAchievements((prev) => [...prev, item]);
                      }}
                      onRemoveCustom={(item) => {
                        setCustomAchievements((prev) =>
                          prev.filter((i) => i !== item)
                        );
                        setSelectedAchievements((prev) =>
                          prev.filter((i) => i !== item)
                        );
                      }}
                      placeholder="Weitere Leistung hinzufügen..."
                      title="Wähle besondere Leistungen"
                      customTitle="Deine eigenen Leistungen"
                    />
                  </div>

                  <button
                    onClick={handleSave}
                    disabled={!isValid}
                    className="w-full px-8 py-4 rounded-xl bg-white/5 border border-[#66c0b6]/30 text-[#66c0b6] font-semibold hover:bg-[#66c0b6]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Schulische Ausbildung speichern
                  </button>
                </div>
              )}

              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} />
                  Weitere schulische Ausbildung hinzufügen
                </button>
              )}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#020617] via-[#020617] to-transparent z-50 px-4 pb-safe pb-6 pt-4">
            <div className="flex justify-between items-center gap-3">
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-5 py-4 rounded-xl text-white/70 hover:text-white active:bg-white/10 transition-all touch-manipulation min-w-[100px]"
              >
                <ArrowLeft size={20} />
                <span className="font-medium">Zurück</span>
              </button>
              <button
                onClick={handleContinue}
                className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg touch-manipulation"
              >
                Weiter
                <ArrowRight size={22} />
              </button>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex justify-between items-center pt-6">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg:white/5 transition-all"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>
            <button
              onClick={handleContinue}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3 shadow-2xl hover:scale-105 ml-auto"
            >
              Weiter
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <AvatarSidebar
            message="Der schulische Abschluss ist besonders für Berufseinsteigende wichtig."
            stepInfo="Wir erfassen ihn hier ATS-konform mit klaren Zeiträumen und relevanten Details."
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────
  // Step 3 – Berufliche Ausbildung / Studium
  // (strukturell wie vorher, Layout vereinheitlicht)
  // ─────────────────────────────

  function Step3_ProfessionalEducation() {
    const [educations, setEducations] = useState<ProfessionalEducation[]>(
      cvData.professionalEducation || []
    );
    const [isAdding, setIsAdding] = useState(educations.length === 0);
    const [currentEdit, setCurrentEdit] = useState<ProfessionalEducation>({
      degree: '',
      institution: '',
      field: '',
      graduation: '',
      focus: [],
      activities: [],
    });

    const [startMonth, setStartMonth] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endMonth, setEndMonth] = useState('');
    const [endYear, setEndYear] = useState('');
    const [isCurrent, setIsCurrent] = useState(false);
    const [showOtherField, setShowOtherField] = useState(false);
    const [otherDegree, setOtherDegree] = useState('');
    const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
    const [customFocus, setCustomFocus] = useState<string[]>([]);
    const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
    const [customActivities, setCustomActivities] = useState<string[]>([]);

    const DEGREE_TYPES = [
      'Ausbildung',
      'Studium (Bachelor)',
      'Studium (Master)',
      'Duales Studium',
      'Studium (Diplom)',
      'Weiterbildung',
      'Zertifikat',
      'Anderer Abschluss',
    ];

    const FOCUS_OPTIONS = [
      'Wirtschaftswissenschaften',
      'Informatik',
      'Ingenieurwesen',
      'Naturwissenschaften',
      'Geisteswissenschaften',
      'Medien & Kommunikation',
      'Design',
      'Rechtswissenschaften',
    ];

    const ACTIVITY_OPTIONS = [
      'Projektarbeit',
      'Praxissemester',
      'Auslandsaufenthalt',
      'Forschungsprojekt',
      'Abschlussarbeit',
      'Studienarbeit',
    ];

    const isValid =
      currentEdit.degree &&
      currentEdit.institution &&
      currentEdit.field &&
      startMonth &&
      startYear &&
      (isCurrent || (endMonth && endYear));

    const handleSave = () => {
      const newEducation: ProfessionalEducation = {
        degree: currentEdit.degree === 'Anderer Abschluss' ? otherDegree : currentEdit.degree,
        institution: currentEdit.institution,
        field: currentEdit.field,
        graduation: formatDateRange(startMonth, startYear, endMonth, endYear, isCurrent),
        focus: [...selectedFocus],
        activities: [...selectedActivities],
      };

      setEducations([...educations, newEducation]);
      resetForm();
      setIsAdding(false);
    };

    const resetForm = () => {
      setCurrentEdit({
        degree: '',
        institution: '',
        field: '',
        graduation: '',
        focus: [],
        activities: [],
      });
      setStartMonth('');
      setStartYear('');
      setEndMonth('');
      setEndYear('');
      setIsCurrent(false);
      setShowOtherField(false);
      setOtherDegree('');
      setSelectedFocus([]);
      setCustomFocus([]);
      setSelectedActivities([]);
      setCustomActivities([]);
    };

    const handleDelete = (index: number) => {
      setEducations(educations.filter((_, i) => i !== index));
    };

    const handleContinue = () => {
      updateCVData('professionalEducation', educations);
      nextStep();
    };

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-3xl mx-auto w-full">
          <ProgressBar currentStep={3} totalSteps={getTotalSteps()} />

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to:white bg-clip-text text-transparent leading-tight">
              Ausbildung / Studium
            </h1>
            <p className="text-xl text-white/70">
              Trage deine berufliche Ausbildung, dein Studium oder relevante Weiterbildungen ein.
            </p>
          </div>

          {!isAdding && educations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text:white">Deine Ausbildungen</h3>
              {educations.map((edu, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl border border:white/10 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text:white mb-1">{edu.field}</h4>
                      <p className="text-white/70">{edu.institution}</p>
                      <p className="text-sm text-[#66c0b6] mt-2">
                        {edu.degree} • {edu.graduation}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAdding && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text:white/90 mb-2">
                  Art des Abschlusses *
                </label>
                <select
                  value={currentEdit.degree}
                  onChange={(e) => {
                    setCurrentEdit({ ...currentEdit, degree: e.target.value });
                    setShowOtherField(e.target.value === 'Anderer Abschluss');
                  }}
                  className="w-full px-5 py-4 rounded-xl border border:white/20 bg-white/10 text:white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer"
                >
                  <option value="" className="bg-[#020617]">
                    Bitte wählen
                  </option>
                  {DEGREE_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-[#020617]">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {showOtherField && (
                <div>
                  <label className="block text-sm font-semibold text:white/90 mb-2">
                    Bitte Abschluss angeben *
                  </label>
                  <input
                    type="text"
                    value={otherDegree}
                    onChange={(e) => setOtherDegree(e.target.value)}
                    placeholder="z.B. Fachinformatiker"
                    className="w-full px-5 py-4 rounded-xl border border:white/20 bg-white/10 text:white text-lg placeholder:text:white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text:white/90 mb-2">
                  Name der Bildungseinrichtung *
                </label>
                <input
                  type="text"
                  value={currentEdit.institution}
                  onChange={(e) =>
                    setCurrentEdit({ ...currentEdit, institution: e.target.value })
                  }
                  placeholder="z.B. Technische Universität München"
                  className="w-full px-5 py-4 rounded-xl border border:white/20 bg-white/10 text:white text-lg placeholder:text:white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text:white/90 mb-2">
                  Abschluss / Studiengang / Ausbildungsberuf *
                </label>
                <input
                  type="text"
                  value={currentEdit.field}
                  onChange={(e) =>
                    setCurrentEdit({ ...currentEdit, field: e.target.value })
                  }
                  placeholder="z.B. Betriebswirtschaftslehre"
                  className="w-full px-5 py-4 rounded-xl border border:white/20 bg-white/10 text:white text-lg placeholder:text:white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text:white/90 mb-3">
                  Zeitraum *
                </label>
                <DateDropdowns
                  startMonth={startMonth}
                  startYear={startYear}
                  endMonth={endMonth}
                  endYear={endYear}
                  isCurrent={isCurrent}
                  onStartChange={(month, year) => {
                    setStartMonth(month);
                    setStartYear(year);
                  }}
                  onEndChange={(month, year) => {
                    setEndMonth(month);
                    setEndYear(year);
                  }}
                  onCurrentChange={setIsCurrent}
                  showCurrentCheckbox={true}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text:white/90 mb-3">
                  Fachrichtung / Schwerpunkt (optional)
                </label>
                <ChipsInput
                  suggestedItems={FOCUS_OPTIONS}
                  selectedItems={selectedFocus}
                  customItems={customFocus}
                  onToggle={(item) =>
                    setSelectedFocus((prev) =>
                      prev.includes(item)
                        ? prev.filter((i) => i !== item)
                        : [...prev, item]
                    )
                  }
                  onAddCustom={(item) => {
                    setCustomFocus((prev) => [...prev, item]);
                    setSelectedFocus((prev) => [...prev, item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomFocus((prev) => prev.filter((i) => i !== item));
                    setSelectedFocus((prev) => prev.filter((i) => i !== item));
                  }}
                  placeholder="Eigene Fachrichtung hinzufügen..."
                  title="Wähle deine Fachrichtung"
                  customTitle="Deine eigenen Fachrichtungen"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text:white/90 mb-3">
                  Relevante Inhalte (optional)
                </label>
                <ChipsInput
                  suggestedItems={ACTIVITY_OPTIONS}
                  selectedItems={selectedActivities}
                  customItems={customActivities}
                  onToggle={(item) =>
                    setSelectedActivities((prev) =>
                      prev.includes(item)
                        ? prev.filter((i) => i !== item)
                        : [...prev, item]
                    )
                  }
                  onAddCustom={(item) => {
                    setCustomActivities((prev) => [...prev, item]);
                    setSelectedActivities((prev) => [...prev, item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomActivities((prev) => prev.filter((i) => i !== item));
                    setSelectedActivities((prev) => prev.filter((i) => i !== item));
                  }}
                  placeholder="Eigenen Punkt hinzufügen..."
                  title="Wähle relevante Inhalte"
                  customTitle="Deine eigenen Inhalte"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!isValid}
                className="w-full px-8 py-4 rounded-xl bg-white/5 border border-[#66c0b6]/30 text-[#66c0b6] font-semibold hover:bg-[#66c0b6]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Ausbildung speichern
              </button>
            </div>
          )}

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full px-8 py-4 rounded-xl border border:white/10 bg-white/5 text:white font-semibold hover:bg:white/10 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Weitere Ausbildung / weiteres Studium hinzufügen
            </button>
          )}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text:white/70 hover:text:white hover:bg:white/5 transition-all"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>
            <button
              onClick={handleContinue}
              disabled={educations.length === 0}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text:black font-bold text-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:scale-105"
            >
              Weiter
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="lg:block hidden">
          <AvatarSidebar
            message="Deine Ausbildung und dein Studium zeigen deine fachliche Grundlage."
            stepInfo="Wir bereiten diese Informationen so auf, dass sie für Recruiter und ATS-Systeme optimal lesbar sind."
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────
  // Step 4 – Berufserfahrung (neues WorkExperienceStep Component)
  // ─────────────────────────────

  function Step4_WorkExperience() {
    return (
      <WorkExperienceStep
        currentStep={4}
        totalSteps={getTotalSteps()}
        experienceLevel={cvData.experienceLevel}
        initialExperiences={cvData.workExperiences}
        onPrev={prevStep}
        onNext={(experiences) => {
          console.log('[CVWizard][Step4] Saving workExperiences:', experiences);
          updateCVData('workExperiences', experiences);
          nextStep();
        }}
      />
    );
  }

  // ─────────────────────────────
  // Step 5 – Projekte (mit Beispielen)
  // ─────────────────────────────
  function Step5_Projects() {
    const [projects, setProjects] = useState<Project[]>(cvData.projects || []);
    const [isAdding, setIsAdding] = useState(projects.length === 0);
const [currentEdit, setCurrentEdit] = useState<Project>({
  title: '',
  type: 'personal', // ✅ ProjectType
  role: '',
  description: '',
  goal: '',
  tools: [],
  result: '',
  impact: '',
  duration: undefined,
});

    const [startMonth, setStartMonth] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endMonth, setEndMonth] = useState('');
    const [endYear, setEndYear] = useState('');

    const PROJECT_TYPES = [
      'Uni-/Schulprojekt',
      'Projekt im Job',
      'Praktikumsprojekt',
      'Hackathon',
      'Ehrenamtliches Projekt',
      'Eigenes / privates Projekt',
    ];

    const ROLE_OPTIONS_LOCAL = [
      'Teammitglied',
      'Projektleitung',
      'Teilprojektleitung',
      'Entwickler:in',
      'Analyst:in',
      'Designer:in',
      'Koordinator:in',
    ];

    // Beispiel-Projekte (wie besprochen)
    const STUDENT_PROJECT_TEMPLATES: { label: string; project: Project }[] = [
      {
        label: 'Schulprojekt: Website-AG',
        project: {
          title: 'Website-AG – Schulhomepage',
          type: 'university',
          role: 'Mitglied der Website-AG',
          description:
            'Gemeinsam mit Mitschüler:innen die Schulhomepage geplant, gestaltet und technisch gepflegt. Inhalte erstellt und kleinere Layout-Anpassungen übernommen.',
          tools: ['CMS (z. B. WordPress)', 'Teamarbeit'],
        },
      },
      {
        label: 'Schülerfirma / Mini-Unternehmen',
        project: {
          title: 'Schülerfirma „Campus Snacks“',
          type: 'university',
          role: 'Mitgründer & Verkauf',
          description:
            'Aufbau einer Schülerfirma mit Verkauf von Snacks in den Pausen und bei Schulveranstaltungen. Verantwortung für Einkauf, Kasse und Kundenkontakt.',
          tools: ['Organisation', 'Verkauf', 'Teamarbeit'],
        },
      },
    ];

    const HOBBY_PROJECT_TEMPLATES: { label: string; project: Project }[] = [
      {
        label: 'Eigener Discord-/Gaming-Server',
        project: {
          title: 'Aufbau und Betreuung eines Gaming-/Community-Servers',
          type: 'personal',
          role: 'Community-Admin',
          description:
            'Planung und Betreuung eines eigenen Community-Servers: Struktur, Rollen und Regeln definiert, Events organisiert und neue Mitglieder eingearbeitet.',
          tools: ['Community-Management', 'Organisation'],
        },
      },
      {
        label: 'Social-Media-Projekt',
        project: {
          title: 'Ehrenamtliches Social-Media-Projekt',
          type: '`personal',
          role: 'Content Creator',
          description:
            'Unterstützung eines Vereins durch Erstellung und Planung von Social-Media-Posts. Einfache Grafiken erstellt und Reichweite analysiert.',
          tools: ['Social Media', 'Content Creation'],
        },
      },
    ];

const isValid =
  !!(currentEdit.title && currentEdit.type && currentEdit.role && currentEdit.goal && currentEdit.result);


    const handleSave = () => {
      const duration =
        startMonth && startYear
          ? endMonth && endYear
            ? `${startMonth}.${startYear} – ${endMonth}.${endYear}`
            : `${startMonth}.${startYear}`
          : undefined;

const newProject: Project = {
  title: currentEdit.title,
  type: currentEdit.type,      // ✅ kein "as any"
  role: currentEdit.role,
  description: currentEdit.description,
  goal: currentEdit.goal,
  tools: currentEdit.tools || [],
  result: currentEdit.result,
  impact: currentEdit.impact || undefined,
  duration: duration || undefined,   // ✅ sauber optional
};


      setProjects((prev) => [...prev, newProject]);
setCurrentEdit({
  title: '',
  type: 'personal' as any,
  role: '',
  description: '',
  goal: '',
  tools: [],
  result: '',
  impact: '',
});

      setStartMonth('');
      setStartYear('');
      setEndMonth('');
      setEndYear('');
      setIsAdding(false);
    };

    const handleDelete = (index: number) => {
      setProjects((prev) => prev.filter((_, i) => i !== index));
    };

    const handleContinue = () => {
      // 🔥 Projekte sicher speichern – Templates lesen dieses Feld aus
      updateCVData('projects', projects);
      nextStep();
    };

    const applyTemplate = (tplProject: Project) => {
      setProjects((prev) => [...prev, tplProject]);
      setIsAdding(false);
    };

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-3xl mx-auto w-full">
          <ProgressBar currentStep={5} totalSteps={getTotalSteps()} />

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Projekte & Praxisbeispiele
            </h1>
            <p className="text-xl text-white/70">
              Zeige mit Projekten, was du praktisch umgesetzt hast – aus Studium, Job oder privat.
            </p>
          </div>

          {/* Schnell-Templates */}
          <div className="space-y-3 bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-sm font-semibold text-white/80">
              Kein Projekt parat? Wähle ein Beispiel, das zu dir passt:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {STUDENT_PROJECT_TEMPLATES.map((tpl, idx) => (
                <button
                  key={`student-${idx}`}
                  type="button"
                  onClick={() => applyTemplate(tpl.project)}
                  className="text-left px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white/90 text-sm hover:bg-white/10 hover:border-[#66c0b6]/50 transition-all"
                >
                  {tpl.label}
                </button>
              ))}
              {HOBBY_PROJECT_TEMPLATES.map((tpl, idx) => (
                <button
                  key={`hobby-${idx}`}
                  type="button"
                  onClick={() => applyTemplate(tpl.project)}
                  className="text-left px-3 py-2 rounded-xl bg-white/5 border border-white/15 text-white/90 text-sm hover:bg-white/10 hover:border-[#66c0b6]/50 transition-all"
                >
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {!isAdding && projects.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Deine Projekte</h3>
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="pr-4">
                      <h4 className="text-xl font-bold text-white mb-1">{project.title}</h4>
                      <p className="text-white/70">
                        {project.type}
                        {project.role && ` • ${project.role}`}
                      </p>
                      {project.duration && (
                        <p className="text-sm text-[#66c0b6] mt-2">{project.duration}</p>
                      )}
                      {project.description && (
                        <p className="text-sm text-white/80 mt-1">
                          {project.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDelete(index)}
                      className="px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isAdding && (
            <div className="space-y-8">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Projekttitel *
                </label>
                <input
                  type="text"
                  value={currentEdit.title}
                  onChange={(e) =>
                    setCurrentEdit({ ...currentEdit, title: e.target.value })
                  }
                  placeholder="z.B. Entwicklung einer Webanwendung für Terminverwaltung"
                  className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Projektart *
                </label>
                <select
                  value={currentEdit.type}
                  onChange={(e) =>
                    setCurrentEdit({ ...currentEdit, type: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-white/20 bg-[#020617] text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer"
                >
                  <option value="">Bitte wählen</option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Rolle im Projekt *
                </label>
                <select
                  value={currentEdit.role}
                  onChange={(e) =>
                    setCurrentEdit({ ...currentEdit, role: e.target.value })
                  }
                  className="w-full px-5 py-4 rounded-xl border border-white/20 bg-[#020617] text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer"
                >
                  <option value="">Bitte wählen</option>
                  {ROLE_OPTIONS_LOCAL.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Kurzbeschreibung (optional)
                </label>
                <textarea
                  value={currentEdit.description}
                  onChange={(e) =>
                    setCurrentEdit({ ...currentEdit, description: e.target.value })
                  }
                  placeholder="Was war das Ziel? Was war dein Beitrag? Welche Ergebnisse gab es?"
                  rows={4}
                  className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 resize-none"
                />
              </div>
{/* 🔽 E3 – Pflichtfelder für Project Interface */}
<div>
  <label className="block text-sm font-semibold text-white/90 mb-2">
    Ziel des Projekts *
  </label>
  <textarea
    value={currentEdit.goal || ''}
    onChange={(e) =>
      setCurrentEdit({ ...currentEdit, goal: e.target.value })
    }
    rows={2}
    placeholder="Was sollte konkret erreicht werden?"
    className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 resize-none"
  />
</div>

<div>
  <label className="block text-sm font-semibold text-white/90 mb-2">
    Ergebnis / Outcome *
  </label>
  <textarea
    value={currentEdit.result || ''}
    onChange={(e) =>
      setCurrentEdit({ ...currentEdit, result: e.target.value })
    }
    rows={2}
    placeholder="Was war das konkrete Ergebnis?"
    className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 resize-none"
  />
</div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Zeitraum (optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-white/60 mb-1">Start</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={startMonth}
                        onChange={(e) => setStartMonth(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#020617] border border-white/25 text-white text-sm focus:outline-none focus:border-[#66c0b6]"
                      >
                        <option value="">Monat</option>
                        {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={startYear}
                        onChange={(e) => setStartYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#020617] border border-white/25 text-white text-sm focus:outline-none focus:border-[#66c0b6]"
                      >
                        <option value="">Jahr</option>
                        {Array.from({ length: 20 }, (_, i) =>
                          String(new Date().getFullYear() - i)
                        ).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-white/60 mb-1">Ende</p>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={endMonth}
                        onChange={(e) => setEndMonth(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#020617] border border-white/25 text-white text-sm focus:outline-none focus:border-[#66c0b6]"
                      >
                        <option value="">Monat</option>
                        {['01','02','03','04','05','06','07','08','09','10','11','12'].map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                      <select
                        value={endYear}
                        onChange={(e) => setEndYear(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#020617] border border-white/25 text-white text-sm focus:outline-none focus:border-[#66c0b6]"
                      >
                        <option value="">Jahr</option>
                        {Array.from({ length: 20 }, (_, i) =>
                          String(new Date().getFullYear() - i)
                        ).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={!isValid}
                className="w-full px-8 py-4 rounded-xl bg-white/5 border border-[#66c0b6]/30 text-[#66c0b6] font-semibold hover:bg-[#66c0b6]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Projekt speichern
              </button>
            </div>
          )}

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Weiteres Projekt hinzufügen
            </button>
          )}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>
            <button
              onClick={handleContinue}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3 shadow-2xl hover:scale-105"
            >
              Weiter
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <AvatarSidebar
            message="Projekte zeigen deine praktische Umsetzungskraft."
            stepInfo="Gerade für Berufseinsteigende sind Projekte ein echter Gamechanger."
          />
        </div>
      </div>
    );
  }


  // ─────────────────────────────
  // Step 6 – Hard Skills & Sprachen
  // ─────────────────────────────

  function Step6_HardSkills() {
    return (
      <HardSkillsStep
        currentStep={6}
        totalSteps={getTotalSteps()}
        targetIndustry={(cvData.targetIndustry as IndustryType) || 'tech'}
        initialSkills={cvData.hardSkills}
        initialLanguages={cvData.languages}
        onNext={(skills, languages) => {
          updateCVData('hardSkills', skills);
          updateCVData('languages', languages);
          nextStep();
        }}
        onPrev={prevStep}
      />
    );
  }

  // ─────────────────────────────
  // Step 7 – Soft Skills
  // ─────────────────────────────

  function Step7_SoftSkills() {
    return (
      <SoftSkillsStep
        currentStep={7}
        totalSteps={getTotalSteps()}
        initialSkills={cvData.softSkills}
        onNext={(skills) => {
          updateCVData('softSkills', skills);
          nextStep();
        }}
        onPrev={prevStep}
      />
    );
  }

  // ─────────────────────────────
  // Step 8 – Work Values
  // ─────────────────────────────
  // ─────────────────────────────
  // Step 8 – Work Values (Arbeitswerte)
  // ─────────────────────────────
  function Step8_WorkValues() {
    const [selected, setSelected] = useState<string[]>(cvData.workValues?.values || []);
    const [custom, setCustom] = useState<string[]>([]);

    const canContinue = selected.length > 0;

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-4xl mx-auto w-full">
          <ProgressBar currentStep={8} totalSteps={getTotalSteps()} />

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Welche Werte sind dir wichtig?
            </h1>
            <p className="text-xl text-white/70">
              Wähle 3–6 Werte, die deine Arbeitsweise prägen.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3 text-left">
              Arbeitswerte
            </h2>
            <ChipsInput
              suggestedItems={WORK_VALUES}
              selectedItems={selected}
              customItems={custom}
              onToggle={(item) =>
                setSelected((prev) =>
                  prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                )
              }
              onAddCustom={(item) => {
                setCustom((prev) => [...prev, item]);
                setSelected((prev) => [...prev, item]);
              }}
              onRemoveCustom={(item) => {
                setCustom((prev) => prev.filter((i) => i !== item));
                setSelected((prev) => prev.filter((i) => i !== item));
              }}
              placeholder="Eigenen Wert hinzufügen..."
              title="Wähle deine Arbeitswerte"
              customTitle="Deine eigenen Werte"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>

            <button
              type="button"
              onClick={() => {
                const updated: WorkValues = {
                  values: selected,
                  workStyle: cvData.workValues?.workStyle || [],
                };
                updateCVData('workValues', updated);
                nextStep();
              }}
              disabled={!canContinue}
              className={`px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl flex items-center gap-3 shadow-2xl transition-all
                ${canContinue ? 'hover:opacity-90 hover:scale-105 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
            >
              Weiter
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="lg:block hidden">
          <AvatarSidebar
            message="Werte zeigen deinen Cultural Fit."
            stepInfo="Authentizität zählt – wähle nur Werte, die wirklich zu dir passen."
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────
  // Step 9 – Work Style (Arbeitsstil)
  // ─────────────────────────────
  // ─────────────────────────────
  // Step 9 – Work Style (Arbeitsstil)
  // ─────────────────────────────
  function Step9_WorkStyle() {
    const [selected, setSelected] = useState<string[]>(cvData.workValues?.workStyle || []);
    const [custom, setCustom] = useState<string[]>([]);

    const canContinue = selected.length > 0;

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-4xl mx-auto w-full">
          <ProgressBar currentStep={9} totalSteps={getTotalSteps()} />

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Wie würdest du deinen Arbeitsstil beschreiben?
            </h1>
            <p className="text-xl text-white/70">
              Wähle 3–6 Eigenschaften, die deine Arbeitsweise am besten beschreiben.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white mb-3 text-left">
              Arbeitsstil
            </h2>
            <ChipsInput
              suggestedItems={WORK_STYLES}
              selectedItems={selected}
              customItems={custom}
              onToggle={(item) =>
                setSelected((prev) =>
                  prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                )
              }
              onAddCustom={(item) => {
                setCustom((prev) => [...prev, item]);
                setSelected((prev) => [...prev, item]);
              }}
              onRemoveCustom={(item) => {
                setCustom((prev) => prev.filter((i) => i !== item));
                setSelected((prev) => prev.filter((i) => i !== item));
              }}
              placeholder="Eigenen Arbeitsstil hinzufügen..."
              title="Wähle deinen Arbeitsstil"
              customTitle="Deine eigenen Stile"
            />
          </div>

          <div className="flex justify-between items-center pt-4">
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>

            <button
              type="button"
              onClick={() => {
                updateCVData('workValues', {
                  values: cvData.workValues?.values || [],
                  workStyle: selected,
                });
                nextStep();
              }}
              disabled={!canContinue}
              className={`px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl flex items-center gap-3 shadow-2xl transition-all
                ${canContinue ? 'hover:opacity-90 hover:scale-105 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
            >
              Weiter
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="hidden lg:block">
          <AvatarSidebar
            message="Dein Arbeitsstil hilft Unternehmen, den richtigen Fit zu erkennen."
            stepInfo="Sei ehrlich – das bringt dich zum richtigen Team."
          />
        </div>
      </div>
    );
  }

  // ─────────────────────────────
  // Step 10 – Hobbies
  // ─────────────────────────────

function Step10_Hobbies() {
  const [selected, setSelected] = useState<string[]>(cvData.hobbies?.hobbies || []);
  const [custom, setCustom] = useState<string[]>([]);
  const [details, setDetails] = useState(cvData.hobbies?.details || '');

  return (
    <div className="h-full flex flex-col lg:flex-row lg:gap-8 lg:p-6 lg:max-w-7xl lg:mx-auto">
      <div className="flex-1 flex flex-col h-full lg:h-auto">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-[#020617]/95 backdrop-blur-md z-50 px-4 pt-4 pb-2 border-b border-white/5">
          <ProgressBar currentStep={10} totalSteps={getTotalSteps()} />
        </div>
        {/* Desktop Progress */}
        <div className="hidden lg:block mb-8">
          <ProgressBar currentStep={10} totalSteps={getTotalSteps()} />
        </div>

        {/* Inhalt */}
        <div className="flex-1 overflow-y-auto lg:overflow-visible px-4 lg:px-0 pt-32 pb-36 lg:pt-0 lg:pb-0">
          <div className="max-w-3xl mx-auto space-y-6 lg:space-y-8">
            <div className="text-center space-y-3 lg:space-y-4 animate-fade-in">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to:white bg-clip-text text-transparent leading-tight px-2">
                Hobbys & Interessen
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-white/70 px-2">
                Was machst du in deiner Freizeit? Hobbys zeigen Persönlichkeit und Cultural Fit.
              </p>
            </div>

            <div className="animate-fade-in">
              <ChipsInput
                suggestedItems={HOBBIES_SUGGESTIONS}
                selectedItems={selected}
                customItems={custom}
                onToggle={(item) =>
                  setSelected((prev) =>
                    prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
                  )
                }
                onAddCustom={(item) => {
                  setCustom((prev) => [...prev, item]);
                  setSelected((prev) => [...prev, item]);
                }}
                onRemoveCustom={(item) => {
                  setCustom((prev) => prev.filter((i) => i !== item));
                  setSelected((prev) => prev.filter((i) => i !== item));
                }}
                placeholder="Eigenes Hobby hinzufügen..."
                title="Wähle deine Hobbys"
                customTitle="Deine eigenen Hobbys"
              />

              <div className="mt-6">
                <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                  Kurze Ergänzung (optional)
                </label>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="Z.B. 'Ich laufe regelmäßig Halbmarathons und fotografiere gerne auf Reisen...'"
                  rows={3}
                  maxLength={200}
                  className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all resize-none touch-manipulation"
                />
                <p className="text-xs text-white/50 mt-1">
                  {details.length}/200 Zeichen
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation – jetzt überall sichtbar */}
        <div className="flex justify-between items-center pt-6">
          <button
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={20} />
            Zurück
          </button>
          <button
            onClick={() => {
              updateCVData('hobbies', { hobbies: selected, details: details || undefined });
              nextStep();
            }}
            disabled={selected.length === 0}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:scale-105 ml-auto"
          >
            Weiter
            <ArrowRight size={24} />
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <AvatarSidebar
          message="Hobbys geben Persönlichkeit und zeigen Cultural Fit."
          stepInfo="Wähle authentisch – das macht dich interessant."
        />
      </div>
    </div>
  );
}

  // ─────────────────────────────
  // Step 11 – Completion & Speichern
  // ─────────────────────────────

    function Step11_Completion() {

    const handleGoToJobTargeting = async () => {
      // … dein Supabase-Speicher-Code wie gehabt …

      const finalCvData = {
        ...cvData,
        workExperiences: cvData.workExperiences || [],
        projects: cvData.projects || [],
        languages: cvData.languages || [],
      };

      // Speichern in stored_cvs (dein bestehender Code)
      // ...

      navigate('/job-targeting', {
        state: { cvData: finalCvData },
      });
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-12 animate-fade-in">
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#66c0b6]/30 to-[#30E3CA]/30 blur-3xl rounded-full"></div>
              <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] flex items-center justify-center shadow-2xl">
                <Check size={64} className="text-white" />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to:white bg-clip-text text-transparent leading-tight">
              Perfekt! 🎉
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-white">
              Jetzt haben wir alles, was wir brauchen.
            </h2>
            <p className="text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed">
              Im nächsten Schritt optimieren wir deinen CV individuell für deinen Traumjob.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-3">✅</div>
              <h3 className="font-semibold text-white mb-2">Vollständiges Profil</h3>
              <p className="text-sm text-white/60">Alle Daten erfasst</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-white mb-2">ATS-konform</h3>
              <p className="text-sm text-white/60">Für Bewerbungssysteme optimiert</p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <div className="text-4xl mb-3">🚀</div>
              <h3 className="font-semibold text-white mb-2">KI-optimiert</h3>
              <p className="text-sm text-white/60">Professionelle HR-Sprache</p>
            </div>
          </div>

          <button
            onClick={handleGoToJobTargeting}
            className="group px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3 shadow-2xl hover:scale-105 mx-auto"
          >
            Weiter zu deiner Wunschstelle
            <ArrowRight
              size={32}
              className="group-hover:translate-x-2 transition-transform"
            />
          </button>

          <p className="text-sm text-white/50">
            🔒 Deine Daten sind sicher und werden verschlüsselt gespeichert
          </p>
        </div>
      </div>
    );
  }
  // ─────────────────────────────
  // Main Render
  // ─────────────────────────────

  if (isLoadingFromDb) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin inline-block w-10 h-10 border-4 border:white/20 border-t-[#66c0b6] rounded-full" />
          <p className="text:white/70">Dein CV wird geladen...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <h1 className="text-3xl font-bold text:white">Ups, da ist etwas schiefgelaufen</h1>
          <p className="text:white/70">{loadError}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from[#66c0b6] to[#30E3CA] text:black font-semibold hover:opacity-90 transition-all"
          >
            Zurück zum Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ⬇️ HIER NEU
  return (
    <div className="min-h-screen w-full bg-[#020617] text:white">
      {/* keine feste Höhe, kein overflow-hidden mehr → Seite kann wieder scrollen */}
      <div className="min-h-screen flex flex-col">
        {renderStep()}
      </div>
    </div>
  );
}
