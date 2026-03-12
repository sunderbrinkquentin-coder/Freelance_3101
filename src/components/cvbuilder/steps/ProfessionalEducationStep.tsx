import { Plus, X } from 'lucide-react';
import { ProfessionalEducation } from '../../../types/cvBuilder';
import { ChipsInput } from '../ChipsInput';

interface ProfessionalEducationStepProps {
  data?: ProfessionalEducation[];
  onChange: (data: ProfessionalEducation[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ProfessionalEducationStep({
  data = [],
  onChange,
  onNext,
  onBack
}: ProfessionalEducationStepProps) {

  const addEducation = () => {
    const newEducation: ProfessionalEducation = {
      type: 'university',
      institution: '',
      degree: '',
      startYear: '',
      endYear: '',
      focus: [],
      projects: [],
      grades: ''
    };
    onChange([...data, newEducation]);
  };

  const removeEducation = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof ProfessionalEducation, value: any) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const educationTypes = [
    { value: 'apprenticeship', label: 'Ausbildung' },
    { value: 'university', label: 'Studium' },
    { value: 'bootcamp', label: 'Bootcamp / Weiterbildung' }
  ];

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Ausbildung / Studium
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Deine berufliche Ausbildung zeigt Recruitern deine fachliche Qualifikation
          </p>
        </div>

        <div className="space-y-5 sm:space-y-6">
          {/* Empty State */}
          {data.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-center">
              <p className="text-white/70 mb-4">
                Noch keine Ausbildung hinzugefügt
              </p>
              <button
                onClick={addEducation}
                className="px-6 py-3 rounded-xl bg-[#66c0b6] text-black font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <Plus size={20} /> Erste Ausbildung hinzufügen
              </button>
            </div>
          ) : (
            <>
              {/* Education Entries */}
              {data.map((edu, index) => (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6 relative"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeEducation(index)}
                    className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all z-10"
                    title="Entfernen"
                  >
                    <X size={20} />
                  </button>

                  {/* Art der Ausbildung */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                      Art der Ausbildung *
                    </label>
                    <select
                      value={edu.type || 'university'}
                      onChange={(e) => updateEducation(index, 'type', e.target.value)}
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                    >
                      {educationTypes.map((type) => (
                        <option key={type.value} value={type.value} className="bg-[#0a0a0a]">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Institution */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                      Institution / Unternehmen *
                    </label>
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      placeholder="z.B. Technische Universität München"
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                    />
                  </div>

                  {/* Abschluss / Fachrichtung */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                      Abschluss / Fachrichtung *
                    </label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="z.B. Bachelor of Science Informatik"
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                    />
                  </div>

                  {/* Zeitraum */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                        Von (Jahr) *
                      </label>
                      <input
                        type="text"
                        value={edu.startYear || ''}
                        onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                        placeholder="2018"
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                        Bis (Jahr) *
                      </label>
                      <input
                        type="text"
                        value={edu.endYear || ''}
                        onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                        placeholder="2022"
                        className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>

                  {/* Note / Durchschnitt */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                      Note / Durchschnitt (optional)
                    </label>
                    <input
                      type="text"
                      value={edu.grades || ''}
                      onChange={(e) => updateEducation(index, 'grades', e.target.value)}
                      placeholder="z.B. 1,5 oder Sehr gut"
                      className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                    />
                  </div>

                  {/* Schwerpunkte */}
                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                      Schwerpunkte / Module (optional)
                    </label>
                    <ChipsInput
                      values={edu.focus || []}
                      onChange={(focus) => updateEducation(index, 'focus', focus)}
                      placeholder="z.B. Machine Learning, Datenbanken..."
                    />
                    <p className="text-xs text-white/50 mt-2">
                      Drücke Enter nach jeder Eingabe
                    </p>
                  </div>
                </div>
              ))}

              {/* Add More Button */}
              <button
                onClick={addEducation}
                className="w-full px-6 py-4 rounded-2xl border-2 border-dashed border-white/20 text-white/70 hover:text-white hover:border-[#66c0b6] hover:bg-white/5 transition-all inline-flex items-center justify-center gap-2 font-medium"
              >
                <Plus size={20} /> Weitere Ausbildung hinzufügen
              </button>
            </>
          )}

          {/* Navigation Buttons */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
            <button
              onClick={onBack}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all border border-white/10"
            >
              ← Zurück
            </button>
            <button
              onClick={onNext}
              className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-base sm:text-lg hover:opacity-90 transition-all"
            >
              Weiter →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
