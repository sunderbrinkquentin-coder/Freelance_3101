import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { ProfessionalEducation } from '../../../types/cvBuilder';

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
    { value: 'bootcamp', label: 'Bootcamp / Kurs' }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full px-4">
      <div className="flex-1 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Ausbildung / Studium
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Deine berufliche Ausbildung zeigt deine fachliche Basis.
          </p>
        </div>

        <div className="space-y-6">
          {data.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 text-center">
              <p className="text-white/70 mb-4">Noch keine Ausbildung hinzugefügt</p>
              <button
                onClick={addEducation}
                className="px-6 py-3 rounded-xl bg-[#66c0b6] text-black font-semibold hover:opacity-90 transition-all inline-flex items-center gap-2"
              >
                <Plus size={20} /> Ausbildung hinzufügen
              </button>
            </div>
          ) : (
            <>
              {data.map((edu, index) => (
                <div key={index} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 relative">
                  <button
                    onClick={() => removeEducation(index)}
                    className="absolute top-4 right-4 p-2 text-white/50 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <X size={20} />
                  </button>

                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                      Art
                    </label>
                    <select
                      value={edu.type || 'university'}
                      onChange={(e) => updateEducation(index, 'type', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                    >
                      {educationTypes.map((type) => (
                        <option key={type.value} value={type.value} className="bg-[#0a0a0a]">
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                      Institution / Unternehmen
                    </label>
                    <input
                      type="text"
                      value={edu.institution || ''}
                      onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                      placeholder="z.B. Technische Universität München"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                      Abschluss / Fachrichtung
                    </label>
                    <input
                      type="text"
                      value={edu.degree || ''}
                      onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                      placeholder="z.B. Bachelor of Science Informatik"
                      className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                        Von (Jahr)
                      </label>
                      <input
                        type="text"
                        value={edu.startYear || ''}
                        onChange={(e) => updateEducation(index, 'startYear', e.target.value)}
                        placeholder="2018"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                        Bis (Jahr)
                      </label>
                      <input
                        type="text"
                        value={edu.endYear || ''}
                        onChange={(e) => updateEducation(index, 'endYear', e.target.value)}
                        placeholder="2022"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addEducation}
                className="w-full px-6 py-4 rounded-2xl border-2 border-dashed border-white/20 text-white/70 hover:text-white hover:border-[#66c0b6] hover:bg-white/5 transition-all inline-flex items-center justify-center gap-2"
              >
                <Plus size={20} /> Weitere Ausbildung hinzufügen
              </button>
            </>
          )}

          <div className="flex justify-between items-center pt-4">
            <button
              onClick={onBack}
              className="px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              ← Zurück
            </button>
            <button
              onClick={onNext}
              className="px-12 py-4 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:opacity-90 transition-all"
            >
              Weiter →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
