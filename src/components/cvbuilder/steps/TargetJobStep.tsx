import { useState } from 'react';
import { Building2, Briefcase, MapPin, ArrowRight, ArrowLeft } from 'lucide-react';
import { ProgressBar } from '../ProgressBar';

interface TargetJob {
  company: string;
  position: string;
  location?: string;
  jobDescription?: string;
}

interface TargetJobStepProps {
  currentStep: number;
  totalSteps: number;
  initialData?: TargetJob;
  onNext: (data: TargetJob) => void;
  onPrev?: () => void;
}

export function TargetJobStep({
  currentStep,
  totalSteps,
  initialData,
  onNext,
  onPrev
}: TargetJobStepProps) {
  const [company, setCompany] = useState(initialData?.company || '');
  const [position, setPosition] = useState(initialData?.position || '');
  const [location, setLocation] = useState(initialData?.location || '');
  const [jobDescription, setJobDescription] = useState(initialData?.jobDescription || '');

  const handleNext = () => {
    if (company.trim() && position.trim()) {
      onNext({
        company: company.trim(),
        position: position.trim(),
        location: location.trim() || undefined,
        jobDescription: jobDescription.trim() || undefined,
      });
    }
  };

  const isValid = company.trim().length > 0 && position.trim().length > 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressBar current={currentStep} total={totalSteps} />

        <div className="mt-12 space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
              Deine Wunschstelle
            </h1>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Für welche Stelle möchtest du dich bewerben? Wir optimieren deinen CV perfekt darauf.
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 space-y-6">
            {/* Company */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-semibold text-white">
                <Building2 className="text-[#66c0b6]" size={24} />
                Unternehmen *
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="z.B. Google, BMW, McKinsey..."
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] transition-colors text-lg"
              />
            </div>

            {/* Position */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-semibold text-white">
                <Briefcase className="text-[#66c0b6]" size={24} />
                Position / Jobtitel *
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="z.B. Junior Product Manager, Software Engineer..."
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] transition-colors text-lg"
              />
            </div>

            {/* Location (Optional) */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-lg font-semibold text-white">
                <MapPin className="text-[#66c0b6]" size={24} />
                Standort <span className="text-white/50 font-normal text-base">(optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="z.B. Berlin, München, Remote..."
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] transition-colors text-lg"
              />
            </div>

            {/* Job Description (Optional) */}
            <div className="space-y-3">
              <label className="text-lg font-semibold text-white block">
                Stellenbeschreibung <span className="text-white/50 font-normal text-base">(optional)</span>
              </label>
              <p className="text-sm text-white/60">
                Falls vorhanden, kopiere hier die Anforderungen aus der Stellenanzeige. Das hilft uns, deinen CV noch besser anzupassen.
              </p>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="z.B. Anforderungen: 3+ Jahre Erfahrung in..."
                rows={6}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] transition-colors text-base resize-none"
              />
            </div>

            {/* Info Box */}
            <div className="bg-[#66c0b6]/10 border border-[#66c0b6]/30 rounded-xl p-6">
              <p className="text-white/90 text-sm leading-relaxed">
                💡 <strong>Tipp:</strong> Je mehr Details du uns gibst, desto besser können wir deinen CV auf diese spezifische Stelle abstimmen. Die Stellenbeschreibung hilft uns besonders, die richtigen Keywords und Formulierungen zu verwenden.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            {onPrev && (
              <button
                onClick={onPrev}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                Zurück
              </button>
            )}

            <button
              onClick={handleNext}
              disabled={!isValid}
              className={`flex-1 px-8 py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                isValid
                  ? 'bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black hover:shadow-lg hover:shadow-[#66c0b6]/20 hover:scale-[1.02]'
                  : 'bg-white/5 text-white/40 cursor-not-allowed'
              }`}
            >
              Wunschstelle speichern & CV generieren
              <ArrowRight size={20} />
            </button>
          </div>

          {!isValid && (
            <p className="text-center text-white/50 text-sm">
              Bitte fülle mindestens Unternehmen und Position aus
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
