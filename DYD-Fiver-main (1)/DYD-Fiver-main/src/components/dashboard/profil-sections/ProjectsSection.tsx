import { useState, useEffect } from 'react';
import { Folder, Edit, X, Save, Plus, Trash2, Check } from 'lucide-react';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';

interface Project {
  titel: string;
  rolle: string;
  von: string;
  bis: string;
  beschreibung?: string;
}

interface ProjectsSectionProps {
  data: Project[];
  onUpdate: (data: Project[]) => Promise<void>;
}

export default function ProjectsSection({ data, onUpdate }: ProjectsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Project[]>(data || []);
  const [saving, setSaving] = useState(false);
  const { syncState, syncAgentResponse } = useRealtimeSync();

  useEffect(() => {
    if (isEditing && JSON.stringify(formData) !== JSON.stringify(data)) {
      syncAgentResponse('projekte', formData);
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

  const addProject = () => {
    setFormData([...formData, { titel: '', rolle: '', von: '', bis: '', beschreibung: '' }]);
  };

  const removeProject = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const updated = [...formData];
    updated[index] = { ...updated[index], [field]: value };
    setFormData(updated);
  };

  return (
    <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Folder className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Projekte</h3>
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
            <span>{data?.length > 0 ? 'Bearbeiten' : 'Projekte hinzufügen'}</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-6">
          {formData.map((proj, index) => (
            <div key={index} className="p-4 bg-white bg-opacity-5 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">Projekt {index + 1}</h4>
                <button
                  onClick={() => removeProject(index)}
                  className="p-2 hover:bg-error hover:bg-opacity-10 rounded-lg transition-colors text-error"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Projekttitel <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={proj.titel}
                  onChange={(e) => updateProject(index, 'titel', e.target.value)}
                  placeholder="z.B. E-Commerce Platform"
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Rolle <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  value={proj.rolle}
                  onChange={(e) => updateProject(index, 'rolle', e.target.value)}
                  placeholder="z.B. Lead Developer"
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
                    value={proj.von}
                    onChange={(e) => updateProject(index, 'von', e.target.value)}
                    placeholder="z.B. Jan 2023"
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">
                    Bis
                  </label>
                  <input
                    type="text"
                    value={proj.bis}
                    onChange={(e) => updateProject(index, 'bis', e.target.value)}
                    placeholder="z.B. Heute oder Jun 2023"
                    className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-text-secondary mb-2">
                  Beschreibung
                </label>
                <textarea
                  value={proj.beschreibung || ''}
                  onChange={(e) => updateProject(index, 'beschreibung', e.target.value)}
                  placeholder="Kurze Beschreibung des Projekts und deiner Aufgaben..."
                  rows={3}
                  className="w-full px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors resize-none"
                />
              </div>
            </div>
          ))}

          <button
            onClick={addProject}
            className="w-full px-4 py-3 bg-white bg-opacity-5 hover:bg-opacity-10 rounded-lg transition-colors text-white font-medium flex items-center justify-center gap-2 border border-dashed border-white border-opacity-20"
          >
            <Plus size={20} />
            <span>Weiteres Projekt hinzufügen</span>
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
            {data?.length > 0 ? `${data.length} Projekte` : 'Keine Projekte'}
          </p>
          {data && data.length > 0 ? (
            <div className="space-y-4">
              {data.map((proj, idx) => (
                <div key={idx} className="p-4 bg-white bg-opacity-5 rounded-lg">
                  <p className="font-semibold text-white">{proj.titel}</p>
                  <p className="text-sm text-text-secondary">{proj.rolle}</p>
                  <p className="text-sm text-text-secondary mt-1">
                    {proj.von} - {proj.bis}
                  </p>
                  {proj.beschreibung && (
                    <p className="text-sm text-text-secondary mt-2">{proj.beschreibung}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Keine Projekte hinzugefügt</p>
          )}
        </div>
      )}
    </div>
  );
}
