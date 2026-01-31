import { useState } from 'react';
import { X, Mail, Lock, Loader2, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userId: string) => void;
  title?: string;
  description?: string;
  mode?: 'login' | 'payment';
}

export function PaywallModal({
  isOpen,
  onClose,
  onSuccess,
  title = 'Nur noch ein Schritt',
  description = 'Erstelle einen Account, um deinen optimierten CV zu erhalten.',
  mode = 'login',
}: PaywallModalProps) {
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('signup');
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
    setIsLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      if (data.user) {
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
          className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-3xl p-8 shadow-2xl"
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-[#66c0b6]/20 flex items-center justify-center border border-purple-500/30">
              <Crown className="text-purple-400" size={32} />
            </div>
          </div>

          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="text-white/70">{description}</p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white/5 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab('signup')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'signup'
                  ? 'bg-gradient-to-r from-purple-500 to-[#66c0b6] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Registrieren
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 px-4 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'login'
                  ? 'bg-gradient-to-r from-purple-500 to-[#66c0b6] text-white'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              Anmelden
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Mail size={16} className="text-purple-400" />
                E-Mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="deine@email.com"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-white/80">
                <Lock size={16} className="text-purple-400" />
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mindestens 6 Zeichen"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={!isFormValid || isLoading}
              className={`w-full py-3.5 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
                isFormValid && !isLoading
                  ? 'bg-gradient-to-r from-purple-500 to-[#66c0b6] text-white hover:shadow-lg hover:shadow-purple-500/20'
                  : 'bg-white/5 text-white/40 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  {activeTab === 'signup' ? 'Erstelle Account...' : 'Melde dich an...'}
                </>
              ) : (
                <>{activeTab === 'signup' ? 'Account erstellen' : 'Anmelden'}</>
              )}
            </button>
          </form>

          {/* Benefits */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="text-purple-400">✓</span>
                <span>KI-optimierter CV auf deine Wunschstelle</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="text-purple-400">✓</span>
                <span>Vollständiger Editor mit Live-Vorschau</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                <span className="text-purple-400">✓</span>
                <span>Dashboard mit Versionsverwaltung</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
