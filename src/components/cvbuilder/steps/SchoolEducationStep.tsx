import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { WizardStepLayout } from '../WizardStepLayout';
import { SchoolEducation } from '../../../types/cvBuilder';

interface SchoolEducationStepProps {
  data?: SchoolEducation[];
  onChange: (data: SchoolEducation[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const SCHOOL_TYPES = [
  'Hauptschulabschluss',
  'Realschulabschluss / Mittlere Reife',
  'Fachhochschulreife (Fachabitur)',
  'Allgemeine Hochschulreife (Abitur)',
  'Sonstiges'
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => (CURRENT_YEAR - i).toString());

export function SchoolEducationStep({ data = [], onChange, onNext, onBack }: SchoolEducationStepProps) {
  const [entries, setEntries] = useState<SchoolEducation[]>(
    data.length > 0 ? data : [{
      type: '',
      school: '',
      graduation: '',
      year: '',
      startYear: '',
      endYear: '',
      location: '',
      focus: []
    }]
  );

  const updateEntry = (index: number, field: keyof SchoolEducation, value: any) => {
    const updated = [...entries];
    updated[index] = { ...updated[index], [field]: value };
    setEntries(updated);
    onChange(updated);
  };

  const addEntry = () => {
    const newEntry: SchoolEducation = {
      type: '',
      school: '',
      graduation: '',
      year: '',
      startYear: '',
      endYear: '',
      location: '',
      focus: []
    };
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    onChange(updatedEntries);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      const updated = entries.filter((_, i) => i !== index);
      setEntries(updated);
      onChange(updated);
    }
  };

  const updateFocus = (index: number, focusText: string) => {
    const focusArray = focusText.split(',').map(f => f.trim()).filter(f => f.length > 0);
    updateEntry(index, 'focus', focusArray);
  };

  const isValid = entries.every(e =>
    e.type && e.school && e.graduation && e.startYear && e.endYear
  );

  return (
    <WizardStepLayout
      title="Deine Schulbildung"
      subtitle="Füge deine schulischen Abschlüsse hinzu. Für Berufseinsteiger besonders wichtig."
      avatarMessage="Die Schulbildung zeigt deine Basis und ist für ATS-Systeme wichtig."
      avatarStepInfo="Gib mindestens deinen höchsten Abschluss an."
      currentStepId="schoolEducation"
      onPrev={onBack}
      onNext={onNext}
      isNextDisabled={!isValid}
      hideProgress
    >
      <div className="space-y-6">
        {entries.map((entry, index) => (
          <div
            key={index}
            className="relative p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4"
          >
            {entries.length > 1 && (
              <button
                onClick={() => removeEntry(index)}
                className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all"
                type="button"
              >
                <Trash2 size={18} />
              </button>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Schulabschluss *
                </label>
                <select
                  value={entry.type}
                  onChange={(e) => updateEntry(index, 'type', e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                >
                  <option value="">Bitte wählen</option>
                  {SCHOOL_TYPES.map((type) => (
                    <option key={type} value={type} className="bg-slate-900">
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Schule *
                  </label>
                  <input
                    type="text"
                    value={entry.school}
                    onChange={(e) => updateEntry(index, 'school', e.target.value)}
                    placeholder="z.B. Gymnasium Musterstadt"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Ort
                  </label>
                  <input
                    type="text"
                    value={entry.location || ''}
                    onChange={(e) => updateEntry(index, 'location', e.target.value)}
                    placeholder="z.B. München"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Abschlussbezeichnung *
                </label>
                <input
                  type="text"
                  value={entry.graduation}
                  onChange={(e) => updateEntry(index, 'graduation', e.target.value)}
                  placeholder="z.B. Abitur, Mittlere Reife"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Startjahr *
                  </label>
                  <select
                    value={entry.startYear || ''}
                    onChange={(e) => updateEntry(index, 'startYear', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                  >
                    <option value="">Bitte wählen</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year} className="bg-slate-900">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white/90 mb-2">
                    Endjahr *
                  </label>
                  <select
                    value={entry.endYear || ''}
                    onChange={(e) => updateEntry(index, 'endYear', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                  >
                    <option value="">Bitte wählen</option>
                    <option value="present" className="bg-slate-900">Aktuell</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year} className="bg-slate-900">
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Schwerpunkte (optional)
                </label>
                <input
                  type="text"
                  value={entry.focus?.join(', ') || ''}
                  onChange={(e) => updateFocus(index, e.target.value)}
                  placeholder="z.B. Mathematik, Naturwissenschaften (mit Komma trennen)"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                />
                <p className="text-xs text-white/50 mt-1">
                  Mehrere Schwerpunkte mit Komma trennen
                </p>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addEntry}
          className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 hover:border-[#66c0b6] hover:bg-white/5 text-white/70 hover:text-white transition-all flex items-center justify-center gap-2"
          type="button"
        >
          <Plus size={20} />
          Weitere Schulbildung hinzufügen
        </button>

        <div className="mt-6 p-4 rounded-xl bg-[#66c0b6]/10 border border-[#66c0b6]/30">
          <p className="text-sm text-[#66c0b6] font-medium mb-1">
            💡 Tipp: Gib deinen höchsten Schulabschluss an
          </p>
          <p className="text-xs text-[#66c0b6]/90">
            Weitere frühere Abschlüsse kannst du optional hinzufügen. Schwerpunkte sind besonders für Abitur relevant.
          </p>
        </div>
      </div>
    </WizardStepLayout>
  );
}
