import { AlertCircle, HelpCircle, XCircle } from 'lucide-react';

export default function ProblemSection() {
  const problems = [
    {
      icon: AlertCircle,
      title: 'Zu viele Absagen',
      description: 'ohne Feedback',
      gradient: 'from-red-500/20 to-orange-500/20',
      iconColor: 'from-red-400 to-orange-400'
    },
    {
      icon: HelpCircle,
      title: 'Unklar, was HR wirklich will',
      description: 'und wie ATS-Systeme arbeiten',
      gradient: 'from-yellow-500/20 to-amber-500/20',
      iconColor: 'from-yellow-400 to-amber-400'
    },
    {
      icon: XCircle,
      title: 'Keine Einladungen',
      description: 'trotz guter Qualifikation',
      gradient: 'from-purple-500/20 to-pink-500/20',
      iconColor: 'from-purple-400 to-pink-400'
    }
  ];

  return (
    <section className="w-full py-32 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Kennst du das?
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Diese Probleme kennen Tausende Bewerber – aber sie sind lösbar.
          </p>
        </div>

        {/* Problem Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {problems.map((problem, index) => (
            <div
              key={index}
              className={`group relative bg-gradient-to-br ${problem.gradient} backdrop-blur-xl border border-white/10 rounded-3xl p-8 hover:scale-105 transition-all duration-500`}
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.15}s both`
              }}
            >
              {/* Animated Border Glow */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${problem.iconColor} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                <problem.icon size={32} className="text-white" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-2 text-white">
                {problem.title}
              </h3>
              <p className="text-gray-300">
                {problem.description}
              </p>

              {/* Decorative Element */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-white/5 rounded-full blur-2xl"></div>
            </div>
          ))}
        </div>

        {/* Solution Statement */}
        <div className="text-center">
          <div className="inline-block bg-gradient-to-r from-[#30E3CA] to-[#38f6d1] rounded-2xl p-8 backdrop-blur-xl">
            <p className="text-2xl md:text-3xl font-bold text-[#0a0a0a]">
              DYD löst genau diese Probleme – automatisch und datenbasiert.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
