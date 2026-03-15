import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Music, ArrowRight } from 'lucide-react';

const STORAGE_KEY = 'harmony_popup_seen';

export default function FestivalPopup() {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const seen = sessionStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setVisible(false);
    sessionStorage.setItem(STORAGE_KEY, '1');
  };

  const goToFestival = () => {
    close();
    navigate('/festival');
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={close}
          />

          <motion.div
            key="popup"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, type: 'spring', stiffness: 280, damping: 24 }}
            className="fixed inset-0 z-[101] flex items-center justify-center pointer-events-none px-4"
          >
            <div className="relative pointer-events-auto w-full max-w-md bg-gradient-to-br from-[#111008] via-[#130e0a] to-[#0e0a10] border border-orange-500/25 rounded-2xl shadow-2xl overflow-hidden">
              {/* Glow accents */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/8 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/8 rounded-full blur-3xl pointer-events-none"></div>

              {/* Close button */}
              <button
                onClick={close}
                className="absolute top-4 right-4 z-10 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/50 hover:text-white transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="relative z-10 p-8 sm:p-10 text-center">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                  <img
                    src="/harmony-festival.png"
                    alt="Harmony Festival"
                    className="h-24 w-auto object-contain drop-shadow-lg"
                  />
                </div>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-400 text-xs font-semibold mb-4">
                  <Music className="w-3 h-3" />
                  Neu: Das DYD Festival
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
                  Ein Festival für echte Gemeinschaft
                </h2>

                <p className="text-sm sm:text-base text-white/70 leading-relaxed mb-8">
                  Harmony ist ein Gegenentwurf zu Kommerzfestivals. Musik, die verbindet –
                  unabhängig von Herkunft und Status. Mit jedem CV-Check hilfst du, Harmony
                  zu verwirklichen.
                </p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={goToFestival}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500/90 to-violet-500/90 text-white font-semibold text-sm hover:from-orange-500 hover:to-violet-500 transition-all hover:scale-105 shadow-lg"
                  >
                    Mehr erfahren
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={close}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/10 text-white/60 font-medium text-sm hover:bg-white/5 hover:text-white transition-all"
                  >
                    Schliessen
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
