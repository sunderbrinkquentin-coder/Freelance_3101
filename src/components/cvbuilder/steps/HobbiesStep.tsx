import { useState } from 'react';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { ProgressBar } from '../ProgressBar';
import { AvatarSidebar } from '../AvatarSidebar';
import { Hobbies } from '../../../types/cvBuilder';

interface HobbiesStepProps {
  currentStep: number;
  totalSteps: number;
  initialHobbies?: Hobbies;
  onNext: (hobbies: Hobbies) => void;
  onPrev: () => void;
}

const HOBBY_SUGGESTIONS = [
  'Sport & Fitness',
  'Lesen',
  'Reisen',
  'Fotografie',
  'Musik',
  'Kochen',
  'Gaming',
  'Wandern',
  'Yoga',
  'Tanzen',
  'Malen & Zeichnen',
  'Programmieren',
  'Gartenarbeit',
  'Freiwilligenarbeit',
  'Sprachen lernen',
  'Schreiben',
  'Filme & Serien',
  'Meditation',
  'DIY & Handwerk',
  'Podcasts hören'
];

export function HobbiesStep({
  currentStep,
  totalSteps,
  initialHobbies,
  onNext,
  onPrev
}: HobbiesStepProps) {
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(
    initialHobbies?.hobbies || []
  );
  const [customHobby, setCustomHobby] = useState('');
  const [customHobbies, setCustomHobbies] = useState<string[]>(
    initialHobbies?.hobbies?.filter(h => !HOBBY_SUGGESTIONS.includes(h)) || []
  );
  const [details, setDetails] = useState(initialHobbies?.details || '');

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies(prev =>
      prev.includes(hobby)
        ? prev.filter(h => h !== hobby)
        : [...prev, hobby]
    );
  };

  const addCustomHobby = () => {
    const trimmed = customHobby.trim();
    if (!trimmed) return;
    if (selectedHobbies.includes(trimmed) || customHobbies.includes(trimmed)) return;

    setCustomHobbies(prev => [...prev, trimmed]);
    setSelectedHobbies(prev => [...prev, trimmed]);
    setCustomHobby('');
  };

  const removeCustomHobby = (hobby: string) => {
    setCustomHobbies(prev => prev.filter(h => h !== hobby));
    setSelectedHobbies(prev => prev.filter(h => h !== hobby));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomHobby();
    }
  };

  const handleContinue = () => {
    onNext({
      hobbies: selectedHobbies,
      details
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 space-y-10 animate-fade-in max-w-4xl mx-auto w-full">
        <ProgressBar currentStep={currentStep} totalSteps={totalSteps} />

        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white via-[#66c0b6] to-white bg-clip-text text-transparent">
            Hobbys & Interessen
          </h1>
          <p className="text-xl text-white/70">
            Zeige deine Persönlichkeit und deinen Cultural Fit
          </p>
        </div>

        <div className="space-y-8">
          {/* Vorschläge */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Beliebte Hobbys</h3>
            <div className="flex flex-wrap gap-3">
              {HOBBY_SUGGESTIONS.map((hobby) => (
                <button
                  key={hobby}
                  onClick={() => toggleHobby(hobby)}
                  className={`px-5 py-3 rounded-xl border transition-all duration-200 hover:scale-105 ${
                    selectedHobbies.includes(hobby)
                      ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                      : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  {hobby}
                </button>
              ))}
            </div>
          </div>

          {/* Eigene Hobbys */}
          {customHobbies.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Deine eigenen Hobbys</h3>
              <div className="flex flex-wrap gap-3">
                {customHobbies.map((hobby) => (
                  <button
                    key={hobby}
                    onClick={() => toggleHobby(hobby)}
                    className={`group px-5 py-3 rounded-xl border transition-all duration-200 hover:scale-105 flex items-center gap-2 ${
                      selectedHobbies.includes(hobby)
                        ? 'border-[#66c0b6] bg-[#66c0b6]/20 text-white shadow-[0_0_20px_rgba(102,192,182,0.3)]'
                        : 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    <span>{hobby}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeCustomHobby(hobby);
                      }}
                      className="ml-2 p-1 rounded-full hover:bg-red-500/20 transition-colors"
                    >
                      <X size={14} className="text-red-400" />
                    </button>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Eigenes Hobby hinzufügen */}
          <div className="border-t border-white/10 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">Eigenes Hobby hinzufügen</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={customHobby}
                onChange={(e) => setCustomHobby(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="z.B. Astronomie, Imkern, Schachspielen..."
                className="flex-1 px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20"
              />
              <button
                onClick={addCustomHobby}
                disabled={!customHobby.trim()}
                className="px-6 py-4 rounded-xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-semibold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-xl"
              >
                <Plus size={20} />
                Hinzufügen
              </button>
            </div>
            <p className="text-sm text-white/50 mt-2">
              Drücke Enter oder klicke auf "Hinzufügen"
            </p>
          </div>

          {/* Details (optional) */}
          <div>
            <label className="block text-lg font-semibold text-white mb-3">
              Details zu deinen Hobbys (optional)
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Beschreibe deine Hobbys genauer, z.B. wie lange du sie ausübst, besondere Erfolge..."
              rows={4}
              className="w-full px-5 py-4 rounded-xl border border-white/20 bg-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#66c0b6] focus:ring-2 focus:ring-[#66c0b6]/20 resize-none"
            />
            <p className="text-sm text-white/50 mt-2">
              z.B. "Laufe seit 3 Jahren Marathon, habe am Berlin Marathon 2023 teilgenommen"
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="text-2xl">✨</div>
              <div>
                <p className="text-white/90 font-medium">
                  {selectedHobbies.length} {selectedHobbies.length === 1 ? 'Hobby' : 'Hobbys'} ausgewählt
                </p>
                <p className="text-sm text-white/60">
                  Hobbys zeigen deine Persönlichkeit und helfen beim Cultural Fit
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-4">
            <button
              onClick={onPrev}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} />
              Zurück
            </button>
            <button
              onClick={handleContinue}
              className="px-12 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl hover:opacity-90 transition-all flex items-center gap-3 shadow-2xl hover:scale-105"
            >
              Zur Wunschstelle
              <ArrowRight size={24} />
            </button>
          </div>
        </div>
      </div>

      <div className="lg:block hidden">
        <AvatarSidebar
          message="Hobbys zeigen deine Persönlichkeit"
          stepInfo="Wähle 3-5 Hobbys, die dich interessant machen und Cultural Fit zeigen"
        />
      </div>
    </div>
  );
}
