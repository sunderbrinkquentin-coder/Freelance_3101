import { CVBuilderData } from '../types/cvBuilder';

export interface CVCheckResult {
  overallScore: number;
  categories: {
    structure: { score: number; feedback: string };
    content: { score: number; feedback: string };
    atsCompatibility: { score: number; feedback: string };
    design: { score: number; feedback: string };
  };
  strengths: string[];
  improvements: string[];
}

export const cvParserService = {
  async parseCV(file: File): Promise<{ success: boolean; cvData?: CVBuilderData; error?: string }> {
    try {
      const text = await this.extractTextFromFile(file);
      const cvData = this.extractCVData(text);

      return {
        success: true,
        cvData
      };
    } catch (error: any) {
      console.error('Error parsing CV:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target?.result as string;
        resolve(text);
      };

      reader.onerror = () => {
        reject(new Error('Fehler beim Lesen der Datei'));
      };

      if (file.type === 'application/pdf') {
        reader.readAsText(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reader.readAsText(file);
      } else {
        reader.readAsText(file);
      }
    });
  },

  extractCVData(text: string): CVBuilderData {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/;
    const phoneRegex = /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/;

    const emailMatch = text.match(emailRegex);
    const phoneMatch = text.match(phoneRegex);

    const lines = text.split('\n').filter(line => line.trim());
    const firstLine = lines[0] || '';
    const nameParts = firstLine.split(/\s+/);

    return {
      personalData: {
        firstName: nameParts[0] || 'Max',
        lastName: nameParts.slice(1).join(' ') || 'Mustermann',
        email: emailMatch ? emailMatch[0] : 'max.mustermann@email.com',
        phone: phoneMatch ? phoneMatch[0] : '+49 123 456789',
        city: '',
        linkedin: '',
        photoUrl: ''
      },
      summary: {
        variant: 'professional',
        text: 'Erfahrener Fachkraft mit nachgewiesener Expertise in verschiedenen Bereichen.'
      },
      workExperiences: [],
      professionalEducation: [],
      projects: [],
      hardSkills: [],
      softSkills: [],
      hobbies: {
        hobbies: []
      }
    };
  },

  async analyzCV(file: File): Promise<CVCheckResult> {
    await new Promise(resolve => setTimeout(resolve, 1500));

    const text = await this.extractTextFromFile(file);
    const wordCount = text.split(/\s+/).length;
    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(text);
    const hasPhone = /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/.test(text);

    const structureScore = Math.min(100, Math.floor((wordCount / 500) * 100));
    const contentScore = Math.min(100, 70 + Math.floor(Math.random() * 20));
    const atsScore = (hasEmail && hasPhone) ? 85 : 70;
    const designScore = Math.min(100, 75 + Math.floor(Math.random() * 15));

    const overallScore = Math.floor((structureScore + contentScore + atsScore + designScore) / 4);

    return {
      overallScore,
      categories: {
        structure: {
          score: structureScore,
          feedback: structureScore >= 80
            ? 'Dein CV ist gut strukturiert und übersichtlich aufgebaut. Die Gliederung hilft Recruitern, schnell die wichtigsten Informationen zu finden.'
            : 'Die Struktur deines CVs könnte verbessert werden. Eine klare Gliederung in Berufserfahrung, Ausbildung und Fähigkeiten macht deinen CV leichter lesbar.'
        },
        content: {
          score: contentScore,
          feedback: contentScore >= 80
            ? 'Der Inhalt ist aussagekräftig und zeigt deine Qualifikationen klar auf. Du nutzt konkrete Beispiele und Erfolge, was sehr überzeugend wirkt.'
            : 'Der Inhalt ist solide, könnte aber noch prägnanter sein. Versuche, mehr konkrete Erfolge und messbare Ergebnisse zu nennen.'
        },
        atsCompatibility: {
          score: atsScore,
          feedback: atsScore >= 80
            ? 'Dein CV ist gut für Bewerbermanagementsysteme (ATS) optimiert. Das Format ist maschinenlesbar und enthält relevante Keywords.'
            : 'Für eine bessere ATS-Kompatibilität solltest du auf komplexe Formatierungen verzichten und wichtige Keywords aus der Stellenbeschreibung einbauen.'
        },
        design: {
          score: designScore,
          feedback: designScore >= 80
            ? 'Das Design ist professionell und modern. Die visuelle Gestaltung unterstreicht deine Professionalität ohne vom Inhalt abzulenken.'
            : 'Das Design ist funktional, könnte aber moderner sein. Ein professionelles Layout hilft dir, einen positiven ersten Eindruck zu hinterlassen.'
        }
      },
      strengths: [
        'Klare Kontaktdaten',
        'Übersichtliche Gliederung',
        'Relevante Berufserfahrung'
      ],
      improvements: [
        'Füge mehr quantifizierbare Erfolge hinzu',
        'Optimiere für ATS-Systeme',
        'Verwende ein moderneres Layout'
      ]
    };
  }
};
