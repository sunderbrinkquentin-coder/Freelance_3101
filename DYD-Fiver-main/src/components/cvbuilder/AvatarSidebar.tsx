import { MessageCircle } from 'lucide-react';

interface AvatarSidebarProps {
  message: string;
  stepInfo?: string;
}

export function AvatarSidebar({ message, stepInfo }: AvatarSidebarProps) {
  return (
    <div className="hidden lg:block lg:w-72 xl:w-80 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-[#66c0b6]/30 to-[#30E3CA]/30 blur-3xl rounded-full"></div>

          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#66c0b6]/40 to-[#30E3CA]/40 blur-2xl rounded-full"></div>
                <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] flex items-center justify-center shadow-xl border-2 border-white/10">
                  <svg viewBox="0 0 100 100" className="w-16 h-16">
                    <circle cx="50" cy="35" r="18" fill="#0a0a0a" />
                    <ellipse cx="50" cy="70" rx="28" ry="32" fill="#0a0a0a" />
                    <circle cx="44" cy="32" r="3" fill="white" />
                    <circle cx="56" cy="32" r="3" fill="white" />
                    <path d="M 42 42 Q 50 46 58 42" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MessageCircle size={20} className="text-[#66c0b6] mt-1 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="text-base text-white/95 leading-relaxed font-medium">
                    {message}
                  </p>
                  {stepInfo && (
                    <p className="text-sm text-white/70 leading-relaxed">
                      {stepInfo}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-white/60">
                <div className="w-2 h-2 rounded-full bg-[#66c0b6] animate-pulse"></div>
                <span>Ich bin die ganze Zeit für dich da</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-xl">
          <h3 className="text-sm font-bold text-[#66c0b6] mb-3">💡 Tipp</h3>
          <p className="text-sm text-white/80 leading-relaxed">
            Du kannst jederzeit zurückgehen und deine Antworten ändern.
          </p>
        </div>
      </div>
    </div>
  );
}
