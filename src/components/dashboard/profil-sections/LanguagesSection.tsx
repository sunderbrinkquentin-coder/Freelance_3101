import { useState, useEffect } from 'react';
import { Globe, Edit, X, Save, Plus, Trash2, Check } from 'lucide-react';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';

interface Language {
  sprache: string;
  niveau: string;
}

interface LanguagesSectionProps {
  data: Language[];
  onUpdate: (data: Language[]) => Promise<void>;
}

export default function LanguagesSection({ data, onUpdate }: LanguagesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Language[]>(data || []);
  const [saving, setSaving] = useState(false);
  const { syncState, syncAgentResponse } = useRealtimeSync();

  const niveauOptions = ['Muttersprache', 'Fließend', 'Verhandlungssicher', 'Gut', 'Grundkenntnisse'];

  useEffect(() => {
    if (isEditing && JSON.stringify(formData) !== JSON.stringify(data)) {
      syncAgentResponse('sprachen', formData);
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
    setFormData(data || []);
    setIsEditing(false);
  };

  const addLanguage = () => {
    setFormData([...formData, { sprache: '', niveau: '' }]);
  };

  const removeLanguage = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateLanguage = (index: number, field: keyof Language, value: string) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  return (
    <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Globe className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Sprachen</h3>
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
        <div className="space-y-6">
          {formData.map((lang, index) => (
            <div key={index} className="p-4 bg-white bg-opacity-5 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Sprache {index + 1}</h4>
                <button
                  onClick={() => removeLanguage(index)}
                  className="p-2 hover:bg-error hover:bg-opacity-10 rounded-lg transition-colors text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Sprache <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={lang.sprache}
                    onChange={(e) => updateLanguage(index, 'sprache', e.target.value)}
                    placeholder="z.B. Deutsch, Englisch"
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Niveau <span className="text-error">*</span>
                  </label>
                  <select
                    value={lang.niveau}
                    onChange={(e) => updateLanguage(index, 'niveau', e.target.value)}
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="" className="bg-dark-card">Wählen...</option>
                    {niveauOptions.map((option) => (
                      <option key={option} value={option} className="bg-dark-card">
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addLanguage}
            className="w-full px-4 py-3 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-white font-medium flex items-center justify-center gap-2 border border-dashed border-white border-opacity-20"
          >
            <Plus size={20} />
            <span>Weitere Sprache hinzufügen</span>
          </button>

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
        <div>
          {data && data.length > 0 ? (
            <div className="space-y-3 mt-3">
              {data.map((lang, idx) => (
                <div key={idx} className="p-3 bg-white bg-opacity-5 rounded-lg">
                  <p className="font-semibold text-white">{lang.sprache}</p>
                  <p className="text-sm text-text-secondary">{lang.niveau}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Keine Sprachen hinzugefügt</p>
          )}
        </div>
      )}
    </div>
  );
}
