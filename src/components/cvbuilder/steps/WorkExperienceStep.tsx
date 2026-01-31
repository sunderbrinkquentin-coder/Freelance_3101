/**
 * WorkExperienceStep – aufgeräumt & branchenübergreifend
 * - Nur EIN Zeitraum-Block
 * - Kein Level/Rolle-Feld mehr
 * - Hoher Kontrast bei Dropdowns
 */

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Plus, Trash2 } from 'lucide-react';
import { ProgressBar } from '../ProgressBar';
import { AvatarSidebar } from '../AvatarSidebar';
import { WorkExperience, ExperienceLevel } from '../../../types/cvBuilder';
import { TasksWithMetricsInput } from '../TasksWithMetricsInput';
import { TASKS_BY_LEVEL, ACHIEVEMENTS_BY_LEVEL } from '../../../config/cvBuilderSteps';
import { getPersonalizedSuggestions } from '../../../services/cvSuggestionsService';

interface WorkExperienceStepProps {
  currentStep: number;
  totalSteps: number;
  experienceLevel?: ExperienceLevel;
  initialExperiences?: WorkExperience[];
  onNext: (experiences: WorkExperience[]) => void;
  onPrev: () => void;
}

type LocalWorkExperience = WorkExperience & {
  industry?: string;
  revenue?: string;
  budget?: string;
  teamSize?: string;
  customersMarket?: string;
  startMonth?: string;
  startYear?: string;
  endMonth?: string;
  endYear?: string;
  current?: boolean;
  tasksWithMetrics?: any[];
  achievementsWithMetrics?: any[];
};

const INDUSTRIES = [
  { value: 'sales', label: 'Vertrieb / Sales' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'finance', label: 'Finance / Controlling' },
  { value: 'hr', label: 'HR / Personalwesen' },
  { value: 'logistik', label: 'Logistik / Supply Chain' },
  { value: 'health', label: 'Gesundheitswesen' },
  { value: 'it', label: 'IT / Software' },
  { value: 'produktion', label: 'Produktion / Fertigung' },
  { value: 'public', label: 'Öffentlicher Dienst' },
  { value: 'consulting', label: 'Beratung / Consulting' },
  { value: 'retail', label: 'Einzelhandel / Retail' },
  { value: 'other', label: 'Sonstiges' },
];

const MONTHS = [
  '01', '02', '03', '04', '05', '06',
  '07', '08', '09', '10', '11', '12'
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => String(currentYear - i));

const createEmptyExperience = (): LocalWorkExperience => ({
  jobTitle: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  current: false,
  startMonth: '',
  startYear: '',
  endMonth: '',
  endYear: '',
  industry: '',
  revenue: '',
  budget: '',
  teamSize: '',
  customersMarket: '',
  tasks: [],
  achievements: [],
  tools: [],
  bullets: [],
  tasksWithMetrics: [],
  achievementsWithMetrics: [],
});

function formatDate(month?: string, year?: string) {
  if (!month || !year) return '';
  return `${month}.${year}`;
}

function syncDates(exp: LocalWorkExperience): LocalWorkExperience {
  const startDate = formatDate(exp.startMonth, exp.startYear);
  let endDate = '';

  if (exp.current) {
    endDate = 'Heute';
  } else {
    endDate = formatDate(exp.endMonth, exp.endYear);
  }

  return { ...exp, startDate, endDate };
}

function getSortValue(exp: LocalWorkExperience): number {
  const year = parseInt(exp.startYear || '0', 10);
  const month = parseInt(exp.startMonth || '0', 10);
  // neueste zuerst: höherer Wert = späteres Datum
  return year * 100 + month;
}

export function WorkExperienceStep({
  currentStep,
  totalSteps,
  experienceLevel,
  initialExperiences,
  onNext,
  onPrev,
}: WorkExperienceStepProps) {
  const [experiences, setExperiences] = useState<LocalWorkExperience[]>(() => {
    if (initialExperiences && initialExperiences.length > 0) {
      return initialExperiences.map((exp) => ({
        ...exp,
        startMonth: (exp as any).startMonth ?? '',
        startYear: (exp as any).startYear ?? '',
        endMonth: (exp as any).endMonth ?? '',
        endYear: (exp as any).endYear ?? '',
        current: (exp as any).current ?? false,
        tasksWithMetrics: (exp as any).tasksWithMetrics ?? [],
        achievementsWithMetrics: (exp as any).achievementsWithMetrics ?? [],
      }));
    }
    return [createEmptyExperience()];
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [tasksSuggestions, setTasksSuggestions] = useState<string[]>([]);
  const [achievementsSuggestions, setAchievementsSuggestions] = useState<string[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  const activeExp = experiences[activeIndex];
  const expLevel: ExperienceLevel = experienceLevel || 'beginner';

  // Indizes für Tabs chronologisch sortieren (neueste Station zuerst)
  const sortedExperienceIndices = experiences
    .map((exp, index) => ({ exp, index }))
    .sort((a, b) => getSortValue(b.exp) - getSortValue(a.exp))
    .map(item => item.index);

  const updateExperience = (
    index: number,
    field: keyof LocalWorkExperience,
    value: any
  ) => {
    setExperiences(prev => {
      const updated = [...prev];
      let exp = { ...updated[index], [field]: value };

      if (
        field === 'startMonth' ||
        field === 'startYear' ||
        field === 'endMonth' ||
        field === 'endYear' ||
        field === 'current'
      ) {
        exp = syncDates(exp);
      }

      updated[index] = exp;
      return updated;
    });
  };

  const updateTasksWithMetrics = (index: number, tasks: any[]) => {
    setExperiences(prev => {
      const updated = [...prev];
      const exp = { ...updated[index] };

      exp.tasksWithMetrics = tasks;
      exp.tasks = tasks
        .map((t: any) => t.metrics?.description || t.task || '')
        .filter(Boolean);

      updated[index] = exp;
      return updated;
    });
  };

  const updateAchievementsWithMetrics = (index: number, achievements: any[]) => {
    setExperiences(prev => {
      const updated = [...prev];
      const exp = { ...updated[index] };

      exp.achievementsWithMetrics = achievements;
      exp.achievements = achievements
        .map((t: any) => t.metrics?.description || t.task || '')
        .filter(Boolean);

      updated[index] = exp;
      return updated;
    });
  };

  const addExperience = () => {
    setExperiences(prev => [...prev, createEmptyExperience()]);
    setActiveIndex(experiences.length);
  };

  const removeExperience = (index: number) => {
    if (experiences.length === 1) return;
    setExperiences(prev => {
      const updated = prev.filter((_, i) => i !== index);
      setActiveIndex(Math.max(0, index - 1));
      return updated;
    });
  };

  const handleNext = () => {
    const validExperiences = experiences.filter(
      (exp) => exp.jobTitle?.trim() && exp.company?.trim()
    );
    onNext(validExperiences as WorkExperience[]);
  };

  // Vorschläge laden
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!activeExp) return;

      if (!activeExp.jobTitle || !activeExp.company) {
        setTasksSuggestions(TASKS_BY_LEVEL[expLevel]);
        setAchievementsSuggestions(ACHIEVEMENTS_BY_LEVEL[expLevel]);
        return;
      }

      setIsLoadingSuggestions(true);
      try {
        const context = {
          jobTitle: activeExp.jobTitle,
          company: activeExp.company,
          industry: activeExp.industry,
          experienceLevel: expLevel,
          location: activeExp.location,
          startDate: activeExp.startDate,
          endDate: activeExp.endDate,
          current: activeExp.current,
        };

        const [tasks, achievements] = await Promise.all([
          getPersonalizedSuggestions({ context, type: 'tasks', count: 12 }),
          getPersonalizedSuggestions({ context, type: 'achievements', count: 10 }),
        ]);

        setTasksSuggestions(tasks);
        setAchievementsSuggestions(achievements);
      } catch (err) {
        console.error('[WorkExperienceStep] Error loading suggestions:', err);
        setTasksSuggestions(TASKS_BY_LEVEL[expLevel]);
        setAchievementsSuggestions(ACHIEVEMENTS_BY_LEVEL[expLevel]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    loadSuggestions();
  }, [activeIndex, activeExp?.jobTitle, activeExp?.company, activeExp?.industry, expLevel]);

  if (!activeExp) return null;

  const isValidExperience =
    activeExp.jobTitle?.trim() &&
    activeExp.company?.trim() &&
    activeExp.startMonth &&
    activeExp.startYear &&
    (activeExp.current || (activeExp.endMonth && activeExp.endYear));

  // Mehr Kontrast für Dropdowns: heller Hintergrund + dunkler Text
const selectBase =
  'w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/40 text-white text-sm md:text-base focus:outline-none focus:border-[#66c0b6]';

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-6 animate-fade-in max-w-3xl mx-auto w-full">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        <div className="text-center space-y-3">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent leading-tight">
            Berufserfahrung
          </h1>
          <p className="text-lg text-white/70">
            Je detaillierter deine Angaben, desto stärker werden die Bulletpoints.
          </p>
        </div>

        {/* Station Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {sortedExperienceIndices.map((index, tabOrderIndex) => {
            const exp = experiences[index];
            const hasCompany = exp.company?.trim();
            const periodLabel =
              exp.startDate && exp.endDate
                ? `${exp.startDate} – ${exp.endDate}`
                : exp.startDate || '';

            const label = hasCompany
              ? periodLabel
                ? `${exp.company} (${periodLabel})`
                : exp.company
              : `Station ${tabOrderIndex + 1}`;

            return (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  index === activeIndex
                    ? 'bg-[#66c0b6] text-black font-semibold'
                    : 'bg:white/10 text-white hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            );
          })}
          <button
            onClick={addExperience}
            className="px-4 py-2 rounded-lg bg-white/5 text-white hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Hinzufügen
          </button>
        </div>

        {/* Formular */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 space-y-6 border border-white/10">
          {/* Basisdaten */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Position / Jobtitel *
              </label>
              <input
                type="text"
                value={activeExp.jobTitle || ''}
                onChange={(e) =>
                  updateExperience(activeIndex, 'jobTitle', e.target.value)
                }
                placeholder="z.B. Sales Manager"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6]"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Unternehmen *
              </label>
              <input
                type="text"
                value={activeExp.company || ''}
                onChange={(e) =>
                  updateExperience(activeIndex, 'company', e.target.value)
                }
                placeholder="z.B. SAP AG"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6]"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Branche
              </label>
              <select
                value={activeExp.industry || ''}
                onChange={(e) =>
                  updateExperience(activeIndex, 'industry', e.target.value)
                }
                className={selectBase}
              >
                <option value="">Branche wählen</option>
                {INDUSTRIES.map((ind) => (
                  <option key={ind.value} value={ind.value}>
                    {ind.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Standort (optional)
              </label>
              <input
                type="text"
                value={activeExp.location || ''}
                onChange={(e) =>
                  updateExperience(activeIndex, 'location', e.target.value)
                }
                placeholder="z.B. München"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6]"
              />
            </div>
          </div>

          {/* Zeitraum – EIN Block */}
          <div>
            <label className="block text-white/80 text-sm font-medium mb-2">
              Zeitraum *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start */}
              <div>
                <p className="text-xs text-white/60 mb-1">Start</p>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={activeExp.startMonth || ''}
                    onChange={(e) =>
                      updateExperience(activeIndex, 'startMonth', e.target.value)
                    }
                    className={selectBase}
                  >
                    <option value="">Monat wählen</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={activeExp.startYear || ''}
                    onChange={(e) =>
                      updateExperience(activeIndex, 'startYear', e.target.value)
                    }
                    className={selectBase}
                  >
                    <option value="">Jahr wählen</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ende */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-white/60">Ende</p>
                  <label className="flex items-center gap-2 text-xs text-white/70">
                    <input
                      type="checkbox"
                      checked={!!activeExp.current}
                      onChange={(e) =>
                        updateExperience(activeIndex, 'current', e.target.checked)
                      }
                      className="rounded"
                    />
                    Ich arbeite derzeit hier
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={activeExp.current ? '' : activeExp.endMonth || ''}
                    onChange={(e) =>
                      updateExperience(activeIndex, 'endMonth', e.target.value)
                    }
                    disabled={!!activeExp.current}
                    className={`${selectBase} disabled:opacity-40`}
                  >
                    <option value="">Monat wählen</option>
                    {MONTHS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                  <select
                    value={activeExp.current ? '' : activeExp.endYear || ''}
                    onChange={(e) =>
                      updateExperience(activeIndex, 'endYear', e.target.value)
                    }
                    disabled={!!activeExp.current}
                    className={`${selectBase} disabled:opacity-40`}
                  >
                    <option value="">Jahr wählen</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs & Umfeld */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Umsatz / Revenue (optional)
              </label>
              <input
                type="text"
                value={activeExp.revenue || ''}
                onChange={(e) =>
                  updateExperience(activeIndex, 'revenue', e.target.value)
                }
                placeholder="z.B. 500.000€ Umsatzverantwortung"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6]"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Budget (optional)
              </label>
              <input
                type="text"
                value={activeExp.budget || ''}
                onChange={(e) =>
                  updateExperience(activeIndex, 'budget', e.target.value)
                }
                placeholder="z.B. 100.000€ Budgetverantwortung"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/40 focus:outline:none focus:border-[#66c0b6]"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Teamgröße / Führung (optional)
              </label>
              <input
                type="text"
                value={activeExp.teamSize || ''}
                onChange={(e) =>
                  updateExperience(activeIndex, 'teamSize', e.target.value)
                }
                placeholder="z.B. 5 Mitarbeitende geführt"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6]"
              />
            </div>

            <div>
              <label className="block text-white/80 text-sm font-medium mb-2">
                Kunden / Markt (optional)
              </label>
              <input
                type="text"
                value={activeExp.customersMarket || ''}
                onChange={(e) =>
                  updateExperience(activeIndex, 'customersMarket', e.target.value)
                }
                placeholder="z.B. B2B Key Accounts, DACH-Region"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/25 text-white placeholder-white/40 focus:outline-none focus:border-[#66c0b6]"
              />
            </div>
          </div>

          {/* Aufgaben */}
          <TasksWithMetricsInput
            experienceLevel={expLevel}
            suggestedTasks={
              tasksSuggestions.length > 0
                ? tasksSuggestions
                : TASKS_BY_LEVEL[expLevel]
            }
            value={(activeExp.tasksWithMetrics as any[]) || []}
            onChange={(tasks) => updateTasksWithMetrics(activeIndex, tasks)}
            title={
              isLoadingSuggestions
                ? '📋 Lade personalisierte Aufgaben...'
                : '📋 Hauptaufgaben (mindestens 3 wählen)'
            }
            emptyMessage="Klicke auf eine Aufgabe und füge konkrete Zahlen hinzu"
          />

          {/* Erfolge – jetzt optional + Hinweis */}
          <TasksWithMetricsInput
            experienceLevel={expLevel}
            suggestedTasks={
              achievementsSuggestions.length > 0
                ? achievementsSuggestions
                : ACHIEVEMENTS_BY_LEVEL[expLevel]
            }
            value={(activeExp.achievementsWithMetrics as any[]) || []}
            onChange={(achievements) =>
              updateAchievementsWithMetrics(activeIndex, achievements)
            }
            title={
              isLoadingSuggestions
                ? '🎯 Lade personalisierte Erfolge...'
                : '🎯 Messbare Erfolge (optional – machen deinen CV deutlich stärker)'
            }
            emptyMessage="Klicke auf einen Erfolg und füge konkrete Zahlen hinzu"
          />

          {experiences.length > 1 && (
            <button
              onClick={() => removeExperience(activeIndex)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
            >
              <Trash2 size={18} /> Diese Station entfernen
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={onPrev}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
          >
            <ArrowLeft size={20} /> Zurück
          </button>
          <button
            onClick={handleNext}
            disabled={!isValidExperience}
            className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3 shadow-2xl hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Weiter <ArrowRight size={24} />
          </button>
        </div>
      </div>

      <div className="hidden lg:block">
        <AvatarSidebar
          message="Details machen den Unterschied! 💪"
          stepInfo="Je klarer Zeitraum, Aufgaben und Erfolge, desto stärker wirken deine Bulletpoints."
        />
      </div>
    </div>
  );
}
