import { useState } from 'react';
import { ArrowRight, ArrowLeft, Plus, X, Check } from 'lucide-react';
import { AvatarSidebar } from './AvatarSidebar';
import { ProgressBar } from './ProgressBar';
import { SoftSkill } from '../../types/cvBuilder';
import { SOFT_SKILLS, SOFT_SKILL_SITUATIONS } from '../../config/cvBuilderSteps';

interface SoftSkillsStepProps {
  currentStep: number;
  totalSteps: number;
  initialSkills?: SoftSkill[];
  onNext: (skills: SoftSkill[]) => void;
  onPrev: () => void;
}

export function SoftSkillsStep({
  currentStep,
  totalSteps,
  initialSkills = [],
  onNext,
  onPrev
}: SoftSkillsStepProps) {
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    initialSkills.map(s => s.skill) || []
  );
  const [skillDetails, setSkillDetails] = useState<Record<string, { situation: string; example?: string }>>(
    initialSkills.reduce((acc, s) => ({
      ...acc,
      [s.skill]: { situation: s.situation, example: s.example }
    }), {})
  );
  const [currentEditingSkill, setCurrentEditingSkill] = useState<string | null>(null);
  const [customSkill, setCustomSkill] = useState('');
  const [customSkills, setCustomSkills] = useState<string[]>(
    initialSkills.filter(s => !SOFT_SKILLS.find(ss => ss.value === s.skill)).map(s => s.skill) || []
  );

  const toggleSkill = (skillValue: string) => {
    if (selectedSkills.includes(skillValue)) {
      setSelectedSkills(prev => prev.filter(s => s !== skillValue));
      const newDetails = { ...skillDetails };
      delete newDetails[skillValue];
      setSkillDetails(newDetails);
    } else {
      setSelectedSkills(prev => [...prev, skillValue]);
      setCurrentEditingSkill(skillValue);
    }
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
    setCurrentEditingSkill(trimmed);
  };

  const removeCustomSkill = (skill: string) => {
    setCustomSkills(prev => prev.filter(s => s !== skill));
    setSelectedSkills(prev => prev.filter(s => s !== skill));
    const newDetails = { ...skillDetails };
    delete newDetails[skill];
    setSkillDetails(newDetails);
  };

  const saveSituation = (skill: string, situation: string, example?: string) => {
    setSkillDetails(prev => ({
      ...prev,
      [skill]: { situation, example }
    }));
    setCurrentEditingSkill(null);
  };

  const handleContinue = () => {
    const incompleteSkills = selectedSkills.filter(skill => !skillDetails[skill]?.situation);
    if (incompleteSkills.length > 0) {
      return;
    }

    const allSkills: SoftSkill[] = selectedSkills.map(skill => ({
      skill: getSkillLabel(skill),
      situation: skillDetails[skill].situation,
      example: skillDetails[skill].example
    }));
    onNext(allSkills);
  };

  const getSkillLabel = (skillValue: string): string => {
    const found = SOFT_SKILLS.find(s => s.value === skillValue);
    return found ? found.label : skillValue;
  };

  const getSkillIcon = (skillValue: string): string => {
    const found = SOFT_SKILLS.find(s => s.value === skillValue);
    return found ? found.icon : '✨';
  };

  const getSituationsForSkill = (skillValue: string): string[] => {
    return SOFT_SKILL_SITUATIONS[skillValue] || [
      'In Projekten',
      'Im Team',
      'Mit Kunden',
      'In Herausforderungen',
      'In der täglichen Arbeit'
    ];
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
            Welche Soft Skills zeichnen dich aus?
          </h2>
          <p className="text-xl text-gray-300">
            Wähle 6-12 Soft Skills und erkläre, wo du sie gezeigt hast.
          </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Wähle deine Soft Skills</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SOFT_SKILLS.map((skill) => {
                const isSelected = selectedSkills.includes(skill.value);
                const hasDetails = skillDetails[skill.value]?.situation;

                return (
                  <button
                    key={skill.value}
                    onClick={() => toggleSkill(skill.value)}
                    className={`relative p-5 rounded-2xl border transition-all duration-200 hover:scale-[1.02] text-left ${
                      isSelected
                        ? 'border-[#66c0b6] bg-[#66c0b6]/20 shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                        : 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{skill.icon}</span>
                      <span className="font-semibold text-white">{skill.label}</span>
                    </div>
                    {isSelected && hasDetails && (
                      <div className="absolute top-2 right-2">
                        <div className="w-6 h-6 rounded-full bg-[#66c0b6] flex items-center justify-center">
                          <Check size={14} className="text-black" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {customSkills.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Deine eigenen Soft Skills</h3>
              <div className="flex flex-wrap gap-3">
                {customSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  const hasDetails = skillDetails[skill]?.situation;

                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      className={`group px-5 py-3 rounded-xl border transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                        isSelected
                          ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                          : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <span>✨ {skill}</span>
                      {hasDetails && <Check size={14} className="text-[#66c0b6]" />}
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
                  );
                })}
              </div>
            </div>
          )}

          <div className="border-t border-white/10 pt-8">
            <h3 className="text-lg font-semibold text-white mb-4">Eigenen Soft Skill hinzufügen</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={customSkill}
                onChange={(e) => setCustomSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Eigenen Soft Skill eingeben..."
                className="flex-1 px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
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
          </div>

          {currentEditingSkill && (
            <SituationDialog
              skill={currentEditingSkill}
              skillLabel={getSkillLabel(currentEditingSkill)}
              skillIcon={getSkillIcon(currentEditingSkill)}
              situations={getSituationsForSkill(currentEditingSkill)}
              initialSituation={skillDetails[currentEditingSkill]?.situation}
              initialExample={skillDetails[currentEditingSkill]?.example}
              onSave={(situation, example) => saveSituation(currentEditingSkill, situation, example)}
              onCancel={() => {
                setCurrentEditingSkill(null);
                setSelectedSkills(prev => prev.filter(s => s !== currentEditingSkill));
              }}
            />
          )}

          {selectedSkills.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Deine ausgewählten Skills</h3>
              {selectedSkills.map(skill => {
                const details = skillDetails[skill];
                return (
                  <div
                    key={skill}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{getSkillIcon(skill)}</span>
                          <span className="font-semibold text-white">{getSkillLabel(skill)}</span>
                        </div>
                        {details?.situation && (
                          <div className="space-y-1">
                            <p className="text-sm text-white/70">
                              <span className="text-[#66c0b6] font-medium">Situation:</span> {details.situation}
                            </p>
                            {details.example && (
                              <p className="text-sm text-white/70">
                                <span className="text-[#66c0b6] font-medium">Beispiel:</span> {details.example}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => setCurrentEditingSkill(skill)}
                        className="px-3 py-1 text-sm rounded-lg border border-white/10 hover:bg-white/5 text-white/70 hover:text-white transition-all"
                      >
                        Bearbeiten
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

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
              disabled={selectedSkills.length === 0 || selectedSkills.some(s => !skillDetails[s]?.situation)}
              className="px-12 py-4 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl"
            >
              Weiter
              <ArrowRight size={22} />
            </button>
          </div>
        </div>
      </div>

      <AvatarSidebar
        message="Soft Skills sind nur glaubwürdig, wenn sie mit realen Beispielen belegt sind."
        stepInfo="Deshalb hilft uns dein kurzer Hintergrund, perfekte HR-Formulierungen zu erzeugen."
      />
    </div>
  );
}

interface SituationDialogProps {
  skill: string;
  skillLabel: string;
  skillIcon: string;
  situations: string[];
  initialSituation?: string;
  initialExample?: string;
  onSave: (situation: string, example?: string) => void;
  onCancel: () => void;
}

function SituationDialog({
  skill,
  skillLabel,
  skillIcon,
  situations,
  initialSituation,
  initialExample,
  onSave,
  onCancel
}: SituationDialogProps) {
  const [selectedSituation, setSelectedSituation] = useState(initialSituation || '');
  const [example, setExample] = useState(initialExample || '');

  const handleSave = () => {
    if (!selectedSituation) {
      return;
    }
    onSave(selectedSituation, example.trim() || undefined);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0a] border border-white/20 rounded-3xl p-8 max-w-2xl w-full shadow-2xl animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl">{skillIcon}</span>
          <h3 className="text-2xl font-bold text-white">{skillLabel}</h3>
        </div>

        <div className="space-y-6">
          <div>
            <h4 className="text-lg font-semibold text-white mb-3">
              In welcher Situation hast du diesen Soft Skill gezeigt?
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {situations.map((situation) => (
                <button
                  key={situation}
                  onClick={() => setSelectedSituation(situation)}
                  className={`px-4 py-3 rounded-xl border transition-all text-left ${
                    selectedSituation === situation
                      ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {situation}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Kurze Ergänzung (optional)
            </label>
            <textarea
              value={example}
              onChange={(e) => setExample(e.target.value)}
              placeholder="Z.B. 'Koordination eines dreiköpfigen Teams während eines Uniprojekts...'"
              rows={3}
              maxLength={200}
              className="w-full px-5 py-4 rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 resize-none"
            />
            <p className="text-xs text-white/50 mt-1">
              {example.length}/200 Zeichen
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-white/70 hover:text-white"
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedSituation}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
            >
              Speichern
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
