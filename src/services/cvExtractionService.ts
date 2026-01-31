/**
 * CV Extraction Service
 *
 * Extracts and maps CV data from uploaded CVs and ATS analysis
 * to CVBuilderData format for the CV Wizard
 */

import { CVBuilderData } from '../types/cvBuilder';
import { v4 as uuidv4 } from 'uuid';

/**
 * Extract CV data from raw upload/analysis response
 * This should be called after CV upload and analysis is complete
 */
export async function extractCVDataFromUpload(uploadId: string): Promise<CVBuilderData | null> {
  try {
    // TODO: Implement actual extraction from Make.com webhook response
    // For now, return empty structure
    console.log('[CVExtraction] Extracting data for uploadId:', uploadId);

    return createEmptyCVBuilderData();
  } catch (error) {
    console.error('[CVExtraction] Error:', error);
    return null;
  }
}

/**
 * Create empty CVBuilderData structure
 */
export function createEmptyCVBuilderData(): CVBuilderData {
  return {
    experienceLevel: undefined,
    personalData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      city: '',
      address: '',
      postalCode: '',
      linkedin: '',
      website: '',
    },
    targetJob: '',
    targetIndustry: undefined,
    targetRole: undefined,
    schoolEducation: undefined,
    professionalEducation: [],
    workExperiences: [],
    projects: [],
    hardSkills: [],
    softSkills: [],
    languages: [],
    workValues: undefined,
    hobbies: undefined,
  };
}

/**
 * Map extracted data to CVBuilderData format
 * This converts raw extracted data into the format expected by CV Wizard
 */
export function mapExtractedToCVBuilder(extracted: any): CVBuilderData {
  const cvData = createEmptyCVBuilderData();

  // Personal Data
  if (extracted?.contact) {
    cvData.personalData = {
      firstName: extracted.contact.vorname || extracted.contact.firstName || '',
      lastName: extracted.contact.nachname || extracted.contact.lastName || '',
      email: extracted.contact.email || '',
      phone: extracted.contact.telefon || extracted.contact.phone || '',
      city: extracted.contact.ort || extracted.contact.city || '',
      address: extracted.contact.adresse || extracted.contact.address || '',
      postalCode: extracted.contact.plz || extracted.contact.postalCode || '',
      linkedin: extracted.contact.linkedin || '',
      website: extracted.contact.website || '',
    };
  }

  // Work Experience
  if (extracted?.experience?.entries) {
    cvData.workExperiences = extracted.experience.entries.map((exp: any) => ({
      id: uuidv4(),
      title: exp.position || '',
      company: exp.firma || exp.company || '',
      location: exp.ort || exp.location || '',
      type: mapJobType(exp.typ || exp.type),
      startMonth: extractMonth(exp.von || exp.from),
      startYear: extractYear(exp.von || exp.from),
      endMonth: exp.aktuell ? '' : extractMonth(exp.bis || exp.to),
      endYear: exp.aktuell ? '' : extractYear(exp.bis || exp.to),
      isCurrentPosition: exp.aktuell || false,
      duration: formatDuration(exp.von, exp.bis, exp.aktuell),
      department: exp.bereich || exp.department,
      tasks: exp.bullets || (exp.aufgaben ? [exp.aufgaben] : []),
      achievements: exp.erfolge ? (Array.isArray(exp.erfolge) ? exp.erfolge : [exp.erfolge]) : [],
      tools: exp.tools || [],
    }));
  }

  // Education
  if (extracted?.education?.entries) {
    cvData.professionalEducation = extracted.education.entries.map((edu: any) => ({
      id: uuidv4(),
      degree: edu.abschluss || edu.degree || '',
      institution: edu.institution || '',
      field: edu.studiengang || edu.field || '',
      startMonth: extractMonth(edu.von || edu.from),
      startYear: extractYear(edu.von || edu.from),
      endMonth: extractMonth(edu.bis || edu.to),
      endYear: extractYear(edu.bis || edu.to),
      graduation: formatDuration(edu.von, edu.bis, false),
      grade: edu.note || edu.grade || '',
      focus: [],
      activities: [],
    }));
  }

  // Skills
  if (extracted?.skills?.list) {
    cvData.hardSkills = extracted.skills.list;
  }

  // Languages
  if (extracted?.languages?.entries) {
    cvData.languages = extracted.languages.entries.map((lang: any) => ({
      language: lang.sprache || lang.language || '',
      level: mapLanguageLevel(lang.niveau || lang.level),
    }));
  }

  // Projects
  if (extracted?.projects?.entries) {
    cvData.projects = extracted.projects.entries.map((proj: any) => ({
      id: uuidv4(),
      title: proj.titel || proj.title || '',
      type: proj.typ || proj.type || '',
      role: proj.rolle || proj.role || '',
      description: proj.beschreibung || proj.description || '',
      duration: formatDuration(proj.von, proj.bis, false),
      results: proj.ergebnisse || proj.results || [],
      technologies: proj.technologien || proj.technologies || [],
    }));
  }

  return cvData;
}

/**
 * Helper: Extract month from date string
 */
function extractMonth(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split(/[.\-/]/);
    if (parts.length >= 2) {
      const month = parseInt(parts[0]);
      if (month >= 1 && month <= 12) {
        return month.toString().padStart(2, '0');
      }
    }
  } catch {}
  return '';
}

/**
 * Helper: Extract year from date string
 */
function extractYear(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const parts = dateStr.split(/[.\-/]/);
    if (parts.length >= 2) {
      const year = parseInt(parts[parts.length - 1]);
      if (year > 1900 && year < 2100) {
        return year.toString();
      }
    }
  } catch {}
  return '';
}

/**
 * Helper: Format duration range
 */
function formatDuration(from?: string, to?: string, current?: boolean): string {
  if (!from) return '';
  const fromStr = from || '';
  if (current) return `${fromStr} - heute`;
  if (!to) return fromStr;
  return `${fromStr} - ${to}`;
}

/**
 * Helper: Map job type to standard format
 */
function mapJobType(type?: string): string {
  if (!type) return 'Vollzeit';
  const normalized = type.toLowerCase();
  if (normalized.includes('teilzeit')) return 'Teilzeit';
  if (normalized.includes('praktikum')) return 'Praktikum';
  if (normalized.includes('werkstudent')) return 'Werkstudent:in';
  if (normalized.includes('freelance')) return 'Freelancer';
  if (normalized.includes('ehrenamt')) return 'Ehrenamt';
  return 'Vollzeit';
}

/**
 * Helper: Map language level to standard format
 */
function mapLanguageLevel(level?: string): string {
  if (!level) return 'Grundkenntnisse';
  const normalized = level.toLowerCase();
  if (normalized.includes('muttersprache') || normalized.includes('native')) return 'Muttersprache';
  if (normalized.includes('fließend') || normalized.includes('fluent')) return 'Fließend';
  if (normalized.includes('gut') || normalized.includes('good')) return 'Gut';
  return 'Grundkenntnisse';
}
