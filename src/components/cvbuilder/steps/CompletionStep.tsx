import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CVBuilderData } from '../../../types/cvBuilder';

interface CompletionStepProps {
  cvData: CVBuilderData;
  onComplete: () => void;
  onBack: () => void;
}

export function CompletionStep({ cvData, onComplete, onBack }: CompletionStepProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#020617] via-[#0a0a1a] to-[#020617]">
      <div className="max-w-4xl w-full text-center space-y-12 animate-fade-in">
        <div className="space-y-6">
          <h1 className="text-6xl font-bold text-white">Perfekt! 🎉</h1>
          <p className="text-2xl text-white/70 max-w-2xl mx-auto">
            Dein CV ist bereit! Jetzt fehlt nur noch die Zielposition.
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl mx-auto">
          <div className="space-y-4 text-left">
            <h3 className="text-xl font-semibold text-white/90">Dein Profil enthält:</h3>
            <ul className="space-y-3 text-white/70">
              {cvData.personalData && (
                <li className="flex items-center gap-2">
                  <span className="text-[#66c0b6]">✓</span>
                  Persönliche Daten
                </li>
              )}
              {cvData.workExperiences && cvData.workExperiences.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="text-[#66c0b6]">✓</span>
                  {cvData.workExperiences.length} Berufserfahrung
                  {cvData.workExperiences.length > 1 ? 'en' : ''}
                </li>
              )}
              {cvData.professionalEducation && cvData.professionalEducation.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="text-[#66c0b6]">✓</span>
                  {cvData.professionalEducation.length} Ausbildung
                  {cvData.professionalEducation.length > 1 ? 'en' : ''}
                </li>
              )}
              {cvData.projects && cvData.projects.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="text-[#66c0b6]">✓</span>
                  {cvData.projects.length} Projekt{cvData.projects.length > 1 ? 'e' : ''}
                </li>
              )}
              {cvData.hardSkills && cvData.hardSkills.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="text-[#66c0b6]">✓</span>
                  {cvData.hardSkills.length} Hard Skills
                </li>
              )}
              {cvData.softSkills && cvData.softSkills.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="text-[#66c0b6]">✓</span>
                  {cvData.softSkills.length} Soft Skills
                </li>
              )}
              {cvData.languages && cvData.languages.length > 0 && (
                <li className="flex items-center gap-2">
                  <span className="text-[#66c0b6]">✓</span>
                  {cvData.languages.length} Sprache{cvData.languages.length > 1 ? 'n' : ''}
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onBack}
            className="group px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            Zurück
          </button>

          <button
            onClick={onComplete}
            className="group px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
          >
            Weiter zu deiner Wunschstelle
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-sm text-white/40">
          Im nächsten Schritt passen wir deinen CV perfekt auf deine Wunschstelle an
        </p>
      </div>
    </div>
  );
}
