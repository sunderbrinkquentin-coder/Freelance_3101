import { useState, useEffect } from 'react';
import { ArrowRight, FileText, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HeroSectionProps {
  onStartWizard: () => void;
}

export default function HeroSection({ onStartWizard }: HeroSectionProps) {
  const navigate = useNavigate();
  const [isTransformed, setIsTransformed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsTransformed(true);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  const handleCTAClick = () => {
    if (!isTransformed) {
      setIsTransformed(true);
    }
    setTimeout(() => {
      onStartWizard();
    }, 300);
  };

  const negativeWords = [
    { text: 'Absagen', position: 'top-[15%] left-[10%]', delay: '0s', duration: '20s' },
    { text: 'Frust', position: 'top-[25%] right-[15%]', delay: '2s', duration: '25s' },
    { text: 'Zeitaufwand', position: 'top-[40%] left-[8%]', delay: '1s', duration: '22s' },
    { text: 'Unsicherheit', position: 'top-[60%] right-[12%]', delay: '3s', duration: '28s' },
    { text: 'Kopfzerbrechen', position: 'top-[70%] left-[15%]', delay: '1.5s', duration: '24s' },
    { text: 'Selbstzweifel', position: 'top-[35%] right-[8%]', delay: '2.5s', duration: '26s' },
    { text: 'Ablehnung', position: 'top-[80%] right-[20%]', delay: '0.5s', duration: '23s' },
  ];

  const positiveWords = [
    { text: 'Einladungen', position: 'top-[15%] left-[10%]', delay: '0s', duration: '20s' },
    { text: 'Klarheit', position: 'top-[25%] right-[15%]', delay: '2s', duration: '25s' },
    { text: 'Zeitersparnis', position: 'top-[40%] left-[8%]', delay: '1s', duration: '22s' },
    { text: 'Selbstbewusstsein', position: 'top-[60%] right-[12%]', delay: '3s', duration: '28s' },
    { text: 'Mehr Chancen', position: 'top-[70%] left-[15%]', delay: '1.5s', duration: '24s' },
    { text: 'Erfolg', position: 'top-[35%] right-[8%]', delay: '2.5s', duration: '26s' },
    { text: 'Zuversicht', position: 'top-[80%] right-[20%]', delay: '0.5s', duration: '23s' },
  ];

  return (
    <section className="relative min-h-screen w-full flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-20 overflow-hidden">
      {/* Animated Grid Background */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(48, 227, 202, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(48, 227, 202, 0.1) 1px, transparent 1px)',
          backgroundSize: '100px 100px'
        }}></div>
      </div>

      {/* Flying Words Container */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {/* DYD Energy Wave */}
        {isTransformed && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="energy-wave"></div>
          </div>
        )}

        {/* Negative Words */}
        {negativeWords.map((word, index) => (
          <span
            key={`negative-${index}`}
            className={`floating-word negative absolute text-2xl md:text-3xl font-bold text-red-500/40 ${word.position} ${
              isTransformed ? 'fade-out-word' : ''
            }`}
            style={{
              animationDelay: word.delay,
              animationDuration: word.duration,
            }}
          >
            {word.text}
          </span>
        ))}

        {/* Positive Words */}
        {isTransformed && positiveWords.map((word, index) => (
          <span
            key={`positive-${index}`}
            className={`floating-word positive absolute text-2xl md:text-3xl font-bold text-[#30E3CA]/60 ${word.position}`}
            style={{
              animationDelay: word.delay,
              animationDuration: word.duration,
            }}
          >
            {word.text}
          </span>
        ))}
      </div>

      {/* Main Content */}
      <div className="w-full text-center max-w-5xl mx-auto relative z-10">
        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.1] tracking-tight">
          Mehr Einladungen.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30E3CA] to-[#38f6d1]">
            Weniger Frust.
          </span>
          <br />
          Dein smarter CV-Optimizer.
        </h1>

        {/* Subheadline */}
        <p className="text-xl sm:text-2xl md:text-3xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
          Lass deinen Lebenslauf automatisch prüfen, verbessern und ATS-konform optimieren.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
          <button
            onClick={handleCTAClick}
            className="group px-8 py-4 bg-gradient-to-r from-[#30E3CA] to-[#38f6d1] hover:shadow-[0_0_40px_rgba(48,227,202,0.6)] rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 w-full sm:w-auto"
          >
            CV prüfen
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => document.getElementById('process')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
          >
            Beispiele ansehen
          </button>
        </div>

        {/* Two Options: Create vs Check */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Option 1: CV neu erstellen */}
          <div
            onClick={() => navigate('/cv-wizard?mode=new')}
            className="group relative cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 hover:border-[#30E3CA]/50 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#30E3CA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
              <div className="mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br from-[#30E3CA]/20 to-[#38f6d1]/20 group-hover:scale-110 transition-transform">
                <Sparkles size={32} className="text-[#30E3CA]" />
              </div>

              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#30E3CA] transition-colors">
                CV neu erstellen
              </h3>

              <p className="text-gray-400 mb-4 leading-relaxed">
                Erstelle Schritt für Schritt einen professionellen Lebenslauf mit unserem intelligenten Wizard.
              </p>

              <div className="flex items-center gap-2 text-sm text-[#30E3CA] font-semibold">
                <span>Jetzt starten</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Option 2: CV prüfen & analysieren */}
          <div
            onClick={() => navigate('/cv-check')}
            className="group relative cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 hover:border-[#30E3CA]/50 hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#30E3CA]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
              <div className="mb-4 inline-flex p-3 rounded-xl bg-gradient-to-br from-[#30E3CA]/20 to-[#38f6d1]/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={32} className="text-[#30E3CA]" />
              </div>

              <h3 className="text-2xl font-bold mb-3 group-hover:text-[#30E3CA] transition-colors">
                CV prüfen & analysieren
              </h3>

              <p className="text-gray-400 mb-4 leading-relaxed">
                Lade deinen bestehenden CV hoch und erhalte eine detaillierte Analyse mit Verbesserungspotenzial.
              </p>

              <div className="flex items-center gap-2 text-sm text-[#30E3CA] font-semibold">
                <span>CV hochladen</span>
                <Upload size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 mt-12">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#30E3CA] rounded-full"></div>
            <span>Keine Anmeldung nötig</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#30E3CA] rounded-full"></div>
            <span>100% DSGVO-konform</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#30E3CA] rounded-full"></div>
            <span>Ergebnis in Sekunden</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          25% {
            transform: translate(20px, -15px) rotate(2deg);
          }
          50% {
            transform: translate(-15px, -30px) rotate(-2deg);
          }
          75% {
            transform: translate(-25px, -10px) rotate(1deg);
          }
        }

        @keyframes fadeOut {
          0% {
            opacity: 0.4;
            transform: scale(1);
          }
          100% {
            opacity: 0;
            transform: scale(0.5) translateY(-50px);
          }
        }

        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: scale(0.5) translateY(50px);
          }
          100% {
            opacity: 0.6;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes energyWave {
          0% {
            width: 0;
            height: 0;
            opacity: 0.8;
          }
          50% {
            opacity: 0.4;
          }
          100% {
            width: 2000px;
            height: 2000px;
            opacity: 0;
          }
        }

        .floating-word {
          animation: float infinite alternate ease-in-out;
          user-select: none;
          will-change: transform;
        }

        .floating-word.negative {
          opacity: 0.4;
        }

        .floating-word.positive {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards, float infinite alternate ease-in-out;
        }

        .fade-out-word {
          animation: fadeOut 1s ease-out forwards !important;
        }

        .energy-wave {
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(48, 227, 202, 0.3) 0%, rgba(48, 227, 202, 0.1) 50%, transparent 70%);
          animation: energyWave 1.5s ease-out forwards;
          pointer-events: none;
        }

        @media (max-width: 768px) {
          .floating-word {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
}
