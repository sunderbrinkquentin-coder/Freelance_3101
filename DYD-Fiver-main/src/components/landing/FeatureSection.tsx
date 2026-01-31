import { Upload, BarChart, Sparkles, Download, ArrowRight } from 'lucide-react';

interface FeatureSectionProps {
  onStartWizard: () => void;
}

export default function FeatureSection({ onStartWizard }: FeatureSectionProps) {
  const steps = [
    {
      number: '01',
      icon: Upload,
      title: 'CV hochladen',
      description: 'Lade deinen bestehenden Lebenslauf hoch oder starte von Grund auf',
      color: 'from-[#30E3CA] to-[#38f6d1]'
    },
    {
      number: '02',
      icon: BarChart,
      title: 'Score erhalten',
      description: 'Erhalte sofort deinen ATS-Score und detaillierte Analyse',
      color: 'from-blue-400 to-purple-400'
    },
    {
      number: '03',
      icon: Sparkles,
      title: 'Verbesserungen sehen',
      description: 'KI zeigt dir konkrete Optimierungsmöglichkeiten',
      color: 'from-purple-400 to-pink-400'
    },
    {
      number: '04',
      icon: Download,
      title: 'Optimierten CV nutzen',
      description: 'Download als PDF oder DOCX und bewirb dich erfolgreich',
      color: 'from-pink-400 to-red-400'
    }
  ];

  return (
    <section id="process" className="w-full py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#30E3CA]/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px]"></div>
      </div>

      <div className="w-full max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#30E3CA]/10 border border-[#30E3CA]/20 rounded-full mb-6">
            <span className="text-sm text-[#30E3CA] font-semibold">SO EINFACH GEHT'S</span>
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            In 4 Schritten zum{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#30E3CA] to-[#38f6d1]">
              perfekten CV
            </span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Weniger als 10 Minuten bis zu deinem optimierten Lebenslauf
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-8 mb-20">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group relative"
              style={{
                animation: `fadeInLeft 0.8s ease-out ${index * 0.2}s both`
              }}
            >
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(48,227,202,0.2)]">
                {/* Step Number */}
                <div className={`flex-shrink-0 w-20 h-20 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center font-bold text-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  {step.number}
                </div>

                {/* Icon */}
                <div className={`flex-shrink-0 w-16 h-16 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-500`}>
                  <step.icon size={32} className="text-white" />
                </div>

                {/* Content */}
                <div className="flex-grow">
                  <h3 className="text-2xl md:text-3xl font-bold mb-2 text-white group-hover:text-[#30E3CA] transition-colors duration-300">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-lg">
                    {step.description}
                  </p>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute -bottom-12 left-1/2 transform -translate-x-1/2">
                    <ArrowRight size={32} className="text-[#30E3CA]/30 rotate-90" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onStartWizard}
            className="group px-10 py-5 bg-gradient-to-r from-[#30E3CA] to-[#38f6d1] hover:shadow-[0_0_60px_rgba(48,227,202,0.6)] rounded-2xl font-bold text-xl transition-all duration-300 inline-flex items-center gap-3"
          >
            Jetzt kostenlos starten
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
          </button>
          <p className="text-gray-500 text-sm mt-4">
            Keine Kreditkarte erforderlich • Sofort loslegen
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </section>
  );
}
