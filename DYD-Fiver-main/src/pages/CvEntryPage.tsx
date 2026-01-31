/**
 * CV Entry Page - Modern WebApp Landing
 *
 * Central entry point for users to choose between:
 * - Analyzing existing CV
 * - Creating new CV with wizard
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileSearch,
  FileEdit,
  Shield,
  Zap,
  Target,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import React from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function CvEntryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#66c0b6]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#30E3CA]/10 rounded-full blur-3xl" />
      </div>

      {/* App Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Decide Your Dream</h1>
                <p className="text-xs text-white/50">CV Center</p>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm text-white/70 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-medium hover:bg-white/10 transition-all"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm mb-4">
            <Shield className="w-4 h-4 text-[#66c0b6]" />
            <span className="text-white/70">DSGVO-konform</span>
            <span className="text-white/30">·</span>
            <Zap className="w-4 h-4 text-[#66c0b6]" />
            <span className="text-white/70">KI-gestützt</span>
            <span className="text-white/30">·</span>
            <Target className="w-4 h-4 text-[#66c0b6]" />
            <span className="text-white/70">ATS-optimiert</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
            Starte jetzt mit deinem
            <br />
            digitalen CV-Center
          </h1>

          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto">
            Wähle, ob du deinen bestehenden Lebenslauf analysieren oder einen
            neuen CV mit unserem Wizard erstellen willst.
          </p>
        </motion.div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Card 1: CV Analysieren - nur für nicht eingeloggte User */}
          {!user && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <ActionCard
                icon={<FileSearch className="w-8 h-8" />}
                badge="Empfohlen, wenn du schon einen CV hast"
                title="CV analysieren"
                description="Lade deinen bestehenden CV hoch, wir analysieren ihn mit KI & ATS und zeigen dir konkrete Verbesserungsvorschläge."
                features={['ATS-Score & Matching', 'Stärken & Lücken', 'Konkrete To-dos']}
                buttonText="Jetzt CV prüfen"
                onClick={() => navigate('/cv-check')}
                glowColor="rgba(102, 192, 182, 0.35)"
              />
            </motion.div>
          )}

          {/* Card 2: CV Erstellen */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ActionCard
              icon={<FileEdit className="w-8 h-8" />}
              title="CV erstellen"
              description="Erstelle deinen CV Schritt für Schritt mit unserem Wizard – strukturiert, modern und ATS-optimiert."
              features={['Geführter Wizard', 'Optimierte Formulierungen', 'Perfekte Struktur']}
              buttonText="Neuen CV starten"
              onClick={() => navigate('/cv-wizard')}
              glowColor="rgba(48, 227, 202, 0.35)"
            />
          </motion.div>
        </div>

        {/* Helper Text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center space-y-3"
        >
          <p className="text-sm text-white/50">Unsicher, womit du starten sollst?</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm text-white/60">
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-[#66c0b6] flex-shrink-0 mt-0.5" />
              <span>
                Wenn du schon einen Lebenslauf hast, wähle{' '}
                <strong className="text-white/80">„CV analysieren"</strong>
              </span>
            </div>
            <div className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-[#66c0b6] flex-shrink-0 mt-0.5" />
              <span>
                Wenn du ganz neu startest, wähle{' '}
                <strong className="text-white/80">„CV erstellen"</strong>
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/**
 * Action Card Component
 */
interface ActionCardProps {
  icon: React.ReactNode;
  badge?: string;
  title: string;
  description: string;
  features: string[];
  buttonText: string;
  onClick: () => void;
  glowColor: string;
}

function ActionCard({
  icon,
  badge,
  title,
  description,
  features,
  buttonText,
  onClick,
  glowColor,
}: ActionCardProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full h-full text-left group relative"
    >
      <div className="relative rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 p-8 hover:border-[#66c0b6]/40 transition-all duration-300 hover:bg-white/10 h-full flex flex-col">
        {/* Hover Glow */}
        <div
          className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
          style={{ boxShadow: `0 0 40px ${glowColor}` }}
        />

        {/* Badge */}
        {badge && (
          <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-[#66c0b6]/20 border border-[#66c0b6]/30 text-xs text-[#66c0b6] font-medium">
            {badge}
          </div>
        )}

        {/* Icon */}
        <motion.div
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#66c0b6]/20 to-[#30E3CA]/20 flex items-center justify-center border border-[#66c0b6]/30 mb-6 text-[#66c0b6] group-hover:scale-110 transition-transform"
          whileHover={{ rotate: 5 }}
        >
          {icon}
        </motion.div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl font-bold text-white group-hover:text-[#66c0b6] transition-colors">
            {title}
          </h2>

          <p className="text-white/60 leading-relaxed">{description}</p>

          {/* Features */}
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-white/70">
                <div className="w-1.5 h-1.5 rounded-full bg-[#66c0b6]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA Button */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="flex items-center justify-between px-6 py-3 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold group-hover:shadow-lg group-hover:shadow-[#66c0b6]/30 transition-all">
            <span>{buttonText}</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}
