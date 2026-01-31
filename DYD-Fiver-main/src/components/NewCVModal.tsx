import { X, Edit, Zap, CheckCircle } from 'lucide-react';

interface NewCVModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReviewProfile: () => void;
  onDirectToJob: () => void;
}

export function NewCVModal({ isOpen, onClose, onReviewProfile, onDirectToJob }: NewCVModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full">
        <div className="sticky top-0 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border-b border-white/10 p-6 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-2xl font-bold text-white">Wie möchtest du starten?</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={24} className="text-white/60" />
          </button>
        </div>

        <div className="p-6 sm:p-8">
          <p className="text-white/70 mb-8 text-center">
            Wir haben deine Basisdaten schon gespeichert. Möchtest du etwas aktualisieren oder direkt
            eine neue Wunschstelle hinzufügen?
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onReviewProfile}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#66c0b6]/50 rounded-xl p-6 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#66c0b6]/20 to-[#30E3CA]/20 border border-[#66c0b6]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Edit size={24} className="text-[#66c0b6]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Basisdaten prüfen & aktualisieren
                  </h3>
                  <p className="text-sm text-white/60">
                    Sieh dir deine bereits gespeicherten Infos an und passe einzelne Abschnitte an.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <CheckCircle size={16} className="text-[#66c0b6]" />
                  <span>Perfekt für größere Änderungen</span>
                </div>
              </div>
            </button>

            <button
              onClick={onDirectToJob}
              className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#66c0b6]/50 rounded-xl p-6 transition-all text-left"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-r from-[#66c0b6]/20 to-[#30E3CA]/20 border border-[#66c0b6]/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Zap size={24} className="text-[#66c0b6]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Direkt mit Wunschstelle starten
                  </h3>
                  <p className="text-sm text-white/60">
                    Nutze deine vorhandenen Daten und optimiere deinen CV nur für eine neue Stelle.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm text-white/50">
                  <Zap size={16} className="text-[#66c0b6]" />
                  <span>Schneller Einstieg in 2 Minuten</span>
                </div>
              </div>
            </button>
          </div>

          <div className="mt-6 text-center">
            <button
              onClick={onClose}
              className="text-sm text-white/50 hover:text-white/70 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
