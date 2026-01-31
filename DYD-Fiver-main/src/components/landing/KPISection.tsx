import { useEffect, useState, useRef } from 'react';
import { FileCheck, TrendingUp, Target, Clock } from 'lucide-react';

export default function KPISection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const kpis = [
    {
      icon: FileCheck,
      value: '12,450',
      suffix: '+',
      label: 'Optimierte CVs',
      color: 'from-[#30E3CA] to-[#38f6d1]'
    },
    {
      icon: TrendingUp,
      value: '94',
      suffix: '%',
      label: 'Erfolgsrate',
      color: 'from-emerald-400 to-teal-400'
    },
    {
      icon: Target,
      value: '87',
      suffix: '/100',
      label: 'Ø ATS-Score',
      color: 'from-cyan-400 to-blue-400'
    },
    {
      icon: Clock,
      value: '10',
      suffix: ' Min',
      label: 'Durchschnitt',
      color: 'from-purple-400 to-pink-400'
    }
  ];

  const CountUpNumber = ({ end, suffix }: { end: number; suffix: string }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
      if (!isVisible) return;

      const duration = 2000;
      const steps = 60;
      const increment = end / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    }, [isVisible, end]);

    return (
      <span>
        {count.toLocaleString()}
        {suffix}
      </span>
    );
  };

  return (
    <section ref={sectionRef} className="w-full py-24 px-4 sm:px-6 lg:px-8 relative">
      <div className="w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpis.map((kpi, index) => (
            <div
              key={index}
              className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(48,227,202,0.2)]"
              style={{
                animation: isVisible ? `fadeInUp 0.6s ease-out ${index * 0.1}s both` : 'none'
              }}
            >
              {/* Gradient Glow */}
              <div className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>

              {/* Icon */}
              <div className={`w-12 h-12 bg-gradient-to-br ${kpi.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <kpi.icon size={24} className="text-white" />
              </div>

              {/* Value */}
              <div className={`text-4xl md:text-5xl font-bold mb-2 bg-gradient-to-r ${kpi.color} bg-clip-text text-transparent`}>
                <CountUpNumber end={parseInt(kpi.value.replace(/,/g, ''))} suffix={kpi.suffix} />
              </div>

              {/* Label */}
              <div className="text-gray-400 text-sm font-medium">{kpi.label}</div>
            </div>
          ))}
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
