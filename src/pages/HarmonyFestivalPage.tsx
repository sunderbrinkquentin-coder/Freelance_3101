import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Mic,
  Handshake,
  Music,
  Heart,
  ArrowRight,
} from 'lucide-react';

export default function HarmonyFestivalPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080808] via-[#0d0a08] to-[#080808] text-white relative overflow-hidden">
      {/* Background shapes */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-orange-400/4 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-transparent to-[#080808]/80"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Zurück zur Startseite</span>
            </button>
            <button
              onClick={() => navigate('/cv-check')}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500/90 to-violet-500/90 text-white font-semibold text-sm hover:from-orange-500 hover:to-violet-500 transition-all"
            >
              Harmony unterstützen
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center mb-20"
          >
            <div className="flex justify-center mb-8">
              <img
                src="/harmony-festival.png"
                alt="Harmony Festival"
                className="h-40 sm:h-52 md:h-64 w-auto object-contain drop-shadow-2xl"
              />
            </div>
            <p className="text-2xl sm:text-3xl text-white/90 font-light tracking-wide">
              Ein Festival für echte Gemeinschaft
            </p>
          </motion.div>

          {/* Intro */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 mb-12"
          >
            <p className="text-base sm:text-lg text-white/80 leading-relaxed">
              Harmony ist ein Gegenentwurf zu klassischen Kommerzfestivals. Es ist ein Ort, an dem
              Musik wieder Menschen verbindet – unabhängig von Herkunft, Einkommen oder Status.
              Ein Raum für Begegnung, Kreativität und echte Gemeinschaft.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-16"
          >
            <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">
              Was Harmony besonders macht
            </h2>

            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  icon: Users,
                  title: 'Für alle',
                  desc: 'Fair, zugänglich und gemeinsam gestaltet – für jede und jeden.',
                },
                {
                  icon: Mic,
                  title: 'Neue Talente',
                  desc: 'Eine Bühne für lokale Künstlerinnen und Künstler, die gehört werden wollen.',
                },
                {
                  icon: Handshake,
                  title: 'Offene Räume',
                  desc: 'Begegnung, Workshops und kultureller Austausch in entspannter Atmosphäre.',
                },
                {
                  icon: Music,
                  title: 'Musik & Miteinander',
                  desc: 'Fokus auf Atmosphäre, Verbindung und Gemeinschaft – nicht auf Profit.',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.45 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-orange-400/30 transition-all duration-300"
                >
                  <feature.icon className="w-10 h-10 text-orange-400/80 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* DYD x Harmony */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="bg-gradient-to-br from-orange-500/10 via-violet-500/5 to-transparent backdrop-blur-sm border border-orange-500/20 rounded-2xl p-8 sm:p-12 mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <Heart className="w-8 h-8 text-orange-400" />
              <h2 className="text-2xl sm:text-3xl font-semibold">DYD × Harmony</h2>
            </div>

            <div className="space-y-4 text-white/80 leading-relaxed">
              <p>
                Mit jeder Lebenslauf-Optimierung über DYD unterstützt ihr Harmony. Wer sich beim
                Festival engagiert, sammelt echte ehrenamtliche Erfahrung, die wir gemeinsam im
                Lebenslauf sichtbar machen.
              </p>
              <p className="text-orange-400/90 font-medium">
                So entsteht ein Festival, das nicht nur gefeiert wird, sondern nachhaltig stärkt.
              </p>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-orange-400/20 to-violet-400/20 mb-6">
              <Music className="w-8 h-8 text-orange-400" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Deine Stimme zählt</h2>

            <p className="text-lg text-white/80 mb-8 leading-relaxed max-w-xl mx-auto">
              Welche Künstlerinnen, Künstler oder Tracks sollten bei Harmony unbedingt dabei sein?
              Unterstütze jetzt und werde Teil der Gemeinschaft.
            </p>

            <button
              onClick={() => navigate('/cv-check')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500/90 to-violet-500/90 text-white font-semibold hover:from-orange-500 hover:to-violet-500 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Jetzt Harmony unterstützen
              <ArrowRight className="w-5 h-5" />
            </button>

            <p className="text-sm text-white/50 mt-4">
              Mit jedem CV-Check hilfst du, Harmony zu verwirklichen
            </p>
          </motion.div>

        </div>
      </div>

      {/* Footer strip */}
      <div className="relative z-10 border-t border-white/10 py-6 text-center text-white/40 text-sm">
        <button onClick={() => navigate('/')} className="hover:text-white/70 transition-colors">
          &larr; Zurück zu DYD
        </button>
      </div>
    </div>
  );
}
