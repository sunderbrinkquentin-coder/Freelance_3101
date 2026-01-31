import { useState, useEffect } from 'react';
import { Zap, Edit, X, Save, Plus, Trash2, Check } from 'lucide-react';
import { useRealtimeSync } from '../../../hooks/useRealtimeSync';

interface SkillsSectionProps {
  data: string[];
  onUpdate: (data: string[]) => Promise<void>;
}

export default function SkillsSection({ data, onUpdate }: SkillsSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<string[]>(data || []);
  const [newSkill, setNewSkill] = useState('');
  const [saving, setSaving] = useState(false);
  const { syncState, syncAgentResponse } = useRealtimeSync();

  useEffect(() => {
    if (isEditing && JSON.stringify(formData) !== JSON.stringify(data)) {
      syncAgentResponse('skills', formData);
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
    setNewSkill('');
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setFormData([...formData, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    setFormData(formData.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Zap className="text-primary" size={24} />
          <h3 className="text-xl font-bold text-white">Skills</h3>
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
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              placeholder="Skill hinzufügen (z.B. Python, React, ...)"
              className="flex-1 px-4 py-2 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white focus:outline-none focus:border-primary transition-colors"
            />
            <button
              onClick={addSkill}
              className="px-4 py-2 bg-primary hover:bg-primary-hover rounded-lg transition-colors text-white font-medium flex items-center gap-2"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.map((skill, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-primary bg-opacity-10 border border-primary rounded-full text-primary text-sm font-medium flex items-center gap-2"
              >
                <span>{skill}</span>
                <button
                  onClick={() => removeSkill(index)}
                  className="hover:text-error transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
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
        <div>
          {data && data.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-3">
              {data.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-primary bg-opacity-10 border border-primary rounded-full text-primary text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-text-secondary text-sm">Keine Skills hinzugefügt</p>
          )}
        </div>
      )}
    </div>
  );
}
