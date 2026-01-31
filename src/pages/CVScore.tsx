import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Target,
  FileText,
  Sparkles,
  Layout,
  Shield,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { AvatarSidebar } from '../components/cvbuilder/AvatarSidebar';

interface ScoreCategory {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  icon: any;
  description: string;
  feedback: string;
  detailedFeedback?: string[];
}

interface CVCheckData {
  overallScore: number;
  categories: ScoreCategory[];
  parsedCV: any;
}

export default function CVScore() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [checkData, setCheckData] = useState<CVCheckData | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [cvCheckId, setCvCheckId] = useState<string | null>(null);

  useEffect(() => {
    analyzeCV();
  }, []);

  const analyzeCV = async () => {
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 2500));

    const mockParsedCV = {
      personalData: {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max.mustermann@email.com',
        phone: '+49 170 1234567',
        city: 'Berlin',
        zipCode: '10115',
        linkedin: 'linkedin.com/in/maxmustermann',
      },
      workExperience: [
        {
          position: 'Senior Software Developer',
          company: 'Tech GmbH',
          startDate: '01/2020',
          endDate: '12/2023',
          current: false,
          tasks: ['Entwicklung von Web-Anwendungen', 'Code Reviews'],
          achievements: ['Erfolgreiche Einführung neuer Features'],
        },
      ],
      professionalEducation: [
        {
          degree: 'Bachelor of Science',
          institution: 'Technische Universität Berlin',
          fieldOfStudy: 'Informatik',
          startDate: '2015',
          endDate: '2019',
          grade: '1.8',
        },
      ],
      hardSkills: ['JavaScript', 'React', 'Node.js', 'Python'],
      softSkills: ['Teamfähigkeit', 'Kommunikation'],
      languages: [
        { language: 'Deutsch', level: 'Muttersprache' },
        { language: 'Englisch', level: 'Fließend' },
      ],
    };

    const mockCheckData: CVCheckData = {
      overallScore: 74,
      categories: [
        {
          id: 'ats',
          name: 'ATS-Konformität',
          score: 68,
          maxScore: 100,
          icon: Shield,
          description: 'Wie gut wird dein CV von Bewerbersystemen erkannt',
          feedback: 'Viele deiner Jobtitel und Aufgaben sind nicht ATS-gerecht formuliert. Bewerbersysteme suchen nach Standard-Berufsbezeichnungen und konkreten Keywords. Verwende klarere Titel wie "Software Engineer" statt "Code-Ninja" und vermeide zu kreative Begriffe, die Algorithmen nicht erkennen.',
          detailedFeedback: [
            'Verwende Standard-Berufsbezeichnungen statt kreativer Titel',
            'Füge branchenübliche Keywords in Aufgabenbeschreibungen ein',
            'Vermeide Tabellen, Textfelder und komplexe Formatierungen',
            'Stelle sicher, dass alle Daten als Text lesbar sind',
          ],
        },
        {
          id: 'structure',
          name: 'Struktur & Layout',
          score: 72,
          maxScore: 100,
          icon: Layout,
          description: 'Übersichtlichkeit und professionelle Gestaltung',
          feedback: 'Deine Sektionen sind nicht klar genug getrennt. Recruiter scannen CVs in wenigen Sekunden und brauchen eine sofort erkennbare Struktur. Definiere klare Bereiche: Profil, Berufserfahrung, Ausbildung, Skills. Nutze Abstände und visuelle Hierarchie, damit der Blick geleitet wird.',
          detailedFeedback: [
            'Füge klare Sektions-Überschriften hinzu (z.B. "BERUFSERFAHRUNG")',
            'Nutze einheitliche Abstände zwischen Sektionen',
            'Verwende Bullet-Points für bessere Lesbarkeit',
            'Halte das Layout auf maximal 2 Seiten',
          ],
        },
        {
          id: 'keywords',
          name: 'Keywords & Relevanz',
          score: 65,
          maxScore: 100,
          icon: Target,
          description: 'Verwendung relevanter Fachbegriffe und Skills',
          feedback: 'Dir fehlen wichtige Fachbegriffe, die für deine Zielposition relevant sind. Recruiter und ATS-Systeme suchen nach spezifischen Keywords aus der Stellenanzeige. Analysiere die Anforderungen deiner Wunschstelle und integriere diese Begriffe natürlich in deinen CV – besonders bei Skills, Tools und Verantwortlichkeiten.',
          detailedFeedback: [
            'Gleiche deine Skills mit Stellenanforderungen ab',
            'Füge relevante Tools und Technologien hinzu',
            'Nutze Branchenvokabular in Aufgabenbeschreibungen',
            'Erwähne Zertifikate und Qualifikationen prominent',
          ],
        },
        {
          id: 'completeness',
          name: 'Vollständigkeit',
          score: 88,
          maxScore: 100,
          icon: FileText,
          description: 'Alle wichtigen Informationen vorhanden',
          feedback: 'Dein CV enthält die meisten wichtigen Informationen. Sehr gut! Ein kleiner Optimierungspunkt: Ergänze bei Berufserfahrungen konkrete Zeiträume in Monaten (nicht nur Jahren) und füge ggf. einen Kurzprofil-Text am Anfang hinzu, der deine Kernkompetenzen in 2-3 Sätzen zusammenfasst.',
          detailedFeedback: [
            'Füge ein Kurzprofil mit 2-3 Sätzen hinzu',
            'Gib genaue Zeiträume (MM/JJJJ) bei allen Stationen an',
            'Ergänze LinkedIn-Profil und Portfolio-Links',
            'Erwähne relevante Projekte mit Ergebnissen',
          ],
        },
        {
          id: 'wording',
          name: 'Formulierung',
          score: 69,
          maxScore: 100,
          icon: Sparkles,
          description: 'Prägnanz und Wirkung deiner Beschreibungen',
          feedback: 'Deine Beschreibungen sind zu passiv und unkonkret. Verwende Action-Verben (z.B. "entwickelte", "leitete", "optimierte") und quantifiziere deine Erfolge mit Zahlen. Statt "war verantwortlich für" schreibe "leitete ein Team von 5 Entwicklern und reduzierte die Ladezeit um 40%".',
          detailedFeedback: [
            'Beginne jeden Bulletpoint mit einem Action-Verb',
            'Quantifiziere Erfolge mit konkreten Zahlen',
            'Vermeide Passiv-Konstruktionen',
            'Konzentriere dich auf Ergebnisse, nicht auf Aufgaben',
          ],
        },
      ],
      parsedCV: mockParsedCV,
    };

    setCheckData(mockCheckData);

    try {
      const sessionId = localStorage.getItem('sessionId') || 'anonymous';

      const { data, error } = await supabase
        .from('cv_check_entries')
        .insert([
          {
            session_id: sessionId,
            mode: 'check',
            cv_parsed: mockParsedCV,
            check_scores: {
              ats: 68,
              structure: 72,
              keywords: 65,
              completeness: 88,
              wording: 69,
            },
            check_feedback: mockCheckData.categories.reduce((acc, cat) => {
              acc[cat.id] = {
                main: cat.feedback,
                detailed: cat.detailedFeedback || [],
              };
              return acc;
            }, {} as any),
            overall_score: mockCheckData.overallScore,
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error saving CV check:', error);
      } else {
        setCvCheckId(data.id);
      }
    } catch (error) {
      console.error('Error in analyzeCV:', error);
    }

    setIsLoading(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[#10B981]';
    if (score >= 50) return 'text-[#F59E0B]';
    return 'text-[#EF4444]';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-[#10B981]';
    if (score >= 50) return 'bg-[#F59E0B]';
    return 'bg-[#EF4444]';
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleOptimize = () => {
    if (checkData && checkData.parsedCV) {
      navigate('/cv-builder', {
        state: {
          mode: 'check',
          initialData: checkData.parsedCV,
          cvCheckId,
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-6"
          >
            <Target className="text-[#66c0b6]" size={64} />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-3xl font-bold mb-4"
          >
            Analysiere deinen CV...
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/60"
          >
            Prüfe Struktur, Keywords und Wirkung auf Recruiter...
          </motion.p>
        </div>
      </div>
    );
  }

  if (!checkData) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] text-white pb-20">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center lg:text-left mb-12"
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent">
                Dein CV im Check
              </h1>
              <p className="text-xl text-white/70">
                Hier siehst du, wie dein Lebenslauf aktuell abschneidet – und wo wir ihn verbessern können.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Gesamtscore</h2>
                <div className={`text-5xl font-bold ${getScoreColor(checkData.overallScore)}`}>
                  {checkData.overallScore}<span className="text-2xl text-white/40">/100</span>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-4 overflow-hidden">
                <motion.div
                  className={`h-full ${getScoreBgColor(checkData.overallScore)} rounded-full`}
                  initial={{ width: 0 }}
                  animate={{ width: `${checkData.overallScore}%` }}
                  transition={{ duration: 1.5, delay: 0.3, ease: 'easeOut' }}
                />
              </div>
              <p className="text-white/60 mt-4 text-center">
                Dein CV hat solides Potenzial – mit gezielten Optimierungen wird er noch stärker.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-6 mb-12"
            >
              <h2 className="text-3xl font-bold mb-6">Detaillierte Bewertung</h2>
              {checkData.categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-[#66c0b6]/20 rounded-xl flex items-center justify-center">
                      <category.icon className="text-[#66c0b6]" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="text-xl font-bold">{category.name}</h3>
                          <p className="text-sm text-white/60">{category.description}</p>
                        </div>
                        <span className={`text-3xl font-bold ${getScoreColor(category.score)} ml-4`}>
                          {category.score}<span className="text-lg text-white/40">/{category.maxScore}</span>
                        </span>
                      </div>
                      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden mb-4">
                        <motion.div
                          className={`h-full ${getScoreBgColor(category.score)} rounded-full`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(category.score / category.maxScore) * 100}%` }}
                          transition={{ duration: 1, delay: 0.4 + index * 0.1, ease: 'easeOut' }}
                        />
                      </div>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                        <p className="text-sm text-white/80 leading-relaxed">{category.feedback}</p>
                        {category.detailedFeedback && category.detailedFeedback.length > 0 && (
                          <>
                            <button
                              onClick={() => toggleCategory(category.id)}
                              className="mt-3 text-[#66c0b6] text-sm font-semibold flex items-center gap-2 hover:text-[#30E3CA] transition-colors"
                            >
                              {expandedCategories.has(category.id) ? (
                                <>
                                  Weniger Details <ChevronUp size={16} />
                                </>
                              ) : (
                                <>
                                  Mehr Details anzeigen <ChevronDown size={16} />
                                </>
                              )}
                            </button>
                            {expandedCategories.has(category.id) && (
                              <motion.ul
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 space-y-2 pl-4 border-l-2 border-[#66c0b6]/30"
                              >
                                {category.detailedFeedback.map((item, i) => (
                                  <li key={i} className="text-sm text-white/70">
                                    • {item}
                                  </li>
                                ))}
                              </motion.ul>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] rounded-3xl p-1 shadow-2xl"
            >
              <div className="bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a] rounded-3xl p-10 text-center">
                <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent">
                  Bereit für den nächsten Schritt?
                </h2>
                <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Wir übernehmen deine bestehenden Daten, füllen deinen CV-Prozess für dich vor und optimieren alles für deine Wunschstelle.
                </p>
                <button
                  onClick={handleOptimize}
                  className="group px-16 py-6 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-2xl hover:opacity-90 transition-all flex items-center gap-4 shadow-2xl hover:scale-105 mx-auto"
                >
                  CV jetzt optimieren
                  <ArrowRight size={28} className="group-hover:translate-x-2 transition-transform" />
                </button>
                <p className="text-sm text-white/50 mt-6">
                  ✨ Du musst kaum noch etwas neu eingeben – wir haben alles vorbereitet
                </p>
              </div>
            </motion.div>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-8">
              <AvatarSidebar
                message="Ich habe alle Infos aus deinem CV herausgezogen. Lass uns jetzt gemeinsam deinen Lebenslauf Schritt für Schritt verbessern – du musst kaum noch etwas neu eingeben."
                stepInfo="Die Optimierung dauert nur 10-15 Minuten und dein CV wird deutlich stärker."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
