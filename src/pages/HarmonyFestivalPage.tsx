import { useState } from 'react';
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
  CheckCircle,
  Loader2,
} from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const TICKETS = [
  {
    id: 'early_bird',
    priceId: import.meta.env.VITE_STRIPE_HARMONY_EARLY_BIRD,
    label: 'EARLY Bird Bundle',
    price: 39.99,
    description: 'Das volle Programm: Live-Konzert, Stand-Up-Show & mehr in einem Paket.',
    highlight: true,
    badge: 'Beliebt',
  },
  {
    id: 'concert',
    priceId: import.meta.env.VITE_STRIPE_HARMONY_CONCERT,
    label: 'Live Konzert Zirkel.WTF',
    price: 17.50,
    description: 'Norddeutschlands Pop-Punk-Hoffnung hautnah. Moderne Beats, Skater-Vibe, ehrliche Texte.',
    highlight: false,
    badge: null,
  },
  {
    id: 'standup',
    priceId: import.meta.env.VITE_STRIPE_HARMONY_STANDUP,
    label: 'Stand-Up Comedy',
    price: 17.50,
    description: '5–6 Newcomer aus der lokalen Stand-Up Comedy Szene.',
    highlight: false,
    badge: null,
  },
  {
    id: 'dj',
    priceId: import.meta.env.VITE_STRIPE_HARMONY_DJ,
    label: 'DJ Sets House / Techno',
    price: 8.50,
    description: 'Lokale DJs für die Club Night – House & Techno bis in den Morgen.',
    highlight: false,
    badge: null,
  },
  {
    id: 'bierpong',
    priceId: import.meta.env.VITE_STRIPE_HARMONY_BIERPONG,
    label: 'Bierpong-Turnier',
    price: 10.00,
    description: 'Tritt gegen andere Teams an und sichere dir deinen Platz im Turnier.',
    highlight: false,
    badge: 'Limitiert',
    perk: 'Gewinnen = den ganzen Abend free trinken',
  },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay },
});

export default function HarmonyFestivalPage() {
  const navigate = useNavigate();
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleBuyTicket = async (ticket: typeof TICKETS[0]) => {
    setError(null);
    setLoadingTicketId(ticket.id);

    try {
      const origin = window.location.origin;
      const response = await fetch(`${SUPABASE_URL}/functions/v1/stripe-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Apikey': SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          price_id: ticket.priceId,
          success_url: `${origin}/harmony-festival?payment=success&ticket=${ticket.id}`,
          cancel_url: `${origin}/harmony-festival?payment=cancelled`,
          mode: 'payment',
          metadata: { ticket_type: ticket.id, ticket_label: ticket.label },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Checkout konnte nicht gestartet werden.');
      }

      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      setLoadingTicketId(null);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');

  return (
    <div className="min-h-screen text-gray-900 relative overflow-hidden" style={{ backgroundColor: '#f5f0e8' }}>
      {/* Subtle texture overlay */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23000000\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      }} />

      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl border-b border-black/10" style={{ backgroundColor: 'rgba(245,240,232,0.92)' }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium">Zurück zur Startseite</span>
            </button>
            <button
              onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-5 py-2 rounded-lg font-bold text-sm text-white transition-all hover:scale-105 shadow-md"
              style={{ background: 'linear-gradient(135deg, #e85d04, #f48c06)' }}
            >
              Ticket sichern
            </button>
          </div>
        </div>
      </nav>

      {/* Payment success banner */}
      {paymentStatus === 'success' && (
        <div className="fixed top-16 inset-x-0 z-40 bg-green-100 border-b border-green-300">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-green-800 text-sm font-medium">
              Zahlung erfolgreich! Dein Ticket wird per E-Mail zugeschickt. Bis bald beim Harmony Festival!
            </p>
          </div>
        </div>
      )}

      {/* ── HERO BANNER IMAGE ─────────────────────────────────── */}
      <div className="relative z-10 pt-16">
        <div className="w-full">
          <img
            src="/22.08.2026_(1).jpg"
            alt="Harmony Festival 2026 – 22.08.2026 Düsseldorf Burgplatz"
            className="w-full object-cover"
            style={{ maxHeight: '520px', objectPosition: 'center center' }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 pt-12">

          {/* ── TAGLINE ─────────────────────────────────────────── */}
          <motion.div {...fadeUp(0)} className="text-center">
            <p className="text-lg sm:text-xl font-bold tracking-wider uppercase" style={{ color: '#e85d04', fontFamily: 'Impact, Arial Black, sans-serif', letterSpacing: '0.05em' }}>
              Lass uns schaun was uns verbindet und nicht was uns trennt
            </p>
            <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
              Ich lade dich ein in meinen Safe Space am Rhein. Inspiriert vom Harmony Beach,
              angetrieben von meiner Vision für DYD. Erlebe Musik, echte Begegnung und mein
              liebstes Bier aus der Heimat.
            </p>
          </motion.div>

          {/* ── POSTER IMAGE ─────────────────────────────────────── */}
          <motion.div {...fadeUp(0.05)} className="flex justify-center">
            <img
              src="/22.08.2026_(8).png"
              alt="Harmony Festival Poster"
              className="w-full max-w-md rounded-2xl shadow-2xl"
              style={{ border: '3px solid rgba(0,0,0,0.08)' }}
            />
          </motion.div>

          {/* ── WARUM ────────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.1)} className="rounded-2xl p-8 sm:p-10" style={{ backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
            <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase tracking-tight" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>Warum gibt es Harmony?</h2>
            <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
              <p>
                Ich habe das Gefühl, wir stecken in Deutschland gerade mitten in einer tiefen
                Spaltung. Wir reden oft mehr übereinander als miteinander. Aber ich weiß, dass
                es einen Weg zurück gibt.
              </p>
              <p>
                Auf Jamaika war es in den 70ern genau das Gleiche: Das Land war zerrissen, bis
                die Musik – vor allem der Reggae – die Menschen wieder zusammengebracht hat.
                Heute ist Jamaika laut, unfassbar lebendig und geprägt von einem krassen
                Zusammenhalt.
              </p>
              <p>
                Mitten in diesem lauten Getümmel der Innenstadt von Montego Bay liegt der
                Harmony Beach. Dieser Strand hat mir neben einem wundervollen Ausblick vor
                allem eines gegeben: Die Kraft, wieder zurück ins Getümmel zu gehen. Genau so
                einen Platz möchte ich mit Harmony nach Düsseldorf bringen.
              </p>
            </div>
          </motion.div>

          {/* ── Feature Cards ──────────────────────────────────── */}
          <motion.div {...fadeUp(0.15)}>
            <h2 className="text-2xl sm:text-3xl font-black mb-8 text-center uppercase tracking-tight" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>
              Was Harmony besonders macht
            </h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { icon: Users, title: 'Offen für alle', desc: 'Fair, zugänglich und gemeinsam gestaltet – für jede und jeden.' },
                { icon: Mic, title: 'Neue Talente', desc: 'Eine Bühne für lokale Künstlerinnen und Künstler, die gehört werden wollen.' },
                { icon: Handshake, title: 'Offene Räume', desc: 'Begegnung, Workshops und kultureller Austausch in entspannter Atmosphäre.' },
                { icon: Music, title: 'Musik & Miteinander', desc: 'Nicht kommerziell ausgeschlachtet – Fokus auf echte Verbindung.' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  className="rounded-xl p-6 transition-all duration-300"
                  style={{ backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  <f.icon className="w-9 h-9 mb-4" style={{ color: '#e85d04' }} />
                  <h3 className="text-base font-black mb-1 uppercase tracking-wide">{f.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── DYD – MEHR ALS FEIERN ────────────────────────────── */}
          <motion.div {...fadeUp(0.2)} className="rounded-2xl p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, rgba(232,93,4,0.08), rgba(244,140,6,0.05))', border: '1px solid rgba(232,93,4,0.2)' }}>
            <div className="flex items-center gap-3 mb-5">
              <Heart className="w-7 h-7 flex-shrink-0" style={{ color: '#e85d04' }} />
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>DYD – Mehr als nur Feiern</h2>
            </div>
            <div className="space-y-4 text-base sm:text-lg text-gray-700 leading-relaxed">
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
                  className="font-bold underline underline-offset-4 transition-colors"
                  style={{ color: '#e85d04' }}
                >
                  checken, optimieren oder erstellen
                </button>{' '}
                und erhöhe deine Chancen auf deinen nächsten Traumjob.
              </p>
            </div>
          </motion.div>

          {/* ── PROGRAMM ─────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.25)}>
            <h2 className="text-2xl sm:text-3xl font-black mb-8 uppercase tracking-tight" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>Das Programm</h2>
            <div className="space-y-4">
              {[
                { icon: Laugh, time: '17:00', title: 'Stand-Up Comedy', desc: 'Ich präsentiere euch Newcomer der lokalen Szene.' },
                { icon: Trophy, time: '18:00', title: 'Bierpong-Turnier', desc: 'Teamgeist & Gewinne. Anmeldung über das Formular unten. Startgebühr 10 €.' },
                { icon: Mic, time: '20:00', title: 'Live: ZIRKEL.WTF', desc: 'Pop-Punk aus Hamburg.' },
                { icon: Disc3, time: '21:30', title: 'Club Night', desc: 'Lokale DJs für House & Techno.' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.08 }}
                  className="flex items-start gap-5 rounded-xl px-6 py-5 transition-colors"
                  style={{ backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(232,93,4,0.12)' }}>
                    <item.icon className="w-5 h-5" style={{ color: '#e85d04' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-black font-mono text-sm" style={{ color: '#e85d04' }}>{item.time}</span>
                      <h3 className="font-black text-gray-900 uppercase tracking-wide text-sm">{item.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── BIER-BRÜCKE ──────────────────────────────────────── */}
          <motion.div {...fadeUp(0.3)} className="rounded-2xl p-8 sm:p-10" style={{ backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
            <div className="flex items-center gap-3 mb-6">
              <Beer className="w-7 h-7 flex-shrink-0" style={{ color: '#f48c06' }} />
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>Die Bier-Brücke</h2>
            </div>
            <p className="text-base sm:text-lg text-gray-700 leading-relaxed mb-6">
              Als Fürther bringe ich echtes Handwerk aus meiner Heimat mit nach Düsseldorf:
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Grüner Bier', 'Hofmann', 'Greif Bräu'].map((brand) => (
                <span
                  key={brand}
                  className="px-4 py-2 rounded-full text-sm font-black uppercase tracking-wide"
                  style={{ backgroundColor: 'rgba(244,140,6,0.12)', border: '1px solid rgba(244,140,6,0.3)', color: '#b45309' }}
                >
                  {brand}
                </span>
              ))}
            </div>
            <div className="inline-flex items-center gap-3 rounded-xl px-6 py-4" style={{ backgroundColor: 'rgba(244,140,6,0.1)', border: '1px solid rgba(244,140,6,0.25)' }}>
              <Star className="w-5 h-5 flex-shrink-0" style={{ color: '#f48c06' }} />
              <p className="font-bold text-gray-800">
                Mein Fairness-Preis: 0,5 l ehrliches Bier für nur <span className="font-black" style={{ color: '#b45309' }}>4,00 €</span>
              </p>
            </div>
          </motion.div>

          {/* ── CREW-DEAL ────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.35)} className="rounded-2xl p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, rgba(244,140,6,0.1), rgba(232,93,4,0.05))', border: '1px solid rgba(244,140,6,0.2)' }}>
            <h2 className="text-2xl sm:text-3xl font-black mb-5 uppercase tracking-tight" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>Crew-Deal: Ticket gegen Hilfe</h2>
            <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
              Dein Budget ist knapp? Werde Teil meiner Crew!
            </p>
            <div className="grid sm:grid-cols-2 gap-5 mb-6">
              <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Dein Einsatz</p>
                <p className="text-gray-900 font-black">2,5 h Theke oder Service</p>
              </div>
              <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)' }}>
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Dein Benefit</p>
                <p className="text-gray-900 font-black">Freies Ticket für den restlichen Abend</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed mb-5">
              So läuft's: Wir quatschen kurz vorab, ob es passt. Plätze sind limitiert.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#e85d04' }}>
                <Clock className="w-4 h-4" />
                Deadline: 15.07.
              </div>
              <a
                href="mailto:kontakt.dyd@googlemail.com?subject=Crew"
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all hover:scale-105"
                style={{ backgroundColor: 'rgba(244,140,6,0.15)', border: '1px solid rgba(244,140,6,0.3)', color: '#92400e' }}
              >
                <Mail className="w-4 h-4" />
                Betreff „Crew" an kontakt.dyd@googlemail.com
              </a>
            </div>
          </motion.div>

          {/* ── TICKETS ──────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.4)} id="tickets">
            <div className="text-center mb-10">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-6" style={{ backgroundColor: 'rgba(232,93,4,0.12)' }}>
                <Ticket className="w-7 h-7" style={{ color: '#e85d04' }} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black mb-4 uppercase tracking-tight" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>Dein Ticket für eine Mission</h2>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-xl mx-auto">
                Mit deinem Kauf unterstützt du direkt DYD und meine Arbeit für faire
                Ausbildungschancen. Wähle dein Ticket und werde Teil der Bewegung.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {TICKETS.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  whileHover={{ scale: 1.01 }}
                  className={`relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl p-6 transition-all duration-300`}
                  style={ticket.highlight ? {
                    background: 'linear-gradient(135deg, rgba(232,93,4,0.1), rgba(244,140,6,0.07))',
                    border: '2px solid rgba(232,93,4,0.35)',
                  } : {
                    backgroundColor: 'rgba(0,0,0,0.04)',
                    border: '1px solid rgba(0,0,0,0.1)',
                  }}
                >
                  {ticket.badge && (
                    <span
                      className="absolute -top-3 left-6 px-3 py-1 rounded-full text-white text-xs font-black tracking-wide uppercase"
                      style={{ backgroundColor: ticket.badge === 'Limitiert' ? '#f48c06' : '#e85d04' }}
                    >
                      {ticket.badge}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-gray-900 text-lg uppercase tracking-wide">{ticket.label}</h3>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{ticket.description}</p>
                    {'perk' in ticket && ticket.perk && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(244,140,6,0.12)', border: '1px solid rgba(244,140,6,0.3)' }}>
                        <Trophy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f48c06' }} />
                        <span className="text-xs font-black uppercase tracking-wide" style={{ color: '#92400e' }}>{ticket.perk}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-shrink-0">
                    <span className="text-2xl font-black" style={{ color: '#e85d04' }}>
                      {ticket.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </span>
                    <button
                      onClick={() => handleBuyTicket(ticket)}
                      disabled={loadingTicketId !== null}
                      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
                      style={ticket.highlight ? {
                        background: 'linear-gradient(135deg, #e85d04, #f48c06)',
                        color: 'white',
                        boxShadow: '0 4px 15px rgba(232,93,4,0.3)',
                      } : {
                        backgroundColor: 'rgba(0,0,0,0.08)',
                        color: '#1f2937',
                        border: '1px solid rgba(0,0,0,0.15)',
                      }}
                    >
                      {loadingTicketId === ticket.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Weiterleitung...
                        </>
                      ) : (
                        <>
                          Jetzt kaufen
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            <p className="text-center text-xs text-gray-500 mt-6">
              Sichere Zahlung über Stripe · Du wirst nach dem Kauf per E-Mail benachrichtigt
            </p>
          </motion.div>

          {/* ── HARD FACTS ────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.45)}>
            <h2 className="text-2xl sm:text-3xl font-black mb-6 uppercase tracking-tight" style={{ fontFamily: 'Impact, Arial Black, sans-serif' }}>Hard Facts</h2>
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)' }}>
              <div className="flex items-start gap-4 px-7 py-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#e85d04' }} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Location</p>
                  <p className="text-gray-900 font-black">Klub Kulb, Burgplatz, Düsseldorf</p>
                </div>
              </div>
              <div className="flex items-start gap-4 px-7 py-5" style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
                <Users className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#e85d04' }} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mb-1 font-bold">Einlass</p>
                  <p className="text-gray-900 font-black">Ab 18 Jahren · Awareness-Team vor Ort</p>
                </div>
              </div>
              <div className="px-7 py-5">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-4 font-bold">Tickets</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Early Bird', price: '39,99 €' },
                    { label: 'Konzert', price: '17,50 €' },
                    { label: 'Comedy', price: '17,50 €' },
                  ].map((t) => (
                    <div
                      key={t.label}
                      className="rounded-xl p-4 text-center"
                      style={{ backgroundColor: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.08)' }}
                    >
                      <p className="text-xs text-gray-500 mb-1 font-bold uppercase">{t.label}</p>
                      <p className="text-lg font-black" style={{ color: '#e85d04' }}>{t.price}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-5">
                  <button
                    onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-black text-white uppercase tracking-wide transition-all hover:scale-[1.02] shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #e85d04, #f48c06)', boxShadow: '0 4px 20px rgba(232,93,4,0.3)' }}
                  >
                    <Ticket className="w-5 h-5" />
                    Jetzt Ticket kaufen
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* Footer strip */}
      <div className="relative z-10 py-6 text-center text-sm" style={{ borderTop: '1px solid rgba(0,0,0,0.1)', color: '#9ca3af' }}>
        <button onClick={() => navigate('/')} className="hover:text-gray-700 transition-colors font-medium">
          &larr; Zurück zu DYD
        </button>
      </div>
    </div>
  );
}
