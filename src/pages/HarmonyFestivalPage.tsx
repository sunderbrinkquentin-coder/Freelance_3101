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
  Zap,
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
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
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
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout konnte nicht gestartet werden.');
      window.location.href = data.url;
    } catch (err: any) {
      setError(err.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.');
      setLoadingTicketId(null);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');

  return (
    <div className="min-h-screen text-white relative" style={{ backgroundColor: '#0a0a0a' }}>

      {/* ── ANIMATED BACKGROUND GRID ─────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />
        <div className="absolute top-0 left-0 w-full h-full" style={{
          background: 'radial-gradient(ellipse 80% 50% at 20% -10%, rgba(232,93,4,0.18) 0%, transparent 60%)',
        }} />
        <div className="absolute bottom-0 right-0 w-full h-full" style={{
          background: 'radial-gradient(ellipse 60% 40% at 80% 110%, rgba(20,184,166,0.12) 0%, transparent 60%)',
        }} />
      </div>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50" style={{ backgroundColor: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 transition-all group"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium group-hover:text-white transition-colors">DYD</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>22.08.2026</span>
              <div className="w-px h-4" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <button
                onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-black uppercase tracking-wide transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #e85d04, #f59e0b)', color: 'white', boxShadow: '0 0 20px rgba(232,93,4,0.4)' }}
              >
                <Ticket className="w-3.5 h-3.5" />
                Tickets
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Payment success banner */}
      {paymentStatus === 'success' && (
        <div className="fixed top-16 inset-x-0 z-40" style={{ backgroundColor: 'rgba(16,185,129,0.15)', borderBottom: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300 text-sm font-medium">
              Zahlung erfolgreich! Dein Ticket wird per E-Mail zugeschickt. Bis bald beim Harmony Festival!
            </p>
          </div>
        </div>
      )}

      {/* ── HERO BANNER ──────────────────────────────────────── */}
      <div className="relative z-10 pt-16">
        <div className="relative w-full overflow-hidden" style={{ maxHeight: '500px' }}>
          <img
            src="/22.08.2026_(2).jpg"
            alt="Harmony Festival 2026"
            className="w-full object-cover"
            style={{ maxHeight: '500px', objectPosition: 'center 30%' }}
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0) 50%, rgba(10,10,10,1) 100%)' }} />
        </div>
      </div>

      {/* ── TAGLINE BAND ─────────────────────────────────────── */}
      <div className="relative z-10 overflow-hidden" style={{ backgroundColor: '#e85d04' }}>
        <div className="flex whitespace-nowrap py-2.5">
          {[...Array(6)].map((_, i) => (
            <span key={i} className="text-white font-black text-xs uppercase tracking-widest mx-8 flex-shrink-0">
              LASS UNS SCHAUN WAS UNS VERBINDET UND NICHT WAS UNS TRENNT &nbsp;✦
            </span>
          ))}
        </div>
      </div>

      {/* ── CONTENT ──────────────────────────────────────────── */}
      <div className="relative z-10 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 space-y-20">

          {/* ── INTRO ────────────────────────────────────────── */}
          <motion.div {...fadeUp(0)} className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest" style={{ backgroundColor: 'rgba(232,93,4,0.12)', border: '1px solid rgba(232,93,4,0.3)', color: '#f59e0b' }}>
              <Zap className="w-3 h-3" />
              Düsseldorf Burgplatz · 18:00 – 02:00 Uhr
            </div>
            <p className="text-base sm:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Ich lade dich ein in meinen Safe Space am Rhein. Inspiriert vom Harmony Beach,
              angetrieben von meiner Vision für DYD. Erlebe Musik, echte Begegnung und mein liebstes Bier aus der Heimat.
            </p>
          </motion.div>

          {/* ── PROGRAM GRID ─────────────────────────────────── */}
          <motion.div {...fadeUp(0.1)}>
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Programm</h2>
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: Laugh, label: 'Stand-Up\nComedy', time: '17:00', color: '#f59e0b' },
                { icon: Trophy, label: 'Bierpong\nTurnier', time: '18:00', color: '#10b981' },
                { icon: Mic, label: 'Zirkel.WTF\nLive', time: '20:00', color: '#e85d04' },
                { icon: Disc3, label: 'DJ Sets\nHouse & Techno', time: '21:30', color: '#06b6d4' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="relative rounded-2xl p-5 flex flex-col gap-3 overflow-hidden group"
                  style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at 50% 0%, ${item.color}18, transparent 70%)` }} />
                  <span className="text-xs font-black font-mono" style={{ color: item.color }}>{item.time}</span>
                  <item.icon className="w-7 h-7" style={{ color: item.color }} />
                  <p className="text-sm font-bold leading-snug whitespace-pre-line text-white">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── WARUM ────────────────────────────────────────── */}
          <motion.div {...fadeUp(0.2)}>
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Warum Harmony?</h2>
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { label: 'Offen für alle', sub: 'Humane Preise, kein VIP-Bullshit' },
                { label: 'Nicht kommerziell', sub: 'Authentische Künstler, echte Energie' },
                { label: 'You will always remember', sub: 'Mix aus allen Genres' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="font-black text-sm text-white mb-1">{item.label}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.sub}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-7 sm:p-9" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="space-y-4 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <p>
                  Ich habe das Gefühl, wir stecken in Deutschland gerade mitten in einer tiefen Spaltung. Wir reden oft mehr übereinander als miteinander. Aber ich weiß, dass es einen Weg zurück gibt.
                </p>
                <p>
                  Auf Jamaika war es in den 70ern genau das Gleiche – bis die Musik die Menschen wieder zusammengebracht hat. Den Harmony Beach in Montego Bay hat mir die Kraft gegeben, wieder ins Getümmel zu gehen. Genau diesen Ort bringe ich nach Düsseldorf.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── DYD SECTION ──────────────────────────────────── */}
          <motion.div {...fadeUp(0.25)}>
            <div className="relative rounded-2xl overflow-hidden p-8 sm:p-10" style={{ background: 'linear-gradient(135deg, rgba(232,93,4,0.12) 0%, rgba(245,158,11,0.06) 50%, rgba(10,10,10,0) 100%)', border: '1px solid rgba(232,93,4,0.2)' }}>
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(232,93,4,0.15), transparent 70%)', transform: 'translate(30%, -30%)' }} />
              <div className="flex items-center gap-3 mb-5">
                <Heart className="w-6 h-6 flex-shrink-0" style={{ color: '#e85d04' }} />
                <h2 className="text-lg font-black uppercase tracking-wide text-white">DYD – Mehr als nur Feiern</h2>
              </div>
              <div className="space-y-3 text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
                <p>
                  Hinter dem Festival steht meine Plattform DYD (Decide Your Dream). Ich kämpfe für faire Bewerbungschancen – denn echte Chancen entstehen dort, wo Menschen sich auf Augenhöhe begegnen.
                </p>
                <p>
                  Auf Jobsuche?{' '}
                  <button
                    onClick={() => navigate('/cv-check')}
                    className="font-black transition-colors"
                    style={{ color: '#f59e0b' }}
                  >
                    CV checken, optimieren oder erstellen
                  </button>{' '}
                  und erhöhe deine Chancen auf deinen Traumjob.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── FEATURES ─────────────────────────────────────── */}
          <motion.div {...fadeUp(0.3)}>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Was Harmony besonders macht</h2>
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Users, title: 'Für alle', desc: 'Fair, zugänglich und gemeinsam gestaltet – für jede und jeden.', accent: '#f59e0b' },
                { icon: Mic, title: 'Neue Talente', desc: 'Eine Bühne für lokale Künstlerinnen und Künstler, die gehört werden wollen.', accent: '#e85d04' },
                { icon: Handshake, title: 'Offene Räume', desc: 'Begegnung, Workshops und kultureller Austausch in entspannter Atmosphäre.', accent: '#10b981' },
                { icon: Music, title: 'Musik & Miteinander', desc: 'Nicht kommerziell ausgeschlachtet – Fokus auf echte Verbindung.', accent: '#06b6d4' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -4 }}
                  className="rounded-xl p-6 flex gap-4 items-start transition-all duration-300"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${f.accent}18` }}>
                    <f.icon className="w-5 h-5" style={{ color: f.accent }} />
                  </div>
                  <div>
                    <h3 className="font-black text-sm text-white mb-1 uppercase tracking-wide">{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── BIER-BRÜCKE ──────────────────────────────────── */}
          <motion.div {...fadeUp(0.35)} className="rounded-2xl p-8 sm:p-10" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center gap-3 mb-6">
              <Beer className="w-6 h-6 flex-shrink-0" style={{ color: '#f59e0b' }} />
              <h2 className="text-lg font-black uppercase tracking-wide text-white">Die Bier-Brücke</h2>
            </div>
            <p className="text-base leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Als Fürther bringe ich echtes Handwerk aus meiner Heimat mit nach Düsseldorf:
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              {['Grüner Bier', 'Hofmann', 'Greif Bräu'].map((brand) => (
                <span key={brand} className="px-4 py-1.5 rounded-full text-sm font-black uppercase tracking-wide" style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}>
                  {brand}
                </span>
              ))}
            </div>
            <div className="inline-flex items-center gap-3 rounded-xl px-5 py-3" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(232,93,4,0.08))', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Star className="w-4 h-4 flex-shrink-0" style={{ color: '#f59e0b' }} />
              <p className="text-sm font-bold text-white">
                Fairness-Preis: 0,5 l ehrliches Bier für nur <span className="font-black" style={{ color: '#f59e0b' }}>4,00 €</span>
              </p>
            </div>
          </motion.div>

          {/* ── CREW-DEAL ────────────────────────────────────── */}
          <motion.div {...fadeUp(0.4)}>
            <div className="relative rounded-2xl p-8 sm:p-10 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(232,93,4,0.04))', border: '1px solid rgba(245,158,11,0.15)' }}>
              <h2 className="text-lg font-black mb-2 uppercase tracking-wide text-white">Crew-Deal: Ticket gegen Hilfe</h2>
              <p className="text-base mb-7" style={{ color: 'rgba(255,255,255,0.55)' }}>Dein Budget ist knapp? Werde Teil meiner Crew!</p>
              <div className="grid sm:grid-cols-2 gap-4 mb-7">
                <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs uppercase tracking-widest mb-2 font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>Dein Einsatz</p>
                  <p className="font-black text-white">2,5 h Theke oder Service</p>
                </div>
                <div className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="text-xs uppercase tracking-widest mb-2 font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>Dein Benefit</p>
                  <p className="font-black text-white">Freies Ticket für den restlichen Abend</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 text-sm font-bold" style={{ color: '#f59e0b' }}>
                  <Clock className="w-4 h-4" />
                  Deadline: 15.07.
                </div>
                <a
                  href="mailto:kontakt.dyd@googlemail.com?subject=Crew"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all hover:scale-105"
                  style={{ backgroundColor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
                >
                  <Mail className="w-4 h-4" />
                  Betreff „Crew" schreiben
                </a>
              </div>
            </div>
          </motion.div>

          {/* ── TICKETS ──────────────────────────────────────── */}
          <motion.div {...fadeUp(0.45)} id="tickets">
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Tickets</h2>
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>
            <p className="text-center text-base mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Mit deinem Kauf unterstützt du direkt DYD und meine Arbeit für faire Ausbildungschancen.
            </p>

            {error && (
              <div className="mb-6 p-4 rounded-xl text-sm text-center font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <div className="space-y-3">
              {TICKETS.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  whileHover={{ x: 4 }}
                  className="relative flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl p-6 transition-all duration-300"
                  style={ticket.highlight ? {
                    background: 'linear-gradient(135deg, rgba(232,93,4,0.14), rgba(245,158,11,0.08))',
                    border: '1px solid rgba(232,93,4,0.3)',
                    boxShadow: '0 0 40px rgba(232,93,4,0.08)',
                  } : {
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  {ticket.badge && (
                    <span
                      className="absolute -top-3 left-5 px-3 py-1 rounded-full text-white text-xs font-black uppercase tracking-wide"
                      style={{ backgroundColor: ticket.badge === 'Limitiert' ? '#f59e0b' : '#e85d04', boxShadow: `0 0 12px ${ticket.badge === 'Limitiert' ? 'rgba(245,158,11,0.5)' : 'rgba(232,93,4,0.5)'}` }}
                    >
                      {ticket.badge}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-white text-base uppercase tracking-wide mb-1">{ticket.label}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{ticket.description}</p>
                    {'perk' in ticket && ticket.perk && (
                      <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <Trophy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                        <span className="text-xs font-black uppercase" style={{ color: '#f59e0b' }}>{ticket.perk}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 flex-shrink-0">
                    <span className="text-2xl font-black" style={{ color: ticket.highlight ? '#f59e0b' : 'rgba(255,255,255,0.8)' }}>
                      {ticket.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </span>
                    <button
                      onClick={() => handleBuyTicket(ticket)}
                      disabled={loadingTicketId !== null}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
                      style={ticket.highlight ? {
                        background: 'linear-gradient(135deg, #e85d04, #f59e0b)',
                        color: 'white',
                        boxShadow: '0 0 20px rgba(232,93,4,0.35)',
                      } : {
                        backgroundColor: 'rgba(255,255,255,0.07)',
                        color: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(255,255,255,0.12)',
                      }}
                    >
                      {loadingTicketId === ticket.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Laden...</>
                      ) : (
                        <>Kaufen<ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.25)' }}>
              Sichere Zahlung über Stripe · Du wirst nach dem Kauf per E-Mail benachrichtigt
            </p>
          </motion.div>

          {/* ── HARD FACTS ───────────────────────────────────── */}
          <motion.div {...fadeUp(0.5)}>
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
              <h2 className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>Hard Facts</h2>
              <div className="h-px flex-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {[
                { icon: MapPin, label: 'Location', value: 'Klub Kulb\nBurgplatz, Düsseldorf', color: '#e85d04' },
                { icon: Clock, label: 'Zeit', value: '22.08.2026\n18:00 – 02:00 Uhr', color: '#f59e0b' },
                { icon: Users, label: 'Einlass', value: 'Ab 18 Jahren\nAwareness-Team vor Ort', color: '#10b981' },
              ].map((item, i) => (
                <div key={i} className="rounded-xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <item.icon className="w-5 h-5 mb-3" style={{ color: item.color }} />
                  <p className="text-xs uppercase tracking-widest mb-1 font-black" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</p>
                  <p className="font-black text-sm text-white whitespace-pre-line leading-relaxed">{item.value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-black text-white uppercase tracking-widest text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, #e85d04, #f59e0b)', boxShadow: '0 0 40px rgba(232,93,4,0.3)' }}
            >
              <Ticket className="w-5 h-5" />
              Jetzt Ticket kaufen
            </button>
          </motion.div>

        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div className="relative z-10 py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/')} className="text-sm font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
          &larr; Zurück zu DYD
        </button>
      </div>
    </div>
  );
}
