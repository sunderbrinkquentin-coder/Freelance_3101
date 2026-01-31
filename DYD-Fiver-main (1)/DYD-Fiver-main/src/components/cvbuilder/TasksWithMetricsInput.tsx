import { useState } from 'react';
import { Plus, X, Check, Edit2 } from 'lucide-react';
import { ExperienceLevel } from '../../types/cvBuilder';

interface TaskWithMetrics {
  task: string;
  metrics: {
    number?: string;
    percentage?: string;
    money?: string;
    timeframe?: string;
    description: string;
  };
}

interface TasksWithMetricsInputProps {
  experienceLevel: ExperienceLevel;
  suggestedTasks: string[];
  value: TaskWithMetrics[];
  onChange: (tasks: TaskWithMetrics[]) => void;
  title?: string;
  emptyMessage?: string;
}

export function TasksWithMetricsInput({
  experienceLevel,
  suggestedTasks,
  value = [],
  onChange,
  title = "Wähle deine Aufgaben",
  emptyMessage = "Wähle mindestens 3 Aufgaben aus"
}: TasksWithMetricsInputProps) {
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTaskName, setCustomTaskName] = useState('');
  const [metricsForm, setMetricsForm] = useState({
    number: '',
    percentage: '',
    money: '',
    timeframe: '',
    description: ''
  });

  const getExamplePlaceholders = (task: string) => {
    if (experienceLevel === 'beginner') {
      return {
        number: 'z.B. 20',
        percentage: 'z.B. 15%',
        money: 'z.B. €5.000',
        timeframe: 'z.B. pro Woche / in 3 Monaten',
        description: `Beispiel: Unterstützte das Team bei ${task.toLowerCase()} und bearbeitete durchschnittlich 20 Anfragen pro Woche`
      };
    } else if (experienceLevel === 'some-experience') {
      return {
        number: 'z.B. 50',
        percentage: 'z.B. 25%',
        money: 'z.B. €50.000',
        timeframe: 'z.B. innerhalb 6 Monaten',
        description: `Beispiel: ${task} und steigerte die Effizienz um 25% innerhalb von 6 Monaten`
      };
    } else {
      return {
        number: 'z.B. 100',
        percentage: 'z.B. 40%',
        money: 'z.B. €500.000',
        timeframe: 'z.B. innerhalb 1 Jahres',
        description: `Beispiel: Verantwortete ${task.toLowerCase()} mit einem Budget von €500.000 und erreichte 40% Steigerung`
      };
    }
  };

  const handleTaskClick = (task: string) => {
    const existing = value.find(t => t.task === task);
    if (existing) {
      onChange(value.filter(t => t.task !== task));
    } else {
      setEditingTask(task);
      setMetricsForm({
        number: '',
        percentage: '',
        money: '',
        timeframe: '',
        description: ''
      });
    }
  };

  const handleAddCustomTask = () => {
    if (customTaskName.trim()) {
      setEditingTask(customTaskName.trim());
      setIsAddingCustom(false);
      setCustomTaskName('');
      setMetricsForm({
        number: '',
        percentage: '',
        money: '',
        timeframe: '',
        description: ''
      });
    }
  };

  const handleSaveMetrics = () => {
    if (!editingTask) return;

    const autoDescription = metricsForm.description.trim() ||
      `${editingTask}${metricsForm.number ? ` – ${metricsForm.number} Einheiten` : ''}${metricsForm.percentage ? ` mit ${metricsForm.percentage} Steigerung` : ''}${metricsForm.money ? ` (${metricsForm.money})` : ''}${metricsForm.timeframe ? ` ${metricsForm.timeframe}` : ''}`;

    const newTask: TaskWithMetrics = {
      task: editingTask,
      metrics: {
        ...metricsForm,
        description: autoDescription
      }
    };

    onChange([...value, newTask]);
    setEditingTask(null);
    setMetricsForm({
      number: '',
      percentage: '',
      money: '',
      timeframe: '',
      description: ''
    });
  };

  const handleEdit = (task: string) => {
    const existing = value.find(t => t.task === task);
    if (existing) {
      setEditingTask(task);
      setMetricsForm(existing.metrics);
      onChange(value.filter(t => t.task !== task));
    }
  };

  const isSelected = (task: string) => value.some(t => t.task === task);

  const placeholders = editingTask ? getExamplePlaceholders(editingTask) : null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
        <p className="text-white/60 text-sm mb-4">{emptyMessage}</p>

        <div className="flex flex-wrap gap-3">
          {suggestedTasks.map((task) => (
            <button
              key={task}
              onClick={() => handleTaskClick(task)}
              className={`group px-4 py-2.5 rounded-xl border transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                isSelected(task)
                  ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                  : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              <span>{task}</span>
              {isSelected(task) && (
                <>
                  <Check size={16} className="text-[#66c0b6]" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(task);
                    }}
                    className="ml-1 p-1 rounded hover:bg-white/10"
                  >
                    <Edit2 size={14} />
                  </button>
                </>
              )}
            </button>
          ))}

          {!isAddingCustom ? (
            <button
              onClick={() => setIsAddingCustom(true)}
              className="px-4 py-2.5 rounded-xl border border-dashed border-white/20 bg-white/5 text-white/70 hover:bg-white/10 hover:border-white/30 hover:text-white transition-all duration-200 flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Eigene Aufgabe hinzufügen</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={customTaskName}
                onChange={(e) => setCustomTaskName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddCustomTask();
                  if (e.key === 'Escape') {
                    setIsAddingCustom(false);
                    setCustomTaskName('');
                  }
                }}
                placeholder="z.B. Kundenprojekte betreut"
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                autoFocus
              />
              <button
                onClick={handleAddCustomTask}
                disabled={!customTaskName.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#66c0b6] text-black font-medium hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Check size={16} />
              </button>
              <button
                onClick={() => {
                  setIsAddingCustom(false);
                  setCustomTaskName('');
                }}
                className="px-4 py-2.5 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {value.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-white/90 font-medium text-sm">Ausgewählte Aufgaben mit Kennzahlen:</h4>
          {value.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 border border-white/10 rounded-xl p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <h5 className="text-white font-medium">{item.task}</h5>
                <button
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="text-white/70 text-sm space-y-1">
                {item.metrics.description && (
                  <p className="text-[#66c0b6]">{item.metrics.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.metrics.number && (
                    <span className="px-2 py-1 rounded-lg bg-white/10 text-xs">
                      📊 {item.metrics.number}
                    </span>
                  )}
                  {item.metrics.percentage && (
                    <span className="px-2 py-1 rounded-lg bg-white/10 text-xs">
                      📈 {item.metrics.percentage}
                    </span>
                  )}
                  {item.metrics.money && (
                    <span className="px-2 py-1 rounded-lg bg-white/10 text-xs">
                      💰 {item.metrics.money}
                    </span>
                  )}
                  {item.metrics.timeframe && (
                    <span className="px-2 py-1 rounded-lg bg-white/10 text-xs">
                      ⏱️ {item.metrics.timeframe}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingTask && placeholders && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a0a] border border-white/20 rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">{editingTask}</h3>
                <p className="text-white/60 text-sm">
                  Wähle passende Kennzahlen-Boxen (klicken statt schreiben)
                </p>
              </div>
              <button
                onClick={() => setEditingTask(null)}
                className="text-white/60 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Anzahl / Menge Boxen */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">
                  📊 Anzahl / Menge
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['10', '20', '50', '100', '200', '500'].map((num) => (
                    <button
                      key={num}
                      onClick={() => setMetricsForm({ ...metricsForm, number: num })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        metricsForm.number === num
                          ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={metricsForm.number}
                  onChange={(e) => setMetricsForm({ ...metricsForm, number: e.target.value })}
                  placeholder="Oder eigene Zahl..."
                  className="w-full mt-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] text-sm"
                />
              </div>

              {/* Prozent Boxen */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">
                  📈 Steigerung / Verbesserung
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['10%', '15%', '20%', '25%', '30%', '40%'].map((pct) => (
                    <button
                      key={pct}
                      onClick={() => setMetricsForm({ ...metricsForm, percentage: pct })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        metricsForm.percentage === pct
                          ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {pct}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={metricsForm.percentage}
                  onChange={(e) => setMetricsForm({ ...metricsForm, percentage: e.target.value })}
                  placeholder="Oder eigener Prozentsatz..."
                  className="w-full mt-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] text-sm"
                />
              </div>

              {/* Geldwert Boxen */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">
                  💰 Geldwert / Budget
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['€5.000', '€10.000', '€50.000', '€100.000', '€500.000', '€1M'].map((money) => (
                    <button
                      key={money}
                      onClick={() => setMetricsForm({ ...metricsForm, money: money })}
                      className={`px-4 py-3 rounded-xl border transition-all ${
                        metricsForm.money === money
                          ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {money}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={metricsForm.money}
                  onChange={(e) => setMetricsForm({ ...metricsForm, money: e.target.value })}
                  placeholder="Oder eigener Betrag..."
                  className="w-full mt-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6] text-sm"
                />
              </div>

              {/* Zeitraum Boxen */}
              <div>
                <label className="block text-white/80 text-sm font-medium mb-3">
                  ⏱️ Zeitraum
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['pro Woche', 'pro Monat', 'in 3 Monaten', 'in 6 Monaten', 'pro Jahr', 'innerhalb 1 Jahr'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setMetricsForm({ ...metricsForm, timeframe: time })}
                      className={`px-4 py-3 rounded-xl border transition-all text-sm ${
                        metricsForm.timeframe === time
                          ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white'
                          : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-generierte Vorschau */}
              {(metricsForm.number || metricsForm.percentage || metricsForm.money || metricsForm.timeframe) && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <p className="text-white/70 text-xs mb-2">
                    <strong className="text-white">Vorschau:</strong>
                  </p>
                  <p className="text-[#66c0b6] text-sm">
                    {editingTask}
                    {metricsForm.number && ` – ${metricsForm.number} Einheiten`}
                    {metricsForm.percentage && ` mit ${metricsForm.percentage} Steigerung`}
                    {metricsForm.money && ` (${metricsForm.money})`}
                    {metricsForm.timeframe && ` ${metricsForm.timeframe}`}
                  </p>
                </div>
              )}

              <div className="space-y-3 pt-4">
                {(metricsForm.number || metricsForm.percentage || metricsForm.money || metricsForm.timeframe) && (
                  <button
                    onClick={() => {
                      const autoDescription = `${editingTask}${metricsForm.number ? ` – ${metricsForm.number} Einheiten` : ''}${metricsForm.percentage ? ` mit ${metricsForm.percentage} Steigerung` : ''}${metricsForm.money ? ` (${metricsForm.money})` : ''}${metricsForm.timeframe ? ` ${metricsForm.timeframe}` : ''}`;
                      setMetricsForm({ ...metricsForm, description: autoDescription });
                      handleSaveMetrics();
                    }}
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold hover:opacity-90 transition-all"
                  >
                    Mit Kennzahlen speichern
                  </button>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleSaveMetrics}
                    className="flex-1 px-6 py-3 rounded-xl border border-white/20 bg-white/5 text-white/90 hover:bg-white/10 transition-all"
                  >
                    Ohne Kennzahlen speichern
                  </button>
                  <button
                    onClick={() => setEditingTask(null)}
                    className="px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/5 transition-all"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
