import { useState, useEffect } from 'react';
import { GraduationCap, Edit, X, Save, Plus, Trash2, Check } from 'lucide-react';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';

interface Education {
  abschluss: string;
  institution: string;
  schwerpunkt?: string;
  von: string;
  bis: string;
  note?: string;
  beschreibung?: string;
}

interface EducationSectionProps {
  data: Education[];
  onUpdate: (data: Education[]) => Promise<void>;
}

export default function EducationSection({ data, onUpdate }: EducationSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Education[]>(data || []);
  const [saving, setSaving] = useState(false);
  const { syncState, syncAgentResponse } = useRealtimeSync();

  useEffect(() => {
    if (isEditing && JSON.stringify(formData) !== JSON.stringify(data)) {
      syncAgentResponse('bildung', formData);
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

  const addEducation = () => {
    setFormData([...formData, { abschluss: '', institution: '', schwerpunkt: '', von: '', bis: '', note: '', beschreibung: '' }]);
  };

  const removeEducation = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  return (
    <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <GraduationCap className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Bildung</h3>
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
          {formData.map((edu, index) => (
            <div key={index} className="p-4 bg-white bg-opacity-5 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Abschluss {index + 1}</h4>
                <button
                  onClick={() => removeEducation(index)}
                  className="p-2 hover:bg-error hover:bg-opacity-10 rounded-lg transition-colors text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Abschluss <span className="text-error">*</span>
                </label>
                <select
                  value={edu.abschluss}
                  onChange={(e) => updateEducation(index, 'abschluss', e.target.value)}
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                >
                  <option value="">Abschluss auswählen...</option>
                  <option value="Bachelor of Science (B.Sc.)">Bachelor of Science (B.Sc.)</option>
                  <option value="Bachelor of Arts (B.A.)">Bachelor of Arts (B.A.)</option>
                  <option value="Bachelor of Engineering (B.Eng.)">Bachelor of Engineering (B.Eng.)</option>
                  <option value="Master of Science (M.Sc.)">Master of Science (M.Sc.)</option>
                  <option value="Master of Arts (M.A.)">Master of Arts (M.A.)</option>
                  <option value="Master of Engineering (M.Eng.)">Master of Engineering (M.Eng.)</option>
                  <option value="Master of Business Administration (MBA)">Master of Business Administration (MBA)</option>
                  <option value="Diplom">Diplom</option>
                  <option value="Staatsexamen">Staatsexamen</option>
                  <option value="Promotion (Dr.)">Promotion (Dr.)</option>
                  <option value="Ausbildung">Ausbildung</option>
                  <option value="Abitur">Abitur</option>
                  <option value="Fachabitur">Fachabitur</option>
                  <option value="Realschulabschluss">Realschulabschluss</option>
                  <option value="Hauptschulabschluss">Hauptschulabschluss</option>
                  <option value="Sonstiges">Sonstiges</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Institution <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  placeholder="z.B. TU München"
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Fachrichtung (optional)
                </label>
                <input
                  type="text"
                  value={edu.schwerpunkt || ''}
                  onChange={(e) => updateEducation(index, 'schwerpunkt', e.target.value)}
                  placeholder="z.B. Informatik, Machine Learning"
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
                    value={edu.von}
                    onChange={(e) => updateEducation(index, 'von', e.target.value)}
                    placeholder="z.B. 2018"
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Bis <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    value={edu.bis}
                    onChange={(e) => updateEducation(index, 'bis', e.target.value)}
                    placeholder="z.B. 2021"
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Note (optional)
                </label>
                <input
                  type="text"
                  value={edu.note || ''}
                  onChange={(e) => updateEducation(index, 'note', e.target.value)}
                  placeholder="z.B. 1.5 oder Gut"
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Besonderheiten (optional)
                </label>
                <textarea
                  value={edu.beschreibung || ''}
                  onChange={(e) => updateEducation(index, 'beschreibung', e.target.value)}
                  placeholder="z.B. Stipendium, Auszeichnungen..."
                  rows={2}
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addEducation}
            className="w-full px-4 py-3 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-white font-medium flex items-center justify-center gap-2 border border-dashed border-white border-opacity-20"
          >
            <Plus size={20} />
            <span>Weiteren Abschluss hinzufügen</span>
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
          <p className="text-text-secondary text-sm mb-4">{data?.length || 0} Abschlüsse</p>
          {data && data.length > 0 ? (
            <div className="space-y-4">
              {data.map((edu, idx) => (
                <div key={idx} className="p-4 bg-white bg-opacity-5 rounded-lg">
                  <p className="font-semibold text-white">{edu.abschluss}</p>
                  <p className="text-sm text-text-secondary">{edu.institution}</p>
                  {edu.schwerpunkt && (
                    <p className="text-sm text-text-secondary">Fachrichtung: {edu.schwerpunkt}</p>
                  )}
                  <p className="text-sm text-text-secondary mt-1">
                    {edu.von} - {edu.bis}
                  </p>
                  {edu.note && (
                    <p className="text-sm text-text-secondary mt-1">Note: {edu.note}</p>
                  )}
                  {edu.beschreibung && (
                    <p className="text-sm text-text-secondary mt-2">{edu.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Keine Bildung hinzugefügt</p>
          )}
        </div>
      )}
    </div>
  );
}
