import { SchoolEducation } from '../../../types/cvBuilder';

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
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full px-4">
      <div className="flex-1 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Schulische Ausbildung
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Deine schulische Laufbahn ist die Basis deiner Karriere.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
              Abschlussart
            </label>
            <select
              value={data.type || ''}
              onChange={(e) => onChange({ ...data, type: e.target.value })}
              className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
            >
              <option value="" className="bg-[#0a0a0a]">Bitte wählen...</option>
              {schoolTypes.map((type) => (
                <option key={type} value={type} className="bg-[#0a0a0a]">
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
              Schulname
            </label>
            <input
              type="text"
              value={data.school || ''}
              onChange={(e) => onChange({ ...data, school: e.target.value })}
              placeholder="z.B. Albert-Einstein-Gymnasium"
              className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
              Zeitraum
            </label>
            <input
              type="text"
              value={data.year || ''}
              onChange={(e) => onChange({ ...data, year: e.target.value })}
              placeholder="z.B. 2015 - 2021"
              className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
            />
          </div>

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
