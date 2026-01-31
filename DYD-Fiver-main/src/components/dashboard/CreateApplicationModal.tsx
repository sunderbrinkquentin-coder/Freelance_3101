import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, Diamond, AlertCircle } from 'lucide-react';
import { dbService } from '../../services/databaseService';
import { PaywallModal } from '../PaywallModal';

interface CreateApplicationModalProps {
  tokenBalance: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateApplicationModal({
  tokenBalance,
  onClose,
  onSuccess,
}: CreateApplicationModalProps) {
  const navigate = useNavigate();
  const [position, setPosition] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showPaywall, setShowPaywall] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (tokenBalance < 1) {
      setShowPaywall(true);
      return;
    }

    try {
      setLoading(true);
      const messages = [
        'Lade CV-Daten...',
        'Analysiere Stellenbeschreibung...',
        'Erstelle optimierten CV...',
        'Fast fertig...',
      ];

      let messageIndex = 0;
      setLoadingMessage(messages[0]);

      const interval = setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        setLoadingMessage(messages[messageIndex]);
      }, 2000);

      const baseData = await dbService.getBaseData();

      if (!baseData) {
        clearInterval(interval);
        setLoading(false);
        alert('Keine CV-Daten gefunden. Bitte fülle zuerst deinen CV aus.');
        return;
      }

      const application = await dbService.createJobApplication({
        vorname: baseData.vorname,
        nachname: baseData.nachname,
        email: baseData.email,
        telefon: baseData.telefon,
        ort: baseData.ort,
        plz: baseData.plz,
        linkedin: baseData.linkedin,
        website: baseData.website,
        bildung_entries: baseData.bildung_entries,
        berufserfahrung_entries: baseData.berufserfahrung_entries,
        projekte_entries: baseData.projekte_entries,
        sprachen_list: baseData.sprachen_list,
        zertifikate_entries: baseData.zertifikate_entries,
        hard_skills: baseData.hard_skills,
        soft_skills: baseData.soft_skills,
        top_skills: baseData.top_skills,
        zusaetzliche_infos: baseData.zusaetzliche_infos,
        rolle: position,
        unternehmen: company,
        stellenbeschreibung: description || null,
        berufserfahrung_entries_optimiert: null,
        projekte_entries_optimiert: null,
        skills_optimiert: null,
        profile_summary: null,
        sales: null,
        optimized_cv_html: null,
        status: 'entwurf',
      });

      await dbService.updateUserSettings({ token_balance: tokenBalance - 1 });

      clearInterval(interval);

      setTimeout(() => {
        onSuccess();
        if (application?.id) {
          navigate('/result');
        }
      }, 1000);
    } catch (error) {
      console.error('Failed to create application:', error);
      setLoading(false);
    }
  };

  const handlePaywallConfirm = async () => {
    console.log('User confirmed purchase - implement Stripe integration here');
    setShowPaywall(false);
    onSuccess();
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        <div className="bg-dark-card rounded-xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-xl text-white font-semibold">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onConfirm={handlePaywallConfirm}
        type="bundle"
        context="application"
      />

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
        <div className="bg-dark-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
          <h2 className="text-2xl font-bold text-white">CV für neue Stelle optimieren</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Wunschstelle <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="z.B. Senior Product Manager"
                required
                className="w-full px-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Firma <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="z.B. BMW AG"
                required
                className="w-full px-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Stellenbeschreibung (optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Füge hier die Stellenbeschreibung ein für bessere Optimierung..."
                rows={6}
                className="w-full px-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none"
              />
              <p className="text-xs text-text-secondary mt-2">
                💡 Je mehr Details, desto besser die Optimierung
              </p>
            </div>

            <div className="p-4 bg-primary bg-opacity-10 border border-primary rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Diamond className="text-primary" size={20} />
                  <span className="text-white font-semibold">Kostet: 1 Token</span>
                </div>
                <span className="text-text-secondary">
                  Dein Guthaben: {tokenBalance} Token{tokenBalance !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {tokenBalance < 1 && (
              <div className="p-4 bg-error bg-opacity-10 border border-error rounded-lg flex items-start gap-3">
                <AlertCircle className="text-error flex-shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <p className="text-error font-semibold mb-2">Du hast keine Tokens mehr!</p>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/tokens')}
                    className="px-4 py-2 bg-error hover:bg-opacity-80 rounded-lg text-white font-semibold transition-colors"
                  >
                    Jetzt Tokens kaufen
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white border-opacity-10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-text-secondary hover:text-white transition-colors font-semibold"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!position || !company || tokenBalance < 1}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>CV optimieren</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
