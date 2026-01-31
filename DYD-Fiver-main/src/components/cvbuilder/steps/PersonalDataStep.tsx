import { useState } from 'react';
import { WizardStepLayout } from '../WizardStepLayout';
import { PersonalData } from '../../../types/cvBuilder';

interface PersonalDataStepProps {
  currentStep: number;
  totalSteps: number;
  initialData?: PersonalData;
  onNext: (data: PersonalData) => void;
  onPrev?: () => void;
}

export function PersonalDataStep({
  currentStep,
  totalSteps,
  initialData,
  onNext,
  onPrev
}: PersonalDataStepProps) {
  const [data, setData] = useState<PersonalData>(initialData || {
    firstName: '',
    lastName: '',
    city: '',
    email: '',
    phone: ''
  });

  const isValid = data.firstName && data.lastName && data.city && data.email && data.phone;

  return (
    <WizardStepLayout
      currentStep={currentStep}
      totalSteps={totalSteps}
      title="Wie können Recruiter dich erreichen?"
      subtitle="Nur die wichtigsten Kontaktdaten – keine vollständige Adresse nötig."
      avatarMessage="Recruiter möchten dich schnell kontaktieren können."
      avatarStepInfo="Datenschutz ist wichtig – vollständige Adresse ist nicht nötig, Stadt reicht aus."
      onPrev={onPrev}
      onNext={() => onNext(data)}
      isNextDisabled={!isValid}
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm sm:text-base font-semibold text-white/90 mb-2">
              Vorname *
            </label>
            <input
              type="text"
              value={data.firstName || ''}
              onChange={(e) => setData({ ...data, firstName: e.target.value })}
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
              onChange={(e) => setData({ ...data, lastName: e.target.value })}
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
            onChange={(e) => setData({ ...data, city: e.target.value })}
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
              onChange={(e) => setData({ ...data, email: e.target.value })}
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
              onChange={(e) => setData({ ...data, phone: e.target.value })}
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
            onChange={(e) => setData({ ...data, linkedin: e.target.value })}
            placeholder="linkedin.com/in/dein-profil"
            className="w-full px-4 py-3.5 sm:px-5 sm:py-4 rounded-xl border-2 border-white/10 bg-white/5 text-white text-base sm:text-lg placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:bg-white/10 transition-all touch-manipulation"
          />
        </div>
      </div>
    </WizardStepLayout>
  );
}
