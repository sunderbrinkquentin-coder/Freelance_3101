import { useState } from 'react';
import { X, Mail, Lock, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface LoginPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userId: string) => void;
}

type TabType = 'signup' | 'login';

export function LoginPaywallModal({ isOpen, onClose, onSuccess }: LoginPaywallModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async () => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Nach Registrierung -> Paywall/Payment
        // Für jetzt gehen wir direkt weiter (Payment kann später integriert werden)
        onSuccess(data.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Registrierung fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setError(null);
    setIsLoading(false);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data.user) {
        // Nach Login -> Paywall/Payment checken
        // Für jetzt gehen wir direkt weiter
        onSuccess(data.user.id);
      }
    } catch (err: any) {
      setError(err.message || 'Login fehlgeschlagen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signup') {
      handleSignup();
    } else {
      handleLogin();
    }
  };

  const isFormValid = email.length > 0 && password.length >= 6;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-white/60 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#66c0b6]/20 to-[#30E3CA]/20 flex items-center justify-center border border-[#66c0b6]/30">
              <Sparkles className="text-[#66c0b6]" size={40} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-4xl font-bold text-white">
              Nur noch ein Schritt bis zu deinem voroptimierten CV
            </h2>
            <p className="text-lg text-white/70 max-w-lg mx-auto">
              Wir erstellen jetzt einen individuellen CV-Vorschlag, perfekt auf deine Wunschstelle abgestimmt.
              Logge dich ein oder erstelle einen Account, um deinen persönlichen Entwurf zu bekommen.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-8 bg-white/5 p-2 rounded-xl">
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Account erstellen
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Ich habe bereits einen Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white">
                <Mail size={18} className="text-[#66c0b6]" />
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] transition-colors"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-white">
                <Lock size={18} className="text-[#66c0b6]" />
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] transition-colors"
                minLength={6}
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-4 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 ${
                isFormValid && !isLoading
                  ? 'bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black hover:shadow-lg hover:shadow-[#66c0b6]/20 hover:scale-[1.02]'
                  : 'bg-white/5 text-white/40 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {activeTab === 'signup' ? 'Erstelle Account...' : 'Melde dich an...'}
                </>
              ) : (
                <>
                  {activeTab === 'signup' ? 'Account erstellen & CV generieren' : 'Anmelden & CV generieren'}
                </>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <p className="text-center text-sm text-white/60 mb-4">
              Was du mit deinem Account bekommst:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center space-y-1">
                <p className="text-[#66c0b6] font-semibold">✓ KI-optimierter CV</p>
                <p className="text-xs text-white/50">Perfekt auf deine Stelle</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[#66c0b6] font-semibold">✓ Dashboard</p>
                <p className="text-xs text-white/50">Alle CVs an einem Ort</p>
              </div>
              <div className="text-center space-y-1">
                <p className="text-[#66c0b6] font-semibold">✓ Bewerbungs-Tracking</p>
                <p className="text-xs text-white/50">Behalte den Überblick</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
