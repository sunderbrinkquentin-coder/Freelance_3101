import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Loader2, AlertTriangle, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { exportCVToPDFBlob } from '../utils/pdfExportClient';
import { CVTemplateType } from '../components/cv-templates/CVTemplateSelector';
import { ModernCVTemplate } from '../components/cv-templates/templates/ModernCVTemplate';
import { ClassicCVTemplate } from '../components/cv-templates/templates/ClassicCVTemplate';
import { MinimalCVTemplate } from '../components/cv-templates/templates/MinimalCVTemplate';
import { CreativeCVTemplate } from '../components/cv-templates/templates/CreativeCVTemplate';
import { ProfessionalCVTemplate } from '../components/cv-templates/templates/ProfessionalCVTemplate';
import PhotoUpload from '../components/PhotoUpload';
import { supabase } from '../lib/supabase';
import { useCvOptimizationStatus } from '../hooks/useCvOptimizationStatus';

interface EditorSection {
  type: string;
  title?: string;
  content?: string;
  items?: any[];
  [key: string]: any;
}

interface EditorData {
  personalInfo?: {
    name?: string;
    title?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    [key: string]: any;
  };
  summary?: string;
  sections?: EditorSection[];
  projects?: any[];
  languages?: any[];
  [key: string]: any;
}

const templates = [
  { id: 'modern' as CVTemplateType, name: 'Modern', icon: '🌊' },
  { id: 'classic' as CVTemplateType, name: 'Klassisch', icon: '📜' },
  { id: 'minimal' as CVTemplateType, name: 'Minimal', icon: '⚪' },
  { id: 'creative' as CVTemplateType, name: 'Kreativ', icon: '🎨' },
  { id: 'professional' as CVTemplateType, name: 'Professional', icon: '💼' },
];

export function CVLiveEditorPage() {
  const { cvId } = useParams<{ cvId: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  console.log('[CV EDITOR] Route cvId ===>', cvId);

  const {
    cvData,
    isLoading,
    isCompleted,
    isFailed,
    error: statusError,
  } = useCvOptimizationStatus(cvId);

  const [editorData, setEditorData] = useState<EditorData | null>(null);
  const [jobData, setJobData] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [cvStatus, setCvStatus] = useState<string>('processing');
  const [error, setError] = useState<string | null>(null);

  const [selectedTemplate, setSelectedTemplate] =
    useState<CVTemplateType>('modern');
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [isDownloadUnlocked, setIsDownloadUnlocked] = useState(false);

  const [showTips, setShowTips] = useState(false);

  const cvPreviewRef = useRef<HTMLDivElement | null>(null);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Auto-Save Refs
  const isInitialLoadRef = useRef(true);
  const saveTimeoutRef = useRef<number | null>(null);

  // 🔁 Polling stored_cvs für optimierten CV
  useEffect(() => {
    if (!cvId) {
      setError('Keine CV-ID gefunden.');
      return;
    }

    let cancelled = false;
    const MAX_ATTEMPTS = 40;
    const INTERVAL_MS = 4000;

    const poll = async (attempt: number) => {
      if (cancelled) return;

      console.log('[CV EDITOR] 🔁 Poll stored_cvs', { cvId, attempt });

      const { data, error } = await supabase
        .from('stored_cvs')
        .select('cv_data, job_data, status, download_unlocked, user_id')
        .eq('id', cvId)
        .maybeSingle();

      console.log('[CV EDITOR] Supabase-Response ===>', {
        cvId,
        data,
        error,
        attempt,
      });

      if (cancelled) return;

      if (error) {
        console.error('[CV EDITOR] ❌ Supabase-Fehler:', error);
        if (attempt >= MAX_ATTEMPTS) {
          setError(error.message || 'Datenbankfehler beim Laden des CV.');
          setCvStatus('failed');
        } else {
          setTimeout(() => poll(attempt + 1), INTERVAL_MS);
        }
        return;
      }

      if (!data) {
        console.warn('[CV EDITOR] ⚠️ Kein Datensatz für id', cvId);
        if (attempt >= MAX_ATTEMPTS) {
          setError(
            'Kein CV-Datensatz gefunden. Bitte starte den Prozess erneut.'
          );
          setCvStatus('failed');
        } else {
          setTimeout(() => poll(attempt + 1), INTERVAL_MS);
        }
        return;
      }

      // Wenn der Datensatz noch keine user_id hat, mit aktuellem User verknüpfen
      if (user && !data.user_id) {
        try {
          console.log(
            '[CVLiveEditor] user_id war leer – verknüpfe mit User:',
            user.id
          );
          await supabase
            .from('stored_cvs')
            .update({ user_id: user.id })
            .eq('id', cvId);
        } catch (linkError) {
          console.error(
            '[CVLiveEditor] Fehler beim Setzen der user_id:',
            linkError
          );
        }
      }

      // --- Status aus Supabase ---
      const rawStatus = (data.status as string) || 'processing';
      const normalizedStatus = rawStatus.toLowerCase().trim();
      setCvStatus(normalizedStatus);

      const isReadyStatus = ['completed', 'ready', 'optimized'].includes(
        normalizedStatus
      );

      // --- cv_data aus Supabase holen/parsen ---
      let rawCvData: any = null;

      const cvFields = ['cv_data', 'cv_data_final'];
      let cvField = '';
      for (const field of cvFields) {
        if ((data as any)?.[field]) {
          cvField = field;
          break;
        }
      }

      console.log('[CV EDITOR] 🔍 Available data fields:', {
        has_cv_data: !!(data as any)?.cv_data,
        has_cv_data_final: !!(data as any)?.cv_data_final,
        using: cvField || 'none',
      });

      if (cvField) {
        try {
          const sourceCv = (data as any)[cvField];

          console.log('[CV EDITOR] sourceCv typeof ===>', typeof sourceCv);

          if (sourceCv) {
            if (typeof sourceCv === 'string') {
              try {
                rawCvData = JSON.parse(sourceCv);
              } catch (parseError) {
                console.error('[CV EDITOR] ⚠️ JSON.parse failed for', cvField, ':', parseError);
                rawCvData = null;
              }
            } else {
              rawCvData = sourceCv;
            }
          }
        } catch (e) {
          console.error('[CV EDITOR] ❌ Fehler beim Verarbeiten von', cvField, ':', e);
          rawCvData = null;
        }
      }

      const hasCvData =
        !!rawCvData &&
        ((typeof rawCvData === 'object' &&
          Object.keys(rawCvData || {}).length > 0) ||
          Array.isArray(rawCvData));

      console.log('[CV EDITOR] ✅ Status validation:', {
        normalizedStatus,
        isReadyStatus,
        hasCvData,
        shouldProceed: hasCvData && isReadyStatus,
      });

      if (normalizedStatus === 'failed') {
        setError(
          'Die CV-Optimierung ist fehlgeschlagen. Bitte versuche es erneut.'
        );
        setCvStatus('failed');
        return;
      }

      if (!hasCvData || !isReadyStatus) {
        console.log('[CV EDITOR] ⏳ Noch nicht fertig', {
          normalizedStatus,
          hasCvData,
          isReadyStatus,
        });

        if (attempt >= MAX_ATTEMPTS) {
          setError(
            'Die CV-Optimierung dauert zu lange oder ist möglicherweise hängen geblieben. Bitte versuche es später erneut.'
          );
          setCvStatus('failed');
        } else {
          setTimeout(() => poll(attempt + 1), INTERVAL_MS);
        }
        return;
      }

      // Ab hier: Make-Prozess ist fertig UND cv_data ist da
      if (data.job_data) {
        try {
          const parsedJob =
            typeof data.job_data === 'string'
              ? JSON.parse(data.job_data)
              : data.job_data;
          setJobData(parsedJob);
        } catch (e) {
          console.warn(
            '[CV EDITOR] ⚠️ job_data konnte nicht geparsed werden:',
            e
          );
          setJobData((data as any).job_data);
        }
      }

      // --- Mapping cv_data → editorData & sections ---
      console.log('[CV EDITOR] 🔍 rawCvData Inhalt:', rawCvData);

      // 1) editorPayload bestimmen (verschiedene mögliche Strukturen)
      const editorPayload: any =
        rawCvData?.optimized_cv ||
        rawCvData?.cv ||
        rawCvData?.data ||
        rawCvData?.cv_data ||
        rawCvData ||
        {};

      console.log('[CV EDITOR] 📦 Using editorPayload:', editorPayload);

      // 2) Foto extrahieren
      const photoFromPayload =
        editorPayload.photoUrl ||
        editorPayload.photo_url ||
        editorPayload.personalInfo?.photoUrl ||
        editorPayload.personalInfo?.photo_url ||
        editorPayload.personalData?.photoUrl ||
        editorPayload.personalData?.photo_url ||
        editorPayload.personal_data?.photoUrl ||
        editorPayload.personal_data?.photo_url;

      if (photoFromPayload) {
        setPhotoUrl(photoFromPayload);
      }

      // 3) Personal Info mappen
      const rawPersonal =
        editorPayload.personalInfo ||
        editorPayload.personal_data ||
        editorPayload.personalData ||
        {};

      const builderPersonal =
        editorPayload.personalData || editorPayload.personal_data || {};

      const personalInfo: any = {
        name:
          rawPersonal.name ||
          builderPersonal.full_name ||
          `${builderPersonal.firstName ?? ''} ${
            builderPersonal.lastName ?? ''
          }`.trim() ||
          '',
        email: rawPersonal.email || builderPersonal.email || '',
        phone: rawPersonal.phone || builderPersonal.phone || '',
        location:
          rawPersonal.location ||
          builderPersonal.location ||
          [builderPersonal.zipCode, builderPersonal.city]
            .filter(Boolean)
            .join(' ') ||
          '',
        linkedin: rawPersonal.linkedin || builderPersonal.linkedin || '',
        website:
          rawPersonal.website ||
          builderPersonal.website ||
          builderPersonal.personalWebsite ||
          '',
        github: rawPersonal.github || builderPersonal.github || '',
        portfolio:
          rawPersonal.portfolio || builderPersonal.portfolio || '',
        experienceLevel: editorPayload.experienceLevel || '',
        roleType: editorPayload.targetRole || '',
        industryType: editorPayload.targetIndustry || '',
      };

      // 4) Basis-Sections: was Make evtl. schon liefert
      let sections: EditorSection[] = [];

      if (
        Array.isArray(editorPayload.sections) &&
        editorPayload.sections.length > 0
      ) {
        sections = [...editorPayload.sections];
        console.log(
          '[CV EDITOR] 📚 Using sections from editorPayload:',
          sections.map((s) => s.type)
        );

        // ggf. Personal-Daten aus einer personal-Section übernehmen
        const personalSection = sections.find(
          (s) => s.type === 'personal' || s.type === 'personalInfo'
        );
        if (personalSection && (personalSection as any).data) {
          Object.assign(personalInfo, (personalSection as any).data);
        }
      }

      // 5) Experience-Daten sammeln & ggf. Section ergänzen
      const experienceItemsSource =
        rawCvData?.experiences ||
        editorPayload.experiences ||
        editorPayload.workExperiences ||
        editorPayload.workExperience ||
        editorPayload.work_experience ||
        editorPayload.cv_experience ||
        editorPayload.experience ||
        [];

      const experienceItems = Array.isArray(experienceItemsSource)
        ? experienceItemsSource
        : [];

      let hasExperienceSection = sections.some(
        (s) => s.type === 'experience'
      );

      if (!hasExperienceSection && experienceItems.length > 0) {
        console.log('[CV EDITOR] 💼 Experience Items:', experienceItems);

        const mappedExperiences = experienceItems.map((exp: any) => ({
          title: exp.title || exp.position || exp.role || exp.jobTitle || '',
          company: exp.company || exp.employer || exp.organization || '',
          date_from:
            exp.date_from ||
            exp.from ||
            exp.startDate ||
            exp.start_date ||
            exp.start ||
            '',
          date_to:
            exp.date_to ||
            exp.to ||
            exp.endDate ||
            exp.end_date ||
            exp.end ||
            '',
          description:
            exp.description || exp.responsibilities || exp.summary || '',
          bulletPoints:
            exp.bulletPoints ||
            exp.bullet_points ||
            exp.achievements ||
            exp.tasks ||
            [],
        }));

        sections.push({
          type: 'experience',
          title: 'Berufserfahrung',
          items: mappedExperiences,
        });

        hasExperienceSection = true;

        console.log(
          '[CV EDITOR] ✅ Experience section added with',
          mappedExperiences.length,
          'items'
        );
      }

      // 6) Education
      const educationItemsSource =
        rawCvData?.education ||
        editorPayload.education ||
        editorPayload.professionalEducation ||
        editorPayload.cv_education ||
        [];

      const educationItems = Array.isArray(educationItemsSource)
        ? educationItemsSource
        : [];

      const hasEducationSection = sections.some(
        (s) => s.type === 'education'
      );

      if (!hasEducationSection && educationItems.length > 0) {
        const mappedEducation = educationItems.map((edu: any) => ({
          degree:
            edu.degree ||
            edu.title ||
            edu.type ||
            edu.qualification ||
            '',
          institution:
            edu.institution ||
            edu.school ||
            edu.university ||
            edu.schoolName ||
            '',
          date_from:
            edu.date_from ||
            edu.from ||
            edu.startDate ||
            edu.start_date ||
            edu.start ||
            edu.startYear ||
            '',
          date_to:
            edu.date_to ||
            edu.to ||
            edu.endDate ||
            edu.end_date ||
            edu.end ||
            edu.endYear ||
            '',
          description: edu.description || edu.focus || edu.field || '',
        }));

        sections.push({
          type: 'education',
          title: 'Ausbildung / Studium',
          items: mappedEducation,
        });

        console.log(
          '[CV EDITOR] ✅ Education section added with',
          mappedEducation.length,
          'items'
        );
      }

      // 7) Projekte
      const projectItemsSource =
        rawCvData?.projects ||
        editorPayload.projects ||
        editorPayload.project ||
        editorPayload.cv_projects ||
        [];

      const projectItems = Array.isArray(projectItemsSource)
        ? projectItemsSource
        : [];

      let hasProjectsSection = sections.some(
        (s) => s.type === 'projects'
      );

      if (!hasProjectsSection && projectItems.length > 0) {
        console.log('[CV EDITOR] 🚀 Project Items:', projectItems);

        const mappedProjects = projectItems.map((proj: any) => ({
          title: proj.title || proj.name || proj.projectName || '',
          role: proj.role || proj.position || '',
          description:
            proj.description || proj.summary || proj.result || '',
          bulletPoints:
            proj.bulletPoints ||
            proj.bullet_points ||
            proj.tasks ||
            proj.achievements ||
            [],
        }));

        sections.push({
          type: 'projects',
          title: 'Projekte',
          items: mappedProjects,
        });

        hasProjectsSection = true;

        console.log(
          '[CV EDITOR] ✅ Projects section added with',
          mappedProjects.length,
          'items'
        );
      }

      // 8) Helper: Detect if item is a language
      const isLanguageItem = (item: any): boolean => {
        const commonLanguages = [
          'deutsch', 'englisch', 'französisch', 'spanisch', 'italienisch',
          'portugiesisch', 'russisch', 'chinesisch', 'japanisch', 'arabisch',
          'türkisch', 'polnisch', 'niederländisch', 'schwedisch', 'norwegisch',
          'dänisch', 'finnisch', 'griechisch', 'tschechisch', 'ungarisch',
          'german', 'english', 'french', 'spanish', 'italian', 'portuguese',
          'russian', 'chinese', 'japanese', 'arabic', 'turkish', 'polish',
          'dutch', 'swedish', 'norwegian', 'danish', 'finnish', 'greek',
        ];

        if (typeof item === 'string') {
          const lower = item.toLowerCase();
          return commonLanguages.some((lang) => lower.includes(lang));
        }

        if (typeof item === 'object' && item !== null) {
          const str = JSON.stringify(item).toLowerCase();
          return (
            commonLanguages.some((lang) => str.includes(lang)) ||
            'sprache' in item ||
            'language' in item ||
            'niveau' in item ||
            'level' in item
          );
        }

        return false;
      };

      // 9) Languages - Extract from all sources FIRST
      const languageItemsFromData =
        rawCvData?.languages ||
        editorPayload.languages ||
        editorPayload.language ||
        editorPayload.languageSkills ||
        editorPayload.language_skills ||
        editorPayload.cv_languages ||
        editorPayload.sprachkenntnisse ||
        [];

      const collectedLanguages: any[] = Array.isArray(languageItemsFromData)
        ? [...languageItemsFromData]
        : [];

      console.log('[CV EDITOR] 🌍 Initial languages from data:', collectedLanguages.length);

      // 10) Skills - Extract and REMOVE any languages found
      const skillsData =
        editorPayload.skills ||
        editorPayload.hardSkills ||
        editorPayload.cv_hard_skills ||
        editorPayload.hard_skills ||
        [];

      const hasSkillsSection = sections.some((s) => s.type === 'skills');

      if (!hasSkillsSection) {
        if (
          skillsData &&
          !Array.isArray(skillsData) &&
          typeof skillsData === 'object'
        ) {
          const hardSkillsItems =
            skillsData.hardSkills ||
            skillsData.hard ||
            skillsData.hard_skills ||
            [];
          const softSkillsItems =
            skillsData.softSkills ||
            skillsData.soft ||
            skillsData.soft_skills ||
            [];

          // Filter hard skills: extract languages, keep only real skills
          if (Array.isArray(hardSkillsItems) && hardSkillsItems.length > 0) {
            const pureSkills: any[] = [];
            hardSkillsItems.forEach((item) => {
              if (isLanguageItem(item)) {
                collectedLanguages.push(item);
                console.log('[CV EDITOR] 🌍 Extracted language from hard skills:', item);
              } else {
                pureSkills.push(item);
              }
            });

            if (pureSkills.length > 0) {
              sections.push({
                type: 'skills',
                title: 'Fähigkeiten',
                items: pureSkills,
              });
            }
          }

          // Filter soft skills: extract languages, keep only real skills
          if (Array.isArray(softSkillsItems) && softSkillsItems.length > 0) {
            const pureSkills: any[] = [];
            softSkillsItems.forEach((item) => {
              if (isLanguageItem(item)) {
                collectedLanguages.push(item);
                console.log('[CV EDITOR] 🌍 Extracted language from soft skills:', item);
              } else {
                pureSkills.push(item);
              }
            });

            if (pureSkills.length > 0) {
              sections.push({
                type: 'soft_skills',
                title: 'Soft Skills',
                items: pureSkills,
              });
            }
          }
        } else if (Array.isArray(skillsData) && skillsData.length > 0) {
          // Filter flat skills array
          const pureSkills: any[] = [];
          skillsData.forEach((item) => {
            if (isLanguageItem(item)) {
              collectedLanguages.push(item);
              console.log('[CV EDITOR] 🌍 Extracted language from skills:', item);
            } else {
              pureSkills.push(item);
            }
          });

          if (pureSkills.length > 0) {
            sections.push({
              type: 'skills',
              title: 'Fähigkeiten',
              items: pureSkills,
            });
          }
        }
      }

      // 11) Normalize languages: ensure { language: "...", level: "..." } structure
      const normalizeLanguage = (item: any): { language: string; level: string } => {
        if (typeof item === 'string') {
          return { language: item, level: '' };
        }
        if (typeof item === 'object' && item !== null) {
          return {
            language: item.language || item.name || item.sprache || String(item),
            level: item.level || item.niveau || item.proficiency || '',
          };
        }
        return { language: String(item), level: '' };
      };

      const normalizedLanguages = collectedLanguages.map(normalizeLanguage);

      console.log('[CV EDITOR] 🌍 Total collected languages:', normalizedLanguages.length);
      console.log('[CV EDITOR] 🌍 Normalized languages:', normalizedLanguages);

      // 12) Add languages section
      const hasLanguagesSection = sections.some((s) => s.type === 'languages');

      if (!hasLanguagesSection && normalizedLanguages.length > 0) {
        sections.push({
          type: 'languages',
          title: 'Sprachen',
          items: normalizedLanguages,
        });

        console.log('[CV EDITOR] ✅ Languages section added with', normalizedLanguages.length, 'items');
      }

      // 13) Weitere optionale Sections (Werte, Zertifikate, Hobbys, …)
      const workValuesItems =
        editorPayload.workValues?.values ||
        editorPayload.workValues?.workStyle ||
        editorPayload.work_values ||
        editorPayload.values ||
        [];

      if (
        workValuesItems &&
        Array.isArray(workValuesItems) &&
        workValuesItems.length > 0 &&
        !sections.some((s) => s.type === 'work_values')
      ) {
        sections.push({
          type: 'work_values',
          title: 'Arbeitsweise & Werte',
          items: workValuesItems,
        });
      }

      const certificationItems =
        editorPayload.certifications ||
        editorPayload.certificates ||
        editorPayload.cv_certifications ||
        [];

      if (
        Array.isArray(certificationItems) &&
        certificationItems.length > 0 &&
        !sections.some((s) => s.type === 'certifications')
      ) {
        sections.push({
          type: 'certifications',
          title: 'Zertifikate',
          items: certificationItems,
        });
      }

      const hobbiesItems =
        editorPayload.hobbies ||
        editorPayload.interests ||
        editorPayload.cv_hobbies ||
        [];

      if (
        Array.isArray(hobbiesItems) &&
        hobbiesItems.length > 0 &&
        !sections.some((s) => s.type === 'hobbies')
      ) {
        sections.push({
          type: 'hobbies',
          title: 'Hobbys & Interessen',
          items: hobbiesItems,
        });
      }

      const volunteeringItems =
        editorPayload.volunteering ||
        editorPayload.volunteerExperience ||
        editorPayload.cv_volunteering ||
        [];

      if (
        Array.isArray(volunteeringItems) &&
        volunteeringItems.length > 0 &&
        !sections.some((s) => s.type === 'volunteering')
      ) {
        sections.push({
          type: 'volunteering',
          title: 'Ehrenamtliches Engagement',
          items: volunteeringItems,
        });
      }

      const coursesItems =
        editorPayload.courses ||
        editorPayload.trainings ||
        editorPayload.cv_courses ||
        [];

      if (
        Array.isArray(coursesItems) &&
        coursesItems.length > 0 &&
        !sections.some((s) => s.type === 'courses')
      ) {
        sections.push({
          type: 'courses',
          title: 'Kurse & Weiterbildungen',
          items: coursesItems,
        });
      }

      const awardsItems =
        editorPayload.awards ||
        editorPayload.honors ||
        editorPayload.cv_awards ||
        [];

      if (
        Array.isArray(awardsItems) &&
        awardsItems.length > 0 &&
        !sections.some((s) => s.type === 'awards')
      ) {
        sections.push({
          type: 'awards',
          title: 'Auszeichnungen',
          items: awardsItems,
        });
      }

      // Safety: sections-Array sicherstellen
      if (!Array.isArray(sections)) {
        sections = [];
      }

      console.log('[CV EDITOR] 🎯 FINALE MAPPED SECTIONS:', sections);
      console.log(
        '[CV EDITOR] 🎯 Section Types:',
        sections.map((s) => s.type)
      );
      console.log(
        '[CV EDITOR] 🎯 Section Items Count:',
        sections.map((s) => ({
          type: s.type,
          itemsCount: Array.isArray(s.items) ? s.items.length : 'no items',
        }))
      );

      // 14) Top-Level-Felder für Projekte/Sprachen (wichtig für Auto-Save)
      const projectsSection = sections.find((s) => s.type === 'projects');
      const languagesSection = sections.find((s) => s.type === 'languages');

      const mappedEditor: EditorData = {
        ...rawCvData,
        ...editorPayload,
        personalInfo,
        summary:
          editorPayload.summary ??
          editorPayload.profile_summary ??
          editorPayload.aboutMe ??
          editorPayload.motivation?.text,
        sections,
        projects:
          projectsSection?.items ||
          editorPayload.projects ||
          rawCvData?.projects ||
          [],
        // CRITICAL: Always use normalizedLanguages - never overwrite
        languages: normalizedLanguages.length > 0 ? normalizedLanguages : [],
      };

      console.log(
        '[CV EDITOR] 🎯 Top-level projects:',
        mappedEditor.projects?.length || 0
      );
      console.log(
        '[CV EDITOR] 🎯 Top-level languages:',
        mappedEditor.languages?.length || 0
      );
      console.log(
        '[CV EDITOR] 🎯 Languages structure:',
        JSON.stringify(mappedEditor.languages, null, 2)
      );

      console.log('[DEBUG] Final sections:', sections.map(s => ({
        type: s.type,
        items: Array.isArray(s.items) ? s.items.length : 0
      })));

      setEditorData(mappedEditor);
    };

    setEditorData(null);
    setError(null);
    setCvStatus('processing');
    poll(1);

    return () => {
      cancelled = true;
    };
  }, [cvId, user]);

  // download_unlocked-Flag prüfen
  useEffect(() => {
    if (!cvId) return;

    const checkDownloadUnlocked = async () => {
      try {
        const { data, error } = await supabase
          .from('stored_cvs')
          .select('download_unlocked')
          .eq('id', cvId)
         .maybeSingle();


        if (error) {
          console.warn(
            '[CV EDITOR] ⚠️ Konnte download_unlocked nicht laden:',
            error
          );
          return;
        }

        setIsDownloadUnlocked(!!data?.download_unlocked);
      } catch (err) {
        console.error(
          '[CV EDITOR] ❌ Fehler beim Prüfen von download_unlocked:',
          err
        );
      }
    };

    checkDownloadUnlocked();
  }, [cvId]);

  // ------- Automatische PDF-Generierung nach Zahlung -------
  useEffect(() => {
    const paymentSuccess = searchParams.get('payment') === 'success';

    if (!paymentSuccess || !cvId || !editorData || !user) return;

    // Flag um Mehrfachausführung zu verhindern
    const hasTriggeredPdf = sessionStorage.getItem(`pdf_generated_${cvId}`);
    if (hasTriggeredPdf) return;

    console.log(
      '[CVLiveEditor] 💳 Payment success detected - auto-generating PDF...'
    );

    // Warte kurz bis die Komponente vollständig geladen ist
    const timer = setTimeout(async () => {
      try {
        sessionStorage.setItem(`pdf_generated_${cvId}`, 'true');
        await handleDownloadClick();

        // Nach erfolgreicher PDF-Generierung zum Dashboard redirecten
        console.log(
          '[CVLiveEditor] ✅ PDF generated - redirecting to dashboard...'
        );
        setTimeout(() => {
          navigate(`/dashboard?payment=success&cvId=${cvId}`, {
            replace: true,
          });
        }, 1500);
      } catch (error) {
        console.error('[CVLiveEditor] ❌ Auto PDF generation failed:', error);
        sessionStorage.removeItem(`pdf_generated_${cvId}`);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchParams, cvId, editorData, user, navigate]);

  // ------- Auto-Save (cv_data) -------
  useEffect(() => {
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    if (!editorData || !cvId || !user) return;

    if (saveTimeoutRef.current) {
      window.clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = window.setTimeout(async () => {
      try {
        console.log('[CVLiveEditor] 💾 Auto-saving changes...');

        const projectsSection = editorData.sections?.find(
          (s) => s.type === 'projects'
        );
        const languagesSection = editorData.sections?.find(
          (s) => s.type === 'languages'
        );

        const dataToSave = {
          ...editorData,
          // Sync projects and languages from sections to top-level
          projects: projectsSection?.items || editorData.projects || [],
          languages: languagesSection?.items || editorData.languages || [],
        };

        const { error } = await supabase
          .from('stored_cvs')
          .update({
cv_data: dataToSave,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cvId);

        if (error) {
          console.error('[CVLiveEditor] ❌ Auto-save error:', error);
        } else {
          console.log('[CVLiveEditor] ✅ Auto-saved');
        }
      } catch (error) {
        console.error('[CVLiveEditor] ❌ Auto-save failed:', error);
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        window.clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editorData, cvId, user]);

  // Helper function to ensure projects and languages are synced between sections and top-level
  const prepareCvDataForSave = (data: EditorData) => {
    const projectsSection = data.sections?.find((s) => s.type === 'projects');
    const languagesSection = data.sections?.find((s) => s.type === 'languages');

    return {
      ...data,
      projects: projectsSection?.items || data.projects || [],
      languages: languagesSection?.items || data.languages || [],
    };
  };

  // ------- Download / Paywall / PDF -------
  const handleDownloadClick = async () => {
    // ─────────────────────────────────────────────────────────────
    // 1️⃣ GUARDS: cvId, user
    // ─────────────────────────────────────────────────────────────
    if (!cvId) {
      console.error('[CVLiveEditor] ❌ No cvId available for download');
      alert('Fehler: Keine CV-ID vorhanden');
      return;
    }

    if (!user) {
      const redirectTo = encodeURIComponent(`/cv-paywall?cvId=${cvId}`);
      navigate(`/login?redirect=${redirectTo}`);
      return;
    }

    const paymentSuccess = searchParams.get('payment') === 'success';

    // ─────────────────────────────────────────────────────────────
    // 2️⃣ PAYMENT / TOKEN CHECK
    // ─────────────────────────────────────────────────────────────
    const { data: cvRecord, error: cvError } = await supabase
      .from('stored_cvs')
      .select('is_paid, download_unlocked, download_count, pdf_url')
      .eq('id', cvId)
      .maybeSingle();

    if (cvError) {
      console.error('[CVLiveEditor] ❌ Fehler beim Laden des CV-Records:', cvError);
    }

    if (cvRecord?.pdf_url) {
      console.log('[CVLiveEditor] ✅ PDF bereits erstellt – direkter Download ohne Neugeneration');
      window.open(cvRecord.pdf_url, '_blank');
      return;
    }

    const alreadyUnlocked = paymentSuccess || !!(cvRecord?.is_paid || cvRecord?.download_unlocked);

    if (!alreadyUnlocked) {
      console.log('[CVLiveEditor] 🔒 CV not paid - checking tokens');

      const { tokenService } = await import('../services/tokenService');
      const hasTokens = await tokenService.hasTokens(user.id);

      if (!hasTokens) {
        console.log('[CVLiveEditor] 🔒 No tokens - redirecting to paywall:', cvId);
        navigate(`/cv-paywall?cvId=${cvId}`);
        return;
      }

      const consumed = await tokenService.consumeToken(user.id);
      if (!consumed) {
        alert('Token konnte nicht verbraucht werden. Bitte versuche es erneut.');
        navigate(`/cv-paywall?cvId=${cvId}`);
        return;
      }

      const { error: unlockError } = await supabase
        .from('stored_cvs')
        .update({
          unlocked_via_token: true,
          download_unlocked: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', cvId);

      if (unlockError) {
        console.error('[CVLiveEditor] ❌ Error unlocking CV:', unlockError);
      } else {
        setIsDownloadUnlocked(true);
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3️⃣ RACE GUARD
    // ─────────────────────────────────────────────────────────────
    if (isExportingPDF) return;
    setIsExportingPDF(true);

    try {
      // ─────────────────────────────────────────────────────────────
      // 4️⃣ FINAL SAVE von cv_data
      // ─────────────────────────────────────────────────────────────
      if (!cvPreviewRef.current) {
        alert('CV-Vorschau nicht gefunden. Bitte lade die Seite neu.');
        return;
      }

      const finalData = editorData ? prepareCvDataForSave(editorData) : null;
      if (!finalData) {
        alert('Keine CV-Daten vorhanden.');
        return;
      }

      const { error: saveErr } = await supabase
        .from('stored_cvs')
.update({
  cv_data: finalData,
  updated_at: new Date().toISOString(),
})

        .eq('id', cvId);

      if (saveErr) {
        console.error('[CVLiveEditor] ❌ Final save failed:', saveErr);
        alert('Speichern fehlgeschlagen – PDF wird nicht erstellt.');
        return;
      }

      // ─────────────────────────────────────────────────────────────
      // 5️⃣ PDF EXPORT (DOM/Fonts/Images ready)
      // ─────────────────────────────────────────────────────────────
      await new Promise(requestAnimationFrame);
      await new Promise(requestAnimationFrame);

      if ((document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }

      const images = Array.from(cvPreviewRef.current.querySelectorAll('img'));
      await Promise.all(
        images.map(
          (img) =>
            img.complete ||
            new Promise<void>((res) => {
              img.onload = () => res();
              img.onerror = () => res();
            })
        )
      );

      console.log('[CVLiveEditor] 📄 Generating PDF...');
      const pdfBlob = await exportCVToPDFBlob(
        cvPreviewRef,
        editorData.personalInfo,
        { quality: 0.95, scale: 2 }
      );

      // ─────────────────────────────────────────────────────────────
      // 6️⃣ UPLOAD + UPDATE stored_cvs
      // ─────────────────────────────────────────────────────────────
      const name = editorData.personalInfo?.name || 'CV';
      const safeName = name.replace(/[^a-zA-Z0-9-_]/g, '_');
      const filePath = `${user.id}/${cvId}.pdf`;

      console.log('[CVLiveEditor] 📤 Uploading PDF to storage:', filePath);
      const { error: uploadError } = await supabase.storage
        .from('cv-pdfs')
        .upload(filePath, pdfBlob, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (uploadError) {
        console.error('[CVLiveEditor] ❌ PDF upload failed:', uploadError);

        const errorMsg = uploadError.message || 'Unbekannter Upload-Fehler';
        await supabase
          .from('stored_cvs')
          .update({
            error_message: errorMsg,
            updated_at: new Date().toISOString(),
          })
          .eq('id', cvId);

        alert('PDF-Upload fehlgeschlagen.');
        return;
      }

      const { data } = supabase.storage.from('cv-pdfs').getPublicUrl(filePath);
      const publicUrl = data.publicUrl;
      console.log('[CVLiveEditor] 🌐 Public PDF URL:', publicUrl);

      const { error: updateError } = await supabase
        .from('stored_cvs')
        .update({
          pdf_url: publicUrl,
          updated_at: new Date().toISOString(),
          download_unlocked: true,
        })
        .eq('id', cvId);

      if (updateError) {
        console.error('[CVLiveEditor] ❌ Fehler beim Speichern der pdf_url:', updateError);
        alert('PDF wurde erstellt, aber der Download-Link konnte nicht gespeichert werden.');
        return;
      }

      console.log('[CVLiveEditor] ✅ Öffentliche PDF-URL in stored_cvs gespeichert und dauerhaft verfügbar');

      // ─────────────────────────────────────────────────────────────
      // 7️⃣ BROWSER DOWNLOAD
      // ─────────────────────────────────────────────────────────────
      const blobUrl = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${safeName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);

      console.log('[CVLiveEditor] ✅ PDF Download erfolgreich');
    } catch (error: any) {
      console.error('[CVLiveEditor] ❌ PDF export/upload error:', error);
      alert(error?.message || 'PDF-Export fehlgeschlagen. Bitte versuche es erneut.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handlePhotoChange = (base64: string | null) => {
    if (base64) {
      setPhotoUrl(base64);
      setShowPhotoUpload(false);
    }
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setEditorData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        personalInfo: { ...(prev.personalInfo || {}), [field]: value },
      };
    });
  };

  const updateSection = (
    sectionIndex: number,
    updates: Partial<EditorSection>
  ) => {
    setEditorData((prev) => {
      if (!prev?.sections) return prev;
      const newSections = [...prev.sections];
      newSections[sectionIndex] = {
        ...newSections[sectionIndex],
        ...updates,
      };
      return { ...prev, sections: newSections };
    });
  };

  const deleteSectionItem = (sectionIndex: number, itemIndex: number) => {
    setEditorData((prev) => {
      if (!prev?.sections?.[sectionIndex]) return prev;

      try {
        const newSections = [...prev.sections];
        const section = { ...newSections[sectionIndex] };

        if (!section.items || !Array.isArray(section.items)) {
          console.warn(
            '[CVLiveEditor] ⚠️ Section has no items array:',
            section
          );
          return prev;
        }

        if (itemIndex < 0 || itemIndex >= section.items.length) {
          console.warn(
            '[CVLiveEditor] ⚠️ Invalid item index:',
            itemIndex
          );
          return prev;
        }

const newItems = [...section.items];
const current = newItems[itemIndex];

// Primitive Werte (string) sicher in Objekt umwandeln
const safeObject =
  current && typeof current === 'object'
    ? current
    : section.type === 'languages'
      ? { language: String(current ?? ''), level: '' }
      : section.type === 'skills' || section.type === 'soft_skills'
        ? { skill: String(current ?? '') }
        : { value: current };

newItems[itemIndex] = { ...safeObject, [field]: value };
section.items = newItems;

        newSections[sectionIndex] = section;

        console.log(
          '[CVLiveEditor] ✅ Deleted item:',
          itemIndex,
          'from section:',
          sectionIndex
        );
        return { ...prev, sections: newSections };
      } catch (error) {
        console.error('[CVLiveEditor] ❌ Delete error:', error);
        return prev;
      }
    });
  };

  const updateSectionItem = (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => {
    setEditorData((prev) => {
      if (!prev?.sections?.[sectionIndex]) return prev;

      try {
        const newSections = [...prev.sections];
        const section = { ...newSections[sectionIndex] };

        if (!section.items || !Array.isArray(section.items)) {
          console.warn(
            '[CVLiveEditor] ⚠️ Section has no items array:',
            section
          );
          return prev;
        }

        if (itemIndex < 0 || itemIndex >= section.items.length) {
          console.warn(
            '[CVLiveEditor] ⚠️ Invalid item index:',
            itemIndex
          );
          return prev;
        }

        const newItems = [...section.items];
        newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
        section.items = newItems;
        newSections[sectionIndex] = section;

        return { ...prev, sections: newSections };
      } catch (error) {
        console.error('[CVLiveEditor] ❌ Update error:', error);
        return prev;
      }
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0a0a0f] to-[#050507] text-white flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md px-4">
          <AlertTriangle size={64} className="text-red-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold mb-2">Fehler</h2>
            <p className="text-white/60">{error}</p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
          >
            Zurück
          </button>
        </div>
      </div>
    );
  }

  if (!editorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0a0a0f] to-[#050507] text-white py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center space-y-6 mb-12">
            <Loader2 size={48} className="text-[#66c0b6] animate-spin mx-auto" />
            <div>
              <h2 className="text-3xl font-bold mb-3">Dein CV wird optimiert...</h2>
              <p className="text-white/60 text-lg">
                Make.com passt deinen CV auf die Stelle an. Das dauert ca. 30–60 Sekunden.
              </p>
              <p className="text-white/40 text-sm mt-4">
                Status:{' '}
                <span className="text-[#66c0b6] font-medium">
                  {cvStatus || 'processing'}
                </span>
              </p>
            </div>
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-[#66c0b6] rounded-full animate-pulse"></div>
              <div
                className="w-2 h-2 bg-[#66c0b6] rounded-full animate-pulse"
                style={{ animationDelay: '0.2s' }}
              ></div>
              <div
                className="w-2 h-2 bg-[#66c0b6] rounded-full animate-pulse"
                style={{ animationDelay: '0.4s' }}
              ></div>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h3 className="text-xl font-semibold text-white/90 mb-6">
              Was du gleich im Editor machen kannst:
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-[#66c0b6]/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#66c0b6]/20 flex items-center justify-center mb-4">
                <span className="text-2xl">🌊</span>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">5 Design-Vorlagen</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Wähle aus Modern, Klassisch, Minimal, Kreativ oder Professional
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-[#66c0b6]/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#66c0b6]/20 flex items-center justify-center mb-4">
                <Camera size={24} className="text-[#66c0b6]" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">Profilfoto einfügen</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Lade dein Bewerbungsfoto direkt im Editor hoch
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-[#66c0b6]/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#66c0b6]/20 flex items-center justify-center mb-4">
                <span className="text-2xl">✏️</span>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">Live-Bearbeitung</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Bearbeite alle Inhalte direkt im CV und sieh das Ergebnis sofort
              </p>
            </div>

            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-[#66c0b6]/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-[#66c0b6]/20 flex items-center justify-center mb-4">
                <Sparkles size={24} className="text-[#66c0b6]" />
              </div>
              <h4 className="text-lg font-semibold mb-2 text-white">Hilfreiche Tipps</h4>
              <p className="text-white/60 text-sm leading-relaxed">
                Dein Avatar gibt dir kontextbasierte Tipps für das beste Ergebnis
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050507] via-[#0a0a0f] to-[#050507] flex flex-col">
      {/* Header / Controls */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 flex-shrink-0 z-50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm text-white/60">Design:</span>
              <div className="flex gap-2 flex-wrap">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedTemplate === template.id
                        ? 'bg-[#66c0b6] text-black'
                        : 'bg-white/5 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <span className="mr-2">{template.icon}</span>
                    {template.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowPhotoUpload(!showPhotoUpload)}
                className="px-4 py-2 rounded-lg bg-[#66c0b6]/20 hover:bg-[#66c0b6]/30 transition-all border border-[#66c0b6]/40 flex items-center gap-2"
                title="Foto hochladen"
              >
                <Camera size={24} className="text-[#66c0b6]" />
                <span className="text-sm font-medium text-white/90">Foto</span>
              </button>

              <button
                onClick={handleDownloadClick}
                disabled={isExportingPDF}
                className={`px-4 py-2 rounded-lg bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 ${
                  isExportingPDF ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isExportingPDF ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generiere PDF...
                  </>
                ) : (
                  'Herunterladen'
                )}
              </button>

              {/* Tipps Button - Info only */}
              <button
                onClick={() => setShowTips(!showTips)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all flex items-center gap-2"
                title="Tipps anzeigen"
              >
                <Sparkles size={18} className="text-[#66c0b6]" />
                <span className="text-sm font-medium text-white/90">Tipps</span>
              </button>
            </div>
          </div>

          {showPhotoUpload && (
            <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
              <PhotoUpload
                currentPhoto={photoUrl}
                onPhotoChange={handlePhotoChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* A4-Vorschau – komplette Seite sichtbar, kein internes Scrolling */}
      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-4 md:py-8 overflow-auto">
        <div className="w-full max-w-[900px] flex flex-col items-center">
          <div
            ref={cvPreviewRef}
            className="
              bg-white
              rounded-2xl
              shadow-2xl
              border
              border-slate-200
              overflow-hidden
              w-full
              aspect-[210/297]
            "
          >
            <div className="w-full h-full">
              {selectedTemplate === 'modern' &&
                editorData.personalInfo &&
                editorData.sections && (
                  <ModernCVTemplate
                    personalInfo={editorData.personalInfo}
                    summary={editorData.summary}
                    sections={editorData.sections}
                    photoUrl={photoUrl}
                    onUpdatePersonalInfo={updatePersonalInfo}
                    onUpdateSummary={(value) =>
                      setEditorData((prev) =>
                        prev ? { ...prev, summary: value } : prev
                      )
                    }
                    onUpdateSection={updateSection}
                    onUpdateSectionItem={updateSectionItem}
                    onDeleteSectionItem={deleteSectionItem}
                  />
                )}

              {selectedTemplate === 'classic' &&
                editorData.personalInfo &&
                editorData.sections && (
                  <ClassicCVTemplate
                    personalInfo={editorData.personalInfo}
                    summary={editorData.summary}
                    sections={editorData.sections}
                    photoUrl={photoUrl}
                    onUpdatePersonalInfo={updatePersonalInfo}
                    onUpdateSummary={(value) =>
                      setEditorData((prev) =>
                        prev ? { ...prev, summary: value } : prev
                      )
                    }
                    onUpdateSection={updateSection}
                    onUpdateSectionItem={updateSectionItem}
                  />
                )}

              {selectedTemplate === 'minimal' &&
                editorData.personalInfo &&
                editorData.sections && (
                  <MinimalCVTemplate
                    personalInfo={editorData.personalInfo}
                    summary={editorData.summary}
                    sections={editorData.sections}
                    photoUrl={photoUrl}
                    onUpdatePersonalInfo={updatePersonalInfo}
                    onUpdateSummary={(value) =>
                      setEditorData((prev) =>
                        prev ? { ...prev, summary: value } : prev
                      )
                    }
                    onUpdateSection={updateSection}
                    onUpdateSectionItem={updateSectionItem}
                  />
                )}

              {selectedTemplate === 'creative' &&
                editorData.personalInfo &&
                editorData.sections && (
                  <CreativeCVTemplate
                    personalInfo={editorData.personalInfo}
                    summary={editorData.summary}
                    sections={editorData.sections}
                    photoUrl={photoUrl}
                    onUpdatePersonalInfo={updatePersonalInfo}
                    onUpdateSummary={(value) =>
                      setEditorData((prev) =>
                        prev ? { ...prev, summary: value } : prev
                      )
                    }
                    onUpdateSection={updateSection}
                    onUpdateSectionItem={updateSectionItem}
                  />
                )}

              {selectedTemplate === 'professional' &&
                editorData.personalInfo &&
                editorData.sections && (
                  <ProfessionalCVTemplate
                    personalInfo={editorData.personalInfo}
                    summary={editorData.summary}
                    sections={editorData.sections}
                    photoUrl={photoUrl}
                    onUpdatePersonalInfo={updatePersonalInfo}
                    onUpdateSummary={(value) =>
                      setEditorData((prev) =>
                        prev ? { ...prev, summary: value } : prev
                      )
                    }
                    onUpdateSection={updateSection}
                    onUpdateSectionItem={updateSectionItem}
                  />
                )}
            </div>
          </div>

          {jobData && jobData.jobTitle && jobData.company && (
            <div className="mt-4 text-center text-sm text-white/50">
              Optimiert für{' '}
              <span className="text-[#66c0b6]">
                {String(jobData.jobTitle)}
              </span>{' '}
              bei{' '}
              <span className="text-[#66c0b6]">
                {String(jobData.company)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tipps Banner */}
      {showTips && (
        <div className="fixed top-20 right-4 max-w-md bg-[#1a1a1a] border border-[#66c0b6]/30 rounded-xl p-4 shadow-2xl z-50">
          <div className="flex items-start gap-3">
            <Sparkles
              size={20}
              className="text-[#66c0b6] flex-shrink-0 mt-1"
            />
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-2">💡 Editor-Tipps</h3>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Klicke auf Texte, um sie direkt zu bearbeiten</li>
                <li>• Wähle ein Design aus den Templates</li>
                <li>• Lade ein Foto für ein professionelles Erscheinungsbild hoch</li>
                <li>• Lade den fertigen CV als PDF herunter</li>
              </ul>
            </div>
            <button
              onClick={() => setShowTips(false)}
              className="text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
