import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
  ChevronDown,
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
    accent: '#e85d04',
  },
  {
    id: 'concert',
    priceId: import.meta.env.VITE_STRIPE_HARMONY_CONCERT,
    label: 'Live Konzert Zirkel.WTF',
    price: 17.50,
    description: 'Norddeutschlands Pop-Punk-Hoffnung hautnah. Moderne Beats, Skater-Vibe, ehrliche Texte.',
    highlight: false,
    badge: null,
    accent: '#e85d04',
  },
  {
    id: 'standup',
    priceId: import.meta.env.VITE_STRIPE_HARMONY_STANDUP,
    label: 'Stand-Up Comedy',
    price: 17.50,
    description: '5–6 Newcomer aus der lokalen Stand-Up Comedy Szene.',
    highlight: false,
    badge: null,
    accent: '#f59e0b',
  },
  {
    id: 'dj',
    priceId: import.meta.env.VITE_STRIPE_HARMONY_DJ,
    label: 'DJ Sets House / Techno',
    price: 8.50,
    description: 'Lokale DJs für die Club Night – House & Techno bis in den Morgen.',
    highlight: false,
    badge: null,
    accent: '#06b6d4',
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
    accent: '#10b981',
  },
];

const ACTS = [
  { num: '01', icon: Laugh, label: 'Stand-Up Comedy', sub: 'Newcomer der lokalen Szene', time: '17:00', color: '#f59e0b' },
  { num: '02', icon: Trophy, label: 'Bierpong Turnier', sub: 'Gewinnen = free drinks', time: '18:00', color: '#10b981' },
  { num: '03', icon: Mic, label: 'Zirkel.WTF Live', sub: 'Pop-Punk aus Hamburg', time: '20:00', color: '#e85d04' },
  { num: '04', icon: Disc3, label: 'DJ Sets', sub: 'House & Techno bis 02:00', time: '21:30', color: '#06b6d4' },
];

const tickerText = 'LASS UNS SCHAUN WAS UNS VERBINDET UND NICHT WAS UNS TRENNT';
const tickerActs = 'ZIRKEL.WTF · STAND-UP COMEDY · BIERPONG TURNIER · DJ HOUSE & TECHNO · LIVE BAND · 22.08.2026';

export default function HarmonyFestivalPage() {
  const navigate = useNavigate();
  const [loadingTicketId, setLoadingTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const heroImgY = useTransform(scrollY, [0, 700], [0, 140]);
  const heroTextOpacity = useTransform(scrollY, [0, 350], [1, 0]);
  const heroTextY = useTransform(scrollY, [0, 350], [0, -60]);

  useEffect(() => {
    const target = new Date('2026-08-22T18:00:00');
    const update = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

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
      setError(err.message || 'Ein Fehler ist aufgetreten.');
      setLoadingTicketId(null);
    }
  };

  const urlParams = new URLSearchParams(window.location.search);
  const paymentStatus = urlParams.get('payment');

  const inView = {
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-60px' },
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  };

  const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center">
      <div className="relative overflow-hidden" style={{ minWidth: '3rem' }}>
        <AnimatePresence mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: -28, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 28, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="block text-center font-black tabular-nums"
            style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: '#f59e0b', fontFamily: "'Barlow Condensed', sans-serif", lineHeight: 1 }}
          >
            {String(value).padStart(2, '0')}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-xs uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.35)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.15em' }}>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen text-white relative overflow-x-hidden" style={{ backgroundColor: '#080808' }}>
      <style>{`
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker-fwd {
          animation: ticker 30s linear infinite;
          display: flex;
          width: max-content;
        }
        .animate-ticker-rev {
          animation: ticker 40s linear infinite reverse;
          display: flex;
          width: max-content;
        }
        @keyframes shimmer-border {
          0%   { opacity: 0.4; }
          50%  { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .shimmer-card {
          animation: shimmer-border 3s ease-in-out infinite;
        }
        @keyframes pulse-ring {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
        }
        .pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
        .festival-display {
          font-family: 'Barlow Condensed', sans-serif;
          font-weight: 900;
        }
        @keyframes slow-drift {
          0%, 100% { transform: translate(0,0); }
          33%       { transform: translate(30px, -20px); }
          66%       { transform: translate(-20px, 15px); }
        }
        .drift-1 { animation: slow-drift 18s ease-in-out infinite; }
        .drift-2 { animation: slow-drift 25s ease-in-out infinite reverse; }
      `}</style>

      {/* ── AMBIENT BACKGROUND ORBS ─────────────────────────── */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
          backgroundSize: '100px 100px',
        }} />
        <div className="drift-1 absolute" style={{ top: '-10%', left: '-5%', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(232,93,4,0.12), transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div className="drift-2 absolute" style={{ bottom: '10%', right: '-5%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(6,182,212,0.08), transparent 70%)', borderRadius: '50%', filter: 'blur(80px)' }} />
        <div className="drift-1 absolute" style={{ top: '40%', left: '40%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(245,158,11,0.06), transparent 70%)', borderRadius: '50%', filter: 'blur(60px)' }} />
      </div>

      {/* ── NAV ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50" style={{ backgroundColor: 'rgba(8,8,8,0.8)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 group" style={{ color: 'rgba(255,255,255,0.45)' }}>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-sm font-medium group-hover:text-white transition-colors">DYD</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="festival-display text-sm tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>22.08.2026</span>
              <button
                onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #e85d04, #f59e0b)', color: 'white', boxShadow: '0 0 24px rgba(232,93,4,0.45)' }}
              >
                <Ticket className="w-3 h-3" />
                Tickets
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Payment success */}
      {paymentStatus === 'success' && (
        <div className="fixed top-14 inset-x-0 z-40" style={{ backgroundColor: 'rgba(16,185,129,0.12)', borderBottom: '1px solid rgba(16,185,129,0.25)', backdropFilter: 'blur(12px)' }}>
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <p className="text-emerald-300 text-sm">Zahlung erfolgreich! Dein Ticket wird per E-Mail zugeschickt.</p>
          </div>
        </div>
      )}

      {/* ── HERO ─────────────────────────────────────────────── */}
      <div ref={heroRef} className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Parallax background image */}
        <motion.div className="absolute inset-0 z-0" style={{ y: heroImgY }}>
          <img
            src="/22.08.2026_(2).jpg"
            alt="Harmony Festival"
            className="w-full h-full object-cover"
            style={{ objectPosition: 'center 25%', transform: 'scale(1.15)' }}
          />
        </motion.div>

        {/* Overlay layers */}
        <div className="absolute inset-0 z-1" style={{ background: 'linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.55) 50%, rgba(8,8,8,1) 100%)' }} />
        <div className="absolute inset-0 z-1" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(232,93,4,0.18), transparent 65%)' }} />

        {/* Hero content */}
        <motion.div
          className="relative z-10 text-center px-4 pt-14"
          style={{ opacity: heroTextOpacity, y: heroTextY }}
        >
          {/* Location badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full"
            style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)' }}
          >
            <MapPin className="w-3.5 h-3.5" style={{ color: '#e85d04' }} />
            <span className="text-xs font-bold uppercase tracking-widest text-white">Düsseldorf Burgplatz · 18:00 – 02:00</span>
          </motion.div>

          {/* Giant HARMONY title */}
          <motion.h1
            initial={{ opacity: 0, y: 60, letterSpacing: '0.12em' }}
            animate={{ opacity: 1, y: 0, letterSpacing: '-0.02em' }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="festival-display block uppercase leading-none"
            style={{
              fontSize: 'clamp(72px, 16vw, 180px)',
              color: 'white',
              textShadow: '0 0 120px rgba(232,93,4,0.5), 0 0 40px rgba(232,93,4,0.2)',
            }}
          >
            HARMONY
          </motion.h1>

          {/* Year */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="festival-display tracking-[0.35em] block mt-1"
            style={{ fontSize: 'clamp(28px, 5vw, 52px)', color: '#f59e0b' }}
          >
            2 0 2 6
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mx-auto my-6"
            style={{ height: '1px', maxWidth: '180px', backgroundColor: 'rgba(232,93,4,0.6)' }}
          />

          {/* Countdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="flex items-end justify-center gap-4 sm:gap-8"
          >
            <CountdownUnit value={countdown.days} label="Tage" />
            <span className="font-black pb-5" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 'clamp(20px, 3vw, 36px)' }}>:</span>
            <CountdownUnit value={countdown.hours} label="Std" />
            <span className="font-black pb-5" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 'clamp(20px, 3vw, 36px)' }}>:</span>
            <CountdownUnit value={countdown.minutes} label="Min" />
            <span className="font-black pb-5" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 'clamp(20px, 3vw, 36px)' }}>:</span>
            <CountdownUnit value={countdown.seconds} label="Sek" />
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-10"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase tracking-wider text-sm text-white"
              style={{ background: 'linear-gradient(135deg, #e85d04, #f59e0b)', boxShadow: '0 0 50px rgba(232,93,4,0.5)' }}
            >
              <Ticket className="w-5 h-5" />
              Ticket sichern
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.8 }}
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "'Barlow Condensed', sans-serif" }}>Scroll</span>
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </div>

      {/* ── TICKER BAND 1 (orange) ────────────────────────────── */}
      <div className="relative z-10 overflow-hidden" style={{ backgroundColor: '#e85d04', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="animate-ticker-fwd py-3">
          {[...Array(14)].map((_, i) => (
            <span key={i} className="festival-display text-white text-sm uppercase tracking-widest mx-10 flex-shrink-0">
              {tickerText} &nbsp;✦
            </span>
          ))}
        </div>
      </div>

      {/* ── TICKER BAND 2 (dark) ──────────────────────────────── */}
      <div className="relative z-10 overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="animate-ticker-rev py-2.5">
          {[...Array(14)].map((_, i) => (
            <span key={i} className="festival-display text-xs uppercase tracking-widest mx-10 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {tickerActs} &nbsp;◆
            </span>
          ))}
        </div>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div className="relative z-10 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">

          {/* ── INVITATION QUOTE ─────────────────────────────── */}
          <motion.div {...inView} className="py-24 text-center max-w-2xl mx-auto">
            <p className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight" style={{ color: '#f59e0b', fontFamily: "'Barlow Condensed', sans-serif" }}>
              "
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug -mt-2" style={{ fontFamily: "'Barlow Condensed', sans-serif", color: 'rgba(255,255,255,0.9)' }}>
              Ich lade dich ein in meinen Safe Space am Rhein.
            </p>
            <p className="mt-4 text-base sm:text-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Inspiriert vom Harmony Beach, angetrieben von meiner Vision für DYD. Erlebe Musik, echte Begegnung und mein liebstes Bier aus der Heimat.
            </p>
          </motion.div>

          {/* ── PROGRAMM ─────────────────────────────────────── */}
          <section className="pb-24">
            <motion.div {...inView} className="flex items-baseline gap-6 mb-14">
              <h2 className="festival-display text-xs uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.3)' }}>Das Programm</h2>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <span className="festival-display text-xs tracking-widest" style={{ color: '#e85d04' }}>22.08.2026</span>
            </motion.div>

            <div className="space-y-5">
              {ACTS.map((act, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ x: i % 2 === 0 ? 6 : -6 }}
                  className="relative rounded-2xl overflow-hidden"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: `1px solid rgba(255,255,255,0.06)` }}
                >
                  {/* Colored accent left bar */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: act.color }} />

                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" style={{ background: `radial-gradient(ellipse at ${i % 2 === 0 ? '0%' : '100%'} 50%, ${act.color}10, transparent 60%)` }} />

                  <div className="flex items-center gap-6 px-7 py-6 pl-9">
                    {/* Act number */}
                    <span className="festival-display flex-shrink-0 leading-none" style={{ fontSize: 'clamp(40px, 6vw, 72px)', color: `${act.color}25`, fontWeight: 900, letterSpacing: '-0.02em' }}>
                      {act.num}
                    </span>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-black uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ backgroundColor: `${act.color}15`, color: act.color, border: `1px solid ${act.color}30` }}>
                          {act.time} Uhr
                        </span>
                      </div>
                      <h3 className="festival-display font-black leading-tight" style={{ fontSize: 'clamp(24px, 4vw, 44px)', color: 'white' }}>{act.label}</h3>
                      <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{act.sub}</p>
                    </div>

                    {/* Icon */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${act.color}12`, border: `1px solid ${act.color}20` }}>
                      <act.icon className="w-7 h-7" style={{ color: act.color }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── WARUM HARMONY — MANIFESTO ────────────────────── */}
          <section className="pb-24 relative">
            {/* Vertical orange accent line */}
            <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(to bottom, transparent, rgba(232,93,4,0.3) 30%, rgba(232,93,4,0.3) 70%, transparent)' }} />

            <motion.div {...inView} className="flex items-baseline gap-6 mb-14 pl-6">
              <h2 className="festival-display text-xs uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.3)' }}>Warum Harmony?</h2>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </motion.div>

            {/* 3 pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px mb-12 pl-6" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
              {[
                { n: '01', label: 'Offen für alle', sub: 'Humane Preise, kein VIP-Bullshit' },
                { n: '02', label: 'Nicht kommerziell', sub: 'Authentische Künstler, echte Energie' },
                { n: '03', label: 'You will always remember', sub: 'Mix aus allen Genres, für alle Menschen' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                  className="p-7"
                  style={{ backgroundColor: '#080808' }}
                >
                  <span className="festival-display text-xs" style={{ color: '#e85d04' }}>{item.n}</span>
                  <p className="festival-display font-black text-xl text-white mt-2 mb-1 leading-tight">{item.label}</p>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{item.sub}</p>
                </motion.div>
              ))}
            </div>

            {/* Pull quote */}
            <motion.blockquote
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="pl-10 border-l-4 ml-6"
              style={{ borderColor: '#e85d04' }}
            >
              <p className="festival-display font-black leading-tight mb-4" style={{ fontSize: 'clamp(22px, 4vw, 40px)', color: 'white' }}>
                "Ich habe das Gefühl, wir stecken in Deutschland gerade mitten in einer tiefen Spaltung."
              </p>
              <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Auf Jamaika war es in den 70ern genau das Gleiche – bis die Musik die Menschen wieder zusammengebracht hat. Den Harmony Beach in Montego Bay hat mir die Kraft gegeben, wieder ins Getümmel zu gehen. Genau diesen Ort bringe ich nach Düsseldorf.
              </p>
            </motion.blockquote>
          </section>

          {/* ── DYD MISSION ──────────────────────────────────── */}
          <motion.section
            {...inView}
            className="pb-24"
          >
            <div className="relative rounded-3xl overflow-hidden px-8 sm:px-12 py-12" style={{ background: 'linear-gradient(135deg, rgba(232,93,4,0.15) 0%, rgba(8,8,8,0) 60%)', border: '1px solid rgba(232,93,4,0.2)' }}>
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(232,93,4,0.12), transparent 70%)', transform: 'translate(40%, -40%)' }} />
              <div className="flex items-start gap-4 mb-5">
                <Heart className="w-6 h-6 mt-1 flex-shrink-0" style={{ color: '#e85d04' }} />
                <h2 className="festival-display font-black text-2xl uppercase tracking-wide text-white">DYD – Mehr als nur Feiern</h2>
              </div>
              <p className="text-lg leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Hinter dem Festival steht meine Plattform <strong className="text-white">DYD (Decide Your Dream)</strong>. Ich kämpfe für faire Bewerbungschancen – denn echte Chancen entstehen dort, wo Menschen sich auf Augenhöhe begegnen.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.55)' }}>
                Auf Jobsuche?{' '}
                <button onClick={() => navigate('/cv-check')} className="font-black underline underline-offset-4 transition-colors hover:opacity-80" style={{ color: '#f59e0b' }}>
                  CV checken, optimieren oder erstellen
                </button>{' '}
                – erhöhe deine Chancen auf deinen Traumjob.
              </p>
            </div>
          </motion.section>

          {/* ── FEATURES ─────────────────────────────────────── */}
          <section className="pb-24">
            <motion.div {...inView} className="flex items-baseline gap-6 mb-12">
              <h2 className="festival-display text-xs uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.3)' }}>Was Harmony besonders macht</h2>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </motion.div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: Users, title: 'Für alle', desc: 'Fair, zugänglich und gemeinsam gestaltet – für jede und jeden.', accent: '#f59e0b' },
                { icon: Mic, title: 'Neue Talente', desc: 'Eine Bühne für lokale Künstlerinnen und Künstler, die gehört werden wollen.', accent: '#e85d04' },
                { icon: Handshake, title: 'Offene Räume', desc: 'Begegnung, Workshops und kultureller Austausch in entspannter Atmosphäre.', accent: '#10b981' },
                { icon: Music, title: 'Musik & Miteinander', desc: 'Nicht kommerziell ausgeschlachtet – Fokus auf echte Verbindung.', accent: '#06b6d4' },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.08 }}
                  whileHover={{ y: -5, borderColor: `${f.accent}35` }}
                  className="rounded-2xl p-6 flex gap-5 items-start cursor-default transition-all duration-300"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: `${f.accent}15` }}>
                    <f.icon className="w-5 h-5" style={{ color: f.accent }} />
                  </div>
                  <div>
                    <h3 className="festival-display font-black text-base text-white mb-1 uppercase tracking-wide">{f.title}</h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── BIER-BRÜCKE ──────────────────────────────────── */}
          <motion.section {...inView} className="pb-24">
            <div className="relative rounded-3xl overflow-hidden px-8 sm:px-12 py-12" style={{ backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 80% 50%, rgba(245,158,11,0.07), transparent 70%)' }} />
              <div className="flex items-center gap-3 mb-6">
                <Beer className="w-6 h-6 flex-shrink-0" style={{ color: '#f59e0b' }} />
                <h2 className="festival-display font-black text-2xl uppercase tracking-wide text-white">Die Bier-Brücke</h2>
              </div>
              <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
                Als Fürther bringe ich echtes Handwerk aus meiner Heimat mit nach Düsseldorf:
              </p>
              <div className="flex flex-wrap gap-3 mb-8">
                {['Grüner Bier', 'Hofmann', 'Greif Bräu'].map((brand) => (
                  <motion.span
                    key={brand}
                    whileHover={{ scale: 1.07, backgroundColor: 'rgba(245,158,11,0.2)' }}
                    className="px-5 py-2 rounded-full festival-display font-black text-sm uppercase tracking-wide cursor-default transition-colors"
                    style={{ backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
                  >
                    {brand}
                  </motion.span>
                ))}
              </div>
              {/* Big price feature */}
              <div className="flex items-end gap-4">
                <span className="festival-display font-black leading-none" style={{ fontSize: 'clamp(56px, 10vw, 96px)', color: '#f59e0b' }}>4,00 €</span>
                <span className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>pro 0,5 l · <span className="font-bold text-white">Fairness-Preis</span></span>
              </div>
            </div>
          </motion.section>

          {/* ── CREW-DEAL ────────────────────────────────────── */}
          <motion.section {...inView} className="pb-24">
            <div className="relative rounded-3xl overflow-hidden px-8 sm:px-12 py-12" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(232,93,4,0.04))', border: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
                <div>
                  <h2 className="festival-display font-black text-2xl uppercase tracking-wide text-white mb-2">Crew-Deal: Ticket gegen Hilfe</h2>
                  <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>Dein Budget ist knapp? Werde Teil meiner Crew!</p>
                </div>
                <span className="self-start px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide" style={{ backgroundColor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                  Spots limitiert
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="festival-display text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Dein Einsatz</p>
                  <p className="festival-display font-black text-xl text-white">2,5 h Theke oder Service</p>
                </div>
                <div className="rounded-2xl p-6" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <p className="festival-display text-xs uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>Dein Benefit</p>
                  <p className="festival-display font-black text-xl text-white">Freies Ticket für den restlichen Abend</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <motion.div
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="flex items-center gap-2 text-sm font-bold"
                  style={{ color: '#f59e0b' }}
                >
                  <Clock className="w-4 h-4" />
                  Deadline: 15.07.
                </motion.div>
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  href="mailto:kontakt.dyd@googlemail.com?subject=Crew"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black uppercase tracking-wide transition-all"
                  style={{ backgroundColor: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#f59e0b' }}
                >
                  <Mail className="w-4 h-4" />
                  Betreff „Crew" schreiben
                </motion.a>
              </div>
            </div>
          </motion.section>

          {/* ── TICKETS ──────────────────────────────────────── */}
          <section className="pb-24" id="tickets">
            <motion.div {...inView} className="flex items-baseline gap-6 mb-6">
              <h2 className="festival-display text-xs uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.3)' }}>Tickets</h2>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
              <span className="festival-display text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>22.08.2026</span>
            </motion.div>

            {/* Pulsing ticket icon */}
            <motion.div {...inView} className="text-center mb-10">
              <div className="relative inline-flex items-center justify-center mb-4">
                <div className="pulse-ring absolute w-12 h-12 rounded-full" style={{ backgroundColor: 'rgba(232,93,4,0.3)' }} />
                <div className="relative w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(232,93,4,0.15)', border: '1px solid rgba(232,93,4,0.3)' }}>
                  <Ticket className="w-5 h-5" style={{ color: '#e85d04' }} />
                </div>
              </div>
              <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Mit deinem Kauf unterstützt du direkt DYD und meine Arbeit für faire Ausbildungschancen.
              </p>
            </motion.div>

            {error && (
              <div className="mb-6 p-4 rounded-xl text-sm text-center font-medium" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <div className="space-y-3">
              {TICKETS.map((ticket, i) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.07 }}
                  whileHover={{ x: 5 }}
                  className={`relative flex flex-col sm:flex-row sm:items-center gap-5 rounded-2xl p-6 transition-all duration-300 ${ticket.highlight ? 'shimmer-card' : ''}`}
                  style={ticket.highlight ? {
                    background: 'linear-gradient(135deg, rgba(232,93,4,0.16), rgba(245,158,11,0.08))',
                    border: '2px solid rgba(232,93,4,0.4)',
                    boxShadow: '0 0 50px rgba(232,93,4,0.1)',
                  } : {
                    backgroundColor: 'rgba(255,255,255,0.025)',
                    borderLeft: `3px solid ${ticket.accent}`,
                    border: `1px solid rgba(255,255,255,0.05)`,
                    borderLeftColor: ticket.accent,
                  }}
                >
                  {ticket.badge && (
                    <span
                      className="absolute -top-3 left-5 px-3 py-1 rounded-full text-white text-xs font-black uppercase tracking-wide"
                      style={{ backgroundColor: ticket.badge === 'Limitiert' ? '#f59e0b' : '#e85d04', boxShadow: `0 0 14px ${ticket.badge === 'Limitiert' ? 'rgba(245,158,11,0.6)' : 'rgba(232,93,4,0.6)'}` }}
                    >
                      {ticket.badge}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="festival-display font-black text-white uppercase tracking-wide mb-1" style={{ fontSize: 'clamp(16px, 2.5vw, 22px)' }}>{ticket.label}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{ticket.description}</p>
                    {'perk' in ticket && ticket.perk && (
                      <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
                        <Trophy className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                        <span className="festival-display text-xs font-black uppercase tracking-wide" style={{ color: '#f59e0b' }}>{ticket.perk}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-4 flex-shrink-0">
                    <span className="festival-display font-black" style={{ fontSize: ticket.highlight ? 'clamp(28px, 4vw, 40px)' : '26px', color: ticket.highlight ? '#f59e0b' : 'rgba(255,255,255,0.85)' }}>
                      {ticket.price.toLocaleString('de-DE', { minimumFractionDigits: 2 })} €
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleBuyTicket(ticket)}
                      disabled={loadingTicketId !== null}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl festival-display font-black text-sm uppercase tracking-wide transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={ticket.highlight ? {
                        background: 'linear-gradient(135deg, #e85d04, #f59e0b)',
                        color: 'white',
                        boxShadow: '0 0 24px rgba(232,93,4,0.4)',
                      } : {
                        backgroundColor: 'rgba(255,255,255,0.07)',
                        color: 'rgba(255,255,255,0.8)',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      {loadingTicketId === ticket.id ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Laden...</>
                      ) : (
                        <>Kaufen<ArrowRight className="w-4 h-4" /></>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Sichere Zahlung über Stripe · Du wirst nach dem Kauf per E-Mail benachrichtigt
            </p>
          </section>

          {/* ── HARD FACTS ───────────────────────────────────── */}
          <motion.section {...inView} className="pb-8">
            <div className="flex items-baseline gap-6 mb-10">
              <h2 className="festival-display text-xs uppercase tracking-[0.3em]" style={{ color: 'rgba(255,255,255,0.3)' }}>Hard Facts</h2>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            </div>
            <div className="grid sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: MapPin, label: 'Location', value: 'Klub Kulb\nBurgplatz, Düsseldorf', color: '#e85d04' },
                { icon: Clock, label: 'Zeit', value: '22.08.2026\n18:00 – 02:00 Uhr', color: '#f59e0b' },
                { icon: Users, label: 'Einlass', value: 'Ab 18 Jahren\nAwareness-Team vor Ort', color: '#10b981' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  whileHover={{ borderColor: `${item.color}30` }}
                  className="rounded-2xl p-6 transition-all duration-300"
                  style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <item.icon className="w-5 h-5 mb-3" style={{ color: item.color }} />
                  <p className="festival-display text-xs uppercase tracking-widest mb-1.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{item.label}</p>
                  <p className="festival-display font-black text-white whitespace-pre-line leading-snug" style={{ fontSize: '17px' }}>{item.value}</p>
                </motion.div>
              ))}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl festival-display font-black text-white uppercase tracking-widest"
              style={{ background: 'linear-gradient(135deg, #e85d04, #f59e0b)', boxShadow: '0 0 50px rgba(232,93,4,0.35)', fontSize: '16px' }}
            >
              <Ticket className="w-5 h-5" />
              Jetzt Ticket kaufen · 22.08.2026
            </motion.button>
          </motion.section>

        </div>
      </div>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <div className="relative z-10 py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className="h-px w-16" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
          <span className="festival-display text-xs uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>Harmony 2026</span>
          <div className="h-px w-16" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />
        </div>
        <button onClick={() => navigate('/')} className="text-xs font-medium transition-colors hover:text-white" style={{ color: 'rgba(255,255,255,0.25)', fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          ← Zurück zu DYD
        </button>
      </div>

      {/* ── BOTTOM STICKY CTA (mobile) ───────────────────────── */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 2, duration: 0.6 }}
        className="fixed bottom-0 inset-x-0 z-40 sm:hidden p-4"
        style={{ background: 'linear-gradient(to top, rgba(8,8,8,0.98), rgba(8,8,8,0))' }}
      >
        <button
          onClick={() => document.getElementById('tickets')?.scrollIntoView({ behavior: 'smooth' })}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl festival-display font-black text-white uppercase tracking-wider text-sm"
          style={{ background: 'linear-gradient(135deg, #e85d04, #f59e0b)', boxShadow: '0 0 30px rgba(232,93,4,0.4)' }}
        >
          <Ticket className="w-4 h-4" />
          Ticket sichern – ab 8,50 €
        </button>
      </motion.div>
    </div>
  );
}
