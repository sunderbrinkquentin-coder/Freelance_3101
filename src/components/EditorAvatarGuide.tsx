// src/components/EditorAvatarGuide.tsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Layout, Image, Edit3, Download } from 'lucide-react';
import AgentBall from './agent/AgentBall';

interface EditorAvatarGuideProps {
  onClose?: () => void;
  currentStep?: 'layout' | 'photo' | 'edit' | 'download';
}

const tips = {
  layout: {
    icon: Layout,
    title: 'Layout wechseln',
    description: 'Wähle aus 5 professionellen Design-Vorlagen',
    details: [
      'Modern: Frisch und zeitgemäß für kreative Berufe',
      'Klassisch: Bewährt und seriös für traditionelle Branchen',
      'Minimal: Klar und übersichtlich für alle Bereiche',
      'Kreativ: Auffallend für Design- und Marketing-Jobs',
      'Professional: Elegant für Führungspositionen'
    ]
  },
  photo: {
    icon: Image,
    title: 'Profilfoto einfügen',
    description: 'Ein professionelles Bewerbungsfoto macht den Unterschied',
    details: [
      'Nutze ein aktuelles, hochwertiges Foto',
      'Achte auf gute Beleuchtung und neutralen Hintergrund',
      'Kleidung sollte zur Stelle passen',
      'Lächle freundlich und authentisch',
      'Das Foto wird automatisch angepasst'
    ]
  },
  edit: {
    icon: Edit3,
    title: 'Inhalte bearbeiten',
    description: 'Verfeinere jeden Abschnitt deines CVs',
    details: [
      'Klicke auf jeden Text um ihn zu bearbeiten',
      'Passe Formulierungen an die Stellenbeschreibung an',
      'Ergänze wichtige Details und Erfolge',
      'Entferne irrelevante Informationen',
      'Änderungen werden automatisch gespeichert'
    ]
  },
  download: {
    icon: Download,
    title: 'Als PDF herunterladen',
    description: 'Exportiere dein fertiges CV in perfekter Qualität',
    details: [
      'Klicke auf "Herunterladen" wenn du fertig bist',
      'Das PDF ist direkt bewerbungsreif',
      'Versende es per E-Mail oder Upload-Portal',
      'Du kannst jederzeit zurückkommen und Änderungen vornehmen',
      'Dein CV wird automatisch gespeichert'
    ]
  }
};

export function EditorAvatarGuide({ onClose, currentStep = 'layout' }: EditorAvatarGuideProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeStep, setActiveStep] = useState(currentStep);
  const [showDetails, setShowDetails] = useState(true);

  useEffect(() => {
    setActiveStep(currentStep);
  }, [currentStep]);

  const currentTip = tips[activeStep];
  const Icon = currentTip.icon;

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="relative group"
        >
          <AgentBall size="small" isSpeaking={true} />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#66c0b6] rounded-full flex items-center justify-center">
            <Sparkles size={14} className="text-black" />
          </div>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="fixed top-24 right-6 z-40 w-96 max-w-[calc(100vw-3rem)]"
    >
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-[#66c0b6]/30 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#66c0b6]/20 to-[#30E3CA]/20 p-4 border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <AgentBall size="small" isSpeaking={true} />
              <div>
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Icon size={18} className="text-[#66c0b6]" />
                  {currentTip.title}
                </h3>
                <p className="text-sm text-white/60 mt-1">
                  {currentTip.description}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMinimized(true)}
                className="text-white/60 hover:text-white transition-colors p-1"
                title="Minimieren"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
              {onClose && (
                <button
                  onClick={onClose}
                  className="text-white/60 hover:text-white transition-colors p-1"
                  title="Schließen"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex border-b border-white/10 bg-black/40">
          {(Object.keys(tips) as Array<keyof typeof tips>).map((key) => {
            const StepIcon = tips[key].icon;
            return (
              <button
                key={key}
                onClick={() => setActiveStep(key)}
                className={`flex-1 px-3 py-3 text-xs font-medium transition-all border-b-2 ${
                  activeStep === key
                    ? 'border-[#66c0b6] text-[#66c0b6] bg-[#66c0b6]/10'
                    : 'border-transparent text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                <StepIcon size={16} className="mx-auto mb-1" />
                {tips[key].title.split(' ')[0]}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {showDetails && (
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-3 max-h-80 overflow-y-auto"
            >
              {currentTip.details.map((detail, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-[#66c0b6]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-[#66c0b6]">{index + 1}</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed">{detail}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="p-4 bg-black/40 border-t border-white/10">
          <p className="text-xs text-white/40 text-center">
            Klicke auf die Tabs oben um mehr Tipps zu sehen
          </p>
        </div>
      </div>
    </motion.div>
  );
}
