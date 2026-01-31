import { useState, useEffect } from 'react';
import { Award, Edit, X, Save, Plus, Trash2, Check } from 'lucide-react';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';

interface Certificate {
  titel: string;
  organisation: string;
  datum: string;
  beschreibung?: string;
}

interface CertificatesSectionProps {
  data: Certificate[];
  onUpdate: (data: Certificate[]) => Promise<void>;
}

export default function CertificatesSection({ data, onUpdate }: CertificatesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Certificate[]>(data || []);
  const [saving, setSaving] = useState(false);
  const { syncState, syncAgentResponse } = useRealtimeSync();

  useEffect(() => {
    if (isEditing && JSON.stringify(formData) !== JSON.stringify(data)) {
      syncAgentResponse('zertifikate', formData);
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

  const addCertificate = () => {
    setFormData([...formData, { titel: '', organisation: '', datum: '', beschreibung: '' }]);
  };

  const removeCertificate = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateCertificate = (index: number, field: keyof Certificate, value: string) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  return (
    <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Award className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Zertifikate</h3>
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
            {data?.length > 0 ? <Edit size={16} /> : <Plus size={16} />}
            <span>{data?.length > 0 ? 'Bearbeiten' : 'Zertifikate hinzufügen'}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {formData.map((cert, index) => (
            <div key={index} className="p-4 bg-white bg-opacity-5 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Zertifikat {index + 1}</h4>
                <button
                  onClick={() => removeCertificate(index)}
                  className="p-2 hover:bg-error hover:bg-opacity-10 rounded-lg transition-colors text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Titel <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={cert.titel}
                  onChange={(e) => updateCertificate(index, 'titel', e.target.value)}
                  placeholder="z.B. AWS Certified Solutions Architect"
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Organisation <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={cert.organisation}
                    onChange={(e) => updateCertificate(index, 'organisation', e.target.value)}
                    placeholder="z.B. Amazon Web Services"
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Datum <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={cert.datum}
                    onChange={(e) => updateCertificate(index, 'datum', e.target.value)}
                    placeholder="z.B. Dez 2023"
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={cert.beschreibung || ''}
                  onChange={(e) => updateCertificate(index, 'beschreibung', e.target.value)}
                  placeholder="Zusätzliche Informationen zum Zertifikat..."
                  rows={2}
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addCertificate}
            className="w-full px-4 py-3 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-white font-medium flex items-center justify-center gap-2 border border-dashed border-white border-opacity-20"
          >
            <Plus size={20} />
            <span>Weiteres Zertifikat hinzufügen</span>
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
          <p className="text-text-secondary text-sm mb-4">
            {data?.length > 0 ? `${data.length} Zertifikate` : 'Keine Zertifikate'}
          </p>
          {data && data.length > 0 ? (
            <div className="space-y-4">
              {data.map((cert, idx) => (
                <div key={idx} className="p-4 bg-white bg-opacity-5 rounded-lg">
                  <p className="font-semibold text-white">{cert.titel}</p>
                  <p className="text-sm text-text-secondary">{cert.organisation} • {cert.datum}</p>
                  {cert.beschreibung && (
                    <p className="text-sm text-text-secondary mt-2">{cert.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Keine Zertifikate hinzugefügt</p>
          )}
        </div>
      )}
    </div>
  );
}
