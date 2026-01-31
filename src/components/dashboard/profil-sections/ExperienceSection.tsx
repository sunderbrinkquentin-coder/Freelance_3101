import { useState, useEffect } from 'react';
import { Briefcase, Edit, X, Save, Plus, Trash2, Check } from 'lucide-react';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';

interface Experience {
  position: string;
  firma: string;
  von: string;
  bis: string;
  aufgaben?: string;
  erfolge?: string[];
}

interface ExperienceSectionProps {
  data: Experience[];
  onUpdate: (data: Experience[]) => Promise<void>;
}

export default function ExperienceSection({ data, onUpdate }: ExperienceSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Experience[]>(data || []);
  const [saving, setSaving] = useState(false);
  const { syncState, syncAgentResponse } = useRealtimeSync();

  useEffect(() => {
    if (isEditing && JSON.stringify(formData) !== JSON.stringify(data)) {
      syncAgentResponse('berufserfahrung', formData);
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

  const addExperience = () => {
    setFormData([...formData, { position: '', firma: '', von: '', bis: '', aufgaben: '', erfolge: [] }]);
  };

  const removeExperience = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof Experience, value: string) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  return (
    <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Briefcase className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Berufserfahrung</h3>
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
          {formData.map((exp, index) => (
            <div key={index} className="p-4 bg-white bg-opacity-5 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Position {index + 1}</h4>
                <button
                  onClick={() => removeExperience(index)}
                  className="p-2 hover:bg-error hover:bg-opacity-10 rounded-lg transition-colors text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Position <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  placeholder="z.B. Senior Product Manager"
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Firma <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={exp.firma}
                  onChange={(e) => updateExperience(index, 'firma', e.target.value)}
                  placeholder="z.B. BMW AG"
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Von <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={exp.von}
                    onChange={(e) => updateExperience(index, 'von', e.target.value)}
                    placeholder="z.B. Jan 2020"
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Bis
                  </label>
                  <input
                    type="text"
                    value={exp.bis}
                    onChange={(e) => updateExperience(index, 'bis', e.target.value)}
                    placeholder="z.B. Heute oder Dez 2023"
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Hauptaufgaben
                </label>
                <textarea
                  value={exp.aufgaben || ''}
                  onChange={(e) => updateExperience(index, 'aufgaben', e.target.value)}
                  placeholder="z.B. Leitung von cross-funktionalen Teams, Produktstrategie..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Erfolge (min. 2)
                </label>
                <div className="space-y-2">
                  {(exp.erfolge || []).map((erfolg, erfolgIndex) => (
                    <div key={erfolgIndex} className="flex gap-2">
                      <input
                        type="text"
                        value={erfolg}
                        onChange={(e) => {
                          const newErfolge = [...(exp.erfolge || [])];
                          newErfolge[erfolgIndex] = e.target.value;
                          updateExperience(index, 'erfolge', newErfolge);
                        }}
                        placeholder="z.B. Steigerung der Kundenzufriedenheit um 35%"
                        className="flex-1 px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                      />
                      <button
                        onClick={() => {
                          const newErfolge = (exp.erfolge || []).filter((_, i) => i !== erfolgIndex);
                          updateExperience(index, 'erfolge', newErfolge);
                        }}
                        className="p-2 hover:bg-error hover:bg-opacity-10 rounded-lg transition-colors text-error"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newErfolge = [...(exp.erfolge || []), ''];
                      updateExperience(index, 'erfolge', newErfolge);
                    }}
                    className="w-full px-4 py-2 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-primary font-medium flex items-center justify-center gap-2 border border-dashed border-primary border-opacity-30"
                  >
                    <Plus size={16} />
                    <span>+ Erfolg hinzufügen</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={addExperience}
            className="w-full px-4 py-3 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-white font-medium flex items-center justify-center gap-2 border border-dashed border-white border-opacity-20"
          >
            <Plus size={20} />
            <span>Weitere Position hinzufügen</span>
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
          <p className="text-text-secondary text-sm mb-4">{data?.length || 0} Positionen</p>
          {data && data.length > 0 ? (
            <div className="space-y-4">
              {data.map((exp, idx) => (
                <div key={idx} className="p-4 bg-white bg-opacity-5 rounded-lg">
                  <p className="font-semibold text-white">{exp.position}</p>
                  <p className="text-sm text-text-secondary">{exp.firma}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {exp.von} - {exp.bis || 'Heute'}
                  </p>
                  {exp.aufgaben && (
                    <p className="text-sm text-text-secondary mt-2">{exp.aufgaben}</p>
                  )}
                  {exp.erfolge && exp.erfolge.length > 0 && (
                    <ul className="text-sm text-text-secondary mt-2 list-disc list-inside space-y-1">
                      {exp.erfolge.map((erfolg, idx) => (
                        <li key={idx}>{erfolg}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Keine Berufserfahrung hinzugefügt</p>
          )}
        </div>
      )}
    </div>
  );
}
