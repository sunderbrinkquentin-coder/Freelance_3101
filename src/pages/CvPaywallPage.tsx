// src/pages/CvPaywallPage.tsx
import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, Loader, Sparkles, Shield, Zap, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { validateStripePriceIds } from '../utils/stripeConfigValidator';

interface Package {
  id: string;
  title: string;
  optimizations: number;
  price: number;
  features: string[];
  popular?: boolean;
}

const PACKAGES: Package[] = [
  {
    id: 'single',
    title: 'Detailanalyse',
    optimizations: 1,
    price: 5,
    features: [
      'Detaillierte Kategorien-Bewertung',
      'Individuelles Feedback',
      'Konkrete Verbesserungsvorschläge',
      'Top-3 Prioritäten',
      'Direkt verfügbar',
    ],
    popular: true,
  },
];

// Supabase Edge Function URL für stripe-checkout
const STRIPE_CHECKOUT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;

// Stripe Price IDs Mapping
const PRICE_IDS: Record<string, string> = {
  // CV-Check Detailanalyse (5€)
  cv_check: import.meta.env.VITE_STRIPE_PRICE_CV_CHECK || '',
  // CV-Builder/Wizard Pakete (falls benötigt)
  single: import.meta.env.VITE_STRIPE_PRICE_SINGLE || '',
  five: import.meta.env.VITE_STRIPE_PRICE_FIVE || '',
  ten: import.meta.env.VITE_STRIPE_PRICE_TEN || '',
};

export default function CvPaywallPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const cvId = searchParams.get('cvId');
  const source = searchParams.get('source');
  const planFromState = (location.state as any)?.plan;

  const { user } = useAuth();

  const [isChecking, setIsChecking] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom validation for CV-Check flow
  const stripeValidation = useMemo(() => {
    if (source === 'cv_unlock') {
      // CV-Check braucht nur die CV_CHECK Price ID
      const cvCheckPriceId = import.meta.env.VITE_STRIPE_PRICE_CV_CHECK;
      return {
        isValid: !!cvCheckPriceId && cvCheckPriceId.trim() !== '',
        missingKeys: !cvCheckPriceId || cvCheckPriceId.trim() === '' ? ['VITE_STRIPE_PRICE_CV_CHECK'] : []
      };
    }
    // Für andere Flows (Wizard etc.) normale Validierung
    return validateStripePriceIds();
  }, [source]);

  // 1) Login-Pflicht vor Paywall - IMMER zuerst prüfen
  useEffect(() => {
    if (!cvId) {
      setIsChecking(false);
      return;
    }

    // Wenn kein User, sofort zum Login redirecten
    if (!user) {
      const redirectTarget = `/cv-paywall?cvId=${cvId}${
        source ? `&source=${source}` : ''
      }`;
      navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`, {
        replace: true,
      });
      return;
    }

    // User ist eingeloggt, weiter mit Zahlungsprüfung
    setIsChecking(true);
  }, [user, cvId, source, navigate]);

  // 2) Zahlungsstatus prüfen (nur wenn User da ist)
  useEffect(() => {
    if (!cvId) {
      setIsChecking(false);
      return;
    }
    if (!user) return;
    checkIfPaid();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cvId, user]);

  const saveAnalysisToDashboard = async (cvId: string) => {
    if (!user) return;

    try {
      console.log('[CvPaywall] 💾 Saving analysis to dashboard...');

      // Hole ATS-Daten
      const { data: cvData, error: cvError } = await supabase
        .from('stored_cvs')
        .select('ats_json, vision_text')
        .eq('id', cvId)
        .maybeSingle();

      if (cvError || !cvData?.ats_json) {
        console.error('[CvPaywall] ❌ Error fetching CV data:', cvError);
        return;
      }

      const atsJson = cvData.ats_json;
      const score = Math.max(0, Math.min(100, atsJson.ats_score ?? 0));

      const categories = [
        { key: 'relevanz_fokus', data: atsJson.relevanz_fokus },
        { key: 'erfolge_kpis', data: atsJson.erfolge_kpis },
        { key: 'klarheit_sprache', data: atsJson.klarheit_sprache },
        { key: 'formales', data: atsJson.formales },
        { key: 'usp_skills', data: atsJson.usp_skills },
      ];

      const categoryScores: Record<string, number> = {};
      const feedback: Record<string, string> = {};
      const recommendations: Record<string, string> = {};

      categories.forEach((cat) => {
        if (cat.data) {
          categoryScores[cat.key] = cat.data.score ?? 0;
          if (cat.data.feedback) feedback[cat.key] = cat.data.feedback;
          if (cat.data.verbesserung) recommendations[cat.key] = cat.data.verbesserung;
        }
      });

      await supabase.from('ats_analyses').upsert({
        user_id: user.id,
        upload_id: cvId,
        ats_score: score,
        category_scores: categoryScores,
        feedback,
        recommendations,
        analysis_data: atsJson,
        extracted_cv_data: {},
      }, {
        onConflict: 'user_id,upload_id'
      });

      console.log('[CvPaywall] ✅ Analysis saved to dashboard');
    } catch (error) {
      console.error('[CvPaywall] ❌ Error saving analysis:', error);
    }
  };

  const checkIfPaid = async () => {
    if (!cvId) {
      setError('Keine CV-ID gefunden');
      setIsChecking(false);
      return;
    }

    console.log('[CvPaywall] 🔍 Checking payment status for cvId:', cvId);

    try {

      // 2) Fallback: stored_cvs
      const { data: storedData, error: storedError } = await supabase
        .from('stored_cvs')
        .select('is_paid, download_unlocked')
        .eq('id', cvId)
        .maybeSingle();

      if (storedError) {
        console.error('[CvPaywall] stored_cvs error:', storedError);
      }

      if (storedData?.is_paid) {
        console.log(
          '[CvPaywall] ✅ Payment found in stored_cvs - unlocking download & redirecting to dashboard'
        );

        // Download freischalten, falls noch nicht gesetzt
        if (!storedData.download_unlocked) {
          const { error: unlockError } = await supabase
            .from('stored_cvs')
            .update({ download_unlocked: true })
            .eq('id', cvId);

          if (unlockError) {
            console.error(
              '[CvPaywall] ❌ Error unlocking download in stored_cvs:',
              unlockError
            );
          }
        }

        // Analyse zum Dashboard speichern
        await saveAnalysisToDashboard(cvId);

        navigate(`/dashboard?payment=success&cvId=${cvId}`, { replace: true });
        return;
      }

      console.log('[CvPaywall] ℹ️ No payment found - showing paywall');
      setIsChecking(false);
    } catch (err) {
      console.error('[CvPaywall] ❌ Error checking payment:', err);
      setError('Fehler beim Prüfen des Zahlungsstatus');
      setIsChecking(false);
    }
  };

  const handleSelectPackage = async (pkg: Package) => {
    if (!cvId) {
      alert('Keine CV-ID gefunden');
      return;
    }

    if (!user) {
      const redirectTarget = `/cv-paywall?cvId=${cvId}${
        source ? `&source=${source}` : ''
      }`;
      navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`, {
        replace: true,
      });
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      console.log('[CvPaywall] 💳 Creating checkout session for', {
        cvId,
        packageId: pkg.id,
        price: pkg.price,
        source,
      });

      // Wähle die richtige Price ID basierend auf dem Flow
      let priceId: string;
      if (source === 'cv_unlock') {
        // CV-Check Flow: Verwende die dedizierte CV-Check Price ID
        priceId = PRICE_IDS['cv_check'];
        console.log('[CvPaywall] 🎯 Using CV-Check Price ID:', priceId);
      } else {
        // Wizard/Builder Flow: Verwende Package-spezifische Price ID
        priceId = PRICE_IDS[pkg.id];
        console.log('[CvPaywall] 🎯 Using Package Price ID:', priceId);
      }

      if (!priceId || priceId.trim() === '') {
        setError(`Keine Stripe Price ID konfiguriert${source === 'cv_unlock' ? ' (VITE_STRIPE_PRICE_CV_CHECK fehlt)' : ''}`);
        setIsProcessing(false);
        return;
      }

      // Get auth session for Supabase
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log('[CvPaywall] 🔐 Auth check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        userId: user?.id,
        sessionError: sessionError?.message,
      });

      if (!session?.access_token) {
        console.error('[CvPaywall] ❌ No valid session/token found');
        setError('Authentifizierung fehlgeschlagen. Bitte melde dich erneut an.');
        setIsProcessing(false);

        // Redirect to login
        const redirectTarget = `/cv-paywall?cvId=${cvId}${source ? `&source=${source}` : ''}`;
        navigate(`/login?redirect=${encodeURIComponent(redirectTarget)}`, {
          replace: true,
        });
        return;
      }

      // ✅ Nach Zahlung zum Dashboard mit Auto-Download (für CV-Download) oder zur Payment-Success-Page (für CV-Check)
      const isDownloadFlow = source === 'cv_download';
      const successUrl = isDownloadFlow
        ? `${window.location.origin}/#/dashboard?downloadCv=${cvId}&payment=success`
        : `${window.location.origin}/#/payment-success?cvId=${cvId}`;
      const cancelUrl = `${window.location.origin}/#/cv-paywall?cvId=${cvId}&payment=cancelled${source ? `&source=${source}` : ''}`;


      console.log('[CvPaywall] 📤 Calling stripe-checkout with:', {
        url: STRIPE_CHECKOUT_URL,
        price_id: priceId,
        success_url: successUrl,
        cancel_url: cancelUrl,
        hasToken: !!session.access_token,
        tokenLength: session.access_token.length,
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
            cv_id: cvId,
            source: 'cv_unlock',
          },
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('[CvPaywall] ❌ Checkout session error:', {
          status: response.status,
          statusText: response.statusText,
          responseBody: text,
        });

        let errorMessage = 'Fehler beim Starten des Zahlungsvorgangs';

        try {
          const errorData = JSON.parse(text);
          if (errorData.error) {
            errorMessage = `Stripe Fehler: ${errorData.error}`;
          }
        } catch (e) {
          // Response is not JSON, use text as is
          errorMessage = `Server Fehler (${response.status}): ${text.substring(0, 100)}`;
        }

        setError(errorMessage);
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      console.log('[CvPaywall] ✅ Checkout session created:', data);

      if (!data?.url) {
        console.error('[CvPaywall] ❌ No checkout URL received:', data);
        setError('Keine gültige Checkout-URL erhalten');
        setIsProcessing(false);
        return;
      }

      // Store cvId in session storage for after payment
      sessionStorage.setItem('pending_cv_id', cvId);
      if (source) {
        sessionStorage.setItem('pending_cv_source', source);
      }

      console.log('[CvPaywall] 🔄 Redirecting to Stripe Checkout:', data.url);

      // Redirect to Stripe Checkout using the URL
      window.location.href = data.url;
    } catch (err) {
      console.error('[CvPaywall] ❌ Payment error:', err);
      setError('Fehler beim Starten des Zahlungsvorgangs');
      setIsProcessing(false);
    }
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Loader className="text-[#66c0b6]" size={64} />
          </motion.div>
          <h2 className="text-xl font-bold text-white mb-2">
            Prüfe Zahlungsstatus...
          </h2>
        </motion.div>
      </div>
    );
  }

  // If coming from Pro plan on landing page (no cvId needed)
  if (!cvId && planFromState === 'pro') {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Pro-Plan Upgrade
          </h1>
          <p className="text-white/60 mb-6">
            Der monatliche Pro-Plan wird bald verfügbar sein. Nutze aktuell unsere Optimierungspakete, um CVs zu optimieren.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/cv-check')}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              CV jetzt checken
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 bg-white/5 border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
            >
              Zum Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!cvId) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <h1 className="text-2xl font-bold text-white mb-4">
            Keine CV-ID gefunden
          </h1>
          <p className="text-white/60 mb-6">
            Bitte starte den Prozess von Anfang an.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Zur Startseite
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#66c0b6]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#30E3CA]/10 rounded-full blur-3xl"></div>
      </div>

      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0a0a]/80 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#66c0b6] to-[#30E3CA] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Decide Your Dream</h1>
                <p className="text-xs text-white/50">CV Optimierung</p>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12 space-y-3 md:space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm mb-3">
            <Shield className="w-4 h-4 text-[#66c0b6]" />
            <span className="text-white/70">Sichere Zahlung</span>
            <span className="text-white/30">·</span>
            <Zap className="w-4 h-4 text-[#66c0b6]" />
            <span className="text-white/70">Sofortiger Zugriff</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
            Detailanalyse freischalten
          </h1>

          <p className="text-base sm:text-lg text-white/60 max-w-2xl mx-auto">
            Erhalte Zugriff auf detaillierte Kategorien-Bewertungen, konkretes Feedback und Verbesserungsvorschläge für deinen Lebenslauf.
          </p>
        </motion.div>

        {!stripeValidation.isValid && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-red-200 font-semibold">
                  Stripe Price IDs missing in environment configuration
                </p>
                <p className="text-xs text-red-200/70 mt-1">
                  {stripeValidation.missingKeys.join(', ')}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center"
          >
            <p className="text-sm text-red-200">{error}</p>
          </motion.div>
        )}

        <div className="max-w-md mx-auto">
          {PACKAGES.map((pkg, index) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="h-full rounded-2xl bg-white/5 backdrop-blur-xl border border-[#66c0b6]/30 p-6 md:p-8">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-white mb-3">
                    {pkg.title}
                  </h3>
                  <div className="mb-4">
                    <span className="text-5xl md:text-6xl font-bold text-[#66c0b6]">
                      {pkg.price}€
                    </span>
                  </div>
                  <p className="text-sm text-white/60">Einmalige Zahlung</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-3 text-sm text-white/80"
                    >
                      <Check
                        size={20}
                        className="text-[#66c0b6] flex-shrink-0 mt-0.5"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <button
                    onClick={() => handleSelectPackage(pkg)}
                    disabled={isProcessing || !stripeValidation.isValid}
                    title={!stripeValidation.isValid ? 'Checkout disabled until Stripe env is configured.' : ''}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black hover:shadow-lg hover:shadow-[#66c0b6]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? 'Wird verarbeitet...' : 'Jetzt freischalten'}
                  </button>
                  {!stripeValidation.isValid && (
                    <p className="text-xs text-white/50 text-center">
                      Checkout disabled until Stripe env is configured.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center space-y-3"
        >
          <p className="text-xs text-white/50">
            Nach der Zahlung erhältst du sofort Zugriff auf die detaillierte Analyse.
          </p>
          <p className="text-xs text-white/40">
            Alle Preise inkl. MwSt. · Sichere Zahlung über Stripe
          </p>
        </motion.div>
      </div>
    </div>
  );
}
