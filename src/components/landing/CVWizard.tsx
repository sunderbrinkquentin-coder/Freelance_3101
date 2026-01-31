import { useState } from 'react';
import { X, Upload, ArrowRight, ArrowLeft, Check, Loader, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CVWizardProps {
  onClose: () => void;
}

export default function CVWizard({ onClose }: CVWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mode, setMode] = useState<'check' | 'create' | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const navigate = useNavigate();

  const checkSteps = [
    {
      id: 'mode-selection',
      type: 'mode-selection',
      title: 'Wie möchtest du starten?',
      description: 'Wähle den Weg, der am besten zu deiner Situation passt.'
    },
    {
      id: 'upload',
      type: 'upload',
      title: 'Lade deinen CV hoch',
      description: 'Unterstützte Formate: PDF, DOCX (max. 5 MB)',
      question: 'upload'
    },
    {
      id: 'analyzing',
      type: 'loading',
      title: 'Dein CV wird analysiert...',
      description: 'Unsere KI prüft gerade deinen Lebenslauf auf über 50 Kriterien.'
    },
    {
      id: 'result',
      type: 'result',
      title: 'Deine Analyse ist fertig!',
      description: 'Wir haben deinen CV analysiert und konkrete Verbesserungsvorschläge gefunden.'
    }
  ];

  const createSteps = [
    {
      id: 'mode-selection',
      type: 'mode-selection',
      title: 'Wie möchtest du starten?',
      description: 'Wähle den Weg, der am besten zu deiner Situation passt.'
    },
    {
      id: 'role',
      type: 'choice',
      title: 'Was beschreibt deine Situation am besten?',
      question: 'role',
      options: [
        { value: 'ausbildung', label: 'Ich suche eine Ausbildung', icon: '🎓' },
        { value: 'quereinstieg', label: 'Ich bin Quereinsteiger', icon: '🔄' },
        { value: 'fachkraft', label: 'Ich bin Fachkraft', icon: '💼' },
        { value: 'fuehrung', label: 'Ich suche Führungsposition', icon: '👔' }
      ]
    },
    {
      id: 'industry',
      type: 'choice',
      title: 'In welcher Branche bist du tätig?',
      question: 'industry',
      options: [
        { value: 'it', label: 'IT & Tech', icon: '💻' },
        { value: 'finance', label: 'Finanzen & Consulting', icon: '📊' },
        { value: 'healthcare', label: 'Gesundheit & Pharma', icon: '⚕️' },
        { value: 'engineering', label: 'Ingenieurwesen', icon: '⚙️' },
        { value: 'marketing', label: 'Marketing & Sales', icon: '📱' },
        { value: 'other', label: 'Andere Branche', icon: '🏢' }
      ]
    },
    {
      id: 'experience',
      type: 'choice',
      title: 'Wie viel Berufserfahrung hast du?',
      question: 'experience',
      options: [
        { value: '0', label: 'Berufseinsteiger', icon: '🌱' },
        { value: '1-2', label: '1-2 Jahre', icon: '📈' },
        { value: '3-5', label: '3-5 Jahre', icon: '🚀' },
        { value: '5+', label: '5+ Jahre', icon: '⭐' }
      ]
    },
    {
      id: 'analyzing',
      type: 'loading',
      title: 'Wir erstellen deinen CV...',
      description: 'Basierend auf deinen Angaben bauen wir einen professionellen Lebenslauf für dich.'
    },
    {
      id: 'result',
      type: 'result',
      title: 'Dein CV ist bereit!',
      description: 'Wir haben ein optimales CV-Template für dich erstellt.'
    }
  ];

  const steps = mode === 'check' ? checkSteps : mode === 'create' ? createSteps : checkSteps;
  const currentStepData = steps[currentStep];
  const progress = (currentStep / (steps.length - 1)) * 100;

  const handleModeSelection = (selectedMode: 'check' | 'create') => {
    if (selectedMode === 'check') {
      navigate('/cv-check');
      onClose();
    } else if (selectedMode === 'create') {
      navigate('/cv-wizard?mode=new');
      onClose();
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 2) {
      setIsAnalyzing(true);
      setTimeout(() => {
        setIsAnalyzing(false);
        setCurrentStep(currentStep + 1);
      }, 3000);
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      setCurrentStep(0);
      setMode(null);
    } else if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleChoice = (value: string) => {
    setAnswers({ ...answers, [currentStepData.question || '']: value });
    setTimeout(handleNext, 300);
  };

  const handleComplete = () => {
    navigate('/service-selection');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#30E3CA] to-[#38f6d1] transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="px-8 py-8 md:px-10 md:py-10 flex flex-col">
          {/* Step Indicator */}
          {currentStep > 0 && (
            <div className="text-sm text-gray-500 mb-8">
              Schritt {currentStep + 1} von {steps.length}
            </div>
          )}

          {/* Mode Selection Screen */}
          {currentStepData.type === 'mode-selection' && (
            <div className="py-4">
              {/* Header */}
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent">
                  {currentStepData.title}
                </h2>
                <p className="text-xl text-gray-300">
                  {currentStepData.description}
                </p>
              </div>

              {/* Main 3-Column Grid: Card + Logo + Card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center justify-center mb-10">
                {/* Left Card - Create New CV */}
                <button
                  onClick={() => handleModeSelection('create')}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-7 hover:bg-white/10 hover:border-[#66c0b6]/30 transition-all duration-300 shadow-lg hover:shadow-[0_0_40px_rgba(102,192,182,0.3)] cursor-pointer flex flex-col gap-4 text-left hover:scale-[1.02]"
                >
                  <h3 className="text-xl md:text-2xl font-semibold text-white">
                    Neuen CV erstellen
                  </h3>

                  <p className="text-sm text-white/70 leading-relaxed">
                    Erstelle deinen perfekten Lebenslauf von Grund auf – Schritt für Schritt mit unserem KI-Assistenten.
                  </p>

                  <ul className="space-y-3 flex-grow">
                    <li className="flex items-start gap-2 text-sm text-white/75">
                      <CheckCircle2 size={16} className="text-[#66c0b6] mt-0.5 flex-shrink-0" />
                      <span>Geführter Prozess durch alle Abschnitte</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-white/75">
                      <CheckCircle2 size={16} className="text-[#66c0b6] mt-0.5 flex-shrink-0" />
                      <span>KI-gestützte Formulierungshilfen</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-white/75">
                      <CheckCircle2 size={16} className="text-[#66c0b6] mt-0.5 flex-shrink-0" />
                      <span>ATS-optimierte Vorlagen</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-white/75">
                      <CheckCircle2 size={16} className="text-[#66c0b6] mt-0.5 flex-shrink-0" />
                      <span>Job-Matching inkludiert</span>
                    </li>
                  </ul>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-[#66c0b6] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      Neuen CV erstellen
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>

                {/* Center - DYD Logo */}
                <div className="flex items-center justify-center md:order-none order-first mb-6 md:mb-0">
                  <div className="relative">
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#66c0b6]/40 to-[#30E3CA]/40 blur-3xl rounded-full"></div>

                    {/* Logo Container */}
                    <div className="relative h-32 w-32 md:h-40 md:w-40 flex items-center justify-center">
                      <img
                        src="/DYD Logo RGB copy.svg"
                        alt="DYD Logo"
                        className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(102,192,182,0.6)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Card - Check & Optimize CV */}
                <button
                  onClick={() => handleModeSelection('check')}
                  className="group rounded-3xl border border-white/10 bg-white/5 p-7 hover:bg-white/10 hover:border-[#66c0b6]/30 transition-all duration-300 shadow-lg hover:shadow-[0_0_40px_rgba(102,192,182,0.3)] cursor-pointer flex flex-col gap-4 text-left hover:scale-[1.02]"
                >
                  <h3 className="text-xl md:text-2xl font-semibold text-white">
                    CV prüfen & optimieren
                  </h3>

                  <p className="text-sm text-white/70 leading-relaxed">
                    Lade deinen bestehenden Lebenslauf hoch und erhalte eine detaillierte Analyse + Score.
                  </p>

                  <ul className="space-y-3 flex-grow">
                    <li className="flex items-start gap-2 text-sm text-white/75">
                      <CheckCircle2 size={16} className="text-[#66c0b6] mt-0.5 flex-shrink-0" />
                      <span>Detaillierter CV-Score (0–100)</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-white/75">
                      <CheckCircle2 size={16} className="text-[#66c0b6] mt-0.5 flex-shrink-0" />
                      <span>Stärken- & Schwächen-Analyse</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-white/75">
                      <CheckCircle2 size={16} className="text-[#66c0b6] mt-0.5 flex-shrink-0" />
                      <span>Bewertung nach 5 Kriterien</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-white/75">
                      <CheckCircle2 size={16} className="text-[#66c0b6] mt-0.5 flex-shrink-0" />
                      <span>Optimierung direkt im Anschluss möglich</span>
                    </li>
                  </ul>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="text-[#66c0b6] font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                      CV analysieren lassen
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </button>
              </div>

              {/* Footer Hint */}
              <div className="text-center pt-8 border-t border-white/10">
                <p className="text-base text-gray-500">
                  Beide Wege führen zu einem perfekt optimierten CV.
                </p>
              </div>
            </div>
          )}

          {/* Other Steps */}
          {currentStepData.type !== 'mode-selection' && (
            <>
              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {currentStepData.title}
              </h2>

              {/* Description */}
              {currentStepData.description && (
                <p className="text-xl text-gray-400 mb-8">
                  {currentStepData.description}
                </p>
              )}

              {/* Step Content */}
              <div className="flex-grow flex flex-col justify-center">
                {currentStepData.type === 'upload' && (
                  <div className="border-2 border-dashed border-white/20 rounded-2xl p-12 text-center hover:border-[#30E3CA]/50 transition-colors cursor-pointer">
                    <Upload size={48} className="text-[#30E3CA] mx-auto mb-4" />
                    <p className="text-gray-400">
                      Klicke hier oder ziehe deine Datei hierher
                    </p>
                  </div>
                )}

                {currentStepData.type === 'choice' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentStepData.options?.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleChoice(option.value)}
                        className={`group p-6 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#30E3CA]/50 rounded-2xl text-left transition-all duration-300 hover:scale-105 ${
                          answers[currentStepData.question || ''] === option.value ? 'border-[#30E3CA] bg-[#30E3CA]/10' : ''
                        }`}
                      >
                        <div className="text-3xl mb-3">{option.icon}</div>
                        <div className="font-semibold">{option.label}</div>
                      </button>
                    ))}
                  </div>
                )}

                {currentStepData.type === 'loading' && (
                  <div className="text-center py-8">
                    <Loader size={64} className="text-[#30E3CA] mx-auto mb-6 animate-spin" />
                    <div className="space-y-2">
                      <p className="text-gray-400">Analysiere Formatierung...</p>
                      <p className="text-gray-400">Prüfe ATS-Konformität...</p>
                      <p className="text-gray-400">Erstelle Optimierungsvorschläge...</p>
                    </div>
                  </div>
                )}

                {currentStepData.type === 'result' && (
                  <div className="text-center py-8">
                    <div className="w-32 h-32 bg-gradient-to-br from-[#30E3CA] to-[#38f6d1] rounded-full flex items-center justify-center mx-auto mb-6">
                      <span className="text-5xl font-bold text-white">87</span>
                    </div>
                    <p className="text-2xl font-bold mb-2">
                      {mode === 'check' ? 'Dein ATS-Score' : 'Bereit zum Start'}
                    </p>
                    <p className="text-gray-400 mb-8">
                      {mode === 'check'
                        ? 'Gut! Mit ein paar Optimierungen erreichst du 95+'
                        : 'Dein CV-Template wartet auf dich im Dashboard'}
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0 || isAnalyzing}
                  className="flex items-center gap-2 px-6 py-3 text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowLeft size={20} />
                  Zurück
                </button>

                {currentStepData.type === 'result' ? (
                  <button
                    onClick={handleComplete}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#30E3CA] to-[#38f6d1] hover:shadow-[0_0_30px_rgba(48,227,202,0.5)] rounded-xl font-semibold transition-all duration-300"
                  >
                    Zu meinem Dashboard
                    <ArrowRight size={20} />
                  </button>
                ) : (
                  <button
                    onClick={handleNext}
                    disabled={
                      isAnalyzing ||
                      (currentStepData.type === 'choice' && !answers[currentStepData.question || ''])
                    }
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#30E3CA] to-[#38f6d1] hover:shadow-[0_0_30px_rgba(48,227,202,0.5)] rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    Weiter
                    <ArrowRight size={20} />
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
