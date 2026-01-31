export interface CVDataFromEditor {
  contact?: {
    vorname?: string;
    nachname?: string;
    email?: string;
    telefon?: string;
    ort?: string;
    plz?: string;
    linkedin?: string;
    website?: string;
    position?: string;
    profil?: string;
  };
  education?: Array<{
    institution?: string;
    abschluss?: string;
    von?: string;
    bis?: string;
    note?: string;
  }>;
  experience?: Array<{
    position?: string;
    firma?: string;
    von?: string;
    bis?: string;
    aktuell?: boolean;
    aufgaben?: string;
    bullets?: string[];
  }>;
  skills?: string[];
  projects?: any[];
  languages?: Array<{
    sprache?: string;
    niveau?: string;
  }>;
  certificates?: Array<{
    titel?: string;
    organisation?: string;
    datum?: string;
  }>;
  additional?: string;
}

export interface CVDataForDatabase {
  contact: Record<string, any> | null;
  education: Record<string, any> | null;
  experience: Record<string, any> | null;
  skills: Record<string, any> | null;
  projects: Record<string, any> | null;
  languages: Record<string, any> | null;
  certificates: Record<string, any> | null;
  additional: string | null;
}

export function mapCVDataForDatabase(cvData: CVDataFromEditor): CVDataForDatabase {
  return {
    contact: cvData.contact ? {
      vorname: cvData.contact.vorname || '',
      nachname: cvData.contact.nachname || '',
      email: cvData.contact.email || '',
      telefon: cvData.contact.telefon || '',
      ort: cvData.contact.ort || '',
      plz: cvData.contact.plz || '',
      linkedin: cvData.contact.linkedin || '',
      website: cvData.contact.website || '',
      position: cvData.contact.position || '',
      profil: cvData.contact.profil || '',
    } : null,

    education: cvData.education && cvData.education.length > 0 ? {
      entries: cvData.education.map(edu => ({
        institution: edu.institution || '',
        abschluss: edu.abschluss || '',
        von: edu.von || '',
        bis: edu.bis || '',
        note: edu.note || '',
      }))
    } : null,

    experience: cvData.experience && cvData.experience.length > 0 ? {
      entries: cvData.experience.map(exp => ({
        position: exp.position || '',
        firma: exp.firma || '',
        von: exp.von || '',
        bis: exp.bis || '',
        aktuell: exp.aktuell || false,
        aufgaben: exp.aufgaben || '',
        bullets: exp.bullets || [],
      }))
    } : null,

    skills: cvData.skills && cvData.skills.length > 0 ? {
      list: cvData.skills
    } : null,

    projects: cvData.projects && cvData.projects.length > 0 ? {
      entries: cvData.projects
    } : null,

    languages: cvData.languages && cvData.languages.length > 0 ? {
      entries: cvData.languages.map(lang => ({
        sprache: lang.sprache || '',
        niveau: lang.niveau || '',
      }))
    } : null,

    certificates: cvData.certificates && cvData.certificates.length > 0 ? {
      entries: cvData.certificates.map(cert => ({
        titel: cert.titel || '',
        organisation: cert.organisation || '',
        datum: cert.datum || '',
      }))
    } : null,

    additional: cvData.additional || null,
  };
}

export function mapCVDataFromDatabase(dbData: any): CVDataFromEditor {
  const experience = dbData.optimized_experience?.entries || dbData.original_experience?.entries || [];

  const migratedExperience = experience.map((exp: any) => {
    if (typeof exp.erfolge === 'string') {
      return {
        ...exp,
        erfolge: exp.erfolge
          .split('\n')
          .map((line: string) => line.trim())
          .filter((line: string) => line.length > 0),
        aufgaben: exp.aufgaben || exp.beschreibung || '',
      };
    }
    return {
      ...exp,
      aufgaben: exp.aufgaben || exp.beschreibung || '',
    };
  });

  return {
    contact: dbData.optimized_contact || dbData.original_contact || {},

    education: (dbData.optimized_education?.entries || dbData.original_education?.entries || []),

    experience: migratedExperience,

    skills: (dbData.optimized_skills?.list || dbData.original_skills?.list || []),

    projects: (dbData.optimized_projects?.entries || dbData.original_projects?.entries || []),

    languages: (dbData.optimized_languages?.entries || dbData.original_languages?.entries || []),

    certificates: (dbData.optimized_certificates?.entries || dbData.original_certificates?.entries || []),

    additional: dbData.optimized_additional || dbData.original_additional || '',
  };
}

export interface CVBuilderData {
  experienceLevel?: string;
  targetRole?: string;
  targetIndustry?: string;
  personalData?: {
    firstName?: string;
    lastName?: string;
    city?: string;
    zipCode?: string;
    email?: string;
    phone?: string;
    linkedin?: string;
    website?: string;
    portfolio?: string;
    photoUrl?: string;
  };
  schoolEducation?: {
    type: string;
    school: string;
    graduation: string;
    year: string;
    focus?: string[];
    projects?: string[];
  };
  professionalEducation?: Array<{
    type: string;
    institution: string;
    degree: string;
    startYear: string;
    endYear: string;
    focus?: string[];
    projects?: string[];
    grades?: string;
  }>;
  workExperiences?: Array<{
    jobTitle: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    current?: boolean;
    tasks?: string[];
    responsibilities?: string[];
    tools?: string[];
    kpis?: string[];
    achievements?: string[];
    bullets?: string[];
  }>;
  projects?: Array<{
    type?: string;
    title: string;
    description: string;
    role?: string;
    goal?: string;
    tools?: string[];
    result?: string;
    impact?: string;
    duration?: string;
  }>;
  hardSkills?: Array<{
    skill: string;
    level?: string;
    yearsOfExperience?: string;
    category?: string;
  }>;
  softSkills?: Array<{
    skill: string;
    situation?: string;
    example?: string;
  }>;
  languages?: Array<{
    name?: string;
    language?: string;
    level?: string;
    proficiency?: string;
  }>;
  hobbies?: {
    hobbies: string[];
    details?: string;
  };
  summary?: {
    variant?: string;
    text: string;
  };
}

export interface CVDataForPDF {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  profile: string;
  address?: string;
  experience: Array<{
    position: string;
    company: string;
    timeframe: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    timeframe: string;
    details?: string;
    city?: string;
    country?: string;
  }>;
  skills: string[];
  languages?: Array<{
    name: string;
    level: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
  }>;
  interests?: string;
}

function formatTimeframe(startDate: string, endDate: string, current?: boolean): string {
  if (!startDate) return '';

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      return `${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const start = formatDate(startDate);
  const end = current ? 'Heute' : formatDate(endDate);

  return start && end ? `${start} - ${end}` : start || end;
}

export function mapCVBuilderDataToPDF(data: CVBuilderData): CVDataForPDF {
  const pd = data.personalData || {};

  const name = [pd.firstName, pd.lastName].filter(Boolean).join(' ') || 'Ihr Name';
  const location = [pd.zipCode, pd.city].filter(Boolean).join(' ') || '';

  const experience = (data.workExperiences || []).map(exp => ({
    position: exp.jobTitle || 'Position',
    company: exp.company || 'Unternehmen',
    timeframe: formatTimeframe(exp.startDate, exp.endDate, exp.current),
    bullets: exp.bullets || exp.achievements || exp.responsibilities || exp.tasks || []
  }));

  const education: Array<any> = [];

  if (data.schoolEducation) {
    education.push({
      degree: data.schoolEducation.graduation || 'Schulabschluss',
      institution: data.schoolEducation.school || 'Schule',
      timeframe: data.schoolEducation.year || '',
      details: data.schoolEducation.focus?.join(', ')
    });
  }

  if (data.professionalEducation && data.professionalEducation.length > 0) {
    data.professionalEducation.forEach(edu => {
      education.push({
        degree: edu.degree || 'Abschluss',
        institution: edu.institution || 'Institution',
        timeframe: formatTimeframe(edu.startYear, edu.endYear),
        details: edu.focus?.join(', ')
      });
    });
  }

  const allSkills = [
    ...(data.hardSkills || []).map(s => s.skill),
    ...(data.softSkills || []).map(s => s.skill)
  ];

  const languages = (data.languages || []).map(lang => ({
    name: lang.name || lang.language || 'Sprache',
    level: lang.level || lang.proficiency || 'Grundkenntnisse'
  }));

  const projects = (data.projects || []).map(proj => ({
    title: proj.title || 'Projekt',
    description: proj.description || proj.result || ''
  }));

  const hobbiesText = data.hobbies?.hobbies?.join(', ') || '';

  return {
    name,
    jobTitle: data.targetRole || 'Gewünschte Position',
    email: pd.email || 'email@example.com',
    phone: pd.phone || '',
    location,
    profile: data.summary?.text || '',
    experience,
    education,
    skills: allSkills,
    languages: languages.length > 0 ? languages : undefined,
    projects: projects.length > 0 ? projects : undefined,
    interests: hobbiesText || undefined
  };
}
