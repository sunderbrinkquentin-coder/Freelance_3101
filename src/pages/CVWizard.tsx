// src/pages/CVWizard.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ArrowRight, ArrowLeft, Check, Plus, Loader2 } from 'lucide-react';

import { AvatarSidebar } from '../components/cvbuilder/AvatarSidebar';
import { MotivationScreen } from '../components/cvbuilder/MotivationScreen';
import { ProgressBar } from '../components/cvbuilder/ProgressBar';
import { DateDropdowns, formatDateRange } from '../components/cvbuilder/DateDropdowns';
import { ChipsInput } from '../components/cvbuilder/ChipsInput';
import { HardSkillsStep } from '../components/cvbuilder/HardSkillsStep';
import { SoftSkillsStep } from '../components/cvbuilder/SoftSkillsStep';
import { WorkExperienceStep } from '../components/cvbuilder/steps/WorkExperienceStep';

import {
  CVBuilderData,
  ExperienceLevel,
  IndustryType,
  PersonalData,
  SchoolEducation,
  ProfessionalEducation,
  Project,
  WorkValues,
  Hobbies,
  WorkExperience,
  HardSkill,
} from '../types/cvBuilder';

import {
  WORK_VALUES,
  WORK_STYLES,
  HOBBIES_SUGGESTIONS,
} from '../config/cvBuilderConstants';

import { useAuth } from '../contexts/AuthContext';

/**
 * Hilfsfunktion zum Mappen der rohen Datenbank-Daten (z.B. vom CV-Check)
 * in das Format des Wizards.
 */
function adaptParsedCvToBuilderData(parsed: any): CVBuilderData {
  const safe = (v: any) => (v == null ? '' : String(v));

  const parseMY = (s: string) => {
    const m = safe(s).match(/^(\d{1,2})\.(\d{4})$/);
    if (!m) return { month: '', year: '' };
    return { month: m[1].padStart(2, '0'), year: m[2] };
  };

  const fullName = safe(parsed?.personalInfo?.name).trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  const firstName = parts[0] ?? '';
  const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';

  const personalData: PersonalData = {
    firstName,
    lastName,
    city: safe(parsed?.personalInfo?.location),
    email: safe(parsed?.personalInfo?.email),
    phone: safe(parsed?.personalInfo?.phone),
    linkedin: safe(parsed?.personalInfo?.linkedin),
  };

  const workExperiences: WorkExperience[] = Array.isArray(parsed?.experience)
    ? parsed.experience.map((e: any) => {
        const startDate = safe(e?.startDate);
        const current = !!e?.isCurrent;
        const smy = parseMY(startDate);
        const emy = parseMY(safe(e?.endDate));

        return {
          jobTitle: safe(e?.title),
          company: safe(e?.company),
          location: safe(e?.location),
          startDate,
          endDate: current ? 'Heute' : safe(e?.endDate),
          current,
          tasks: Array.isArray(e?.bullets) ? e.bullets.filter(Boolean) : [],
          responsibilities: [],
          tools: [],
          kpis: [],
          achievements: [],
          startMonth: smy.month,
          startYear: smy.year,
          endMonth: current ? '' : emy.month,
          endYear: current ? '' : emy.year,
        } as any;
      })
    : [];

  return {
    experienceLevel: workExperiences.length >= 2 ? 'experienced' : 'beginner',
    personalData,
    workExperiences,
    professionalEducation: [], 
    hardSkills: [],
    languages: [],
    projects: [],
  } as CVBuilderData;
}

export function CVWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ---- States ----
  const [cvId, setCvId] = useState<string | null>(location.state?.cvId || new URLSearchParams(location.search).get('cvId'));
  const [cvData, setCVData] = useState<CVBuilderData>({} as CVBuilderData);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [showMotivation, setShowMotivation] = useState(false);
  const [motivationVariant, setMotivationVariant] = useState<1 | 2 | 3>(1);

  // ---- Database Sync (Load) ----
  useEffect(() => {
    const initWizard = async () => {
      if (!cvId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('stored_cvs')
          .select('cv_data, status')
          .eq('id', cvId)
          .single();

        if (error) throw error;
        if (data?.cv_data) {
          // Falls die Daten vom Check kommen (Source 'check'), mappen wir sie einmalig
          const baseData = (data.status === 'pending' || data.status === 'processing') 
            ? adaptParsedCvToBuilderData(data.cv_data)
            : data.cv_data as CVBuilderData;
          
          setCVData(baseData);
          if (Object.keys(baseData).length > 0) setCurrentStep(1);
        }
      } catch (err: any) {
        console.error('[CVWizard] Load Error:', err.message);
        setLoadError('Dein Profil konnte nicht geladen werden.');
      } finally {
        setIsLoading(false);
      }
    };

    initWizard();
  }, [cvId]);

  // ---- Database Sync (Auto-Save) ----
  const saveProgress = useCallback(async (newData: CVBuilderData) => {
    if (!cvId) return;
    setIsSaving(true);
    try {
      await supabase
        .from('stored_cvs')
        .update({
          cv_data: newData,
          updated_at: new Date().toISOString(),
          status: 'draft'
        })
        .eq('id', cvId);
    } finally {
      setIsSaving(false);
    }
  }, [cvId]);

  const updateCVData = <K extends keyof CVBuilderData>(key: K, value: CVBuilderData[K]) => {
    setCVData((prev) => {
      const next = { ...prev, [key]: value };
      saveProgress(next);
      return next;
    });
  };

  // ---- Navigation Logic ----
  const nextStep = () => {
    if ((currentStep + 1) % 3 === 0 && currentStep > 0 && currentStep < 11) {
      setMotivationVariant((((currentStep + 1) / 3) % 3 + 1) as 1 | 2 | 3);
      setShowMotivation(true);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ---- Finalizing ----
  const handleFinalize = async () => {
    if (!cvId) return;
    setIsLoading(true);
    try {
      // Finaler Status-Update für Make.com
      await supabase
        .from('stored_cvs')
        .update({ status: 'completed' })
        .eq('id', cvId);
        
      navigate('/job-targeting', { state: { cvId, cvData } });
    } catch (err) {
      setLoadError('Fehler beim Abschließen des Profils.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Step Rendering & Sub-Components ----
  // (Hier folgen deine Step-Funktionen Step0 bis Step10...)
  // [Gleicher UI-Code wie in deinem Original, aber mit den oben definierten Logik-Fixes]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-[#66c0b6] animate-spin" />
          <p className="text-white/70 font-medium">Dein Profil wird vorbereitet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white relative">
      {/* Auto-Save Indicator */}
      {isSaving && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/50">
          <Loader2 size={12} className="animate-spin" /> Speichere...
        </div>
      )}
      
      <div className="min-h-screen flex flex-col">
        {/* Render Step based on currentStep */}
        {renderStep()}
      </div>
    </div>
  );
}