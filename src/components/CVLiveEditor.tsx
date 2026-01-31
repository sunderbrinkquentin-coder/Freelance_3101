import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Save, Download, Layout, Check, Upload, Eye, EyeOff, GripVertical, ChevronUp, ChevronDown, X } from 'lucide-react';
import { CVBuilderData } from '../types/cvBuilder';
import { ClassicTemplate } from './cv-templates/ClassicTemplate';
import { ModernTemplate } from './cv-templates/ModernTemplate';
import { CompactTemplate } from './cv-templates/CompactTemplate';
import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';
import { PaywallModal } from './PaywallModal';
import { cvStorageService } from '../services/cvStorageService';

interface JobData {
  company: string;
  jobTitle: string;
  jobLink?: string;
  jobDescription: string;
}

interface CVLiveEditorProps {
  cvId?: string;
  cvData: CVBuilderData;
  jobData: JobData | null;
}

type LayoutType = 'classic' | 'modern' | 'compact';

type SectionId = 'profile' | 'experience' | 'education' | 'projects' | 'skills' | 'languages' | 'hobbies';

interface Section {
  id: SectionId;
  title: string;
  visible: boolean;
}

interface OptimizedCV {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    city: string;
    zipCode: string;
    linkedin?: string;
    website?: string;
    photoUrl?: string;
  };
  profileSummary: string;
  salesPitch: string;
  education: Array<{
    degree: string;
    institution: string;
    field: string;
    startDate: string;
    endDate: string;
    grade?: string;
  }>;
  experience: Array<{
    position: string;
    company: string;
    startDate: string;
    endDate: string;
    current: boolean;
    responsibilities: string[];
    achievements: string[];
  }>;
  projects: Array<{
    title: string;
    role: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  languages: Array<{
    language: string;
    level: string;
  }>;
  hardSkills: string[];
  softSkills: string[];
}

export function CVLiveEditor({ cvId, cvData: initialCvData, jobData }: CVLiveEditorProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedLayout, setSelectedLayout] = useState<LayoutType>('modern');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [pendingAction, setPendingAction] = useState<'save' | 'download' | null>(null);
  const [isPaid, setIsPaid] = useState(false);

  const [cvData, setCvData] = useState<CVBuilderData>(initialCvData);

  const [sections, setSections] = useState<Section[]>([
    { id: 'profile', title: 'Profil', visible: true },
    { id: 'experience', title: 'Berufserfahrung', visible: true },
    { id: 'education', title: 'Ausbildung', visible: true },
    { id: 'projects', title: 'Projekte', visible: true },
    { id: 'skills', title: 'Kompetenzen', visible: true },
    { id: 'languages', title: 'Sprachen', visible: true },
    { id: 'hobbies', title: 'Hobbys', visible: false },
  ]);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 400,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCvData(prev => ({
          ...prev,
          personalData: {
            ...prev.personalData,
            photoUrl: base64String,
          },
        }));
      };

      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error('Photo upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handlePhotoDelete = () => {
    setCvData(prev => ({
      ...prev,
      personalData: {
        ...prev.personalData,
        photoUrl: '',
      },
    }));
  };

  const toggleSection = (id: SectionId) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, visible: !s.visible } : s));
  };

  const moveSectionUp = (index: number) => {
    if (index === 0) return;
    setSections(prev => {
      const newSections = [...prev];
      [newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]];
      return newSections;
    });
  };

  const moveSectionDown = (index: number) => {
    if (index === sections.length - 1) return;
    setSections(prev => {
      const newSections = [...prev];
      [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      return newSections;
    });
  };

  const updatePersonalData = (field: string, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalData: {
        ...prev.personalData,
        [field]: value,
      },
    }));
  };

  const mapCVData = (data: CVBuilderData): OptimizedCV => {
    const personalData = data?.personalData ?? {};
    const schoolEducation = Array.isArray(data?.schoolEducation) ? [data.schoolEducation] : [];
    const professionalEducation = Array.isArray(data?.professionalEducation) ? data.professionalEducation : [];

    const allEducation = [
      ...schoolEducation.map((edu: any) => ({
        degree: edu?.type || edu?.schoolType || '',
        institution: edu?.school || edu?.schoolName || '',
        field: '',
        startDate: edu?.year || edu?.startYear || '',
        endDate: edu?.year || edu?.endYear || '',
        grade: edu?.graduation || edu?.grade || ''
      })),
      ...professionalEducation.map((edu: any) => ({
        degree: edu?.degree || '',
        institution: edu?.institution || '',
        field: edu?.focus?.join(', ') || '',
        startDate: edu?.startYear || '',
        endDate: edu?.endYear || '',
        grade: edu?.grades || ''
      }))
    ];

    const workExperiences = Array.isArray(data?.workExperiences)
      ? data.workExperiences.map((exp: any) => ({
          position: exp?.jobTitle || '',
          company: exp?.company || '',
          startDate: exp?.startDate || '',
          endDate: exp?.endDate || '',
          current: exp?.current || false,
          responsibilities: Array.isArray(exp?.tasks) ? exp.tasks : [],
          achievements: Array.isArray(exp?.achievements) ? exp.achievements : []
        }))
      : [];

    const projects = Array.isArray(data?.projects)
      ? data.projects.map((proj: any) => ({
          title: proj?.title || '',
          role: proj?.role || '',
          startDate: proj?.duration?.split('-')[0]?.trim() || '',
          endDate: proj?.duration?.split('-')[1]?.trim() || '',
          description: proj?.description || proj?.result || ''
        }))
      : [];

    const languages: Array<{ language: string; level: string }> = Array.isArray(data?.languages)
      ? data.languages.map((lang: any) => ({
          language: typeof lang === 'string' ? lang : (lang?.language || lang?.name || ''),
          level: typeof lang === 'string' ? '' : (lang?.level || lang?.proficiency || '')
        })).filter((lang: any) => lang.language)
      : [];

    const normalizeSkills = (skills: any[]): string[] => {
      if (!Array.isArray(skills)) return [];
      return skills
        .map(skill => typeof skill === 'string' ? skill : (skill?.skill || skill?.name || ''))
        .filter(Boolean);
    };

    const hardSkills = normalizeSkills(data?.hardSkills || []);
    const softSkills = normalizeSkills(data?.softSkills || []);

    const profileSummary = generateProfileSummary(data, jobData);
    const salesPitch = generateSalesText(data, jobData);

    return {
      personalData: {
        firstName: personalData?.firstName || '',
        lastName: personalData?.lastName || '',
        email: personalData?.email || '',
        phone: personalData?.phone || '',
        city: personalData?.city || '',
        zipCode: personalData?.zipCode || '',
        linkedin: personalData?.linkedin || '',
        website: personalData?.website || personalData?.portfolio || '',
        photoUrl: personalData?.photoUrl || ''
      },
      profileSummary,
      salesPitch,
      education: allEducation,
      experience: workExperiences,
      projects,
      languages,
      hardSkills,
      softSkills
    };
  };

  const generateProfileSummary = (data: CVBuilderData, job: JobData | null): string => {
    const experiences = Array.isArray(data?.workExperiences) ? data.workExperiences.length : 0;
    const firstName = data?.personalData?.firstName || '';
    const lastName = data?.personalData?.lastName || '';

    return `${firstName} ${lastName} verfügt über ${experiences} relevante Berufserfahrung${experiences !== 1 ? 'en' : ''}.`.trim();
  };

  const generateSalesText = (data: CVBuilderData, job: JobData | null): string => {
    if (!job) return '';
    return `Motivierte/r Kandidat/in für die Position bei ${job.company}.`;
  };

  const optimizedCV = mapCVData(cvData);

  const handleSaveAction = async () => {
    const currentCvId = cvId || searchParams.get('cvId');
    if (!currentCvId) {
      console.error('No cvId available');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate(`/login?redirect=/cv-editor?cvId=${currentCvId}`);
        return;
      }

      await performSave();
    } catch (error) {
      console.error('Error in handleSaveAction:', error);
    }
  };

  const handleDownloadAction = async () => {
    const currentCvId = cvId || searchParams.get('cvId');
    if (!currentCvId) {
      console.error('No cvId available');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        navigate(`/login?redirect=/cv-editor?cvId=${currentCvId}`);
        return;
      }

      // 🔥 FIX: Prüfe is_paid in stored_cvs (nicht cv_records)
      const { data: cvRecord, error } = await supabase
        .from('stored_cvs')
        .select('is_paid')
        .eq('id', currentCvId)
        .maybeSingle();

      if (error) {
        console.error('Error checking CV payment status:', error);
        return;
      }

      if (!cvRecord || cvRecord.is_paid === false) {
        setPendingAction('download');
        setShowPaywall(true);
        return;
      }

      await performDownload();
    } catch (error) {
      console.error('Error in handleDownloadAction:', error);
    }
  };

  const performSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const currentCvId = cvId || searchParams.get('cvId');
      if (!currentCvId) {
        console.error('No cvId for save');
        return;
      }

      await cvStorageService.saveCVData({
        id: currentCvId,
        cvData: cvData,
        layout: selectedLayout,
        jobData: jobData || undefined,
        isPaid: isPaid
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const performDownload = async () => {
    console.log('PDF download not yet implemented');
    alert('PDF-Download wird vorbereitet...');
  };

  const handlePaywallConfirm = async () => {
    const currentCvId = cvId || searchParams.get('cvId');
    if (!currentCvId) return;

    try {
      const result = await cvStorageService.unlockCV(currentCvId);
      if (result.success) {
        setIsPaid(true);
        setShowPaywall(false);

        if (pendingAction === 'save') {
          await performSave();
        } else if (pendingAction === 'download') {
          await performDownload();
        }
        setPendingAction(null);
      } else {
        console.error('Error unlocking CV:', result.error);
      }
    } catch (error) {
      console.error('Exception unlocking CV:', error);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const renderTemplate = () => {
    switch (selectedLayout) {
      case 'classic':
        return <ClassicTemplate data={optimizedCV} />;
      case 'compact':
        return <CompactTemplate data={optimizedCV} />;
      default:
        return <ModernTemplate data={optimizedCV} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-[1800px] mx-auto space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent">
              {jobData ? `CV für ${jobData.company}` : 'Dein optimierter CV'}
            </h1>
            <p className="text-base text-white/70">
              {jobData
                ? `Optimiert für die Position als ${jobData.jobTitle}`
                : 'Passe dein CV an und wähle ein Layout'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 text-white/80">
              <Layout size={18} className="text-[#66c0b6]" />
              <span className="font-semibold text-sm">Layout:</span>
            </div>

            <div className="flex gap-2">
              {(['classic', 'modern', 'compact'] as LayoutType[]).map((layout) => (
                <button
                  key={layout}
                  onClick={() => setSelectedLayout(layout)}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                    selectedLayout === layout
                      ? 'bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black'
                      : 'bg-white/5 text-white/80 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {layout === 'classic' && 'Klassisch'}
                  {layout === 'modern' && 'Modern'}
                  {layout === 'compact' && 'Kompakt'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={handleSaveAction}
              disabled={isSaving}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg"
            >
              {saveSuccess ? (
                <>
                  <Check size={20} />
                  Gespeichert!
                </>
              ) : isSaving ? (
                <>
                  <Save size={20} className="animate-pulse" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Speichern
                </>
              )}
            </button>

            <button
              onClick={handleDownloadAction}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <Download size={20} />
              PDF
            </button>

            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all"
            >
              Zum Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-4 max-h-[900px] overflow-y-auto">
              <h2 className="text-xl font-bold text-white mb-4">CV bearbeiten</h2>

              <div className="space-y-3 bg-white/5 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    {cvData.personalData?.photoUrl ? (
                      <div className="relative">
                        <img
                          src={cvData.personalData.photoUrl}
                          alt="Profilbild"
                          className="w-24 h-24 rounded-full object-cover border-2 border-[#66c0b6]"
                        />
                        <button
                          onClick={handlePhotoDelete}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center shadow-lg transition-colors"
                          title="Foto löschen"
                        >
                          <X size={16} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center">
                        <Upload size={32} className="text-white/50" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 rounded-lg bg-[#66c0b6] text-black font-semibold hover:opacity-90 transition-all disabled:opacity-50 text-sm"
                    >
                      {isUploading ? 'Wird hochgeladen...' : cvData.personalData?.photoUrl ? 'Bild ändern' : 'Profilbild hochladen'}
                    </button>
                    <p className="text-xs text-white/50 mt-1">Max. 5 MB, JPG/PNG</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white">Persönliche Daten</h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Vorname"
                    value={cvData.personalData?.firstName || ''}
                    onChange={(e) => updatePersonalData('firstName', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#66c0b6]"
                  />
                  <input
                    type="text"
                    placeholder="Nachname"
                    value={cvData.personalData?.lastName || ''}
                    onChange={(e) => updatePersonalData('lastName', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#66c0b6]"
                  />
                  <input
                    type="email"
                    placeholder="E-Mail"
                    value={cvData.personalData?.email || ''}
                    onChange={(e) => updatePersonalData('email', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#66c0b6]"
                  />
                  <input
                    type="tel"
                    placeholder="Telefon"
                    value={cvData.personalData?.phone || ''}
                    onChange={(e) => updatePersonalData('phone', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#66c0b6]"
                  />
                  <input
                    type="text"
                    placeholder="Stadt"
                    value={cvData.personalData?.city || ''}
                    onChange={(e) => updatePersonalData('city', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#66c0b6]"
                  />
                  <input
                    type="text"
                    placeholder="PLZ"
                    value={cvData.personalData?.zipCode || ''}
                    onChange={(e) => updatePersonalData('zipCode', e.target.value)}
                    className="px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#66c0b6]"
                  />
                </div>
                <input
                  type="url"
                  placeholder="LinkedIn"
                  value={cvData.personalData?.linkedin || ''}
                  onChange={(e) => updatePersonalData('linkedin', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#66c0b6]"
                />
                <input
                  type="url"
                  placeholder="Website"
                  value={cvData.personalData?.website || ''}
                  onChange={(e) => updatePersonalData('website', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 text-sm focus:outline-none focus:border-[#66c0b6]"
                />
              </div>

              <div className="space-y-2 pt-4 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-3">Sektionen verwalten</h3>
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center gap-2 bg-white/5 rounded-lg p-3"
                  >
                    <GripVertical size={18} className="text-white/30" />
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="flex items-center gap-2 flex-1 text-left"
                    >
                      {section.visible ? (
                        <Eye size={16} className="text-[#66c0b6]" />
                      ) : (
                        <EyeOff size={16} className="text-white/30" />
                      )}
                      <span className={`text-sm ${section.visible ? 'text-white' : 'text-white/50'}`}>
                        {section.title}
                      </span>
                    </button>
                    <button
                      onClick={() => moveSectionUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => moveSectionDown(index)}
                      disabled={index === sections.length - 1}
                      className="p-1 hover:bg-white/10 rounded disabled:opacity-30"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Live-Vorschau</h2>
              <div className="bg-white rounded-xl shadow-2xl overflow-visible">
                <div className="transform scale-75 origin-top-left" style={{ width: '133.33%' }}>
                  {renderTemplate()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        onConfirm={handlePaywallConfirm}
      />
    </div>
  );
}
