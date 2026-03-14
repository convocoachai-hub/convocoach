'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Check, X, Lock, ArrowRight, ChevronDown } from 'lucide-react';

declare global { interface Window { Razorpay: any; } }

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  cream:   '#F3EDE2',
  ink:     '#0F0C09',
  red:     '#D13920',
  warm1:   '#E8E0D2',
  warm2:   '#D4CBBA',
  muted:   '#8A8074',
  mutedLt: '#BFB8AC',
  amber:   '#B87A10',
};

// ─── PRICES ───────────────────────────────────────────────────────────────────
const PRICES: Record<string, { symbol: string; text: string }> = {
  INR: { symbol: '₹',   text: '99'   },
  USD: { symbol: '$',   text: '1.99' },
  EUR: { symbol: '€',   text: '1.99' },
  GBP: { symbol: '£',   text: '1.79' },
  CAD: { symbol: '$',   text: '2.69' },
  AUD: { symbol: '$',   text: '2.99' },
  JPY: { symbol: '¥',   text: '300'  },
  SGD: { symbol: '$',   text: '2.69' },
  AED: { symbol: 'د.إ', text: '7.30' },
  BRL: { symbol: 'R$',  text: '9.90' },
  MXN: { symbol: '$',   text: '34'   },
};

const COMPARISON = [
  { feature: 'Chat analyses',       free: '4 total',  pro: 'Unlimited'    },
  { feature: 'Attraction score',    free: 'Basic',    pro: 'Full + history'},
  { feature: 'Missed signals',      free: false,      pro: true            },
  { feature: 'AI reply rewrites',   free: false,      pro: true            },
  { feature: 'Practice characters', free: '2 only',   pro: 'All 10'       },
  { feature: 'Momentum meter',      free: false,      pro: true            },
  { feature: 'Expert difficulty',   free: false,      pro: true            },
  { feature: 'Priority support',    free: false,      pro: true            },
];

const TESTIMONIALS = [
  { name: 'Alex M.',   loc: 'Toronto',   text: 'She started initiating after I fixed my double-texting. This thing was brutally accurate.' },
  { name: 'Rahul S.',  loc: 'Mumbai',    text: 'I missed three signals. Three. It spelled them out. Changed how I read everything.' },
  { name: 'Jordan K.', loc: 'London',    text: "Best two dollars I've spent this year. My reply rate went up noticeably in a week." },
  { name: 'Priya R.',  loc: 'Singapore', text: 'Used it on a work negotiation thread. Saw I was being passive. Renegotiated and won.' },
];

const FAQS = [
  { q: 'Why is it only $1.99?',        a: 'Early access pricing. We want real users before scaling. Everyone who joins now locks this rate in permanently — it will go up.' },
  { q: 'Are my screenshots stored?',   a: 'No. Images are processed in memory and discarded immediately. We never see your conversations.' },
  { q: 'Can I cancel anytime?',        a: 'One click in your dashboard. No cancellation fee, no form, no questions.' },
  { q: 'Does this work for non-dating?', a: 'Completely. Professional negotiations, friendships, family — emotional signals are universal.' },
];

const SIGNALS = [
  'She asked a follow-up question — you ignored the thread',
  'Her response time dropped from 2hrs → 4min — a clear interest spike',
  'She used your exact phrasing back — mirroring behavior',
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

// ─── CHAT MOCKUP ──────────────────────────────────────────────────────────────
function ChatMockup() {
  const bubble = (msg: string, side: 'l' | 'r', delay: number) => (
    <motion.div key={msg} initial={{ opacity: 0, x: side === 'l' ? -12 : 12 }}
      animate={{ opacity: 1, x: 0 }} transition={{ delay, duration: 0.45, ease: [0.16,1,0.3,1] }}
      style={{ display: 'flex', justifyContent: side === 'r' ? 'flex-end' : 'flex-start' }}>
      <div style={{
        background: side === 'l' ? C.warm1 : C.ink,
        color: side === 'l' ? C.ink : C.cream,
        borderRadius: side === 'l' ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
        padding: '8px 13px', maxWidth: '82%',
        fontSize: 12.5, lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif",
      }}>{msg}</div>
    </motion.div>
  );

  const tag = (text: string, color: string, delay: number, align: 'l'|'r' = 'l') => (
    <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.35 }}
      style={{ display: 'flex', justifyContent: align === 'r' ? 'flex-end' : 'flex-start' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: `${color}14`, border: `1px solid ${color}35`,
        borderRadius: 100, padding: '3px 9px',
      }}>
        {align === 'l' && <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'block', flexShrink: 0 }} />}
        <span style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: 'uppercase' as const, letterSpacing: '0.06em', fontFamily: 'monospace' }}>{text}</span>
      </div>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.9, ease: [0.16,1,0.3,1] }}
      style={{ width: 272, flexShrink: 0, transform: 'rotate(-3deg)' }}>
      <div style={{
        background: C.cream, border: `1.5px solid ${C.warm2}`,
        borderRadius: 22, padding: '14px 13px',
        boxShadow: `6px 14px 52px rgba(15,12,9,0.15), 0 2px 8px rgba(15,12,9,0.06)`,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.warm1}` }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: C.warm1, border: `1.5px solid ${C.warm2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: C.muted }}>S</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.ink, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Sofia</div>
            <div style={{ fontSize: 9.5, color: C.mutedLt }}>active now</div>
          </div>
          <div style={{ marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%', background: '#2D8A4E' }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {bubble("omg same, that's so funny 😭", 'l', 0.7)}
          {tag('Humor mirroring', C.red, 1.0)}
          {bubble("haha yeah it's wild", 'r', 1.25)}
          {tag('⚠ Missed opportunity', C.amber, 1.55, 'r')}
          {bubble('so what are you up to this weekend? 👀', 'l', 1.85)}
          {tag('Invite signal — respond now', C.red, 2.15)}
        </div>

        {/* Blurred premium */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5 }}
          style={{ marginTop: 10, position: 'relative', background: C.warm1, borderRadius: 12, padding: '10px 12px', overflow: 'hidden' }}>
          <div style={{ filter: 'blur(3.5px)', userSelect: 'none', pointerEvents: 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.red, marginBottom: 3, fontFamily: 'monospace' }}>Attraction: 78%</div>
            <div style={{ fontSize: 10.5, color: C.muted, lineHeight: 1.5 }}>
              Optimal: vulnerability + callback<br />Momentum: Accelerating ↑
            </div>
          </div>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${C.warm1} 55%, transparent)`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 9.5, fontWeight: 800, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'monospace' }}>
              <Lock style={{ width: 9, height: 9 }} /> Premium only
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
    <div style={{ borderBottom: `1px solid ${C.warm2}` }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: C.ink, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.4 }}>{q}</span>
        <ChevronDown style={{ width: 16, height: 16, color: C.red, flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} style={{ overflow: 'hidden' }}>
            <p style={{ paddingBottom: 20, fontSize: 14, color: C.muted, lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>{a}</p>
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

  const handlePayment = async () => {
    if (!session?.user) { signIn('google', { callbackUrl: '/upgrade' }); return; }
    setLoading(true);
    try {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      const order = await fetch('/api/payment/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency }),
      }).then(r => r.json());
      if (!order.orderId) throw new Error('No order');
      await new Promise<void>(res => { script.onload = () => res(); });
      new window.Razorpay({
        key: order.keyId, amount: order.amount, currency: order.currency,
        name: 'ConvoCoach', order_id: order.orderId,
        prefill: { name: session.user.name, email: session.user.email },
        theme: { color: C.red },
        handler: async (response: any) => {
          const r = await fetch('/api/payment/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(response),
          }).then(r => r.json());
          if (r.success) router.push('/payment-success');
        },
      }).open();
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const rule = { width: '100%', height: 1, background: C.warm2, border: 'none', margin: 0 } as React.CSSProperties;
  const label: React.CSSProperties = { fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace', color: C.red, display: 'block' };
  const h2Style: React.CSSProperties = { fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 52, fontWeight: 900, color: C.ink, margin: '16px 0 48px', letterSpacing: '-0.03em', lineHeight: 1.02 };
  const wrap: React.CSSProperties = { padding: '80px 24px', maxWidth: 1120, margin: '0 auto' };

  const RedBtn = ({ label: btnLabel, full = false }: { label: string; full?: boolean }) => (
    <motion.button onClick={handlePayment} disabled={loading}
      whileHover={{ scale: 1.025, boxShadow: '0 10px 40px rgba(209,57,32,0.32)' }}
      whileTap={{ scale: 0.97 }}
      style={{
        background: C.red, color: '#fff', border: 'none', borderRadius: 14,
        padding: '16px 36px', fontSize: 15, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
        fontFamily: "'Bricolage Grotesque', sans-serif", display: 'inline-flex', alignItems: 'center', gap: 10,
        width: full ? '100%' : 'auto', justifyContent: full ? 'center' : 'flex-start',
        opacity: loading ? 0.7 : 1, boxShadow: '0 4px 20px rgba(209,57,32,0.2)',
      }}>
      {loading
        ? 'Processing...'
        : <>{btnLabel} <ArrowRight style={{ width: 16, height: 16 }} /></>}
    </motion.button>
  );

  return (
    <>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:.35} }
        * { box-sizing: border-box; }
        .sticky-mobile { display: none !important; }
        @media (max-width: 768px) {
          .sticky-mobile { display: flex !important; }
          .hero-flex { flex-direction: column !important; }
          .hero-h1 { font-size: 54px !important; }
          .stats-row { flex-wrap: wrap; gap: 28px !important; }
          .section-wrap { padding: 56px 20px !important; }
          .pricing-grid { grid-template-columns: 1fr !important; }
          .testimonial-grid { grid-template-columns: 1fr !important; }
          .cta-flex { flex-direction: column !important; align-items: flex-start !important; }
          .compare-table { font-size: 13px !important; }
          .big-number { font-size: 110px !important; }
          .signals-flex { flex-direction: column !important; }
        }
      `}</style>

      {/* ── Mobile sticky bar ─────────────────────────────────────────── */}
      <div className="sticky-mobile" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
        background: `${C.ink}F2`, backdropFilter: 'blur(20px)',
        borderTop: `1px solid rgba(243,237,226,0.08)`,
        padding: '12px 20px', alignItems: 'center', gap: 12,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: `${C.cream}55`, letterSpacing: '0.1em', fontFamily: 'monospace', textTransform: 'uppercase' }}>launch price</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: C.cream, fontFamily: "'Bricolage Grotesque', sans-serif", lineHeight: 1.1 }}>
            {price.symbol}{price.text}<span style={{ fontSize: 12, fontWeight: 400, color: `${C.cream}45`, marginLeft: 4 }}>/mo</span>
          </div>
        </div>
        <button onClick={handlePayment} disabled={loading} style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 12, padding: '13px 26px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", flexShrink: 0 }}>
          {loading ? 'Wait...' : 'Upgrade →'}
        </button>
      </div>

      <div style={{ background: C.cream, minHeight: '100vh', paddingBottom: 80 }}>

        {/* ════════════════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════════════════ */}
        <div style={{ ...wrap, paddingTop: 96 }} className="section-wrap">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={label}>
            ConvoCoach Premium
          </motion.span>

          <div className="hero-flex" style={{ display: 'flex', alignItems: 'flex-start', gap: 52, marginTop: 28 }}>
            {/* Left */}
            <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.8, ease: [0.16,1,0.3,1] }} style={{ flex: 1, minWidth: 0 }}>
              <h1 className="hero-h1" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 90, fontWeight: 900, lineHeight: 1.0, color: C.ink, margin: 0, letterSpacing: '-0.04em' }}>
                You're<br />reading<br />it{' '}
                <em style={{ color: C.red, fontStyle: 'italic' }}>wrong.</em>
              </h1>

              <p style={{ marginTop: 28, fontSize: 16, color: C.muted, maxWidth: 400, lineHeight: 1.75, fontWeight: 400 }}>
                Every conversation holds signals you're missing. ConvoCoach runs 10 layers of AI analysis and tells you exactly what happened, what they felt, and what to say next.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginTop: 36, flexWrap: 'wrap' }}>
                <RedBtn label={session ? 'Start Premium' : 'Sign in & Upgrade'} />
                <span style={{ fontSize: 13, color: C.mutedLt }}>{price.symbol}{price.text}/mo · cancel anytime</span>
              </div>

              {/* Stats */}
              <div className="stats-row" style={{ display: 'flex', gap: 44, marginTop: 52, paddingTop: 40, borderTop: `1px solid ${C.warm2}` }}>
                {[
                  { n: 14200, label: 'conversations analyzed' },
                  { n: 94,    label: 'accuracy rating', s: '%'  },
                  { n: 1247,  label: 'active this week'         },
                ].map(({ n, label: lbl, s }) => (
                  <div key={lbl}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 32, fontWeight: 900, color: C.ink, letterSpacing: '-0.03em' }}>
                      <Num n={n} suffix={s} />
                    </div>
                    <div style={{ fontSize: 11, color: C.mutedLt, marginTop: 2, fontWeight: 500 }}>{lbl}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: tilted chat mockup */}
            <div style={{ paddingTop: 20, flexShrink: 0 }}>
              <ChatMockup />
            </div>
          </div>
        </div>

        <hr style={rule} />

        {/* ════════════════════════════════════════════════════════════════
            MISSED SIGNALS — ink background, giant 72%
        ════════════════════════════════════════════════════════════════ */}
        <div style={{ background: C.ink }}>
          <div style={{ ...wrap, paddingTop: 72, paddingBottom: 72 }} className="section-wrap">
            <div className="signals-flex" style={{ display: 'flex', alignItems: 'flex-start', gap: 48 }}>

              {/* Giant number */}
              <motion.div initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }} style={{ flexShrink: 0 }}>
                <div className="big-number" style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 164, fontWeight: 900, color: C.red, lineHeight: 0.88, letterSpacing: '-0.06em' }}>
                  <Num n={72} suffix="%" />
                </div>
                <div style={{ fontSize: 11, fontWeight: 800, color: `${C.cream}40`, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace', marginTop: 16 }}>
                  Attraction probability
                </div>
              </motion.div>

              {/* Signal list + blurred content */}
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.6 }}
                style={{ flex: 1, minWidth: 280, paddingTop: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.red, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 22 }}>
                  Signals you missed
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 32 }}>
                  {SIGNALS.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 14 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1 }}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <span style={{ width: 22, height: 22, borderRadius: '50%', background: `${C.red}18`, border: `1px solid ${C.red}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red, display: 'block' }} />
                      </span>
                      <span style={{ fontSize: 15, color: `${C.cream}75`, lineHeight: 1.6 }}>{s}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Blurred full breakdown */}
                <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', background: `${C.cream}06`, border: `1px solid ${C.cream}10`, padding: '16px 18px' }}>
                  <div style={{ filter: 'blur(4px)', userSelect: 'none', pointerEvents: 'none' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.red, fontFamily: 'monospace', marginBottom: 8 }}>Full breakdown</div>
                    {['Optimal reply: vulnerability + callback humor', "Don't stall — momentum is strong right now", 'Next mistake to avoid: over-explaining yourself'].map(t => (
                      <div key={t} style={{ fontSize: 13, color: `${C.cream}55`, lineHeight: 1.75 }}>— {t}</div>
                    ))}
                  </div>
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${C.ink} 45%, transparent)`, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 800, color: `${C.cream}55`, textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
                      <Lock style={{ width: 10, height: 10 }} /> Premium only
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <hr style={rule} />

        {/* ════════════════════════════════════════════════════════════════
            COMPARISON TABLE
        ════════════════════════════════════════════════════════════════ */}
        <div style={wrap} className="section-wrap">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span style={label}>What you're leaving behind</span>
            <h2 style={h2Style}>Free vs. Premium.</h2>

            <div className="compare-table" style={{ maxWidth: 680 }}>
              {/* Header */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px', paddingBottom: 12, borderBottom: `2px solid ${C.ink}` }}>
                {['Feature', 'Free', 'Premium'].map((h, i) => (
                  <div key={h} style={{ fontSize: 11, fontWeight: 800, color: i === 2 ? C.red : C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace', textAlign: i > 0 ? 'center' : 'left' }}>{h}</div>
                ))}
              </div>
              {COMPARISON.map(({ feature, free, pro }, i) => (
                <motion.div key={feature} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  style={{ display: 'grid', gridTemplateColumns: '1fr 100px 120px', padding: '13px 0', borderBottom: `1px solid ${C.warm2}`, alignItems: 'center', background: i % 2 !== 0 ? `${C.warm1}50` : 'transparent' }}>
                  <span style={{ fontSize: 15, color: C.ink, fontWeight: 500 }}>{feature}</span>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {typeof free === 'boolean'
                      ? (free ? <Check style={{ width: 15, height: 15, color: C.muted }} /> : <X style={{ width: 14, height: 14, color: C.mutedLt }} />)
                      : <span style={{ fontSize: 13, color: C.muted }}>{free}</span>}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {typeof pro === 'boolean'
                      ? (pro ? <Check style={{ width: 16, height: 16, color: C.red }} /> : <X style={{ width: 14, height: 14, color: C.mutedLt }} />)
                      : <span style={{ fontSize: 13, color: C.red, fontWeight: 700 }}>{pro}</span>}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <hr style={rule} />

        {/* ════════════════════════════════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════════════════════════════ */}
        <div style={wrap} className="section-wrap">
          <span style={label}>The process</span>
          <h2 style={h2Style}>Three steps.</h2>
          <div style={{ maxWidth: 620 }}>
            {[
              { n: '01', title: 'Upload a screenshot',        desc: 'Any chat — iMessage, WhatsApp, Instagram, Hinge. We handle the extraction.' },
              { n: '02', title: 'AI runs 10 analysis layers', desc: 'Attraction signals, tone, momentum, reply energy, missed moments. All in seconds.' },
              { n: '03', title: 'Get your edge',              desc: 'Exact mistakes identified. What they felt. What to say next. Nothing withheld.' },
            ].map(({ n, title, desc }, i) => (
              <motion.div key={n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }}
                style={{ display: 'flex', gap: 28, padding: '28px 0', borderBottom: `1px solid ${C.warm2}` }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 52, fontWeight: 900, color: C.warm2, lineHeight: 1, flexShrink: 0, width: 60 }}>{n}</div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 15, color: C.muted, lineHeight: 1.7 }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <hr style={rule} />

        {/* ════════════════════════════════════════════════════════════════
            PRICING — ink bg, left-aligned
        ════════════════════════════════════════════════════════════════ */}
        <div style={{ background: C.ink }}>
          <div style={{ ...wrap, paddingTop: 72, paddingBottom: 80 }} className="section-wrap">
            <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>

              {/* Left copy */}
              <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <span style={{ ...label, color: `${C.cream}35` }}>Launch pricing</span>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 60, fontWeight: 900, color: C.cream, margin: '16px 0 0', letterSpacing: '-0.04em', lineHeight: 0.98 }}>
                  Less than<br />a coffee.
                </h2>
                <p style={{ fontSize: 15, color: `${C.cream}50`, lineHeight: 1.75, marginTop: 22, maxWidth: 360 }}>
                  We're still in early access. Join now and lock this rate permanently — it will go up when we scale.
                </p>
                <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {['No screenshots stored ever', 'Cancel in one click anytime', 'No contracts or commitments', 'Works on any chat platform'].map(t => (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: `${C.cream}55` }}>
                      <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1px solid ${C.cream}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Check style={{ width: 10, height: 10, color: C.red }} />
                      </div>
                      {t}
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Right: card */}
              <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: 0.15, duration: 0.7 }}>
                <div style={{ background: C.cream, borderRadius: 24, padding: '36px 32px', boxShadow: '0 0 0 1px rgba(244,238,226,0.06), 0 40px 80px rgba(0,0,0,0.55)' }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.red, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: 'monospace', marginBottom: 12 }}>
                    ↯ Early adopter rate
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 76, fontWeight: 900, color: C.ink, letterSpacing: '-0.05em', lineHeight: 1 }}>
                      {price.symbol}{price.text}
                    </span>
                    <span style={{ fontSize: 14, color: C.muted }}>/month</span>
                  </div>
                  <div style={{ fontSize: 13, color: C.mutedLt, marginBottom: 28 }}>Billed monthly. Cancel anytime.</div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 11, marginBottom: 28, paddingTop: 24, borderTop: `1px solid ${C.warm2}` }}>
                    {['Unlimited chat analyses', 'Full 10-layer AI breakdown', 'Missed opportunity detector', 'AI reply rewrites', 'All 10 practice characters', 'Priority support'].map(f => (
                      <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.ink }}>
                        <Check style={{ width: 14, height: 14, color: C.red, flexShrink: 0 }} />
                        {f}
                      </div>
                    ))}
                  </div>

                  <RedBtn label={session ? 'Upgrade Now' : 'Sign in to Upgrade'} full />
                  <div style={{ textAlign: 'center', marginTop: 14, fontSize: 11, color: C.mutedLt }}>
                    Secured by Razorpay · No card stored
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <hr style={rule} />

        {/* ════════════════════════════════════════════════════════════════
            TESTIMONIALS — editorial pull quotes, grid
        ════════════════════════════════════════════════════════════════ */}
        <div style={wrap} className="section-wrap">
          <span style={label}>In their words</span>
          <h2 style={h2Style}>Real users.</h2>
          <div className="testimonial-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
            {TESTIMONIALS.map(({ name, loc, text }, i) => (
              <motion.div key={name} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
                style={{
                  padding: '40px 36px',
                  borderBottom: i < 2 ? `1px solid ${C.warm2}` : 'none',
                  borderRight: i % 2 === 0 ? `1px solid ${C.warm2}` : 'none',
                }}>
                <div style={{ fontSize: 56, fontFamily: 'Georgia, serif', color: C.warm2, lineHeight: 0.7, marginBottom: 18 }}>"</div>
                <p style={{ fontSize: 16, color: C.ink, lineHeight: 1.7, fontStyle: 'italic', margin: '0 0 22px', fontFamily: 'Georgia, serif' }}>
                  {text}
                </p>
                <div style={{ fontSize: 11, fontWeight: 800, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                  {name} · {loc}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <hr style={rule} />

        {/* ════════════════════════════════════════════════════════════════
            FAQ
        ════════════════════════════════════════════════════════════════ */}
        <div style={wrap} className="section-wrap">
          <span style={label}>Questions</span>
          <h2 style={h2Style}>Answered.</h2>
          <div style={{ maxWidth: 640 }}>
            {FAQS.map(({ q, a }) => <FAQ key={q} q={q} a={a} />)}
          </div>
        </div>

        <hr style={rule} />

        {/* ════════════════════════════════════════════════════════════════
            BOTTOM CTA — asymmetric, left-aligned
        ════════════════════════════════════════════════════════════════ */}
        <div style={wrap} className="section-wrap">
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}>
            <div className="cta-flex" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 72, fontWeight: 900, color: C.ink, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.0 }}>
                  Stop missing<br />the signals.
                </h2>
                <p style={{ fontSize: 15, color: C.muted, marginTop: 18, lineHeight: 1.7, maxWidth: 380 }}>
                  Every conversation you don't analyze is a signal you'll never get back.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <RedBtn label={`Premium — ${price.symbol}${price.text}/mo`} />
                <div style={{ marginTop: 10, fontSize: 12, color: C.mutedLt }}>Cancel anytime · No screenshots stored</div>
              </div>
            </div>

            {/* Decorative rule */}
            <div style={{ height: 3, background: C.red, marginTop: 72, borderRadius: 2, width: '100%' }} />
          </motion.div>
        </div>

      </div>
    </>
  );
}