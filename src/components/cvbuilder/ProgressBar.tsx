import { Check } from 'lucide-react';

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const percentage = (current / total) * 100;

  return (
    <div className="w-full py-3 px-4">
      {/* Mobile-First: Kompakte Anzeige */}
      <div className="flex items-center justify-between gap-4">
        {/* Progress Text */}
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#66c0b6]/20 border border-[#66c0b6]">
            <span className="text-sm font-bold text-[#66c0b6]">{current}</span>
          </div>
          <span className="text-sm font-medium text-white/70">von {total}</span>
        </div>

        {/* Progress Bar */}
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Percentage - nur auf größeren Bildschirmen */}
        <span className="hidden sm:block text-sm font-bold text-[#66c0b6] min-w-[3rem] text-right">
          {Math.round(percentage)}%
        </span>
      </div>

      {/* Optional: Abgeschlossene Schritte Indikator für größere Bildschirme */}
      <div className="hidden lg:flex items-center gap-2 mt-3 flex-wrap">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`w-8 h-1 rounded-full transition-all ${
              index < current
                ? 'bg-[#66c0b6]'
                : index === current - 1
                ? 'bg-[#66c0b6]/50'
                : 'bg-white/10'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
