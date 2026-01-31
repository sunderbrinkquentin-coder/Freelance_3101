import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ExternalLink, Calendar, Building2, Sparkles, Lock, Unlock } from 'lucide-react';
import { cvStorageService, StoredCV } from '../../services/cvStorageService';

export default function CVOptimizationsSection() {
  const navigate = useNavigate();
  const [cvs, setCvs] = useState<StoredCV[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCVs();
  }, []);

  const loadCVs = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🟦 [CV-OPTIMIZATIONS] Loading CVs from cvStorageService...');

      // 🔥 Hole aktuellen User
      const { data: { user } } = await import('../../lib/supabase').then(m => m.supabase.auth.getUser());
      if (!user) {
        console.warn('[CV-OPTIMIZATIONS] No user logged in');
        setCvs([]);
        return;
      }

      // 🔥 Nutze getUserCVs statt listUserCVs
      const result = await cvStorageService.getUserCVs(user.id);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to load CVs');
      }

      console.log('🟩 [CV-OPTIMIZATIONS] Loaded:', result.data.length, 'CVs');
      setCvs(result.data);
    } catch (err: any) {
      console.error('❌ [CV-OPTIMIZATIONS] Error:', err);
      setError('Fehler beim Laden der CV-Optimierungen');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getStatusBadge = (isPaid: boolean) => {
    if (isPaid) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-[#66c0b6]/20 text-[#66c0b6] border-[#66c0b6]/30 flex items-center gap-1">
          <Unlock size={12} />
          Freigeschaltet
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-gray-500/20 text-gray-300 border-gray-500/30 flex items-center gap-1">
          <Lock size={12} />
          Gesperrt
        </span>
      );
    }
  };

  const handleOpenEditor = (cv: StoredCV) => {
    console.log('🟦 [CV-OPTIMIZATIONS] Opening editor:', cv.id);
    // 🔥 FIX: Route zu /cv-live-editor/:cvId
    navigate(`/cv-live-editor/${cv.id}`);
  };

  if (loading) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="text-[#66c0b6]" size={28} />
          Meine CV-Optimierungen
        </h2>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-4 border-[#66c0b6]/30 border-t-[#66c0b6] rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Sparkles className="text-[#66c0b6]" size={28} />
          Meine CV-Optimierungen
        </h2>
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6">
          <p className="text-red-400 text-center">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <Sparkles className="text-[#66c0b6]" size={28} />
        Meine CV-Optimierungen
      </h2>

      {cvs.length === 0 ? (
        <div className="bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 bg-[#66c0b6]/10 rounded-full flex items-center justify-center mx-auto">
              <FileText className="text-[#66c0b6]" size={40} />
            </div>
            <h3 className="text-xl font-semibold text-white">
              Noch keine CV-Optimierungen
            </h3>
            <p className="text-white/60 leading-relaxed">
              Du hast noch keine CV-Optimierungen durchgeführt. Starte jetzt und lass uns deinen
              perfekten Lebenslauf erstellen!
            </p>
            <button
              onClick={() => navigate('/cv-wizard?mode=new')}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold rounded-xl hover:opacity-90 transition-all inline-flex items-center gap-2"
            >
              <Sparkles size={20} />
              Jetzt CV erstellen
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cvs.map((cv) => (
            <div
              key={cv.id}
              className="group bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-[#66c0b6]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#66c0b6]/10"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-white truncate mb-1">
                      {cv.job_data?.jobTitle || 'Ohne Titel'}
                    </h3>
                    <p className="text-white/60 text-sm truncate flex items-center gap-2">
                      <Building2 size={14} />
                      {cv.job_data?.company || 'Ohne Unternehmen'}
                    </p>
                  </div>
                  {getStatusBadge(cv.is_paid)}
                </div>

                <div className="flex items-center gap-2 text-xs text-white/50">
                  <Calendar size={14} />
                  <span>Erstellt am {formatDate(cv.created_at)}</span>
                </div>

                <button
                  onClick={() => handleOpenEditor(cv)}
                  disabled={!cv.is_paid}
                  className="w-full px-4 py-3 bg-[#66c0b6]/10 hover:bg-[#66c0b6]/20 text-[#66c0b6] font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-[#66c0b6]/20 hover:border-[#66c0b6]/40 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ExternalLink size={18} />
                  {cv.is_paid ? 'Im Editor öffnen' : 'Gesperrt'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
