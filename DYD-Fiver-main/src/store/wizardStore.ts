import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CVBuilderData } from '../types/cvBuilder';

interface WizardState {
  sessionId: string;
  cvDraft: CVBuilderData;
  currentStep: number;

  // Actions
  setSessionId: (id: string) => void;
  updateCVData: <K extends keyof CVBuilderData>(key: K, value: CVBuilderData[K]) => void;
  setCurrentStep: (step: number) => void;
  resetWizard: () => void;
  getCVDraft: () => CVBuilderData;
}

// Generate session ID
const generateSessionId = () => {
  const stored = localStorage.getItem('dyd_session_id');
  if (stored) return stored;

  const newId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('dyd_session_id', newId);
  return newId;
};

export const useWizardStore = create<WizardState>()(
  persist(
    (set, get) => ({
      sessionId: generateSessionId(),
      cvDraft: {},
      currentStep: 0,

      setSessionId: (id) => set({ sessionId: id }),

      updateCVData: (key, value) =>
        set((state) => ({
          cvDraft: { ...state.cvDraft, [key]: value },
        })),

      setCurrentStep: (step) => set({ currentStep: step }),

      resetWizard: () =>
        set({
          cvDraft: {},
          currentStep: 0,
          sessionId: generateSessionId(),
        }),

      getCVDraft: () => get().cvDraft,
    }),
    {
      name: 'dyd-wizard-storage',
      partialize: (state) => ({
        sessionId: state.sessionId,
        cvDraft: state.cvDraft,
        currentStep: state.currentStep,
      }),
    }
  )
);
