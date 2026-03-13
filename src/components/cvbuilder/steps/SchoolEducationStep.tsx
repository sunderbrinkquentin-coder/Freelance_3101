import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { WizardStepLayout } from '../WizardStepLayout';
import { SchoolEducation } from '../../../types/cvBuilder';

interface SchoolEducationStepProps {
  data?: SchoolEducation;
  onChange: (data: SchoolEducation) => void;
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

export function SchoolEducationStep({ data, onChange, onNext, onBack }: SchoolEducationStepProps) {
  const [entry, setEntry] = useState<SchoolEducation>(
    data || {
      type: '',
      school: '',
      graduation: '',
      year: '',
      focus: [],
      projects: []
    }
  );

  const updateField = (field: keyof SchoolEducation, value: any) => {
    const updated = { ...entry, [field]: value };
    setEntry(updated);
    onChange(updated);
  };

  const isValid = entry.type && entry.school && entry.graduation && entry.year;

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
        <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Schulabschluss *
              </label>
              <select
                value={entry.type}
                onChange={(e) => updateField('type', e.target.value)}
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

            <div>
              <label className="block text-sm font-semibold text-white/90 mb-2">
                Schule *
              </label>
              <input
                type="text"
                value={entry.school}
                onChange={(e) => updateField('school', e.target.value)}
                placeholder="z.B. Gymnasium Musterstadt"
                className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Abschluss *
                </label>
                <input
                  type="text"
                  value={entry.graduation}
                  onChange={(e) => updateField('graduation', e.target.value)}
                  placeholder="z.B. Abitur"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/90 mb-2">
                  Zeitraum *
                </label>
                <input
                  type="text"
                  value={entry.year}
                  onChange={(e) => updateField('year', e.target.value)}
                  placeholder="z.B. 2015-2018"
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-[#66c0b6]/10 border border-[#66c0b6]/30">
          <p className="text-sm text-[#66c0b6] font-medium">
            💡 Tipp: Gib deinen höchsten Schulabschluss an. Bei Bedarf kannst du weitere Details später hinzufügen.
          </p>
        </div>
      </div>
    </WizardStepLayout>
  );
}
