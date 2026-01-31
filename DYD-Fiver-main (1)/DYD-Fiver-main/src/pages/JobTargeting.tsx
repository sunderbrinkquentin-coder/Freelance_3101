// src/pages/JobTargeting.tsx

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Briefcase, Building2, Link2, FileText, Loader2 } from 'lucide-react';
import { AvatarSidebar } from '../components/cvbuilder/AvatarSidebar';
import { CVBuilderData } from '../types/cvBuilder';
import { cvStorageService } from '../services/cvStorageService';
import { sessionManager } from '../utils/sessionManager';
import { supabase } from '../lib/supabase';
import { MAKE_GENERATOR_WEBHOOK, validateMakeGeneratorWebhookUrl } from '../config/makeWebhook';

export function JobTargeting() {
  const navigate = useNavigate();
  const location = useLocation();
  const baseCvData = location.state?.cvData as CVBuilderData | undefined;
  const existingCvId = location.state?.cvId as string | undefined;

  console.log('🟦 [JOB-TARGETING] 📋 ========== RAW LOCATION STATE ==========');
  console.log('🟦 [JOB-TARGETING] 📋 location.state:', location.state);
  console.log('🟦 [JOB-TARGETING] 📋 location.state.cvData:', location.state?.cvData);
  console.log('🟦 [JOB-TARGETING] 📋 typeof cvData:', typeof location.state?.cvData);
  console.log('🟦 [JOB-TARGETING] 📋 cvData.projects DIRECT:', location.state?.cvData?.projects);
  console.log('🟦 [JOB-TARGETING] 📋 cvData.hardSkills DIRECT:', location.state?.cvData?.hardSkills);
  console.log('🟦 [JOB-TARGETING] 📋 ALL KEYS in cvData:', Object.keys(location.state?.cvData || {}));
  console.log('🟦 [JOB-TARGETING] 📋 ========================================');
  console.log('🟦 [JOB-TARGETING] 📋 Received CV Data:', {
    hasBaseCvData: !!baseCvData,
    hasWorkExperiences: !!baseCvData?.workExperiences,
    workExperiencesCount: baseCvData?.workExperiences?.length || 0,
    hasProjects: !!baseCvData?.projects,
    projectsCount: baseCvData?.projects?.length || 0,
    hasHardSkills: !!baseCvData?.hardSkills,
    hardSkillsCount: baseCvData?.hardSkills?.length || 0,
    hasLanguages: !!baseCvData?.languages,
    languagesCount: baseCvData?.languages?.length || 0,
  });
  console.log('🟦 [JOB-TARGETING] 📋 Received Work Experiences:', JSON.stringify(baseCvData?.workExperiences, null, 2));
  console.log('🟦 [JOB-TARGETING] 📋 Received Projects:', JSON.stringify(baseCvData?.projects, null, 2));
  console.log('🟦 [JOB-TARGETING] 📋 Received HardSkills:', JSON.stringify(baseCvData?.hardSkills, null, 2));
  console.log('🟦 [JOB-TARGETING] 📋 Received Languages:', JSON.stringify(baseCvData?.languages, null, 2));
  console.log('🟦 [JOB-TARGETING] 📋 Complete baseCvData:', JSON.stringify(baseCvData, null, 2));

  const [formData, setFormData] = useState({
    company: '',
    jobTitle: '',
    jobLink: '',
    jobDescription: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- Helper: Deep sanitize ----------
  const deepSanitize = (obj: any, depth = 0): any => {
    if (depth > 50) return null;

    if (obj === null || obj === undefined) return null;
    if (typeof obj === 'boolean') return obj;
    if (typeof obj === 'number') return isFinite(obj) ? obj : null;

    if (typeof obj === 'string') {
      return obj
        .replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, '')
        .replace(/[\u2000-\u200F\u2028-\u202F]/g, ' ')
        .replace(/[\uFEFF\uFFFE\uFFFF]/g, '');
    }

    if (obj instanceof Date) return obj.toISOString();

    if (Array.isArray(obj)) {
      return obj
        .map((item) => deepSanitize(item, depth + 1))
        .filter((item) => item !== null && item !== undefined);
    }

    if (typeof obj === 'object') {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        const value = deepSanitize((obj as any)[key], depth + 1);
        if (value !== null && value !== undefined) {
          const cleanKey =
            typeof key === 'string' ? key.replace(/[^\w\s\-_.]/g, '') : key;
          result[cleanKey] = value;
        }
      }
      return result;
    }

    return null;
  };

  const handleClickNext = async () => {
    setError(null);

    if (!formData.company || !formData.jobTitle || !formData.jobDescription) {
      setError('Bitte fülle Unternehmen, Jobtitel und Stellenbeschreibung aus.');
      return;
    }

    if (!baseCvData) {
      console.error('❌ [JOB-TARGETING] No CV data in location.state');
      setError('Es fehlen CV-Daten. Bitte gehe den CV-Prozess noch einmal vollständig durch.');
      return;
    }

    await handleSubmit();
  };

  const handleSubmit = async () => {
    if (!formData.company || !formData.jobTitle || !formData.jobDescription) return;
    if (!baseCvData) return;

    setIsSaving(true);

    try {
      console.log('🟦 [JOB-TARGETING] Start submission');

      // 1) Session & User sicher holen
      let sessionId: string | null = null;
      try {
        sessionId = sessionManager.getSessionId();
        console.log('🟦 [JOB-TARGETING] Session ID:', sessionId || 'anonymous');
      } catch (e) {
        console.warn('🟨 [JOB-TARGETING] Could not get session ID:', e);
      }

      let currentUserId: string | null = null;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        currentUserId = user?.id || null;
        console.log('🟦 [JOB-TARGETING] User ID:', currentUserId || 'anonymous');
      } catch (e) {
        console.warn('🟨 [JOB-TARGETING] Could not get user ID:', e);
      }

      // 2) CV + Jobdaten sanitizen
      const sanitizedJobData = {
        company: deepSanitize(formData.company),
        job_title: deepSanitize(formData.jobTitle),
        job_link: deepSanitize(formData.jobLink) || null,
        job_description: deepSanitize(formData.jobDescription),
      };

      // 3) Explizit jedes Feld einzeln sanitizen (verhindert Datenverlust)
      console.log('🟦 [JOB-TARGETING] 📋 Before destructuring - baseCvData.projects:', baseCvData?.projects);
      console.log('🟦 [JOB-TARGETING] 📋 Before destructuring - baseCvData.hardSkills:', baseCvData?.hardSkills);
      console.log('🟦 [JOB-TARGETING] 📋 Before destructuring - baseCvData.workExperiences:', baseCvData?.workExperiences);

      // CRITICAL: Don't destructure - just use baseCvData directly to avoid data loss
      const cvDataPayload = {
        ...deepSanitize(baseCvData),
        desired_job: sanitizedJobData,
      };

      console.log('🟦 [JOB-TARGETING] 📋 ========== AFTER SANITIZE ==========');
      console.log('🟦 [JOB-TARGETING] 📋 cvDataPayload keys:', Object.keys(cvDataPayload || {}));
      console.log('🟦 [JOB-TARGETING] 📋 CV Data Payload:', {
        hasWorkExperiences: !!cvDataPayload.workExperiences,
        workExperiencesCount: cvDataPayload.workExperiences?.length || 0,
        hasProjects: !!cvDataPayload.projects,
        projectsCount: cvDataPayload.projects?.length || 0,
        hasHardSkills: !!cvDataPayload.hardSkills,
        hardSkillsCount: cvDataPayload.hardSkills?.length || 0,
        hasLanguages: !!cvDataPayload.languages,
        languagesCount: cvDataPayload.languages?.length || 0,
      });
      console.log('🟦 [JOB-TARGETING] 📋 Work Experiences AFTER SANITIZE:', JSON.stringify(cvDataPayload.workExperiences, null, 2));
      console.log('🟦 [JOB-TARGETING] 📋 Projects AFTER SANITIZE:', JSON.stringify(cvDataPayload.projects, null, 2));
      console.log('🟦 [JOB-TARGETING] 📋 HardSkills AFTER SANITIZE:', JSON.stringify(cvDataPayload.hardSkills, null, 2));
      console.log('🟦 [JOB-TARGETING] 📋 =======================================');

      // 4) In stored_cvs speichern (status = ready, damit Editor sofort laden kann)
      console.log('🟦 [JOB-TARGETING] Saving to Supabase (status=ready)...');

      // Erst speichern mit den Basis-Daten
      const { data: savedCv, error: saveError } = await supabase
        .from('stored_cvs')
        .upsert({
          ...(existingCvId ? { id: existingCvId } : {}),
          user_id: currentUserId,
          session_id: sessionId,
          cv_data: cvDataPayload,
          job_data: {
            company: formData.company,
            jobTitle: formData.jobTitle,
            jobLink: formData.jobLink,
            jobDescription: formData.jobDescription,
          },
          source: 'wizard',
          is_paid: false,
          status: 'ready', // Direkt auf 'ready' setzen, damit Editor sofort laden kann
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' })
        .select('id')
        .single();

      if (saveError || !savedCv) {
        console.error('❌ [JOB-TARGETING] Save error:', saveError);
        throw new Error(saveError?.message || 'Failed to save CV');
      }

      const cvId = savedCv.id;
      console.log('✅ [JOB-TARGETING] CV saved with status=ready, cvId:', cvId);

      // 5) Make-Webhook triggern (Daten für Generator)
      const webhookValidation = validateMakeGeneratorWebhookUrl();
      if (!webhookValidation.ok) {
        console.error('[CV-GENERATOR WEBHOOK ERROR] Validation failed:', webhookValidation);
        // trotzdem in den Editor -> der pollt dann auf status/completed
      } else {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const callbackUrl = `${supabaseUrl}/functions/v1/make-cv-callback`;

        const payload = {
          cv_id: cvId,
          session_id: sessionId,
          user_id: currentUserId,
          callback_url: callbackUrl,
          // Make bekommt die komplette Struktur inkl. Berufserfahrung, Projekten & Sprachen
          cv_draft: cvDataPayload,
          job_data: sanitizedJobData,
        };

        console.log('[CV-GENERATOR] 📤 Triggering webhook...', {
          url: MAKE_GENERATOR_WEBHOOK,
          preview: {
            cv_id: cvId,
            has_cv_data: !!cvDataPayload,
            has_job_data: !!sanitizedJobData,
          },
        });
        console.log('[CV-GENERATOR] 📤 Full Payload Check:', {
          hasWorkExperiences: !!payload.cv_draft.workExperiences,
          workExperiencesCount: payload.cv_draft.workExperiences?.length || 0,
          hasProjects: !!payload.cv_draft.projects,
          projectsCount: payload.cv_draft.projects?.length || 0,
          hasHardSkills: !!payload.cv_draft.hardSkills,
          hardSkillsCount: payload.cv_draft.hardSkills?.length || 0,
          hasLanguages: !!payload.cv_draft.languages,
          languagesCount: payload.cv_draft.languages?.length || 0,
        });
        console.log(
          '[CV-GENERATOR] 📤 cv_draft.workExperiences:',
          JSON.stringify(payload.cv_draft.workExperiences, null, 2)
        );
        console.log(
          '[CV-GENERATOR] 📤 cv_draft.projects:',
          JSON.stringify(payload.cv_draft.projects, null, 2)
        );
        console.log(
          '[CV-GENERATOR] 📤 cv_draft.hardSkills:',
          JSON.stringify(payload.cv_draft.hardSkills, null, 2)
        );
        console.log(
          '[CV-GENERATOR] 📤 cv_draft.languages:',
          JSON.stringify(payload.cv_draft.languages, null, 2)
        );

        console.log('[CV-GENERATOR] 📤 Complete payload being sent to Make:', JSON.stringify(payload, null, 2));

        // Fire & forget – Editor pollt danach Supabase
        fetch(MAKE_GENERATOR_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then((res) => {
            console.log('[CV-GENERATOR] Webhook status:', res.status);
          })
          .catch((err) => {
            console.error('[CV-GENERATOR] Webhook error:', err);
          });
      }

      // 6) Zur Live-Editor-Page navigieren
      console.log('🟩 [JOB-TARGETING] Navigate to CV Editor');
      navigate(`/cv/${cvId}`);
    } catch (err) {
      console.error('❌ [JOB-TARGETING] Unexpected error:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Ein technischer Fehler ist aufgetreten. Bitte versuche es erneut.';
      setError(msg);
      alert(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const isValid = !!(formData.company && formData.jobTitle && formData.jobDescription);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          <div className="flex-1 space-y-8 animate-fade-in">
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent">
                Deine Wunschstelle
              </h1>
              <p className="text-xl text-white/70 max-w-2xl mx-auto">
                Gib die Details zu deiner Wunschstelle ein. Wir passen deinen CV optimal darauf an.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 space-y-8">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-lg font-semibold text-white/90">
                  <Building2 size={20} className="text-[#66c0b6]" />
                  Unternehmen *
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="z.B. Google, BMW, Siemens..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-lg font-semibold text-white/90">
                  <Briefcase size={20} className="text-[#66c0b6]" />
                  Jobtitel *
                </label>
                <input
                  type="text"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                  placeholder="z.B. Software Engineer, Marketing Manager..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-lg font-semibold text-white/90">
                  <Link2 size={20} className="text-[#66c0b6]" />
                  Link zur Stellenanzeige (optional)
                </label>
                <input
                  type="url"
                  value={formData.jobLink}
                  onChange={(e) => setFormData({ ...formData, jobLink: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-lg font-semibold text-white/90">
                  <FileText size={20} className="text-[#66c0b6]" />
                  Stellenbeschreibung *
                </label>
                <p className="text-sm text-white/60">
                  Kopiere die Stellenanzeige hier hinein. Je vollständiger, desto besser können wir deinen CV
                  anpassen.
                </p>
                <textarea
                  value={formData.jobDescription}
                  onChange={(e) =>
                    setFormData({ ...formData, jobDescription: e.target.value })
                  }
                  placeholder="Füge hier die komplette Stellenbeschreibung ein..."
                  rows={12}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 resize-none font-mono text-sm"
                />
                <p className="text-xs text-white/40">
                  💡 Tipp: Je detaillierter die Stellenbeschreibung, desto präziser die Optimierung
                </p>
              </div>

              <div className="pt-6 flex flex-col items-center gap-4">
                {error && (
                  <div className="w-full max-w-md px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                    <p className="text-center text-sm text-red-400">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleClickNext}
                  disabled={!isValid || isSaving}
                  className="group px-16 py-6 rounded-3xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-2xl hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-4 shadow-2xl hover:scale-105"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={32} className="animate-spin" />
                      Speichere...
                    </>
                  ) : (
                    <>
                      Weiter zum Editor
                      <ArrowRight
                        size={32}
                        className="group-hover:translate-x-2 transition-transform"
                      />
                    </>
                  )}
                </button>

                <p className="text-center text-sm text-white/50">* Pflichtfelder</p>
              </div>
            </div>
          </div>

          <div className="lg:block hidden">
            <AvatarSidebar
              message="Jetzt fehlt nur noch deine Wunschstelle. Wir nutzen gleich deinen fertigen CV und passen ihn genau auf diese Position an."
              stepInfo="Je präziser du die Stellenbeschreibung angibst, desto besser das Ergebnis."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
