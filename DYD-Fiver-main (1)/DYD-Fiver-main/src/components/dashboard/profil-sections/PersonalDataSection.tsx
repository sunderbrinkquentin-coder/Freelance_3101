import { useState, useEffect } from 'react';
import { User, Edit, X, Save, Check } from 'lucide-react';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';

interface PersonalDataSectionProps {
  data: any;
  onUpdate: (data: any) => Promise<void>;
}

export default function PersonalDataSection({ data, onUpdate }: PersonalDataSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(data);
  const [saving, setSaving] = useState(false);
  const { syncState, syncProfile } = useRealtimeSync();

  useEffect(() => {
    if (isEditing && JSON.stringify(formData) !== JSON.stringify(data)) {
      syncProfile(formData);
    }
  }, [formData, isEditing]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onUpdate(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(data);
    setIsEditing(false);
  };

  return (
    <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <User className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Persönliche Daten</h3>
          {isEditing && syncState.status === 'synced' && (
            <span className="flex items-center gap-1 text-xs text-success">
              <Check size={14} />
              Gespeichert
            </span>
          )}
          {isEditing && syncState.status === 'syncing' && (
            <span className="flex items-center gap-1 text-xs text-text-secondary">
              <div className="w-3 h-3 border-2 border-text-secondary border-t-transparent rounded-full animate-spin" />
              Speichert...
            </span>
          )}
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-white font-medium flex items-center gap-2"
          >
            <Edit size={16} />
            <span>Bearbeiten</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Vorname <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.vorname}
                onChange={(e) => setFormData({ ...formData, vorname: e.target.value })}
                className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Nachname <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.nachname}
                onChange={(e) => setFormData({ ...formData, nachname: e.target.value })}
                className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">
              Email <span className="text-error">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Telefon</label>
            <input
              type="tel"
              value={formData.telefon}
              onChange={(e) => setFormData({ ...formData, telefon: e.target.value })}
              className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">
                Ort <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={formData.ort}
                onChange={(e) => setFormData({ ...formData, ort: e.target.value })}
                className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-text-secondary mb-2">PLZ</label>
              <input
                type="text"
                value={formData.plz}
                onChange={(e) => setFormData({ ...formData, plz: e.target.value })}
                className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">LinkedIn</label>
            <input
              type="url"
              value={formData.linkedin}
              onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
              placeholder="linkedin.com/in/..."
              className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-text-secondary mb-2">Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="www.example.com"
              className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <X size={16} />
              <span>Abbrechen</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              <span>Speichern</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2 text-white">
          <p>
            <span className="text-text-secondary">Name:</span> {data.vorname} {data.nachname}
          </p>
          <p>
            <span className="text-text-secondary">Email:</span> {data.email}
          </p>
          {data.telefon && (
            <p>
              <span className="text-text-secondary">Telefon:</span> {data.telefon}
            </p>
          )}
          <p>
            <span className="text-text-secondary">Ort:</span> {data.ort}
            {data.plz && `, ${data.plz}`}
          </p>
          {data.linkedin && (
            <p>
              <span className="text-text-secondary">LinkedIn:</span>{' '}
              <a href={data.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {data.linkedin}
              </a>
            </p>
          )}
          {data.website && (
            <p>
              <span className="text-text-secondary">Website:</span>{' '}
              <a href={data.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {data.website}
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
