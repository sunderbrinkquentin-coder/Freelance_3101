import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Users,
  Mic,
  Handshake,
  Music,
  Heart,
  ArrowRight,
  MapPin,
  Clock,
  Beer,
  Ticket,
  Star,
  Laugh,
  Trophy,
  Disc3,
  Mail,
} from 'lucide-react';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function HarmonyFestivalPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#080808] via-[#0d0a08] to-[#080808] text-white relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[700px] h-[700px] bg-orange-500/6 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-violet-500/6 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-orange-400/4 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/80 via-transparent to-[#080808]/80"></div>
      </div>

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/70 hover:text-white transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm">Zurück zur Startseite</span>
            </button>
            <a
              href="https://buy.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-orange-500/90 to-violet-500/90 text-white font-semibold text-sm hover:from-orange-500 hover:to-violet-500 transition-all"
            >
              Ticket sichern
            </a>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">

          {/* ── 1. HERO ─────────────────────────────────────────── */}
          <motion.div {...fadeUp(0)} className="text-center">
            <div className="flex justify-center mb-8">
              <img
                src="/harmony-festival.png"
                alt="Harmony Festival"
                className="h-40 sm:h-56 md:h-72 w-auto object-contain drop-shadow-2xl"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 leading-tight">
              HARMONY 2026
            </h1>
            <p className="text-lg sm:text-xl text-orange-300/90 font-light tracking-wide">
              Andere Ansichten, gleicher Wunsch: Glücklich sein.
            </p>
            <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto leading-relaxed">
              Ich lade dich ein in meinen Safe Space am Rhein. Inspiriert vom Harmony Beach,
              angetrieben von meiner Vision für DYD. Erlebe Musik, echte Begegnung und mein
              liebstes Bier aus der Heimat.
            </p>
          </motion.div>

          {/* ── 2. WARUM ────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.1)} className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Warum gibt es Harmony?</h2>
            <div className="space-y-4 text-base sm:text-lg text-white/80 leading-relaxed">
              <p>
                Ich habe das Gefühl, wir stecken in Deutschland gerade mitten in einer tiefen
                Spaltung. Wir reden oft mehr übereinander als miteinander. Aber ich weiß, dass
                es einen Weg zurück gibt.
              </p>
              <p>
                Auf Jamaika war es in den 70ern genau das Gleiche: Das Land war zerrissen, bis
                die Musik – vor allem der Reggae – die Menschen wieder zusammengebracht hat.
                Heute ist Jamaika laut, unfassbar lebendig und geprägt von einem krassen
                Zusammenhalt. Klar, als Tourist ist es manchmal anstrengend, und beim „Abziehen"
                sind sie leider auch ganz vorne mit dabei – aber genau das gehört zu dieser
                rohen, echten Energie.
              </p>
              <p>
                Mitten in diesem lauten Getümmel der Innenstadt von Montego Bay liegt der
                Harmony Beach. Dieser Strand hat mir neben einem wundervollen Ausblick vor
                allem eines gegeben: Die Kraft, wieder zurück ins Getümmel zu gehen. Genau so
                einen Platz möchte ich mit Harmony nach Düsseldorf bringen. Ein Ort, an dem wir
                kurz durchatmen, die Vorurteile vergessen und uns darauf konzentrieren, was wir
                alle wollen: Einfach glücklich sein und eine geile Zeit haben.
              </p>
            </div>
          </motion.div>

          {/* ── Feature Cards ──────────────────────────────────── */}
          <motion.div {...fadeUp(0.15)}>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-8 text-center">
              Was Harmony besonders macht
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { icon: Users, title: 'Für alle', desc: 'Fair, zugänglich und gemeinsam gestaltet – für jede und jeden.' },
                { icon: Mic, title: 'Neue Talente', desc: 'Eine Bühne für lokale Künstlerinnen und Künstler, die gehört werden wollen.' },
                { icon: Handshake, title: 'Offene Räume', desc: 'Begegnung, Workshops und kultureller Austausch in entspannter Atmosphäre.' },
                { icon: Music, title: 'Musik & Miteinander', desc: 'Fokus auf Atmosphäre, Verbindung und Gemeinschaft – nicht auf Profit.' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/[0.03] border border-white/10 rounded-xl p-6 hover:border-orange-400/30 transition-all duration-300"
                >
                  <f.icon className="w-9 h-9 text-orange-400/80 mb-4" />
                  <h3 className="text-base font-semibold mb-1">{f.title}</h3>
                  <p className="text-sm text-white/60 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── 3. DYD – MEHR ALS FEIERN ────────────────────────── */}
          <motion.div {...fadeUp(0.2)} className="bg-gradient-to-br from-orange-500/10 via-violet-500/5 to-transparent border border-orange-500/20 rounded-2xl p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-5">
              <Heart className="w-7 h-7 text-orange-400 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-semibold">DYD – Mehr als nur Feiern</h2>
            </div>
            <div className="space-y-4 text-base sm:text-lg text-white/80 leading-relaxed">
              <p>
                Hinter dem Festival steht meine Plattform DYD (Decide Your Dream). Ich kämpfe
                für faire Bewerbungschancen, denn ich bin überzeugt: Echte Chancen entstehen
                dort, wo Menschen sich auf Augenhöhe begegnen – egal ob am Lebenslauf oder
                am Tresen.
              </p>
              <p>
                Und falls du gerade auf Jobsuche bist: Lass deinen CV bei mir{' '}
                <button
                  onClick={() => navigate('/cv-check')}
                  className="text-orange-400 underline underline-offset-4 hover:text-orange-300 transition-colors"
                >
                  checken, optimieren oder erstellen
                </button>{' '}
                und erhöhe deine Chancen auf deinen nächsten Traumjob.
              </p>
            </div>
          </motion.div>

          {/* ── 4. PROGRAMM ─────────────────────────────────────── */}
          <motion.div {...fadeUp(0.25)}>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-8">Das Programm</h2>
            <div className="space-y-4">
              {[
                {
                  icon: Laugh,
                  time: '17:00',
                  title: 'Stand-Up Comedy',
                  desc: 'Ich präsentiere euch Newcomer der lokalen Szene.',
                },
                {
                  icon: Trophy,
                  time: '18:00',
                  title: 'Bierpong-Turnier',
                  desc: 'Teamgeist & Gewinne. Anmeldung über das Formular unten. Startgebühr 10 €.',
                },
                {
                  icon: Mic,
                  time: '20:00',
                  title: 'Live: ZIRKEL.WTF',
                  desc: 'Pop-Punk aus Hamburg.',
                },
                {
                  icon: Disc3,
                  time: '21:30',
                  title: 'Club Night',
                  desc: 'Lokale DJs für House & Techno.',
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-5 bg-white/[0.03] border border-white/10 rounded-xl px-6 py-5 hover:border-orange-400/20 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/15 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-orange-400 font-mono font-bold text-sm">{item.time}</span>
                      <h3 className="font-semibold text-white">{item.title}</h3>
                    </div>
                    <p className="text-sm text-white/60 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── 5. BIER-BRÜCKE ──────────────────────────────────── */}
          <motion.div {...fadeUp(0.3)} className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Beer className="w-7 h-7 text-amber-400 flex-shrink-0" />
              <h2 className="text-2xl sm:text-3xl font-semibold">Die Bier-Brücke</h2>
            </div>
            <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6">
              Als Fürther bringe ich echtes Handwerk aus meiner Heimat mit nach Düsseldorf:
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Grüner Bier', 'Hofmann', 'Greif Bräu'].map((brand) => (
                <span
                  key={brand}
                  className="px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-sm font-semibold"
                >
                  {brand}
                </span>
              ))}
            </div>
            <div className="inline-flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-xl px-6 py-4">
              <Star className="w-5 h-5 text-amber-400 flex-shrink-0" />
              <p className="text-white/90 font-medium">
                Mein Fairness-Preis: 0,5 l ehrliches Bier für nur <span className="text-amber-400 font-bold">4,00 €</span>
              </p>
            </div>
          </motion.div>

          {/* ── 6. CREW-DEAL ────────────────────────────────────── */}
          <motion.div {...fadeUp(0.35)} className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/20 rounded-2xl p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-semibold mb-5">Crew-Deal: Ticket gegen Hilfe</h2>
            <p className="text-base sm:text-lg text-white/70 mb-6 leading-relaxed">
              Dein Budget ist knapp? Werde Teil meiner Crew!
            </p>
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-5">
                <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Dein Einsatz</p>
                <p className="text-white font-semibold">2,5 h Theke oder Service</p>
              </div>
              <div className="bg-white/[0.04] border border-white/10 rounded-xl p-5">
                <p className="text-xs text-white/50 uppercase tracking-widest mb-1">Dein Benefit</p>
                <p className="text-white font-semibold">Freies Ticket für den restlichen Abend</p>
              </div>
            </div>
            <p className="text-sm text-white/60 leading-relaxed mb-5">
              So läuft's: Wir quatschen kurz vorab, ob es passt. Plätze sind limitiert.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-orange-400 font-medium">
                <Clock className="w-4 h-4" />
                Deadline: 15.07.
              </div>
              <a
                href="mailto:kontakt.dyd@googlemail.com?subject=Crew"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500/15 border border-violet-500/30 text-violet-300 text-sm font-semibold hover:bg-violet-500/25 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Betreff „Crew" an kontakt.dyd@googlemail.com
              </a>
            </div>
          </motion.div>

          {/* ── 7. TICKET = MISSION ──────────────────────────────── */}
          <motion.div {...fadeUp(0.4)} className="bg-gradient-to-br from-orange-500/12 via-[#0d0a08] to-violet-500/10 border border-orange-500/25 rounded-2xl p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-400/15 mb-6">
              <Ticket className="w-7 h-7 text-orange-400" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-4">Dein Ticket für eine Mission</h2>
            <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-xl mx-auto mb-5">
              Mit deinem Kauf entscheidest du dich nicht nur für eine geile Nacht im Klub Kulb.
              Du unterstützt direkt DYD und damit meine Arbeit für faire Ausbildungschancen und
              berufliche Bildung.
            </p>
            <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-xl mx-auto mb-5">
              Jedes verkaufte Ticket hilft mir, die Plattform weiter auszubauen und Menschen dabei
              zu unterstützen, ihre Träume unabhängig von ihrer Herkunft zu verwirklichen. Lass uns
              zeigen, dass Feiern und Haltung zusammengehören.
            </p>
            <p className="text-orange-400 font-medium mb-8">
              Werde Teil der Bewegung und setz ein Zeichen für echtes Miteinander.
            </p>

            <a
              href="https://buy.stripe.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-10 py-5 rounded-xl bg-gradient-to-r from-orange-500 to-violet-500 text-white font-bold text-base sm:text-lg shadow-2xl shadow-orange-500/20 hover:scale-105 hover:shadow-orange-500/30 transition-all duration-300"
            >
              Sichere dir jetzt deinen Platz & unterstütze die Vision
              <ArrowRight className="w-5 h-5" />
            </a>
          </motion.div>

          {/* ── 8. HARD FACTS ────────────────────────────────────── */}
          <motion.div {...fadeUp(0.45)}>
            <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Hard Facts</h2>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/[0.07]">
              <div className="flex items-start gap-4 px-7 py-5">
                <MapPin className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Location</p>
                  <p className="text-white font-semibold">Klub Kulb, Burgplatz, Düsseldorf</p>
                </div>
              </div>
              <div className="flex items-start gap-4 px-7 py-5">
                <Users className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-1">Einlass</p>
                  <p className="text-white font-semibold">Ab 18 Jahren · Awareness-Team vor Ort</p>
                </div>
              </div>
              <div className="px-7 py-5">
                <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Tickets</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Early Bird', price: '37,99 €' },
                    { label: 'Middle', price: '39,99 €' },
                    { label: 'Late', price: '43,00 €' },
                  ].map((t) => (
                    <div
                      key={t.label}
                      className="bg-white/[0.04] border border-white/10 rounded-xl p-4 text-center"
                    >
                      <p className="text-xs text-white/50 mb-1">{t.label}</p>
                      <p className="text-lg font-bold text-orange-400">{t.price}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <a
                    href="https://buy.stripe.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-orange-500/90 to-violet-500/90 text-white font-bold hover:from-orange-500 hover:to-violet-500 transition-all hover:scale-[1.02] shadow-lg"
                  >
                    <Ticket className="w-5 h-5" />
                    Jetzt Ticket kaufen
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer strip */}
      <div className="relative z-10 border-t border-white/10 py-6 text-center text-white/40 text-sm">
        <button onClick={() => navigate('/')} className="hover:text-white/70 transition-colors">
          &larr; Zurück zu DYD
        </button>
      </div>
    </div>
  );
}
