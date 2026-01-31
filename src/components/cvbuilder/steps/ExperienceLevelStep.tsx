import { Check, ArrowRight } from 'lucide-react';
import { ExperienceLevel } from '../../../types/cvBuilder';
import { AvatarSidebar } from '../AvatarSidebar';

interface ExperienceLevelStepProps {
  currentStep: number;
  totalSteps: number;
  initialLevel?: ExperienceLevel;
  onNext: (level: ExperienceLevel) => void;
}

export function ExperienceLevelStep({
  currentStep,
  totalSteps,
  onNext
}: ExperienceLevelStepProps) {
  const options = [
    {
      id: 'beginner' as ExperienceLevel,
      title: 'Ich stehe am Anfang meiner Karriere',
      description: 'Schüler, Studierende, Absolventen ohne Berufserfahrung',
      benefit: '✨ Wir fokussieren auf Ausbildung & Projekte'
    },
    {
      id: 'some-experience' as ExperienceLevel,
      title: 'Ich habe erste praktische Erfahrungen gesammelt',
      description: 'Praktika, Werkstudententätigkeit, Nebenjobs (0–3 Jahre)',
      benefit: '🚀 Wir heben deine Erfahrungen optimal hervor'
    },
    {
      id: 'experienced' as ExperienceLevel,
      title: 'Ich bringe relevante Berufserfahrung mit',
      description: '3–10+ Jahre Erfahrung in meinem Bereich',
      benefit: '💼 Wir machen deine Erfolge messbar & konkret'
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
      <div className="flex-1 space-y-8 lg:space-y-10 animate-fade-in px-4 sm:px-0">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-block px-4 py-2 rounded-full bg-[#66c0b6]/10 border border-[#66c0b6]/30 text-[#66c0b6] text-sm font-semibold mb-4">
            Schritt {currentStep} von {totalSteps}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 lg:mb-6 bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight px-2">
            Wo stehst du gerade in deiner Karriere?
          </h1>
          <p className="text-lg sm:text-xl text-white/70 leading-relaxed px-2">
            Wir passen alle Fragen individuell an deine Situation an.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onNext(option.id)}
              className="group relative rounded-2xl sm:rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8 hover:bg-white/10 hover:border-[#66c0b6]/40 transition-all duration-300 shadow-2xl hover:shadow-[0_0_60px_rgba(102,192,182,0.4)] cursor-pointer text-left hover:scale-[1.02]"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#66c0b6]/20 to-[#30E3CA]/20 flex items-center justify-center border border-[#66c0b6]/30 group-hover:scale-110 transition-transform flex-shrink-0">
                  <Check size={28} className="text-[#66c0b6] sm:w-8 sm:h-8" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-[#66c0b6] transition-colors">
                    {option.title}
                  </h3>
                  <p className="text-sm sm:text-base text-white/60 mb-3">
                    {option.description}
                  </p>
                  <p className="text-sm text-[#66c0b6] font-medium">
                    {option.benefit}
                  </p>
                </div>

                <ArrowRight size={28} className="text-[#66c0b6] group-hover:translate-x-2 transition-transform flex-shrink-0 hidden sm:block sm:w-8 sm:h-8" />
              </div>
            </button>
          ))}
        </div>

        <div className="text-center px-4">
          <p className="text-xs sm:text-sm text-white/50">
            💡 Deine Antworten bleiben bei dir und werden nicht an Dritte weitergegeben
          </p>
        </div>
      </div>

      <div className="lg:block hidden">
        <AvatarSidebar
          message="Deine Antwort hilft uns, die perfekten Fragen und Empfehlungen für deinen CV zu geben."
          stepInfo="Jeder Karriereweg ist einzigartig – wir passen uns deiner Situation an."
        />
      </div>
    </div>
  );
}
