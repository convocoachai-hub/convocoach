'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, X, Lock, ArrowRight, ChevronDown, Zap, Star as StarIcon, Shield } from 'lucide-react';

declare global { interface Window { Razorpay: any; } }

// ─── DESIGN TOKENS — Neo-Brutalism × Memphis ─────────────────────────────────
const C = {
  yellow:    '#FFD84D',
  red:       '#FF4D4D',
  blue:      '#4F46E5',
  green:     '#22C55E',
  pink:      '#FF6FD8',
  black:     '#0D0D0D',
  white:     '#FFFFFF',
  bgCream:   '#FFF7E6',
  bgBlue:    '#EAF0FF',
  bgYellow:  '#FFFBEA',
  bgPink:    '#FFF0FA',
  bgGreen:   '#EDFFF5',
  shadow:    '6px 6px 0px #0D0D0D',
  shadowLg:  '8px 8px 0px #0D0D0D',
  shadowSm:  '4px 4px 0px #0D0D0D',
  border:    '3px solid #0D0D0D',
  borderThin:'2px solid #0D0D0D',
};

const SNAP = { duration: 0.18, ease: [0.2, 0, 0.2, 1] } as const;

// ─── GEOMETRIC DECORATORS ─────────────────────────────────────────────────────
const Dot = ({ size = 10, color = C.yellow, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: color, border: `2px solid ${C.black}`, flexShrink: 0, ...style }} />
);
const Squiggle = ({ color = C.yellow, style = {} }) => (
  <svg width="48" height="16" viewBox="0 0 48 16" fill="none" style={style}>
    <path d="M2 8 C8 2, 14 14, 20 8 S32 2, 38 8 S44 14, 46 8" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
);
const Star = ({ size = 20, color = C.yellow, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={style}>
    <polygon points="10,1 12.2,7.4 19,7.4 13.6,11.6 15.8,18 10,14 4.2,18 6.4,11.6 1,7.4 7.8,7.4" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);
const Triangle = ({ size = 18, color = C.red, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" style={style}>
    <polygon points="9,2 17,16 1,16" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);

// ─── REVEAL & UI COMPONENTS ───────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.22, delay, ease: [0.2, 0, 0.2, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function Label({ text, color = C.yellow }: { text: string; color?: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
      <div style={{ width: 12, height: 12, background: color, border: C.border, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", color: C.black }}>
        {text}
      </span>
    </div>
  );
}

function Badge({ text, color = C.yellow, textColor = C.black, rotate = -2 }: { text: string; color?: string; textColor?: string; rotate?: number }) {
  return (
    <span style={{
      display: 'inline-block', background: color, color: textColor,
      border: C.borderThin, borderRadius: 8, padding: '4px 10px',
      fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
      fontFamily: "'DM Sans', sans-serif", transform: `rotate(${rotate}deg)`,
      boxShadow: C.shadowSm, flexShrink: 0,
    }}>{text}</span>
  );
}

// ─── PRICES & DATA ────────────────────────────────────────────────────────────
interface PriceTier { symbol: string; monthly: string; yearly: string; lifetime: string }
const PRICES: Record<string, PriceTier> = {
  INR: { symbol: '₹',   monthly: '99',   yearly: '1,000', lifetime: '3,999' },
  USD: { symbol: '$',   monthly: '1.99', yearly: '19.99', lifetime: '69.99' },
  EUR: { symbol: '€',   monthly: '1.99', yearly: '19.99', lifetime: '69.99' },
  GBP: { symbol: '£',   monthly: '1.79', yearly: '17.99', lifetime: '59.99' },
  CAD: { symbol: '$',   monthly: '2.69', yearly: '26.99', lifetime: '89.99' },
  AUD: { symbol: '$',   monthly: '2.99', yearly: '29.99', lifetime: '99.99' },
  JPY: { symbol: '¥',   monthly: '300',  yearly: '2,980', lifetime: '9,980' },
  SGD: { symbol: '$',   monthly: '2.69', yearly: '26.99', lifetime: '89.99' },
  AED: { symbol: 'د.إ', monthly: '7.30', yearly: '73',    lifetime: '249'   },
  BRL: { symbol: 'R$',  monthly: '9.90', yearly: '99.90', lifetime: '349'   },
  MXN: { symbol: '$',   monthly: '34',   yearly: '339',   lifetime: '1,199' },
};

const COMPARISON = [
  { feature: 'Chat analyses',            free: '5 total',  pro: 'Unlimited' },
  { feature: 'Attraction score',         free: 'Basic',    pro: 'Full + history' },
  { feature: 'Score breakdown (8 areas)', free: 'Summary',  pro: 'Full detail' },
  { feature: 'Psychological signals',    free: false,      pro: true },
  { feature: 'Power dynamics',           free: false,      pro: true },
  { feature: 'Missed opportunities',     free: '1 shown',  pro: 'All shown' },
  { feature: 'AI reply rewrites',        free: '1 style',  pro: '3 styles' },
  { feature: 'Strategy & next steps',    free: false,      pro: true },
  { feature: 'Red flag detection',       free: false,      pro: true },
  { feature: 'Practice characters',      free: '2 only',   pro: 'All 10+' },
  { feature: 'Live AI coaching checks',  free: '3 checks', pro: 'Unlimited' },
];

const TESTIMONIALS = [
  { name: 'Alex M.',   loc: 'Toronto',   text: 'She started initiating after I fixed my double-texting. This thing was brutally accurate.', color: C.red },
  { name: 'Rahul S.',  loc: 'Mumbai',    text: 'I missed three signals. Three. It spelled them out. Changed how I read everything.', color: C.blue },
  { name: 'Jordan K.', loc: 'London',    text: "Best two dollars I've spent this year. My reply rate went up noticeably in a week.", color: C.green },
  { name: 'Priya R.',  loc: 'Singapore', text: 'Used it on a work negotiation thread. Saw I was being passive. Renegotiated and won.', color: C.yellow },
];

const FAQS = [
  { q: 'Why is it only $1.99?',        a: 'This is early access pricing. We want real users to test the AI before we scale. Everyone who joins now locks this rate in permanently — it will go up soon.' },
  { q: 'Are my screenshots stored?',   a: 'Absolutely not. Images are processed entirely in memory to extract text and are discarded immediately. We never save or see your private conversations.' },
  { q: 'Can I cancel anytime?',        a: 'Yes. It takes exactly one click in your dashboard settings. No cancellation fees, no retention forms, no questions asked.' },
  { q: 'Does this work for non-dating?', a: '100%. Professional negotiations, friendships, resolving family arguments — the underlying psychological and emotional signals are universal.' },
];

const SIGNALS = [
  'She asked a follow-up question — you ignored the thread',
  'Her response time dropped from 2hrs → 4min — a clear interest spike',
  'She used your exact phrasing back — subconscious mirroring',
];

// ─── HOOKS ────────────────────────────────────────────────────────────────────
function useCurrency() {
  const [c, setC] = useState('USD');
  useEffect(() => {
    try {
      const l = Intl.DateTimeFormat().resolvedOptions().locale.toUpperCase();
      if (l.includes('IN'))      setC('INR');
      else if (l.includes('GB')) setC('GBP');
      else if (l.includes('CA')) setC('CAD');
      else if (l.includes('AU')) setC('AUD');
      else if (l.includes('JP')) setC('JPY');
      else if (l.includes('SG')) setC('SGD');
      else if (l.includes('AE')) setC('AED');
      else if (l.includes('BR')) setC('BRL');
      else if (l.includes('MX')) setC('MXN');
      else if (['FR','DE','IT','ES','EU'].some(x => l.includes(x))) setC('EUR');
    } catch {}
  }, []);
  return c;
}

function Num({ n, suffix = '' }: { n: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        const t0 = Date.now();
        const tick = () => {
          const p = Math.min((Date.now() - t0) / 2000, 1);
          setVal(Math.floor((1 - Math.pow(1 - p, 4)) * n));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [n]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── CHAT MOCKUP (BRUTALIST) ──────────────────────────────────────────────────
function ChatMockup() {
  const bubble = (msg: string, side: 'l' | 'r', delay: number) => (
    <motion.div key={msg} initial={{ opacity: 0, x: side === 'l' ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.45, ease: [0.16,1,0.3,1] }}
      style={{ display: 'flex', justifyContent: side === 'r' ? 'flex-end' : 'flex-start' }}>
      <div style={{
        background: side === 'l' ? C.white : C.black,
        color: side === 'l' ? C.black : C.white,
        borderRadius: side === 'l' ? '12px 12px 12px 0px' : '12px 12px 0px 12px',
        border: C.borderThin,
        padding: '10px 14px', maxWidth: '85%',
        fontSize: 13, lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
        boxShadow: C.shadowSm,
      }}>{msg}</div>
    </motion.div>
  );

  const tag = (text: string, color: string, delay: number, align: 'l'|'r' = 'l') => (
    <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35 }}
      style={{ display: 'flex', justifyContent: align === 'r' ? 'flex-end' : 'flex-start' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: C.white, border: `2px solid ${color}`,
        borderRadius: 100, padding: '4px 10px', boxShadow: `2px 2px 0px ${color}`
      }}>
        {align === 'l' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'block', flexShrink: 0 }} />}
        <span style={{ fontSize: 10, fontWeight: 900, color: C.black, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'DM Sans', sans-serif" }}>{text}</span>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.9, ease: [0.16,1,0.3,1] }}
      style={{ width: '100%', maxWidth: 320, flexShrink: 0, transform: 'rotate(-2deg)' }}>
      <div style={{
        background: C.bgCream, border: C.border,
        borderRadius: 24, padding: '20px 16px',
        boxShadow: C.shadowLg,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: C.borderThin }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.yellow, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: C.black }}>S</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.black, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>Sofia</div>
            <div style={{ fontSize: 11, color: '#666', fontWeight: 600 }}>Active now</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 10, height: 10, borderRadius: '50%', background: C.green, border: '2px solid #000' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {bubble("omg same, that's so funny 😭", 'l', 0.7)}
          {tag('Humor mirroring', C.blue, 1.0)}
          {bubble("haha yeah it's wild", 'r', 1.25)}
          {tag('⚠ Missed opportunity', C.red, 1.55, 'r')}
          {bubble('so what are you up to this weekend? 👀', 'l', 1.85)}
          {tag('Invite signal — respond now', C.green, 2.15)}
        </div>

        {/* Locked premium */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          style={{ marginTop: 16, position: 'relative', background: C.black, border: C.borderThin, borderRadius: 16, padding: '16px', overflow: 'hidden' }}>
          <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
            <div style={{ fontSize: 13, fontWeight: 900, color: C.white, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>Attraction: 78%</div>
            <div style={{ fontSize: 12, color: '#AAA', lineHeight: 1.5, fontWeight: 500 }}>
              Optimal: vulnerability + callback<br />Momentum: Accelerating ↑
            </div>
          </div>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${C.black} 65%, transparent)`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 900, color: C.yellow, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'DM Sans', sans-serif" }}>
              <Lock style={{ width: 12, height: 12 }} /> Premium Insight
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────────
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: C.borderThin, background: open ? C.white : 'transparent', transition: 'background 0.2s' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 20px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.black, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{q}</span>
        <ChevronDown style={{ width: 20, height: 20, color: C.red, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
            <p style={{ padding: '0 20px 24px', fontSize: 15, color: '#444', lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", margin: 0, fontWeight: 500 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const currency = useCurrency();
  const price = PRICES[currency] || PRICES['USD'];

  const handlePayment = async (planType: 'monthly' | 'yearly' | 'lifetime' = 'monthly') => {
    if (!session?.user) { signIn('google', { callbackUrl: '/upgrade' }); return; }
    setLoading(true);
    try {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      const order = await fetch('/api/payment/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency, planType }),
      }).then(r => r.json());
      if (!order.orderId) throw new Error('No order');
      await new Promise<void>(res => { script.onload = () => res(); });
      new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: 'ConvoCoach', description: order.description, order_id: order.orderId,
        prefill: { name: session.user.name, email: session.user.email },
        theme: { color: C.red },
        handler: async (response: any) => {
          const r = await fetch('/api/payment/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...response, planType }),
          }).then(r => r.json());
          if (r.success) router.push('/payment-success');
        },
      }).open();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const RedBtn = ({ label: btnLabel, full = false, plan = 'monthly' as 'monthly' | 'yearly' | 'lifetime' }: { label: string; full?: boolean; plan?: 'monthly' | 'yearly' | 'lifetime' }) => (
    <motion.button onClick={() => handlePayment(plan)} disabled={loading}
      whileHover={{ y: -3, boxShadow: C.shadowLg }}
      whileTap={{ y: 1, boxShadow: '2px 2px 0px #0D0D0D' }}
      transition={SNAP}
      style={{
        background: C.red, color: '#fff', border: C.border, borderRadius: 14,
        padding: '16px 36px', fontSize: 16, fontWeight: 900, cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'DM Sans', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 10,
        width: full ? '100%' : 'auto', justifyContent: full ? 'center' : 'flex-start',
        opacity: loading ? 0.7 : 1, boxShadow: C.shadow,
      }}>
      {loading ? 'Processing...' : <>{btnLabel} <ArrowRight style={{ width: 18, height: 18 }} /></>}
    </motion.button>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        * { box-sizing: border-box; }
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden; width: 100%; background: ${C.bgCream}; }
        
        .sticky-mobile { display: none !important; }
        .stats-grid { display: flex; flex-wrap: wrap; border-top: 3px solid #0D0D0D; border-left: 3px solid #0D0D0D; }
        .stats-grid > div { flex: 1 1 200px; border-right: 3px solid #0D0D0D; border-bottom: 3px solid #0D0D0D; }
        .table-grid { display: grid; grid-template-columns: 1fr 100px 120px; align-items: center; border-bottom: 3px solid #0D0D0D; }

        @media (max-width: 900px) {
          .hero-flex { flex-direction: column !important; align-items: center !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .testimonial-grid { grid-template-columns: 1fr !important; }
          .cta-flex { flex-direction: column !important; align-items: flex-start !important; }
        }

        @media (max-width: 640px) {
          .sticky-mobile { display: flex !important; }
          .hero-h1 { font-size: clamp(46px, 12vw, 64px) !important; }
          .section-wrap { padding: 48px 20px !important; }
          .stats-grid > div { flex: 1 1 100%; border-right: none; }
          .big-number { font-size: 120px !important; }
          .signals-flex { flex-direction: column !important; }
          .table-grid { grid-template-columns: 1fr 70px 80px; font-size: 13px !important; }
        }
      `}} />

      {/* ── Mobile sticky bar ─────────────────────────────────────────── */}
      <div className="sticky-mobile" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: C.white, borderTop: C.border,
        padding: '16px 20px', alignItems: 'center', gap: 12,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 900, color: C.red, letterSpacing: '0.1em', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase' }}>Launch Price</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.black, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.1 }}>
            {price.symbol}{price.monthly}<span style={{ fontSize: 13, fontWeight: 600, color: '#666', marginLeft: 4 }}>/mo</span>
          </div>
        </div>
        <button onClick={() => handlePayment('monthly')} disabled={loading} style={{ background: C.red, color: '#fff', border: C.border, borderRadius: 12, padding: '12px 24px', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", flexShrink: 0, boxShadow: C.shadowSm }}>
          {loading ? 'Wait...' : 'Upgrade →'}
        </button>
      </div>

      <div style={{ background: C.bgCream, minHeight: '100vh' }}>

        {/* ════════════════════════════════════════════════════════════════
            HERO — Yellow
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ position: 'relative', background: C.yellow, borderBottom: C.border, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Star size={36} color={C.white} style={{ position: 'absolute', top: '15%', right: '10%' }} />
            <Triangle size={28} color={C.blue} style={{ position: 'absolute', bottom: '25%', left: '5%' }} />
            <Squiggle color={C.red} style={{ position: 'absolute', bottom: '10%', right: '25%' }} />
          </div>

          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 24px' }} className="section-wrap">
            <Reveal>
              <Label text="ConvoCoach Premium" color={C.red} />
            </Reveal>

            <div className="hero-flex" style={{ display: 'flex', alignItems: 'flex-start', gap: 56, marginTop: 12 }}>
              {/* Left */}
              <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.6, ease: [0.16,1,0.3,1] }} style={{ flex: 1, minWidth: 0 }}>
                
                <h1 className="hero-h1" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(64px, 8vw, 96px)', fontWeight: 900, lineHeight: 1.05, color: C.black, margin: 0, letterSpacing: '-0.04em', wordBreak: 'break-word' }}>
                  Stop guessing.<br />
                  <span style={{ background: C.black, color: C.white, padding: '2px 12px', borderRadius: 12, border: C.border, display: 'inline-block', marginTop: 8 }}>
                    Get the blueprint.
                  </span>
                </h1>

                <p style={{ marginTop: 24, fontSize: 17, color: '#333', maxWidth: 480, lineHeight: 1.6, fontWeight: 600 }}>
                  Every conversation holds signals you are actively missing. ConvoCoach Premium runs a brutal 10-layer AI analysis to tell you exactly what happened, what they felt, and what to say next.
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 36, flexWrap: 'wrap' }}>
                  <RedBtn label={session ? 'Start Premium' : 'Sign in & Upgrade'} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: 15, fontWeight: 900, color: C.black }}>{price.symbol}{price.monthly}/mo</span>
                    <span style={{ fontSize: 12, color: '#555', fontWeight: 600 }}>Cancel anytime</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="stats-grid" style={{ marginTop: 48 }}>
                  {[
                    { n: 14200, label: 'chats analyzed', bg: C.white },
                    { n: 94,    label: 'accuracy rating', s: '%', bg: C.bgBlue  },
                    { n: 1247,  label: 'active this week', bg: C.bgGreen },
                  ].map(({ n, label: lbl, s, bg }) => (
                    <div key={lbl} style={{ background: bg, padding: '20px 24px' }}>
                      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 32, fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1 }}>
                        <Num n={n} suffix={s} />
                      </div>
                      <div style={{ fontSize: 12, color: '#444', marginTop: 4, fontWeight: 800 }}>{lbl}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right: tilted chat mockup */}
              <div style={{ flexShrink: 0, paddingRight: 20 }}>
                <ChatMockup />
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            MISSED SIGNALS — Black background, Giant 72%
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.black, borderBottom: C.border }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 24px' }} className="section-wrap">
            <div className="signals-flex" style={{ display: 'flex', alignItems: 'center', gap: 64 }}>

              {/* Giant number */}
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }} style={{ flexShrink: 0 }}>
                <div className="big-number" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(140px, 15vw, 180px)', fontWeight: 900, color: C.red, lineHeight: 0.85, letterSpacing: '-0.05em', textShadow: C.shadow }}>
                  <Num n={72} suffix="%" />
                </div>
              </motion.div>

              {/* Signal list */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
                style={{ flex: 1, minWidth: 280 }}>
                <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, color: C.white, lineHeight: 1.1, marginBottom: 16, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em' }}>
                  of attraction signals go completely unnoticed by average texters.
                </h2>
                <p style={{ fontSize: 16, color: '#AAA', marginBottom: 32, lineHeight: 1.6, fontWeight: 500 }}>
                  You are leaving opportunities on the table. Our Premium AI detects the psychological cues you are blind to.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {SIGNALS.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 14, background: '#1A1A1A', padding: '16px 20px', borderRadius: 14, border: C.borderThin }}>
                      <Zap style={{ width: 20, height: 20, color: C.yellow, flexShrink: 0, marginTop: 2 }} />
                      <span style={{ fontSize: 15, color: C.white, lineHeight: 1.5, fontWeight: 600 }}>{s}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            PRICING — Cream bg
        ════════════════════════════════════════════════════════════════ */}
        <section id="pricing" style={{ background: C.bgCream, borderBottom: C.border }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 24px' }} className="section-wrap">
            <Reveal>
              <Label text="Pricing Plans" color={C.blue} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(42px, 6vw, 64px)', fontWeight: 900, color: C.black, margin: '0 0 48px', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                Choose your edge.
              </h2>
            </Reveal>

            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
              
              {/* Monthly */}
              <Reveal delay={0.1}>
                <div style={{ background: C.white, borderRadius: 24, padding: '32px', border: C.border, boxShadow: C.shadow, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: C.black, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>Monthly</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 48, fontWeight: 900, color: C.black, letterSpacing: '-0.04em', lineHeight: 1 }}>{price.symbol}{price.monthly}</span>
                    <span style={{ fontSize: 15, color: '#666', fontWeight: 600 }}>/mo</span>
                  </div>
                  <div style={{ fontSize: 14, color: '#444', marginBottom: 24, fontWeight: 500 }}>Billed monthly. Cancel anytime.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, paddingTop: 24, borderTop: C.borderThin, flex: 1 }}>
                    {['Unlimited chat analyses', '10-layer psychological breakdown', 'AI reply rewrites (3 styles)', 'All 10+ practice characters'].map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.black, fontWeight: 600 }}>
                        <Check style={{ width: 16, height: 16, color: C.red, flexShrink: 0 }} />{f}
                      </div>
                    ))}
                  </div>
                  <RedBtn label={session ? 'Start Monthly' : 'Sign in to Upgrade'} full />
                </div>
              </Reveal>

              {/* Yearly — Highlighted */}
              <Reveal delay={0.2}>
                <div style={{ background: C.yellow, borderRadius: 24, padding: '32px', border: C.border, boxShadow: C.shadowLg, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'absolute', top: -16, right: 24, background: C.black, color: C.white, fontSize: 11, fontWeight: 900, padding: '8px 16px', borderRadius: 12, letterSpacing: '0.1em', textTransform: 'uppercase', border: C.borderThin }}>Most Popular</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: C.black, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>Yearly</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 48, fontWeight: 900, color: C.black, letterSpacing: '-0.04em', lineHeight: 1 }}>{price.symbol}{price.yearly}</span>
                    <span style={{ fontSize: 15, color: '#444', fontWeight: 600 }}>/year</span>
                  </div>
                  <div style={{ fontSize: 14, color: C.red, fontWeight: 800, marginBottom: 24 }}>Save ~17% vs monthly billing</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, paddingTop: 24, borderTop: C.borderThin, flex: 1 }}>
                    {['Everything in Monthly', 'Score history & performance trends', 'Red flag detection alerts', 'Smart reply generation engine', 'Priority email support'].map((f, i) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.black, fontWeight: i === 0 ? 800 : 600 }}>
                        <Check style={{ width: 16, height: 16, color: C.black, flexShrink: 0 }} />{f}
                      </div>
                    ))}
                  </div>
                  <RedBtn label={session ? 'Start Yearly' : 'Sign in to Upgrade'} full plan="yearly" />
                </div>
              </Reveal>

              {/* Lifetime */}
              <Reveal delay={0.3}>
                <div style={{ background: C.black, borderRadius: 24, padding: '32px', border: C.border, boxShadow: C.shadow, position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'absolute', top: -16, right: 24, background: C.blue, color: C.white, fontSize: 11, fontWeight: 900, padding: '8px 16px', borderRadius: 12, letterSpacing: '0.1em', textTransform: 'uppercase', border: C.borderThin }}>Best Value</div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: C.yellow, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", marginBottom: 12 }}>Lifetime Pro</div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 48, fontWeight: 900, color: C.white, letterSpacing: '-0.04em', lineHeight: 1 }}>{price.symbol}{price.lifetime}</span>
                    <span style={{ fontSize: 15, color: '#888', fontWeight: 600 }}>one-time</span>
                  </div>
                  <div style={{ fontSize: 14, color: C.yellow, fontWeight: 800, marginBottom: 24 }}>Pay once. Own it forever.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32, paddingTop: 24, borderTop: '2px solid #333', flex: 1 }}>
                    {['Everything in Yearly', 'Lifetime access — zero renewals', 'All future features included free', 'Direct dedicated support channel', 'Early beta access to new tools'].map((f, i) => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.white, fontWeight: i === 0 ? 800 : 600 }}>
                        <StarIcon style={{ width: 16, height: 16, color: C.yellow, flexShrink: 0 }} />{f}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ y: -3, boxShadow: `6px 6px 0px ${C.blue}` }} whileTap={{ y: 1, boxShadow: '2px 2px 0px #4F46E5' }}
                    onClick={() => handlePayment('lifetime')} disabled={loading}
                    style={{ width: '100%', padding: '16px', borderRadius: 14, border: C.border, background: C.white, color: C.black, fontSize: 16, fontWeight: 900, cursor: loading ? 'default' : 'pointer', fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.7 : 1 }}
                  >
                    {loading ? 'Processing...' : (session ? 'Get Lifetime Access' : 'Sign in to Upgrade')}
                  </motion.button>
                </div>
              </Reveal>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            COMPARISON TABLE
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.white, borderBottom: C.border }}>
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '96px 24px' }} className="section-wrap">
            <Reveal>
              <Label text="Feature Breakdown" color={C.pink} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: C.black, marginBottom: 48, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                Free vs. Premium.
              </h2>
            </Reveal>

            <div style={{ border: C.border, borderRadius: 20, overflow: 'hidden', boxShadow: C.shadowLg }}>
              {/* Header */}
              <div className="table-grid" style={{ background: C.black, padding: '16px 20px', color: C.white }}>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Feature</div>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center' }}>Free</div>
                <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', textAlign: 'center', color: C.yellow }}>Premium</div>
              </div>
              
              {/* Body */}
              <div style={{ background: C.white }}>
                {COMPARISON.map(({ feature, free, pro }, i) => (
                  <div key={feature} className="table-grid" style={{ padding: '16px 20px', borderBottom: i === COMPARISON.length - 1 ? 'none' : C.borderThin, background: i % 2 === 0 ? C.white : C.bgCream }}>
                    <span style={{ fontSize: 15, color: C.black, fontWeight: 700 }}>{feature}</span>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {typeof free === 'boolean'
                        ? (free ? <Check style={{ width: 18, height: 18, color: C.black }} /> : <X style={{ width: 18, height: 18, color: '#999' }} />)
                        : <span style={{ fontSize: 14, color: '#666', fontWeight: 600 }}>{free}</span>}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {typeof pro === 'boolean'
                        ? (pro ? <Check style={{ width: 20, height: 20, color: C.red }} /> : <X style={{ width: 18, height: 18, color: '#999' }} />)
                        : <span style={{ fontSize: 14, color: C.red, fontWeight: 900 }}>{pro}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            TESTIMONIALS
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.bgBlue, borderBottom: C.border }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 24px' }} className="section-wrap">
            <Reveal>
              <Label text="Real Results" color={C.blue} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: C.black, marginBottom: 48, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                Don't just take our word for it.
              </h2>
            </Reveal>

            <div className="testimonial-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
              {TESTIMONIALS.map(({ name, loc, text, color }, i) => (
                <Reveal key={name} delay={i * 0.08}>
                  <motion.div 
                    whileHover={{ y: -4, boxShadow: C.shadowLg }} 
                    transition={SNAP}
                    style={{ 
                      background: C.white, border: C.border, borderRadius: 16, 
                      padding: '24px', boxShadow: C.shadow, 
                      height: '100%', display: 'flex', flexDirection: 'column', 
                      borderTop: `6px solid ${color}` 
                    }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
                      {[1,2,3,4,5].map(s => <StarIcon key={s} style={{ width: 16, height: 16, color: C.yellow, fill: C.yellow }} />)}
                    </div>
                    <p style={{ fontSize: 16, color: C.black, lineHeight: 1.6, fontWeight: 600, flex: 1, margin: '0 0 24px' }}>
                      "{text}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: color, border: C.borderThin }} />
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: C.black }}>{name}</div>
                        <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>{loc}</div>
                      </div>
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            FAQ
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.bgCream, borderBottom: C.border }}>
          <div style={{ maxWidth: 800, margin: '0 auto', padding: '96px 24px' }} className="section-wrap">
            <Reveal>
              <Label text="FAQ" color={C.red} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(36px, 6vw, 56px)', fontWeight: 900, color: C.black, marginBottom: 48, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                Questions answered.
              </h2>
            </Reveal>
            <div style={{ background: C.white, border: C.border, borderRadius: 20, overflow: 'hidden', boxShadow: C.shadowLg }}>
              {FAQS.map(({ q, a }) => <FAQ key={q} q={q} a={a} />)}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            BOTTOM CTA
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.white }}>
          <div style={{ maxWidth: 1120, margin: '0 auto', padding: '96px 24px' }} className="section-wrap">
            <Reveal>
              <div className="cta-flex" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', background: C.red, border: C.border, borderRadius: 24, padding: 'clamp(32px, 6vw, 56px)', boxShadow: C.shadowLg, position: 'relative', overflow: 'hidden' }}>
                <Star size={64} color={C.yellow} style={{ position: 'absolute', right: -20, top: -20, opacity: 0.9 }} />
                <div style={{ flex: '1 1 400px', zIndex: 1 }}>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: 900, color: C.white, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                    Stop missing<br />the signals.
                  </h2>
                  <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginTop: 16, lineHeight: 1.6, fontWeight: 600, maxWidth: 440 }}>
                    Every conversation you don't analyze is a signal you'll never get back. Upgrade now.
                  </p>
                </div>
                <div style={{ flexShrink: 0, zIndex: 1, width: '100%', maxWidth: 300 }}>
                  <motion.button onClick={() => { document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' }); }}
                    whileHover={{ y: -4, boxShadow: C.shadowLg }} whileTap={{ y: 2, boxShadow: C.shadowSm }} transition={SNAP}
                    style={{ width: '100%', background: C.yellow, color: C.black, border: C.border, borderRadius: 14, padding: '20px 32px', fontSize: 18, fontWeight: 900, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadow }}>
                    View Pricing →
                  </motion.button>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: 700 }}>
                    <Shield style={{ width: 14, height: 14 }} /> Cancel anytime. Secure payment.
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  );
}