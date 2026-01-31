import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { dbService } from '../../services/databaseService';
import { JobApplication } from '../../types/database';

interface EditApplicationModalProps {
  application: JobApplication;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditApplicationModal({
  application,
  onClose,
  onSuccess,
}: EditApplicationModalProps) {
  const [rolle, setRolle] = useState(application.rolle);
  const [unternehmen, setUnternehmen] = useState(application.unternehmen);
  const [stellenbeschreibung, setStellenbeschreibung] = useState(application.stellenbeschreibung || '');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);
      await dbService.updateJobApplication(application.id, {
        rolle,
        unternehmen,
        stellenbeschreibung: stellenbeschreibung || null,
      });
      onSuccess();
    } catch (error) {
      console.error('Failed to update application:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75">
      <div className="bg-dark-card rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white border-opacity-10">
          <h2 className="text-2xl font-bold text-white">Bewerbung bearbeiten</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-10 rounded-lg transition-colors"
          >
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Wunschstelle <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={rolle}
                onChange={(e) => setRolle(e.target.value)}
                placeholder="z.B. Senior Product Manager"
                required
                className="w-full px-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Firma <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={unternehmen}
                onChange={(e) => setUnternehmen(e.target.value)}
                placeholder="z.B. BMW AG"
                required
                className="w-full px-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Stellenbeschreibung (optional)
              </label>
              <textarea
                value={stellenbeschreibung}
                onChange={(e) => setStellenbeschreibung(e.target.value)}
                placeholder="Füge hier die Stellenbeschreibung ein für bessere Optimierung..."
                rows={6}
                className="w-full px-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-white border-opacity-10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-6 py-3 text-text-secondary hover:text-white transition-colors font-semibold disabled:opacity-50"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={!rolle || !unternehmen || loading}
              className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={20} />
              <span>Änderungen speichern</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
