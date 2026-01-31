import { Brain, Shield, Zap, Target, Clock, TrendingUp } from 'lucide-react';

export default function USPSection() {
  const usps = [
    {
      icon: Brain,
      title: 'KI-gestütztes Scoring',
      description: 'Dein CV wird durch modernste KI analysiert und bewertet',
      gradient: 'from-[#30E3CA] to-[#38f6d1]'
    },
    {
      icon: Shield,
      title: 'ATS-Optimierung',
      description: 'Automatische Anpassung für Bewerbermanagementsysteme',
      gradient: 'from-blue-400 to-cyan-400'
    },
    {
      icon: Target,
      title: 'Job-Match-Analyse',
      description: 'Finde heraus, wie gut dein CV zu deiner Zielposition passt',
      gradient: 'from-purple-400 to-pink-400'
    },
    {
      icon: Zap,
      title: 'Ergebnisse in Sekunden',
      description: 'Sofortige Analyse ohne lange Wartezeiten',
      gradient: 'from-yellow-400 to-orange-400'
    },
    {
      icon: Clock,
      title: 'DSGVO-konform',
      description: 'Deine Daten bleiben sicher und geschützt',
      gradient: 'from-green-400 to-emerald-400'
    },
    {
      icon: TrendingUp,
      title: 'Höhere Interviewchancen',
      description: '94% unserer Nutzer berichten von mehr Einladungen',
      gradient: 'from-red-400 to-pink-400'
    }
  ];

  return (
    <section id="features" className="w-full py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#30E3CA]/10 border border-[#30E3CA]/20 rounded-full mb-6">
            <span className="text-sm text-[#30E3CA] font-semibold">WARUM DYD?</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Dein Vorteil auf einen Blick
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Modernste Technologie trifft auf jahrelange Recruiting-Expertise
          </p>
        </div>

        {/* USP Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usps.map((usp, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 hover:shadow-[0_0_50px_rgba(48,227,202,0.3)]"
              style={{
                animation: `fadeInScale 0.6s ease-out ${index * 0.1}s both`
              }}
            >
              {/* Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${usp.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500 blur-xl`}></div>

              {/* Icon Container */}
              <div className="relative mb-6">
                <div className={`w-14 h-14 bg-gradient-to-br ${usp.gradient} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500`}>
                  <usp.icon size={28} className="text-white" />
                </div>
                {/* Pulse Effect */}
                <div className={`absolute inset-0 w-14 h-14 bg-gradient-to-br ${usp.gradient} rounded-2xl opacity-0 group-hover:opacity-50 group-hover:scale-150 transition-all duration-700 blur-md`}></div>
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold mb-3 text-white group-hover:text-[#30E3CA] transition-colors duration-300">
                {usp.title}
              </h3>
              <p className="text-gray-400 leading-relaxed">
                {usp.description}
              </p>

              {/* Hover Arrow */}
              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                <div className={`w-8 h-8 bg-gradient-to-br ${usp.gradient} rounded-full flex items-center justify-center`}>
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </section>
  );
}
