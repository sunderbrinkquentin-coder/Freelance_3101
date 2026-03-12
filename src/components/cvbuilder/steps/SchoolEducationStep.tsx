import { useState } from 'react';
import { Plus, Trash2, ArrowLeft, ArrowRight } from 'lucide-react';
import { SchoolEducation } from '../../../types/cvBuilder';
import { SimpleChipsInput } from '../SimpleChipsInput';

interface SchoolEducationStepProps {
  data?: SchoolEducation[];
  onChange: (data: SchoolEducation[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const EMPTY_SCHOOL: SchoolEducation = {
  type: '',
  school: '',
  graduation: '',
  year: '',
  focus: [],
  projects: []
};

export function SchoolEducationStep({
  data = [],
  onChange,
  onNext,
  onBack
}: SchoolEducationStepProps) {
  const schools = data.length > 0 ? data : [EMPTY_SCHOOL];

  const schoolTypes = [
    'Hauptschulabschluss',
    'Mittlere Reife / Realschulabschluss',
    'Fachhochschulreife / Fachabitur',
    'Allgemeine Hochschulreife / Abitur',
    'Ohne Abschluss'
  ];

  const updateSchool = (index: number, updates: Partial<SchoolEducation>) => {
    const newSchools = [...schools];
    newSchools[index] = { ...newSchools[index], ...updates };
    onChange(newSchools);
  };

  const addSchool = () => {
    onChange([...schools, EMPTY_SCHOOL]);
  };

  const removeSchool = (index: number) => {
    if (schools.length === 1) return;
    const newSchools = schools.filter((_, i) => i !== index);
    onChange(newSchools);
  };

  const canContinue = schools.some(s => s.type && s.school && s.year);

  return (
    <div className="min-h-screen w-full">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Schulische Ausbildung
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Deine schulische Laufbahn bildet die Grundlage deiner Karriere
          </p>
        </div>

        {/* Schools List */}
        <div className="space-y-6">
          {schools.map((school, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6"
            >
              {/* Header with Delete Button */}
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {index === 0 ? 'Schulische Ausbildung' : `Weitere Ausbildung ${index + 1}`}
                </h3>
                {schools.length > 1 && (
                  <button
                    onClick={() => removeSchool(index)}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>

              {/* Abschlussart */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                  Abschlussart *
                </label>
                <select
                  value={school.type || ''}
                  onChange={(e) => updateSchool(index, { type: e.target.value })}
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                >
                  <option value="" className="bg-[#0a0a0a]">Bitte wählen...</option>
                  {schoolTypes.map((type) => (
                    <option key={type} value={type} className="bg-[#0a0a0a]">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Schulname */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                  Name der Schule *
                </label>
                <input
                  type="text"
                  value={school.school || ''}
                  onChange={(e) => updateSchool(index, { school: e.target.value })}
                  placeholder="z.B. Albert-Einstein-Gymnasium"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                />
              </div>

              {/* Abschluss */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                  Abschluss (optional)
                </label>
                <input
                  type="text"
                  value={school.graduation || ''}
                  onChange={(e) => updateSchool(index, { graduation: e.target.value })}
                  placeholder="z.B. Abitur mit Durchschnitt 1,8"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                />
              </div>

              {/* Zeitraum */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                  Zeitraum *
                </label>
                <input
                  type="text"
                  value={school.year || ''}
                  onChange={(e) => updateSchool(index, { year: e.target.value })}
                  placeholder="z.B. 2015 - 2021"
                  className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                />
              </div>

              {/* Schwerpunkte/Leistungskurse */}
              <div>
                <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                  Schwerpunkte / Leistungskurse (optional)
                </label>
                <SimpleChipsInput
                  values={school.focus || []}
                  onChange={(focus) => updateSchool(index, { focus })}
                  placeholder="z.B. Mathematik, Physik, Informatik..."
                />
                <p className="text-xs text-white/50 mt-2">
                  Drücke Enter nach jeder Eingabe
                </p>
              </div>
            </div>
          ))}

          {/* Add School Button */}
          <button
            onClick={addSchool}
            className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 text-white/70 hover:text-white hover:border-[#66c0b6] hover:bg-white/5 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Weitere schulische Ausbildung hinzufügen
          </button>
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all border border-white/10 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Zurück
          </button>
          <button
            onClick={onNext}
            disabled={!canContinue}
            className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-base sm:text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Weiter
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
