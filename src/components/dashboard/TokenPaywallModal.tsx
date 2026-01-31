import { X, Star, Check, CreditCard, Loader } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

interface TokenPaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Stripe Price IDs Mapping
const PRICE_IDS: Record<string, string> = {
  single: import.meta.env.VITE_STRIPE_PRICE_SINGLE || '',
  'bundle-5': import.meta.env.VITE_STRIPE_PRICE_FIVE || '',
  'bundle-10': import.meta.env.VITE_STRIPE_PRICE_TEN || '',
};

const STRIPE_CHECKOUT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;

export function TokenPaywallModal({ isOpen, onClose, onSuccess }: TokenPaywallModalProps) {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePurchase = async (plan: 'single' | 'bundle-5' | 'bundle-10') => {
    setIsProcessing(true);
    setError(null);

    try {
      console.log('[TokenPaywall] 💳 Creating checkout session for plan:', plan);

      const priceId = PRICE_IDS[plan];
      if (!priceId) {
        setError(`Keine Stripe Price ID für Paket "${plan}" konfiguriert`);
        setIsProcessing(false);
        return;
      }

      // Get auth session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error('[TokenPaywall] ❌ No valid session found - redirecting to login');
        setIsProcessing(false);
        onClose();

        // Redirect to login with action to re-open paywall after login
        setTimeout(() => {
          navigate('/login?redirect=' + encodeURIComponent('/dashboard') + '&action=buy-tokens');
        }, 100);
        return;
      }

      // Success/Cancel URLs für HashRouter
      const successUrl = `${window.location.origin}/#/dashboard?payment=success`;
      const cancelUrl = `${window.location.origin}/#/dashboard?payment=cancelled`;

      console.log('[TokenPaywall] 📤 Calling stripe-checkout with:', {
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      const response = await fetch(STRIPE_CHECKOUT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: successUrl,
          cancel_url: cancelUrl,
          mode: 'payment',
          metadata: {
            source: 'token_purchase',
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[TokenPaywall] ❌ Checkout error:', errorData);
        throw new Error(errorData.error || 'Fehler beim Erstellen der Checkout-Session');
      }

      const { url } = await response.json();
      console.log('[TokenPaywall] ✅ Checkout URL:', url);

      if (!url) {
        throw new Error('Keine Checkout-URL erhalten');
      }

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (err: any) {
      console.error('[TokenPaywall] ❌ Error:', err);
      setError(err.message || 'Ein Fehler ist aufgetreten');
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      id: 'single' as const,
      credits: 1,
      price: '5',
      pricePerCredit: '5,00',
      title: '1 Optimierung',
      description: 'Perfekt für eine Bewerbung',
    },
    {
      id: 'bundle-5' as const,
      credits: 5,
      price: '20',
      pricePerCredit: '4,00',
      title: '5 Optimierungen',
      description: 'Spare 20%',
      savings: '20%',
      popular: true,
    },
    {
      id: 'bundle-10' as const,
      credits: 10,
      price: '30',
      pricePerCredit: '3,00',
      title: '10 Optimierungen',
      description: 'Spare 40% - Beste Wahl',
      savings: '40%',
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#1a1a1a] border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-[#66c0b6] to-[#30E3CA]">
              <Star size={24} className="text-black" />
            </div>
            <h2 className="text-2xl font-bold text-white">Credits kaufen</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={24} className="text-white/60" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg text-white/80">
              Kaufe Credits, um deine CVs für neue Stellen zu optimieren
            </p>
            <p className="text-white/60">
              Mit Bundles sparst du bis zu 40%
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl p-6 border-2 transition-all ${
                  plan.popular
                    ? 'border-[#66c0b6] bg-[#66c0b6]/5'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black text-xs font-bold">
                    BELIEBT
                  </div>
                )}

                {plan.savings && (
                  <div className="absolute -top-3 -right-3 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold">
                    -{plan.savings}
                  </div>
                )}

                <div className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold text-white">{plan.credits}</div>
                    <div className="text-sm text-white/60">Credit{plan.credits > 1 ? 's' : ''}</div>
                  </div>

                  <div>
                    <div className="text-4xl font-bold text-[#66c0b6]">€{plan.price}</div>
                    <div className="text-xs text-white/60 mt-1">
                      €{plan.pricePerCredit} pro Credit
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-white">{plan.title}</p>
                    <p className="text-xs text-white/60">{plan.description}</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Check size={16} className="text-[#66c0b6]" />
                      <span>CV-Optimierung für {plan.credits} Stelle{plan.credits > 1 ? 'n' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Check size={16} className="text-[#66c0b6]" />
                      <span>KI-gestützte Anpassung</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <Check size={16} className="text-[#66c0b6]" />
                      <span>Unbegrenzte Bearbeitungen</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={isProcessing}
                    className={`w-full px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      plan.popular
                        ? 'bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black hover:opacity-90'
                        : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        <span>Wird geladen...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard size={18} />
                        <span>Jetzt kaufen</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-[#66c0b6]/20 flex-shrink-0">
                <Star size={20} className="text-[#66c0b6]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-semibold text-white">Was du mit Credits bekommst:</h4>
                <ul className="text-sm text-white/70 space-y-1">
                  <li>• Optimiere deine bestehenden CVs für neue Stellen</li>
                  <li>• KI analysiert die Stellenbeschreibung und passt deinen CV an</li>
                  <li>• Jeder Credit = 1 Optimierung für eine neue Stelle</li>
                  <li>• Bearbeite und exportiere deine CVs unbegrenzt</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-xs text-white/40 text-center">
            Sichere Zahlung über Stripe • Sofortiger Zugang
          </p>
        </div>
      </div>
    </div>
  );
}
