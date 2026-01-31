import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ProgressBar } from '../ProgressBar';
import { AvatarSidebar } from '../AvatarSidebar';
import { Hobbies } from '../../../types/cvBuilder';

interface HobbiesStepProps {
  currentStep: number;
  totalSteps: number;
  initialHobbies?: Hobbies;
  onNext: (hobbies: Hobbies) => void;
  onPrev: () => void;
}

export function HobbiesStep({ currentStep, totalSteps, initialHobbies, onNext, onPrev }: HobbiesStepProps) {
  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-10 animate-fade-in max-w-3xl mx-auto w-full">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-white">Hobbys & Interessen</h1>
          <p className="text-xl text-white/70">Step wird implementiert - siehe CVWizard.tsx Step10</p>
        </div>
        <div className="flex justify-between items-center pt-4">
          <button onClick={onPrev} className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all">
            <ArrowLeft size={20} /> Zurück
          </button>
          <button onClick={() => onNext(initialHobbies || { hobbies: [] })} className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3 shadow-2xl hover:scale-105">
            Weiter <ArrowRight size={24} />
          </button>
        </div>
      </div>
      <div className="lg:block hidden">
        <AvatarSidebar message="Hobbys geben Persönlichkeit" stepInfo="Zeigen Cultural Fit" />
      </div>
    </div>
  );
}
