import { SchoolEducation } from '../../../types/cvBuilder';
import { SimpleChipsInput } from '../SimpleChipsInput';

interface SchoolEducationStepProps {
  data?: SchoolEducation;
  onChange: (data: SchoolEducation) => void;
  onNext: () => void;
  onBack: () => void;
}

export function SchoolEducationStep({
  data = {
    type: '',
    school: '',
    graduation: '',
    year: '',
    focus: [],
    projects: []
  },
  onChange,
  onNext,
  onBack
}: SchoolEducationStepProps) {

  const schoolTypes = [
    'Hauptschulabschluss',
    'Mittlere Reife / Realschulabschluss',
    'Fachhochschulreife / Fachabitur',
    'Allgemeine Hochschulreife / Abitur',
    'Ohne Abschluss'
  ];

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

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

          {/* Abschlussart */}
          <div>
            <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
              Abschlussart *
            </label>
            <select
              value={data.type || ''}
              onChange={(e) => onChange({ ...data, type: e.target.value })}
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
              value={data.school || ''}
              onChange={(e) => onChange({ ...data, school: e.target.value })}
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
              value={data.graduation || ''}
              onChange={(e) => onChange({ ...data, graduation: e.target.value })}
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
              value={data.year || ''}
              onChange={(e) => onChange({ ...data, year: e.target.value })}
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
              values={data.focus || []}
              onChange={(focus) => onChange({ ...data, focus })}
              placeholder="z.B. Mathematik, Physik, Informatik..."
            />
            <p className="text-xs text-white/50 mt-2">
              Drücke Enter nach jeder Eingabe
            </p>
          </div>

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
