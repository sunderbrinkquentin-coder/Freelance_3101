// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Briefcase, Sparkles, LogOut, ClipboardCheck, Coins, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cvStorageService } from '../services/cvStorageService';
import { tokenService } from '../services/tokenService';
import { cvDownloadService } from '../services/cvDownloadService';
import { OptimizeJobModal } from '../components/dashboard/OptimizeJobModal';
import { CVAdjustmentModal } from '../components/dashboard/CVAdjustmentModal';
import { TokenPaywallModal } from '../components/dashboard/TokenPaywallModal';
import { OptimizedCVCard } from '../components/dashboard/OptimizedCVCard';
import { DraftCVCard } from '../components/dashboard/DraftCVCard';
import { KanbanBoard } from '../components/dashboard/KanbanBoard';
import { useAuth } from '../contexts/AuthContext';

export function DashboardPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { logout, profile } = useAuth();

  const [userCVs, setUserCVs] = useState<any[]>([]);
  const [cvChecks, setCvChecks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCVForOptimize, setSelectedCVForOptimize] = useState<any | null>(null);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [userTokens, setUserTokens] = useState<number>(0);
  const [optimizedJobData, setOptimizedJobData] = useState<any>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);


  // ---------- Ladefunktionen ----------


  async function loadCVs() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setUserCVs([]);
        return;
      }

      console.log('[Dashboard] Loading CVs from stored_cvs for user:', user.id);

      const { data, error } = await supabase
        .from('stored_cvs')
        .select(
          'id, cv_data, job_data, updated_at, status, source, is_paid, download_unlocked, file_name, pdf_url, created_at, download_count, ats_json, contact_person, application_deadline'
        )
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('[Dashboard] Error loading CVs:', error);
        setUserCVs([]);
        return;
      }

      console.log('[Dashboard] Loaded', data?.length || 0, 'CVs');
      console.log(
        '[Dashboard] CVs with download_unlocked:',
        data?.filter((cv) => cv.download_unlocked).length || 0
      );
      setUserCVs(data || []);
    } catch (error) {
      console.error('[Dashboard] Error loading CVs:', error);
      setUserCVs([]);
    }
  }

  async function loadCvChecks() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      console.log(
        '[Dashboard] Loading CV checks - User:',
        user?.id,
        'Session:',
        session?.user?.id
      );

      let query = supabase
        .from('stored_cvs')
        .select('id, created_at, status, file_name, ats_json, error_message')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      const { data, error } = await query;
      if (error) {
        console.error('[Dashboard] Error loading CV checks:', error);
        return;
      }

      console.log('[Dashboard] cvChecks loaded:', data?.length || 0, 'checks');

      const mappedData = (data || []).map((check) => ({
        ...check,
        analysis_status: check.status,
      }));

      setCvChecks(mappedData);
    } catch (error) {
      console.error('[Dashboard] Error loading CV checks:', error);
    }
  }

  async function loadUserTokens() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const tokens = await tokenService.getUserTokens(user.id);
      setUserTokens(tokens?.credits || 0);
    } catch (error) {
      console.error('Error loading user tokens:', error);
    }
  }

  async function loadUserProfile() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[Dashboard] Error loading profile:', error);
        return;
      }

      if (profile?.full_name) {
        const firstName = profile.full_name.split(' ')[0];
        setUserFirstName(firstName);
      }
    } catch (error) {
      console.error('[Dashboard] Error loading user profile:', error);
    }
  }

  // ---------- Effects ----------

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      await loadCVs();
      await loadCvChecks();
      await loadUserTokens();
      await loadUserProfile();
      setIsLoading(false);
    })();

    // Prüfe ob Paywall nach Login angezeigt werden soll
    const actionParam = searchParams.get('action');
    const cvIdParam = searchParams.get('cvId');

    if (actionParam === 'buy-tokens') {
      console.log('[Dashboard] 💰 Opening paywall after login');
      setShowPaywall(true);
      setSearchParams({});
    } else if (actionParam === 'cv-unlock' && cvIdParam) {
      console.log('[Dashboard] 🔓 CV unlock flow - redirecting to paywall with cvId:', cvIdParam);
      navigate(`/cv-paywall?cvId=${cvIdParam}&source=cv-unlock`, { replace: true });
    }

    // Nach erfolgreicher Zahlung Daten neu laden
    const paymentParam = searchParams.get('payment');
    const downloadCvParam = searchParams.get('downloadCv');

    if (paymentParam === 'success') {
      console.log('[Dashboard] ✅ Payment successful - reloading CVs');
      setShowPaymentSuccess(true);

      setTimeout(async () => {
        await loadCVs();
        await loadUserTokens();
        await loadCvChecks();

        // ✅ Auto-Download nach CV-Kauf (aus Editor Flow)
        if (downloadCvParam) {
          console.log('[Dashboard] 📥 Auto-downloading CV after payment:', downloadCvParam);
          try {
            const { data: cvData, error } = await supabase
              .from('stored_cvs')
              .select('pdf_url, file_name')
              .eq('id', downloadCvParam)
              .maybeSingle();

            if (error) {
              console.error('[Dashboard] ❌ Error loading CV for download:', error);
            } else if (cvData?.pdf_url) {
              console.log('[Dashboard] ✅ PDF URL found, starting download:', cvData.pdf_url);

              // PDF direkt öffnen/downloaden
              const link = document.createElement('a');
              link.href = cvData.pdf_url;
              link.target = '_blank';
              link.download = cvData.file_name || 'lebenslauf.pdf';
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } else {
              console.log('[Dashboard] ⚠️ No PDF URL yet for CV:', downloadCvParam);
            }
          } catch (err) {
            console.error('[Dashboard] ❌ Error during auto-download:', err);
          }
        }
      }, 1000);

      setTimeout(() => {
        setShowPaymentSuccess(false);
      }, 5000);

      const newParams = new URLSearchParams(searchParams);
      newParams.delete('payment');
      newParams.delete('cvId');
      newParams.delete('downloadCv');
      setSearchParams(newParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-Refresh für Entwürfe ohne PDF (alle 10 Sekunden)
  useEffect(() => {
    const draftsWithoutPdf = userCVs.filter(
      (cv) => (cv.download_unlocked || cv.is_paid) && !cv.pdf_url
    );

    if (draftsWithoutPdf.length === 0) return;

    console.log('[Dashboard] Auto-refresh aktiv:', draftsWithoutPdf.length, 'Entwürfe warten auf PDF');

    const intervalId = setInterval(async () => {
      console.log('[Dashboard] Refreshing CVs...');
      await loadCVs();
    }, 10000);

    return () => clearInterval(intervalId);
  }, [userCVs]);

  // ---------- Actions ----------

  const handleOptimizeCV = async (cv: any) => {
    setSelectedCVForOptimize(cv);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    if (userTokens <= 0) {
      setShowPaywall(true);
    } else {
      setShowOptimizeModal(true);
    }
  };

  const handleSubmitJobData = async (jobData: any) => {
    if (!selectedCVForOptimize) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const consumed = await tokenService.consumeToken(user.id);
      if (!consumed) {
        throw new Error('Nicht genügend Credits');
      }

      await cvStorageService.saveCVData({
        id: selectedCVForOptimize.id,
        cvData: selectedCVForOptimize.cv_data,
        jobData,
        isPaid: true,
        mode: 'update',
        source: 'dashboard_optimize',
      });

      setOptimizedJobData(jobData);
      await loadUserTokens();

      setShowOptimizeModal(false);
      setShowAdjustmentModal(true);
    } catch (error) {
      console.error('Error optimizing CV:', error);
      alert(
        'Fehler beim Optimieren: ' +
          (error instanceof Error ? error.message : 'Unbekannter Fehler')
      );
    }
  };

  const handleRepeatWizard = () => {
    if (!selectedCVForOptimize) return;
    navigate(`/cv-wizard?mode=update&cvId=${selectedCVForOptimize.id}`);
  };

  const handleGoToEditor = () => {
    if (!selectedCVForOptimize) return;
    navigate(`/cv-live-editor/${selectedCVForOptimize.id}`, {
      state: {
        cvData: selectedCVForOptimize.cv_data,
        jobData: optimizedJobData,
      },
    });
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
  };

  const handlePaywallSuccess = async () => {
    await loadUserTokens();
    setShowPaywall(false);
    setShowOptimizeModal(true);
  };


  const handleCreateCV = () => {
    navigate('/cv-wizard?mode=new');
  };

  const handleDownloadCV = async (cv: any) => {
    console.log('[Dashboard] Downloading CV:', cv.id);

    const result = await cvDownloadService.downloadCV(cv.id);

    if (!result.success) {
      if (result.error === 'redirect_to_editor') {
        console.log('[Dashboard] No PDF found, redirecting to editor');
        navigate(`/cv-live-editor/${cv.id}`);
        return;
      }

      alert(result.error || 'Fehler beim Herunterladen des CVs');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Berechne CV-Check-Daten
  const allCvChecks = cvChecks;
  const latestCompletedCheck = cvChecks.find(
    (check) => check.analysis_status === 'completed' || check.ats_json
  );

  // ---------- Render ----------

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
      {showPaymentSuccess && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
          <div className="bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black px-6 py-4 rounded-xl shadow-2xl border-2 border-white/20 flex items-center gap-3 max-w-md">
            <CheckCircle size={24} className="flex-shrink-0" />
            <div>
              <div className="font-bold text-lg">Zahlung erfolgreich!</div>
              <div className="text-sm text-black/80">
                Dein CV wurde freigeschaltet. Du findest ihn jetzt in deinem Dashboard.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent">
                {profile?.full_name ? `Hallo ${profile.full_name.split(' ')[0]}!` : 'Hallo!'}
              </h1>
              <p className="text-xs sm:text-sm text-white/70 mt-1">
                Behalte alle deine Bewerbungen im Blick
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 flex items-center gap-2">
                <Coins size={18} className="text-[#66c0b6]" />
                <div>
                  <div className="text-xs text-white/60">Credits</div>
                  <div className="text-sm font-bold">{userTokens}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-2 text-white/70 hover:text-white text-sm"
                title="Ausloggen"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Ausloggen</span>
              </button>

              <button
                onClick={handleCreateCV}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold hover:opacity-90 transition-all shadow-lg flex items-center justify-center gap-2 text-sm"
              >
                <Plus size={18} />
                <span className="hidden sm:inline">Neuen CV</span>
                <span className="sm:hidden">CV erstellen</span>
              </button>

              <button
                onClick={() => {
                  if (allCvChecks.length === 0) {
                    navigate('/cv-check');
                  } else if (latestCompletedCheck?.id) {
                    navigate(`/cv-result/${latestCompletedCheck.id}`);
                  }
                }}
                className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <ClipboardCheck size={18} />
                <span className="hidden sm:inline">CV-Check</span>
                <span className="sm:hidden">Check</span>
              </button>
            </div>
          </div>


          {userCVs.filter((cv) => (cv.download_unlocked || cv.is_paid) && !cv.pdf_url).length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles size={20} className="text-[#66c0b6]" />
                Entwürfe
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mb-3">
                Deine CVs werden gerade erstellt. Sobald das PDF fertig ist, erscheint es hier zum Download.
              </p>

              <div className="grid gap-2 sm:gap-3">
                {userCVs
                  .filter((cv) => (cv.download_unlocked || cv.is_paid) && !cv.pdf_url)
                  .map((cv) => (
                    <div key={cv.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#66c0b6]"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-bold text-white mb-1 truncate">
                            {cv.file_name || 'Neuer Lebenslauf'}
                          </h3>
                          <p className="text-xs text-white/60 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-[#66c0b6] animate-pulse"></span>
                            PDF wird generiert...
                          </p>
                        </div>
                        <button
                          onClick={() => navigate(`/cv-live-editor/${cv.id}`)}
                          className="px-3 py-2 rounded-lg bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold hover:opacity-90 transition-all shadow-lg whitespace-nowrap text-xs sm:text-sm"
                        >
                          Editor
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {userCVs.filter((cv) => (cv.download_unlocked || cv.is_paid) && !cv.pdf_url).length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
                <ClipboardCheck size={20} className="text-amber-500" />
                Bewerbungs-Entwürfe
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mb-3">
                Diese Entwürfe warten auf PDF-Generierung. Bearbeite die Details und fahre fort.
              </p>

              <div className="grid gap-2 sm:gap-3">
                {userCVs
                  .filter((cv) => (cv.download_unlocked || cv.is_paid) && !cv.pdf_url)
                  .map((cv) => (
                    <DraftCVCard
                      key={cv.id}
                      cv={cv}
                      onEdit={(cv) => navigate(`/cv/${cv.id}`)}
                      onDelete={loadCVs}
                      onUpdate={loadCVs}
                    />
                  ))}
              </div>
            </div>
          )}

          {userCVs.filter((cv) => (cv.download_unlocked || cv.is_paid) && cv.pdf_url).length > 0 && (
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Sparkles size={20} className="text-[#66c0b6]" />
                Fertige CVs
              </h2>
              <p className="text-xs sm:text-sm text-white/60 mb-3">
                Deine fertigen CVs kannst du hier als PDF herunterladen
              </p>

              <div className="grid gap-2 sm:gap-3">
                {userCVs
                  .filter((cv) => (cv.download_unlocked || cv.is_paid) && cv.pdf_url)
                  .map((cv) => (
                    <OptimizedCVCard
                      key={cv.id}
                      cv={cv}
                      onDownload={handleDownloadCV}
                      onUpdate={loadCVs}
                    />
                  ))}
              </div>
            </div>
          )}

          <h2 className="text-base sm:text-lg font-bold text-white mb-2">Bewerbungs-Kanban</h2>
          <p className="text-xs sm:text-sm text-white/60 mb-3">Verschiebe deine Bewerbungen zwischen den Spalten um den Status zu aktualisieren</p>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#66c0b6] mx-auto"></div>
              <p className="mt-4 text-white/60">Lade Bewerbungen...</p>
            </div>
          ) : userCVs.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 md:p-12 text-center space-y-4">
              <Briefcase size={64} className="mx-auto text-white/30" />
              <h3 className="text-xl md:text-2xl font-bold">
                Noch keine Bewerbungen
              </h3>
              <p className="text-white/60 max-w-md mx-auto">
                Starte deine erste Bewerbung und tracke deinen Fortschritt
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
                <button
                  onClick={() => navigate('/cv-wizard?mode=new')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold hover:opacity-90 transition-all inline-flex items-center gap-2"
                >
                  <Plus size={20} />
                  Erste Bewerbung erstellen
                </button>
              </div>
            </div>
          ) : (
            <KanbanBoard cvs={userCVs} onCVUpdate={loadCVs} />
          )}
        </div>
      </div>

      <OptimizeJobModal
        isOpen={showOptimizeModal}
        onClose={() => setShowOptimizeModal(false)}
        onSubmit={handleSubmitJobData}
      />

      <CVAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onRepeatWizard={handleRepeatWizard}
        onGoToEditor={handleGoToEditor}
      />

      <TokenPaywallModal
        isOpen={showPaywall}
        onClose={handlePaywallClose}
        onSuccess={handlePaywallSuccess}
      />
    </div>
  );
}
