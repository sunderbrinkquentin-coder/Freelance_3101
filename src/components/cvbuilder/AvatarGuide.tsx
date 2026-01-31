import { MessageCircle } from 'lucide-react';

interface AvatarGuideProps {
  message: string;
  position?: 'top-right' | 'bottom-right';
}

export function AvatarGuide({ message, position = 'top-right' }: AvatarGuideProps) {
  const positionClasses = position === 'top-right'
    ? 'top-24 right-6'
    : 'bottom-4 right-4';

  return (
    <div className={`fixed ${positionClasses} z-20 flex items-start gap-3 max-w-xs`}>
      <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-2xl">
        <div className="absolute -right-2 top-6 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[10px] border-l-white/20"></div>

        <div className="flex items-start gap-3">
          <MessageCircle size={18} className="text-[#66c0b6] mt-0.5 flex-shrink-0" />
          <p className="text-sm text-white/95 leading-relaxed font-medium">
            {message}
          </p>
        </div>
      </div>

      <div className="relative flex-shrink-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#66c0b6]/40 to-[#30E3CA]/40 blur-2xl rounded-full"></div>

        <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] flex items-center justify-center shadow-xl border-2 border-white/10">
          <svg viewBox="0 0 100 100" className="w-11 h-11">
            <circle cx="50" cy="35" r="18" fill="#0a0a0a" />
            <ellipse cx="50" cy="70" rx="28" ry="32" fill="#0a0a0a" />
            <circle cx="44" cy="32" r="3" fill="white" />
            <circle cx="56" cy="32" r="3" fill="white" />
            <path d="M 42 42 Q 50 46 58 42" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}
