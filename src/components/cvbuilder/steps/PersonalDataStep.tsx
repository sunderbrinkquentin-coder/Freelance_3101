import { WizardStepLayout } from '../WizardStepLayout';
import { PersonalData } from '../../../types/cvBuilder';

interface PersonalDataStepProps {
  data?: PersonalData;
  onChange: (data: PersonalData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function PersonalDataStep({
  data = {
    firstName: '',
    lastName: '',
    city: '',
    email: '',
    phone: ''
  },
  onChange,
  onNext,
  onBack
}: PersonalDataStepProps) {

  const isValid = data.firstName && data.lastName && data.city && data.email && data.phone;

  const handleNext = () => {
    if (isValid) {
      onNext();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto w-full px-4">
      <div className="flex-1 space-y-8 animate-fade-in">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-white">
            Wie können Recruiter dich erreichen?
          </h1>
          <p className="text-lg md:text-xl text-white/70 max-w-2xl mx-auto">
            Nur die wichtigsten Kontaktdaten – keine vollständige Adresse nötig.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                Vorname *
              </label>
              <input
                type="text"
                value={data.firstName || ''}
                onChange={(e) => onChange({ ...data, firstName: e.target.value })}
                placeholder="Max"
                className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all touch-manipulation"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                Nachname *
              </label>
              <input
                type="text"
                value={data.lastName || ''}
                onChange={(e) => onChange({ ...data, lastName: e.target.value })}
                placeholder="Mustermann"
                className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all touch-manipulation"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
              Stadt *
            </label>
            <input
              type="text"
              value={data.city || ''}
              onChange={(e) => onChange({ ...data, city: e.target.value })}
              placeholder="Berlin"
              className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all touch-manipulation"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                E-Mail *
              </label>
              <input
                type="email"
                value={data.email || ''}
                onChange={(e) => onChange({ ...data, email: e.target.value })}
                placeholder="max@example.com"
                className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all touch-manipulation"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                Telefon *
              </label>
              <input
                type="tel"
                value={data.phone || ''}
                onChange={(e) => onChange({ ...data, phone: e.target.value })}
                placeholder="+49 151 12345678"
                className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all touch-manipulation"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
              LinkedIn (optional)
            </label>
            <input
              type="url"
              value={data.linkedin || ''}
              onChange={(e) => onChange({ ...data, linkedin: e.target.value })}
              placeholder="linkedin.com/in/dein-profil"
              className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all touch-manipulation"
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
              onClick={handleNext}
              disabled={!isValid}
              className="px-12 py-4 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Weiter →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
