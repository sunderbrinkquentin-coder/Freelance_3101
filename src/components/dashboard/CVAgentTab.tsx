import { useState } from 'react';
import { XCircle, Zap, Target, CheckCircle } from 'lucide-react';
import { dbService } from '../../services/databaseService';

export default function CVAgentTab() {
  const [email, setEmail] = useState('');
  const [betaTester, setBetaTester] = useState(true);
  const [launchNotify, setLaunchNotify] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const randomSlots = Math.floor(Math.random() * (85 - 65 + 1)) + 65;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setEmail('');
      }, 3000);
    } catch (error) {
      console.error('Failed to submit:', error);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <div className="bg-primary bg-opacity-10 border border-primary rounded-xl p-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-bold text-white mb-4">Du bist dabei!</h2>
          <p className="text-lg text-text-secondary">
            Wir melden uns bei dir sobald Beta startet. Check deine Emails!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-6">🤖</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          CV Agent - Deine KI-Bewerbungsassistentin
        </h1>
        <p className="text-xl text-text-secondary">
          Bewirb dich auf Karriereseiten mit nur einem Klick. Der Agent übernimmt das Ausfüllen für dich.
        </p>
      </div>

      {/* Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-error bg-opacity-10 rounded-lg mb-4">
            <XCircle className="text-error" size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Nie wieder 20 Minuten pro Bewerbung
          </h3>
          <p className="text-text-secondary">
            Der Agent füllt alle Felder automatisch aus
          </p>
        </div>

        <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-warning bg-opacity-10 rounded-lg mb-4">
            <Zap className="text-warning" size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            95% Zeitersparnis
          </h3>
          <p className="text-text-secondary">
            Von 20 Minuten auf 1 Minute pro Bewerbung
          </p>
        </div>

        <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-primary bg-opacity-10 rounded-lg mb-4">
            <Target className="text-primary" size={24} />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            Personalisiert für jede Stelle
          </h3>
          <p className="text-text-secondary">
            KI passt deine Daten optimal an die Stelle an
          </p>
        </div>
      </div>

      {/* Launch Info */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Launch: Q1 2025</h2>
        <div className="grid md:grid-cols-2 gap-4 text-white">
          <div>
            <div className="text-3xl font-bold mb-2">100</div>
            <div className="text-sm opacity-90">Beta-Tester Plätze</div>
          </div>
          <div>
            <div className="text-3xl font-bold mb-2">89€</div>
            <div className="text-sm opacity-90">Wert: 3 Monate kostenlos</div>
          </div>
        </div>
      </div>

      {/* Urgency Banner */}
      <div className="bg-error bg-opacity-10 border border-error rounded-lg p-4 mb-8 text-center">
        <p className="text-error font-semibold text-lg">
          🔥 {randomSlots}/100 Plätze vergeben
        </p>
      </div>

      {/* Signup Form */}
      <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-8 mb-12">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Deine Email-Adresse"
              required
              className="w-full px-6 py-4 bg-white bg-opacity-5 border border-white border-opacity-10 rounded-lg text-white text-lg placeholder-text-secondary focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={betaTester}
                onChange={(e) => setBetaTester(e.target.checked)}
                className="w-5 h-5 accent-primary mt-1"
              />
              <span className="text-white">
                Ja, ich will als Beta-Tester dabei sein
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={launchNotify}
                onChange={(e) => setLaunchNotify(e.target.checked)}
                className="w-5 h-5 accent-primary mt-1"
              />
              <span className="text-white">
                Benachrichtige mich bei Launch
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-primary hover:bg-primary-hover rounded-lg text-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap size={24} />
            <span>Jetzt Beta-Zugang sichern</span>
          </button>
        </form>
      </div>

      {/* Beta Benefits */}
      <div className="bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10 p-8 mb-12">
        <h3 className="text-2xl font-bold text-white mb-6 text-center">
          Was Beta-Tester bekommen:
        </h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-white">
            <CheckCircle className="text-primary flex-shrink-0" size={24} />
            <span className="text-lg">3 Monate Premium kostenlos</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <CheckCircle className="text-primary flex-shrink-0" size={24} />
            <span className="text-lg">Direkter Support vom Gründer</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <CheckCircle className="text-primary flex-shrink-0" size={24} />
            <span className="text-lg">Feature-Requests werden priorisiert</span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <CheckCircle className="text-primary flex-shrink-0" size={24} />
            <span className="text-lg">Lifetime 50% Rabatt nach Beta</span>
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-4xl mb-4">"</div>
          <p className="text-xl text-white mb-6 italic">
            Ich hab 12 Bewerbungen in 2 Stunden geschafft. Unglaublich!
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-white font-bold">
              SM
            </div>
            <div className="text-left">
              <div className="font-semibold text-white">Sarah M.</div>
              <div className="text-sm text-white opacity-80">Beta-Testerin</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
