import { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, X } from 'lucide-react';
import { AvatarSidebar } from './AvatarSidebar';
import { ProgressBar } from './ProgressBar';
import { HardSkill, Language } from '../../types/cvBuilder';
import { HARD_SKILLS_BY_INDUSTRY, COMMON_LANGUAGES } from '../../config/cvBuilderSteps';

interface HardSkillsStepProps {
  currentStep: number;
  totalSteps: number;
  targetIndustry: string;
  initialSkills?: HardSkill[];
  initialLanguages?: Language[];
  onNext: (skills: HardSkill[], languages: Language[]) => void;
  onPrev: () => void;
}

export function HardSkillsStep({
  currentStep,
  totalSteps,
  targetIndustry,
  initialSkills = [],
  initialLanguages = [],
  onNext,
  onPrev
}: HardSkillsStepProps) {
  const suggestedSkills = Array.isArray(HARD_SKILLS_BY_INDUSTRY[targetIndustry as keyof typeof HARD_SKILLS_BY_INDUSTRY])
    ? HARD_SKILLS_BY_INDUSTRY[targetIndustry as keyof typeof HARD_SKILLS_BY_INDUSTRY]
    : [];

  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    Array.isArray(initialSkills) ? initialSkills.map(s => s.skill) : []
  );
  const [customSkill, setCustomSkill] = useState('');
  const [customSkills, setCustomSkills] = useState<string[]>(
    Array.isArray(initialSkills)
      ? initialSkills.filter(s => !(suggestedSkills ?? []).includes(s.skill)).map(s => s.skill)
      : []
  );

  const [languages, setLanguages] = useState<Language[]>(initialLanguages);
  const [newLanguage, setNewLanguage] = useState({ name: '', level: 'basic' as const });
  const [isAddingLanguage, setIsAddingLanguage] = useState(false);
  const [selectedLanguageForLevel, setSelectedLanguageForLevel] = useState<string | null>(null);

  const languageLevels = [
    { value: 'basic', label: 'Grundkenntnisse' },
    { value: 'intermediate', label: 'Gute Kenntnisse' },
    { value: 'advanced', label: 'Sehr gute Kenntnisse' },
    { value: 'native', label: 'Muttersprache' }
  ];

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const addCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) return;

    if (selectedSkills.includes(trimmed) || customSkills.includes(trimmed)) {
      return;
    }

    setCustomSkills(prev => [...prev, trimmed]);
    setSelectedSkills(prev => [...prev, trimmed]);
    setCustomSkill('');
  };

  const removeCustomSkill = (skill: string) => {
    setCustomSkills(prev => prev.filter(s => s !== skill));
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  const addLanguage = () => {
    if (newLanguage.name.trim()) {
      setLanguages(prev => [...prev, { language: newLanguage.name.trim(), level: newLanguage.level }]);
      setNewLanguage({ name: '', level: 'basic' });
      setIsAddingLanguage(false);
    }
  };

  const selectLanguageWithLevel = (languageName: string, level: string) => {
    if (!languages.find(l => l.language === languageName)) {
      setLanguages(prev => [...prev, { language: languageName, level: level as any }]);
    }
    setSelectedLanguageForLevel(null);
  };

  const isLanguageSelected = (languageName: string) => {
    return languages.some(l => l.language === languageName);
  };

  const removeLanguage = (index: number) => {
    setLanguages(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    const allSkills: HardSkill[] = selectedSkills.map(skill => ({
      skill,
      category: customSkills.includes(skill) ? 'other' : 'tool'
    }));
    onNext(allSkills, languages);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomSkill();
    }
  };

  return (
    <div className="flex gap-8">
      <div className="flex-1 space-y-10 animate-fade-in">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent">
            Hard Skills & Sprachen
          </h2>
          <p className="text-xl text-gray-300">
            Wähle deine Skills aus und füge deine Sprachkenntnisse hinzu.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              {(suggestedSkills ?? []).length > 0
                ? `Vorgeschlagene Skills für ${targetIndustry === 'tech' ? 'Tech & IT' : 'deine Branche'}`
                : 'Hard Skills'}
            </h3>
            {(suggestedSkills ?? []).length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {(suggestedSkills ?? []).map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-5 py-3 rounded-xl border transition-all duration-200 hover:scale-105 ${
                      selectedSkills.includes(skill)
                        ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                        : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <p className="text-white/70 text-center">
                  Wir haben keine automatischen Vorschläge gefunden – bitte gib deine Skills manuell ein.
                </p>
              </div>
            )}
          </div>

          {customSkills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Deine eigenen Skills</h3>
              <div className="flex flex-wrap gap-3">
                {customSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`group px-5 py-3 rounded-xl border transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                      selectedSkills.includes(skill)
                        ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                        : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{skill}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomSkill(skill);
                      }}
                      className="ml-2 p-1 rounded-full hover:bg-red-500/20 transition-colors"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-white/10 pt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Eigenen Hard Skill hinzufügen</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Eigenen Hard Skill eingeben..."
                className="flex-1 px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
              />
              <button
                onClick={addCustomSkill}
                disabled={!customSkill.trim()}
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-xl"
              >
                <Plus size={20} />
                Hinzufügen
              </button>
            </div>
            <p className="text-sm text-white/50 mt-2">
              Drücke Enter oder klicke auf "Hinzufügen", um den Skill zur Liste hinzuzufügen.
            </p>
          </div>

          <div className="border-t border-white/10 pt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Sprachkenntnisse</h3>

            <div className="mb-6">
              <p className="text-sm text-white/60 mb-3">Häufige Sprachen</p>
              <div className="flex flex-wrap gap-3">
                {COMMON_LANGUAGES.map((lang) => {
                  const isSelected = isLanguageSelected(lang);
                  const isSelectingLevel = selectedLanguageForLevel === lang;

                  return (
                    <div key={lang} className="relative">
                      <button
                        onClick={() => {
                          if (isSelected) {
                            setLanguages(prev => prev.filter(l => l.language !== lang));
                          } else {
                            setSelectedLanguageForLevel(lang);
                          }
                        }}
                        className={`px-5 py-3 rounded-xl border transition-all duration-200 hover:scale-105 ${
                          isSelected
                            ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                            : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        {lang}
                      </button>

                      {isSelectingLevel && (
                        <div className="absolute top-full left-0 mt-2 bg-[#0a0f1e] border border-white/20 rounded-xl p-3 shadow-2xl z-50 min-w-[200px]">
                          <p className="text-xs text-white/60 mb-2">Niveau wählen:</p>
                          <div className="space-y-2">
                            {languageLevels.map((level) => (
                              <button
                                key={level.value}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  selectLanguageWithLevel(lang, level.value);
                                }}
                                className="w-full text-left px-3 py-2 rounded-lg text-sm text-white/90 hover:bg-[#66c0b6]/20 hover:text-white transition-all"
                              >
                                {level.label}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedLanguageForLevel(null);
                            }}
                            className="w-full mt-2 px-3 py-2 rounded-lg text-xs text-white/60 hover:bg-white/10 transition-all"
                          >
                            Abbrechen
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {languages.length > 0 && (
              <div className="space-y-3 mb-4">
                {languages.map((lang, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex-1">
                      <p className="text-white font-medium">{lang.language}</p>
                      <p className="text-white/60 text-sm">
                        {languageLevels.find(l => l.value === lang.level)?.label}
                      </p>
                    </div>
                    <button
                      onClick={() => removeLanguage(index)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <X size={18} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {!isAddingLanguage ? (
              <button
                onClick={() => setIsAddingLanguage(true)}
                className="w-full px-5 py-4 rounded-xl border border-dashed border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                <span>Weitere Sprache hinzufügen</span>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') addLanguage();
                    if (e.key === 'Escape') {
                      setIsAddingLanguage(false);
                      setNewLanguage({ name: '', level: 'basic' });
                    }
                  }}
                  placeholder="z.B. Englisch, Spanisch, Französisch..."
                  className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                  autoFocus
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {languageLevels.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setNewLanguage({ ...newLanguage, level: level.value as any })}
                      className={`px-4 py-3 rounded-xl border transition-all text-sm ${
                        newLanguage.level === level.value
                          ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addLanguage}
                    disabled={!newLanguage.name.trim()}
                    className="flex-1 px-5 py-3 rounded-xl bg-[#66c0b6] text-black font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Hinzufügen
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingLanguage(false);
                      setNewLanguage({ name: '', level: 'basic' });
                    }}
                    className="px-5 py-3 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-all"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✅</div>
              <div>
                <p className="text-white/90 font-medium">
                  {selectedSkills.length} Skills ausgewählt
                </p>
                <p className="text-sm text-white/60">
                  Wähle die Skills, die du wirklich beherrschst.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={onPrev}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white/70 hover:text-white"
            >
              <ArrowLeft size={18} />
              Zurück
            </button>
            <button
              onClick={handleContinue}
              disabled={selectedSkills.length === 0}
              className="px-12 py-4 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl"
            >
              Weiter
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </div>

      <AvatarSidebar
        message="Hard Skills und Sprachen sind wichtig für ATS-Systeme."
        stepInfo="Füge alle relevanten Skills und Sprachkenntnisse hinzu. Sprachen werden jetzt direkt hier erfasst."
      />
    </div>
  );
}
