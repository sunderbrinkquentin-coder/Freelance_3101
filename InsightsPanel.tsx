import { Sparkles, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Insight {
  category?: string;
  text: string;
}

interface InsightsPanelProps {
  insights?: (string | Insight)[];
}

export function InsightsPanel({ insights = [] }: InsightsPanelProps) {
  // Default insights if none provided from Make.com
  const defaultInsights = [
    'Deine zuletzt genannte Erfahrung passt perfekt zur Rolle',
    'Sehr gut: Deine wichtigsten Tools sind klar hervorgehoben',
    'Dein Profil ist stark auf die Wunschstelle ausgerichtet',
    'Top: Deine Projektbeispiele matchen exakt die Anforderungen',
    'Ausgezeichnet: Deine Soft Skills sind deutlich erkennbar',
  ];

  // Normalize insights to strings
  const normalizedInsights = insights.map(insight => {
    if (typeof insight === 'string') {
      return insight;
    }
    if (insight && typeof insight === 'object' && 'text' in insight) {
      return insight.text;
    }
    // Fallback: try to convert to string
    return String(insight);
  });

  const displayInsights = normalizedInsights.length > 0 ? normalizedInsights : defaultInsights;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sticky top-4"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#66c0b6]/20 to-[#30E3CA]/20 flex items-center justify-center border border-[#66c0b6]/30">
          <Sparkles className="text-[#66c0b6]" size={24} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            Warum dein CV jetzt stark wirkt
          </h3>
          <p className="text-sm text-white/50">
            KI-Analyse deines Profils
          </p>
        </div>
      </div>

      {/* Insights List */}
      <ul className="space-y-4">
        {displayInsights.map((insight, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="flex items-start gap-3 group"
          >
            <div className="flex-shrink-0 mt-1">
              <CheckCircle className="text-[#66c0b6] group-hover:scale-110 transition-transform" size={20} />
            </div>
            <span className="text-white/80 text-sm leading-relaxed group-hover:text-white transition-colors">
              {insight}
            </span>
          </motion.li>
        ))}
      </ul>

      {/* Motivational Footer */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <p className="text-center text-sm text-white/70 leading-relaxed">
          🎯 <strong>Glückwunsch!</strong> Dein CV ist nun optimal auf deine Wunschstelle abgestimmt.
          Du kannst jetzt einzelne Details feinjustieren.
        </p>
      </div>
    </motion.div>
  );
}
