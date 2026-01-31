import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Check, Sparkles, Plus } from 'lucide-react';
import { AvatarSidebar } from '../components/cvbuilder/AvatarSidebar';
import { MotivationScreen } from '../components/cvbuilder/MotivationScreen';
import { ProgressBar } from '../components/cvbuilder/ProgressBar';
import { DateDropdowns, formatDateRange } from '../components/cvbuilder/DateDropdowns';
import { ChipsInput } from '../components/cvbuilder/ChipsInput';
import { HardSkillsStep } from '../components/cvbuilder/HardSkillsStep';
import { SoftSkillsStep } from '../components/cvbuilder/SoftSkillsStep';
import { CVBuilderData, ExperienceLevel, RoleType, IndustryType, PersonalData, SchoolEducation, ProfessionalEducation, WorkExperience, Project, WorkValues, Hobbies } from '../types/cvBuilder';
import { ROLE_OPTIONS, INDUSTRIES, TASKS_BY_LEVEL, ACHIEVEMENTS_BY_LEVEL } from '../config/cvBuilderSteps';
import { WORK_VALUES, WORK_STYLES, HOBBIES_SUGGESTIONS } from '../config/cvBuilderConstants';

export function CVUploadCheck() {
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize mode and data from location state
  const mode = location.state?.mode ?? 'new';
  const initialDataFromCheck = location.state?.initialData as CVBuilderData | undefined;

  const [currentStep, setCurrentStep] = useState(() => {
    // In Check-Modus skip Experience Level wenn schon vorhanden
    if (initialDataFromCheck && mode === 'check') {
      return initialDataFromCheck.experienceLevel ? 1 : 0;
    }
    return 0;
  });

  const [cvData, setCVData] = useState<CVBuilderData>(() => initialDataFromCheck ?? {});
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationVariant, setMotivationVariant] = useState<1 | 2 | 3>(1);
  const [isCheckMode] = useState(mode === 'check');

  const updateCVData = <K extends keyof CVBuilderData>(key: K, value: CVBuilderData[K]) => {
    setCVData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if ((currentStep + 1) % 3 === 0 && currentStep > 0 && currentStep <= 10) {
      setMotivationVariant((((currentStep + 1) / 3) % 3 + 1) as 1 | 2 | 3);
      setShowMotivation(true);
    } else {
      setCurrentStep(prev => prev + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMotivationComplete = () => {
    setShowMotivation(false);
    setCurrentStep(prev => prev + 1);
  };

  const getTotalSteps = () => 12;

  const renderStep = () => {
    if (showMotivation) {
      return <MotivationScreen onContinue={handleMotivationComplete} variant={motivationVariant} />;
    }

    switch (currentStep) {
      case 0: return <Step0_ExperienceLevel />;
      case 1: return <Step1_PersonalData />;
      case 2: return <Step2_SchoolEducation />;
      case 3: return <Step3_ProfessionalEducation />;
      case 4: return <Step4_WorkExperience />;
      case 5: return <Step5_Projects />;
      case 6: return <Step6_HardSkills />;
      case 7: return <Step7_SoftSkills />;
      case 8: return <Step8_WorkValues />;
      case 9: return <Step9_WorkStyle />;
      case 10: return <Step10_Hobbies />;
      case 11: return <Step11_Completion />;
      default: return null;
    }
  };

  function Step0_ExperienceLevel() {
    const options = [
      {
        id: 'beginner',
        title: 'Ich stehe am Anfang meiner Karriere',
        description: 'Schüler, Studierende, Absolventen ohne Berufserfahrung',
        benefit: '✨ Wir fokussieren auf Ausbildung & Projekte'
      },
      {
        id: 'some-experience',
        title: 'Ich habe erste praktische Erfahrungen gesammelt',
        description: 'Praktika, Werkstudententätigkeit, Nebenjobs (0–3 Jahre)',
        benefit: '🚀 Wir heben deine Erfahrungen optimal hervor'
      },
      {
        id: 'experienced',
        title: 'Ich bringe relevante Berufserfahrung mit',
        description: '3–10+ Jahre Erfahrung in meinem Bereich',
        benefit: '💼 Wir machen deine Erfolge messbar & konkret'
      }
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
                    <p className="text-base text-white/60 mb-3">
                      {option.description}
                    </p>
                    <p className="text-sm text-[#66c0b6] font-medium">
                      {option.benefit}
                    </p>
                  </div>

                  <ArrowRight size={32} className="text-[#66c0b6] group-hover:translate-x-2 transition-transform flex-shrink-0" />
                </div>
              </button>
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-white/50">
              💡 Deine Antworten bleiben bei dir und werden nicht an Dritte weitergegeben
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

  function Step1_PersonalData() {
    const [data, setData] = useState<PersonalData>(cvData.personalData || {});

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
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
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
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
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
                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
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
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
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
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
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
                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
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

  function Step2_SchoolEducation() {
    const [educations, setEducations] = useState<SchoolEducation[]>(
      cvData.schoolEducation ? [cvData.schoolEducation] : []
    );
    const [currentEdit, setCurrentEdit] = useState(0);

    const education = educations[currentEdit] || {
      type: '',
      school: '',
      graduation: '',
      year: '',
      focus: [],
      projects: []
    };

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
      'Anderer Abschluss'
    ];

    const FOCUS_OPTIONS = [
      'Wirtschaft',
      'Technik',
      'Sprachen',
      'Naturwissenschaften',
      'Medien/Gestaltung'
    ];

    const ACHIEVEMENT_OPTIONS = [
      'Ehrenamt',
      'Jahrgangsbestleistung',
      'Schulpreis',
      'AGs',
      'Wettbewerbe'
    ];

    const isValid =
      education.type &&
      education.school &&
      startMonth &&
      startYear &&
      (isCurrent || (endMonth && endYear));

    const handleContinue = () => {
      const finalEducation: SchoolEducation = {
        type: education.type === 'Anderer Abschluss' ? otherGraduation : education.type,
        school: education.school,
        graduation: education.type === 'Anderer Abschluss' ? otherGraduation : education.type,
        year: formatDateRange(startMonth, startYear, endMonth, endYear, isCurrent),
        focus: [...selectedFocus],
        projects: [...selectedAchievements]
      };

      updateCVData('schoolEducation', finalEducation);
      nextStep();
    };

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-3xl mx-auto w-full">
          <ProgressBar currentStep={2} totalSteps={getTotalSteps()} />

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Schulische Ausbildung
            </h1>
            <p className="text-xl text-white/70">
              Gib deinen höchsten Schulabschluss und die wichtigsten Details ein.
            </p>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Höchster Schulabschluss *
              </label>
              <select
                value={education.type}
                onChange={(e) => {
                  setEducations([{ ...education, type: e.target.value }]);
                  setShowOtherField(e.target.value === 'Anderer Abschluss');
                }}
                className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer"
              >
                <option value="" className="bg-[#0a0a0a]">Bitte wählen</option>
                {SCHOOL_TYPES.map(type => (
                  <option key={type} value={type} className="bg-[#0a0a0a]">
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
                value={education.school}
                onChange={(e) => setEducations([{ ...education, school: e.target.value }])}
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
                onToggle={(item) => setSelectedFocus(prev =>
                  prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                )}
                onAddCustom={(item) => {
                  setCustomFocus(prev => [...prev, item]);
                  setSelectedFocus(prev => [...prev, item]);
                }}
                onRemoveCustom={(item) => {
                  setCustomFocus(prev => prev.filter(i => i !== item));
                  setSelectedFocus(prev => prev.filter(i => i !== item));
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
                onToggle={(item) => setSelectedAchievements(prev =>
                  prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                )}
                onAddCustom={(item) => {
                  setCustomAchievements(prev => [...prev, item]);
                  setSelectedAchievements(prev => [...prev, item]);
                }}
                onRemoveCustom={(item) => {
                  setCustomAchievements(prev => prev.filter(i => i !== item));
                  setSelectedAchievements(prev => prev.filter(i => i !== item));
                }}
                placeholder="Weitere Leistung hinzufügen..."
                title="Wähle besondere Leistungen"
                customTitle="Deine eigenen Leistungen"
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
              onClick={handleContinue}
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
            message="Der schulische Abschluss ist besonders für Berufseinsteigende wichtig."
            stepInfo="Wir erfassen ihn hier ATS-konform mit klaren Zeiträumen und relevanten Details."
          />
        </div>
      </div>
    );
  }

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
      activities: []
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
      'Anderer Abschluss'
    ];

    const FOCUS_OPTIONS = [
      'Wirtschaftswissenschaften',
      'Informatik',
      'Ingenieurwesen',
      'Naturwissenschaften',
      'Geisteswissenschaften',
      'Medien & Kommunikation',
      'Design',
      'Rechtswissenschaften'
    ];

    const ACTIVITY_OPTIONS = [
      'Projektarbeit',
      'Praxissemester',
      'Auslandsaufenthalt',
      'Forschungsprojekt',
      'Abschlussarbeit',
      'Studienarbeit'
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
        activities: [...selectedActivities]
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
        activities: []
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
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Ausbildung / Studium
            </h1>
            <p className="text-xl text-white/70">
              Trage deine berufliche Ausbildung, dein Studium oder relevante Weiterbildungen ein.
            </p>
          </div>

          {!isAdding && educations.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Deine Ausbildungen</h3>
              {educations.map((edu, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{edu.field}</h4>
                      <p className="text-white/70">{edu.institution}</p>
                      <p className="text-sm text-[#66c0b6] mt-2">{edu.degree} • {edu.graduation}</p>
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
                  Art des Abschlusses *
                </label>
                <select
                  value={currentEdit.degree}
                  onChange={(e) => {
                    setCurrentEdit({ ...currentEdit, degree: e.target.value });
                    setShowOtherField(e.target.value === 'Anderer Abschluss');
                  }}
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer"
                >
                  <option value="" className="bg-[#0a0a0a]">Bitte wählen</option>
                  {DEGREE_TYPES.map(type => (
                    <option key={type} value={type} className="bg-[#0a0a0a]">
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
                    value={otherDegree}
                    onChange={(e) => setOtherDegree(e.target.value)}
                    placeholder="z.B. Fachinformatiker"
                    className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Name der Bildungseinrichtung *
                </label>
                <input
                  type="text"
                  value={currentEdit.institution}
                  onChange={(e) => setCurrentEdit({ ...currentEdit, institution: e.target.value })}
                  placeholder="z.B. Technische Universität München"
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Abschluss / Studiengang / Ausbildungsberuf *
                </label>
                <input
                  type="text"
                  value={currentEdit.field}
                  onChange={(e) => setCurrentEdit({ ...currentEdit, field: e.target.value })}
                  placeholder="z.B. Betriebswirtschaftslehre"
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
                  Fachrichtung / Schwerpunkt (optional)
                </label>
                <ChipsInput
                  suggestedItems={FOCUS_OPTIONS}
                  selectedItems={selectedFocus}
                  customItems={customFocus}
                  onToggle={(item) => setSelectedFocus(prev =>
                    prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                  )}
                  onAddCustom={(item) => {
                    setCustomFocus(prev => [...prev, item]);
                    setSelectedFocus(prev => [...prev, item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomFocus(prev => prev.filter(i => i !== item));
                    setSelectedFocus(prev => prev.filter(i => i !== item));
                  }}
                  placeholder="Eigene Fachrichtung hinzufügen..."
                  title="Wähle deine Fachrichtung"
                  customTitle="Deine eigenen Fachrichtungen"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Relevante Inhalte (optional)
                </label>
                <ChipsInput
                  suggestedItems={ACTIVITY_OPTIONS}
                  selectedItems={selectedActivities}
                  customItems={customActivities}
                  onToggle={(item) => setSelectedActivities(prev =>
                    prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                  )}
                  onAddCustom={(item) => {
                    setCustomActivities(prev => [...prev, item]);
                    setSelectedActivities(prev => [...prev, item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomActivities(prev => prev.filter(i => i !== item));
                    setSelectedActivities(prev => prev.filter(i => i !== item));
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
              className="w-full px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Weitere Ausbildung / weiteres Studium hinzufügen
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
              disabled={educations.length === 0}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:scale-105"
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

  function Step4_WorkExperience() {
    const [experiences, setExperiences] = useState<WorkExperience[]>(
      cvData.workExperiences || []
    );
    const [isAdding, setIsAdding] = useState(experiences.length === 0);
    const [currentEdit, setCurrentEdit] = useState<WorkExperience>({
      title: '',
      company: '',
      location: '',
      type: 'Vollzeit',
      duration: '',
      tasks: [],
      achievements: []
    });

    const [startMonth, setStartMonth] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endMonth, setEndMonth] = useState('');
    const [endYear, setEndYear] = useState('');
    const [isCurrent, setIsCurrent] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<string[]>([]);
    const [customDepartment, setCustomDepartment] = useState<string[]>([]);
    const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
    const [customTasks, setCustomTasks] = useState<string[]>([]);
    const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);
    const [customAchievements, setCustomAchievements] = useState<string[]>([]);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [customTools, setCustomTools] = useState<string[]>([]);

    const JOB_TYPES = [
      'Vollzeit',
      'Teilzeit',
      'Praktikum',
      'Werkstudent:in',
      'Nebenjob',
      'Freelancer',
      'Ehrenamt'
    ];

    const DEPARTMENTS = [
      'Marketing',
      'Vertrieb',
      'HR',
      'IT / Entwicklung',
      'Consulting',
      'Finance',
      'Operations',
      'Produkt Management',
      'Customer Success'
    ];

    const TASK_OPTIONS = [
      'Kundenbetreuung',
      'Analysen erstellt',
      'Berichte vorbereitet',
      'Kampagnen umgesetzt',
      'Daten ausgewertet',
      'Prozesse optimiert',
      'Meetings koordiniert',
      'Präsentationen erstellt',
      'Teamarbeit',
      'Projektmanagement'
    ];

    const ACHIEVEMENT_OPTIONS = [
      'Umsatz gesteigert',
      'Kosten reduziert',
      'Prozesse beschleunigt',
      'Kundenzufriedenheit erhöht',
      'Projekt erfolgreich abgeschlossen',
      'Team aufgebaut',
      'Qualität verbessert'
    ];

    const isValid =
      currentEdit.title &&
      currentEdit.company &&
      startMonth &&
      startYear &&
      (isCurrent || (endMonth && endYear)) &&
      selectedTasks.length > 0;

    const handleSave = () => {
      const newExperience: WorkExperience = {
        title: currentEdit.title,
        company: currentEdit.company,
        location: currentEdit.location || undefined,
        type: currentEdit.type,
        duration: formatDateRange(startMonth, startYear, endMonth, endYear, isCurrent),
        department: selectedDepartment.length > 0 ? selectedDepartment[0] : undefined,
        tasks: [...selectedTasks],
        achievements: [...selectedAchievements],
        tools: selectedTools.length > 0 ? [...selectedTools] : undefined
      };

      setExperiences([...experiences, newExperience]);
      resetForm();
      setIsAdding(false);
    };

    const resetForm = () => {
      setCurrentEdit({
        title: '',
        company: '',
        location: '',
        type: 'Vollzeit',
        duration: '',
        tasks: [],
        achievements: []
      });
      setStartMonth('');
      setStartYear('');
      setEndMonth('');
      setEndYear('');
      setIsCurrent(false);
      setSelectedDepartment([]);
      setCustomDepartment([]);
      setSelectedTasks([]);
      setCustomTasks([]);
      setSelectedAchievements([]);
      setCustomAchievements([]);
      setSelectedTools([]);
      setCustomTools([]);
    };

    const handleDelete = (index: number) => {
      setExperiences(experiences.filter((_, i) => i !== index));
    };

    const handleContinue = () => {
      updateCVData('workExperiences', experiences);
      nextStep();
    };

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-3xl mx-auto w-full">
          <ProgressBar currentStep={4} totalSteps={getTotalSteps()} />

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Berufserfahrung
            </h1>
            <p className="text-xl text-white/70">
              Gib hier deine bisherigen beruflichen Stationen ein.
            </p>
          </div>

          {!isAdding && experiences.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Deine Berufserfahrungen</h3>
              {experiences.map((exp, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{exp.title}</h4>
                      <p className="text-white/70">{exp.company}{exp.location && ` • ${exp.location}`}</p>
                      <p className="text-sm text-[#66c0b6] mt-2">{exp.type} • {exp.duration}</p>
                      <p className="text-sm text-white/60 mt-2">{exp.tasks.length} Aufgaben</p>
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
                  Jobtitel *
                </label>
                <input
                  type="text"
                  value={currentEdit.title}
                  onChange={(e) => setCurrentEdit({ ...currentEdit, title: e.target.value })}
                  placeholder="z.B. Marketing Manager"
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Unternehmen *
                </label>
                <input
                  type="text"
                  value={currentEdit.company}
                  onChange={(e) => setCurrentEdit({ ...currentEdit, company: e.target.value })}
                  placeholder="z.B. Siemens AG"
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Standort (Stadt) - optional
                </label>
                <input
                  type="text"
                  value={currentEdit.location || ''}
                  onChange={(e) => setCurrentEdit({ ...currentEdit, location: e.target.value })}
                  placeholder="z.B. München"
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Art der Tätigkeit *
                </label>
                <select
                  value={currentEdit.type}
                  onChange={(e) => setCurrentEdit({ ...currentEdit, type: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer"
                >
                  {JOB_TYPES.map(type => (
                    <option key={type} value={type} className="bg-[#0a0a0a]">
                      {type}
                    </option>
                  ))}
                </select>
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
                  Bereich / Abteilung (optional)
                </label>
                <ChipsInput
                  suggestedItems={DEPARTMENTS}
                  selectedItems={selectedDepartment}
                  customItems={customDepartment}
                  onToggle={(item) => setSelectedDepartment([item])}
                  onAddCustom={(item) => {
                    setCustomDepartment([item]);
                    setSelectedDepartment([item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomDepartment([]);
                    setSelectedDepartment([]);
                  }}
                  placeholder="Eigenen Bereich hinzufügen..."
                  title="Wähle deinen Bereich"
                  customTitle="Dein eigener Bereich"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Aufgaben * (mindestens 1)
                </label>
                <ChipsInput
                  suggestedItems={TASK_OPTIONS}
                  selectedItems={selectedTasks}
                  customItems={customTasks}
                  onToggle={(item) => setSelectedTasks(prev =>
                    prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                  )}
                  onAddCustom={(item) => {
                    setCustomTasks(prev => [...prev, item]);
                    setSelectedTasks(prev => [...prev, item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomTasks(prev => prev.filter(i => i !== item));
                    setSelectedTasks(prev => prev.filter(i => i !== item));
                  }}
                  placeholder="Eigene Aufgabe hinzufügen..."
                  title="Wähle deine Aufgaben"
                  customTitle="Deine eigenen Aufgaben"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Erfolge / Ergebnisse (optional, aber empfohlen)
                </label>
                <ChipsInput
                  suggestedItems={ACHIEVEMENT_OPTIONS}
                  selectedItems={selectedAchievements}
                  customItems={customAchievements}
                  onToggle={(item) => setSelectedAchievements(prev =>
                    prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                  )}
                  onAddCustom={(item) => {
                    setCustomAchievements(prev => [...prev, item]);
                    setSelectedAchievements(prev => [...prev, item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomAchievements(prev => prev.filter(i => i !== item));
                    setSelectedAchievements(prev => prev.filter(i => i !== item));
                  }}
                  placeholder="Eigenen Erfolg hinzufügen..."
                  title="Wähle deine Erfolge"
                  customTitle="Deine eigenen Erfolge"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Verwendete Tools / Technologien (optional)
                </label>
                <ChipsInput
                  suggestedItems={[]}
                  selectedItems={selectedTools}
                  customItems={customTools}
                  onToggle={(item) => setSelectedTools(prev =>
                    prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                  )}
                  onAddCustom={(item) => {
                    setCustomTools(prev => [...prev, item]);
                    setSelectedTools(prev => [...prev, item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomTools(prev => prev.filter(i => i !== item));
                    setSelectedTools(prev => prev.filter(i => i !== item));
                  }}
                  placeholder="Tool hinzufügen (z.B. Excel, Salesforce)..."
                  title=""
                  customTitle="Deine Tools"
                />
              </div>

              <button
                onClick={handleSave}
                disabled={!isValid}
                className="w-full px-8 py-4 rounded-xl bg-white/5 border border-[#66c0b6]/30 text-[#66c0b6] font-semibold hover:bg-[#66c0b6]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Berufserfahrung speichern
              </button>
            </div>
          )}

          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="w-full px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              Weitere Berufserfahrung hinzufügen
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
              disabled={cvData.experienceLevel === 'beginner' ? false : experiences.length === 0}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:scale-105"
            >
              Weiter
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="lg:block hidden">
          <AvatarSidebar
            message="Hier zeigen wir, was du bisher geleistet hast."
            stepInfo="Aufgaben und Erfolge bilden später die Grundlage für starke Bulletpoints in deinem CV."
          />
        </div>
      </div>
    );
  }

  function Step5_Projects() {
    const [projects, setProjects] = useState<Project[]>(cvData.projects || []);
    const [isAdding, setIsAdding] = useState(projects.length === 0);
    const [currentEdit, setCurrentEdit] = useState<Project>({
      title: '',
      type: '',
      role: '',
      description: '',
      technologies: []
    });

    const [startMonth, setStartMonth] = useState('');
    const [startYear, setStartYear] = useState('');
    const [endMonth, setEndMonth] = useState('');
    const [endYear, setEndYear] = useState('');
    const [selectedRole, setSelectedRole] = useState<string[]>([]);
    const [customRole, setCustomRole] = useState<string[]>([]);
    const [selectedGoal, setSelectedGoal] = useState<string[]>([]);
    const [customGoal, setCustomGoal] = useState<string[]>([]);
    const [selectedResults, setSelectedResults] = useState<string[]>([]);
    const [customResults, setCustomResults] = useState<string[]>([]);
    const [selectedTools, setSelectedTools] = useState<string[]>([]);
    const [customTools, setCustomTools] = useState<string[]>([]);

    const PROJECT_TYPES = [
      'Uni-/Schulprojekt',
      'Projekt im Job',
      'Praktikumsprojekt',
      'Hackathon',
      'Ehrenamtliches Projekt',
      'Eigenes / privates Projekt'
    ];

    const ROLE_OPTIONS = [
      'Teammitglied',
      'Projektleitung',
      'Teilprojektleitung',
      'Entwickler:in',
      'Analyst:in',
      'Designer:in',
      'Koordinator:in'
    ];

    const GOAL_OPTIONS = [
      'Problem lösen',
      'Prozess verbessern',
      'Produkt / Feature entwickeln',
      'Studie / Analyse durchführen',
      'Event organisieren',
      'Prototyp erstellen'
    ];

    const RESULT_OPTIONS = [
      'Projekt erfolgreich abgeschlossen',
      'Einsparungen erzielt',
      'Nutzerfeedback erhalten',
      'Note / Bewertung (z.B. 1,0)',
      'In Produktion genommen',
      'Auszeichnung erhalten'
    ];

    const isValid =
      currentEdit.title &&
      currentEdit.type &&
      selectedRole.length > 0 &&
      selectedGoal.length > 0;

    const handleSave = () => {
      const duration = (startMonth && startYear)
        ? (endMonth && endYear)
          ? formatDateRange(startMonth, startYear, endMonth, endYear, false)
          : `${startMonth}/${startYear}`
        : undefined;

      const newProject: Project = {
        title: currentEdit.title,
        type: currentEdit.type,
        role: selectedRole[0],
        description: selectedGoal[0],
        duration,
        results: selectedResults.length > 0 ? [...selectedResults] : undefined,
        technologies: selectedTools.length > 0 ? [...selectedTools] : []
      };

      setProjects([...projects, newProject]);
      resetForm();
      setIsAdding(false);
    };

    const resetForm = () => {
      setCurrentEdit({
        title: '',
        type: '',
        role: '',
        description: '',
        technologies: []
      });
      setStartMonth('');
      setStartYear('');
      setEndMonth('');
      setEndYear('');
      setSelectedRole([]);
      setCustomRole([]);
      setSelectedGoal([]);
      setCustomGoal([]);
      setSelectedResults([]);
      setCustomResults([]);
      setSelectedTools([]);
      setCustomTools([]);
    };

    const handleDelete = (index: number) => {
      setProjects(projects.filter((_, i) => i !== index));
    };

    const handleContinue = () => {
      updateCVData('projects', projects);
      nextStep();
    };

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-3xl mx-auto w-full">
          <ProgressBar currentStep={5} totalSteps={getTotalSteps()} />

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Projekte
            </h1>
            <p className="text-xl text-white/70">
              Projekte – aus Studium, Beruf oder privat – zeigen deine praktischen Fähigkeiten.
            </p>
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
                    <div>
                      <h4 className="text-xl font-bold text-white mb-1">{project.title}</h4>
                      <p className="text-white/70">{project.type} • {project.role}</p>
                      <p className="text-sm text-[#66c0b6] mt-2">{project.description}</p>
                      {project.duration && (
                        <p className="text-sm text-white/60 mt-1">{project.duration}</p>
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
                  onChange={(e) => setCurrentEdit({ ...currentEdit, title: e.target.value })}
                  placeholder="z.B. Entwicklung einer Webanwendung für Terminverwaltung"
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Projektart *
                </label>
                <select
                  value={currentEdit.type}
                  onChange={(e) => setCurrentEdit({ ...currentEdit, type: e.target.value })}
                  className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 cursor-pointer"
                >
                  <option value="" className="bg-[#0a0a0a]">Bitte wählen</option>
                  {PROJECT_TYPES.map(type => (
                    <option key={type} value={type} className="bg-[#0a0a0a]">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Rolle im Projekt * (wähle eine)
                </label>
                <ChipsInput
                  suggestedItems={ROLE_OPTIONS}
                  selectedItems={selectedRole}
                  customItems={customRole}
                  onToggle={(item) => setSelectedRole([item])}
                  onAddCustom={(item) => {
                    setCustomRole([item]);
                    setSelectedRole([item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomRole([]);
                    setSelectedRole([]);
                  }}
                  placeholder="Eigene Rolle hinzufügen..."
                  title="Wähle deine Rolle"
                  customTitle="Deine eigene Rolle"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Projektziel * (wähle eines)
                </label>
                <ChipsInput
                  suggestedItems={GOAL_OPTIONS}
                  selectedItems={selectedGoal}
                  customItems={customGoal}
                  onToggle={(item) => setSelectedGoal([item])}
                  onAddCustom={(item) => {
                    setCustomGoal([item]);
                    setSelectedGoal([item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomGoal([]);
                    setSelectedGoal([]);
                  }}
                  placeholder="Eigenes Ziel hinzufügen..."
                  title="Wähle das Projektziel"
                  customTitle="Dein eigenes Ziel"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Ergebnis (optional)
                </label>
                <ChipsInput
                  suggestedItems={RESULT_OPTIONS}
                  selectedItems={selectedResults}
                  customItems={customResults}
                  onToggle={(item) => setSelectedResults(prev =>
                    prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                  )}
                  onAddCustom={(item) => {
                    setCustomResults(prev => [...prev, item]);
                    setSelectedResults(prev => [...prev, item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomResults(prev => prev.filter(i => i !== item));
                    setSelectedResults(prev => prev.filter(i => i !== item));
                  }}
                  placeholder="Eigenes Ergebnis hinzufügen..."
                  title="Wähle Ergebnisse"
                  customTitle="Deine eigenen Ergebnisse"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Tools / Methoden (optional)
                </label>
                <ChipsInput
                  suggestedItems={[]}
                  selectedItems={selectedTools}
                  customItems={customTools}
                  onToggle={(item) => setSelectedTools(prev =>
                    prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
                  )}
                  onAddCustom={(item) => {
                    setCustomTools(prev => [...prev, item]);
                    setSelectedTools(prev => [...prev, item]);
                  }}
                  onRemoveCustom={(item) => {
                    setCustomTools(prev => prev.filter(i => i !== item));
                    setSelectedTools(prev => prev.filter(i => i !== item));
                  }}
                  placeholder="Tool/Methode hinzufügen (z.B. React, Scrum)..."
                  title=""
                  customTitle="Verwendete Tools/Methoden"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-3">
                  Zeitraum (optional)
                </label>
                <DateDropdowns
                  startMonth={startMonth}
                  startYear={startYear}
                  endMonth={endMonth}
                  endYear={endYear}
                  isCurrent={false}
                  onStartChange={(month, year) => {
                    setStartMonth(month);
                    setStartYear(year);
                  }}
                  onEndChange={(month, year) => {
                    setEndMonth(month);
                    setEndYear(year);
                  }}
                  onCurrentChange={() => {}}
                  showCurrentCheckbox={false}
                />
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

        <div className="lg:block hidden">
          <AvatarSidebar
            message="Projekte sind besonders für Berufseinsteigende wichtig."
            stepInfo="Sie zeigen, was du praktisch umsetzen kannst – weit über deinen Jobtitel hinaus."
          />
        </div>
      </div>
    );
  }

  function Step6_HardSkills() {
    return (
      <HardSkillsStep
        currentStep={6}
        totalSteps={getTotalSteps()}
        targetIndustry={cvData.targetIndustry || 'tech'}
        initialSkills={cvData.hardSkills}
        onNext={(skills) => {
          updateCVData('hardSkills', skills);
          nextStep();
        }}
        onPrev={prevStep}
      />
    );
  }

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

  function Step8_WorkValues() {
    const [selected, setSelected] = useState<string[]>(cvData.workValues?.values || []);
    const [custom, setCustom] = useState<string[]>([]);

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

          <ChipsInput
            suggestedItems={WORK_VALUES}
            selectedItems={selected}
            customItems={custom}
            onToggle={(item) => setSelected(prev =>
              prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
            )}
            onAddCustom={(item) => {
              setCustom(prev => [...prev, item]);
              setSelected(prev => [...prev, item]);
            }}
            onRemoveCustom={(item) => {
              setCustom(prev => prev.filter(i => i !== item));
              setSelected(prev => prev.filter(i => i !== item));
            }}
            placeholder="Eigenen Wert hinzufügen..."
            title="Wähle deine Arbeitswerte"
            customTitle="Deine eigenen Werte"
          />

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
                updateCVData('workValues', { values: selected, workStyle: [] });
                nextStep();
              }}
              disabled={selected.length === 0}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:scale-105"
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

  function Step9_WorkStyle() {
    const [selected, setSelected] = useState<string[]>(cvData.workValues?.workStyle || []);
    const [custom, setCustom] = useState<string[]>([]);

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

          <ChipsInput
            suggestedItems={WORK_STYLES}
            selectedItems={selected}
            customItems={custom}
            onToggle={(item) => setSelected(prev =>
              prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
            )}
            onAddCustom={(item) => {
              setCustom(prev => [...prev, item]);
              setSelected(prev => [...prev, item]);
            }}
            onRemoveCustom={(item) => {
              setCustom(prev => prev.filter(i => i !== item));
              setSelected(prev => prev.filter(i => i !== item));
            }}
            placeholder="Eigenen Arbeitsstil hinzufügen..."
            title="Wähle deinen Arbeitsstil"
            customTitle="Deine eigenen Stile"
          />

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
                updateCVData('workValues', {
                  values: cvData.workValues?.values || [],
                  workStyle: selected
                });
                nextStep();
              }}
              disabled={selected.length === 0}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:scale-105"
            >
              Weiter
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="lg:block hidden">
          <AvatarSidebar
            message="Dein Arbeitsstil hilft Unternehmen, den richtigen Fit zu erkennen."
            stepInfo="Sei ehrlich – das bringt dich zum richtigen Team."
          />
        </div>
      </div>
    );
  }

  function Step10_Hobbies() {
    const [selected, setSelected] = useState<string[]>(cvData.hobbies?.hobbies || []);
    const [custom, setCustom] = useState<string[]>([]);
    const [details, setDetails] = useState(cvData.hobbies?.details || '');

    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-4xl mx-auto w-full">
          <ProgressBar currentStep={10} totalSteps={getTotalSteps()} />

          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Was machst du in deiner Freizeit?
            </h1>
            <p className="text-xl text-white/70">
              Hobbys zeigen Persönlichkeit und Cultural Fit.
            </p>
          </div>

          <ChipsInput
            suggestedItems={HOBBIES_SUGGESTIONS}
            selectedItems={selected}
            customItems={custom}
            onToggle={(item) => setSelected(prev =>
              prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
            )}
            onAddCustom={(item) => {
              setCustom(prev => [...prev, item]);
              setSelected(prev => [...prev, item]);
            }}
            onRemoveCustom={(item) => {
              setCustom(prev => prev.filter(i => i !== item));
              setSelected(prev => prev.filter(i => i !== item));
            }}
            placeholder="Eigenes Hobby hinzufügen..."
            title="Wähle deine Hobbys"
            customTitle="Deine eigenen Hobbys"
          />

          <div>
            <label className="block text-sm font-semibold text-white/90 mb-2">
              Kurze Ergänzung (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Z.B. 'Ich laufe regelmäßig Halbmarathons und fotografiere gerne auf Reisen...'"
              rows={3}
              maxLength={200}
              className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 resize-none"
            />
            <p className="text-xs text-white/50 mt-1">
              {details.length}/200 Zeichen
            </p>
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
                updateCVData('hobbies', { hobbies: selected, details: details || undefined });
                nextStep();
              }}
              disabled={selected.length === 0}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-2xl hover:scale-105"
            >
              Weiter
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        <div className="lg:block hidden">
          <AvatarSidebar
            message="Hobbys geben Persönlichkeit und zeigen Cultural Fit."
            stepInfo="Wähle authentisch – das macht dich interessant."
          />
        </div>
      </div>
    );
  }

  function Step11_Completion() {
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
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
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
            onClick={() => {
              console.log('CVWizard: Navigating to job targeting with cvData');
              navigate('/job-targeting', { state: { cvData } });
            }}
            className="group px-16 py-6 rounded-3xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-2xl hover:opacity-90 transition-all flex items-center gap-4 shadow-2xl hover:scale-105 mx-auto"
          >
            Weiter zu deiner Wunschstelle
            <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
          </button>

          <p className="text-sm text-white/50">
            🔒 Deine Daten sind sicher und werden verschlüsselt gespeichert
          </p>
        </div>
      </div>
    );
  }

  function PlaceholderStep({ stepNumber, title, description }: { stepNumber: number; title: string; description: string }) {
    return (
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-10 animate-fade-in max-w-3xl mx-auto w-full">
          <ProgressBar currentStep={stepNumber} totalSteps={getTotalSteps()} />
          <div className="text-center space-y-6">
            <h1 className="text-5xl font-bold text-white">{title}</h1>
            <p className="text-xl text-white/70">{description}</p>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
              <p className="text-white/60">
                Dieser Step wird nach dem gleichen Pattern implementiert wie die anderen Steps.
                <br />Siehe CVWizard.tsx für das vollständige Pattern.
              </p>
            </div>
            <div className="flex gap-4 justify-center">
              <button onClick={prevStep} className="px-6 py-3 rounded-xl border border-white/10 text-white hover:bg-white/5 flex items-center gap-2">
                <ArrowLeft size={20} /> Zurück
              </button>
              <button onClick={nextStep} className="px-12 py-4 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold flex items-center gap-2">
                Weiter <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
        <div className="lg:block hidden">
          <AvatarSidebar message={`Step ${stepNumber}: ${title}`} stepInfo="Pattern für Implementierung verfügbar." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white py-12 px-4">
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
        `}
      </style>
      <div className="max-w-[1600px] mx-auto">
        {renderStep()}
      </div>
    </div>
  );
}

export default CVUploadCheck;
