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
    zipCode: '',
    email: '',
    phone: '',
    linkedin: '',
    website: '',
    portfolio: ''
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
    <div className="min-h-screen w-full">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-3">
            Wie können Recruiter dich erreichen?
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto">
            Nur die wichtigsten Kontaktdaten – keine vollständige Adresse nötig
          </p>
        </div>

        {/* Form */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">

          {/* Name */}
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
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
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
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Ort & PLZ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                Stadt *
              </label>
              <input
                type="text"
                value={data.city || ''}
                onChange={(e) => onChange({ ...data, city: e.target.value })}
                placeholder="Berlin"
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                PLZ (optional)
              </label>
              <input
                type="text"
                value={data.zipCode || ''}
                onChange={(e) => onChange({ ...data, zipCode: e.target.value })}
                placeholder="10115"
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Kontakt */}
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
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
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
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Online-Profile */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                LinkedIn (optional)
              </label>
              <input
                type="url"
                value={data.linkedin || ''}
                onChange={(e) => onChange({ ...data, linkedin: e.target.value })}
                placeholder="linkedin.com/in/dein-profil"
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                Website (optional)
              </label>
              <input
                type="url"
                value={data.website || ''}
                onChange={(e) => onChange({ ...data, website: e.target.value })}
                placeholder="www.deine-website.de"
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
                Portfolio / GitHub (optional)
              </label>
              <input
                type="url"
                value={data.portfolio || ''}
                onChange={(e) => onChange({ ...data, portfolio: e.target.value })}
                placeholder="github.com/dein-username"
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all"
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-[#66c0b6]/10 border border-[#66c0b6]/30 rounded-xl p-4">
            <p className="text-sm text-white/80">
              💡 <strong>Tipp:</strong> Deine vollständige Adresse ist nicht nötig. Stadt und PLZ reichen für Bewerbungen aus und schützen deine Privatsphäre.
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
              onClick={handleNext}
              disabled={!isValid}
              className="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-base sm:text-lg hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Weiter →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
