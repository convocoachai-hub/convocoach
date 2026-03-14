'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useSpring, useMotionValue, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── DESIGN TOKENS (matches upgrade page exactly) ────────────────────────────
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

// ─── MOTION CONFIGS ───────────────────────────────────────────────────────────
const EO = { duration: 0.75, ease: [0.16, 1, 0.3, 1] } as const;
// NOTE: all repeat animations explicitly use type:'tween' to avoid spring keyframe error

// ─── TILT HOOK ────────────────────────────────────────────────────────────────
function useTilt(str = 8) {
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    rx.set(((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -str);
    ry.set(((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  str);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return { ref, rotateX: useSpring(rx, { stiffness: 200, damping: 30 }), rotateY: useSpring(ry, { stiffness: 200, damping: 30 }), onMove, onLeave };
}

// ─── SHARED COMPONENTS ────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 28, className = '' }: { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }} transition={{ ...EO, delay }} className={className}>
      {children}
    </motion.div>
  );
}

function Tilt({ children, str = 6, className = '' }: { children: React.ReactNode; str?: number; className?: string }) {
  const { ref, rotateX, rotateY, onMove, onLeave } = useTilt(str);
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className={className}>
      {children}
    </motion.div>
  );
}

// Serif italic accent — same as upgrade page
function I({ children, c = C.red }: { children: React.ReactNode; c?: string }) {
  return <em style={{ fontStyle: 'italic', color: c, fontFamily: 'Georgia, serif' }}>{children}</em>;
}

// Animated counter
function Counter({ to, sfx = '' }: { to: number; sfx?: string }) {
  const [n, setN] = useState(0);
  const [go, setGo] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting && !go) setGo(true); });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [go]);
  useEffect(() => {
    if (!go) return;
    let f: number;
    const s = performance.now();
    const run = (now: number) => {
      const t = Math.min((now - s) / 1600, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setN(Math.round(ease * to));
      if (t < 1) f = requestAnimationFrame(run);
    };
    f = requestAnimationFrame(run);
    return () => cancelAnimationFrame(f);
  }, [go, to]);
  return <span ref={ref}>{n.toLocaleString()}{sfx}</span>;
}

// Chat bubble (cream-themed)
function Bub({ text, self, bad, delay = 0 }: { text: string; self?: boolean; bad?: boolean; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: self ? 10 : -10 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      style={{ display: 'flex', justifyContent: self ? 'flex-end' : 'flex-start', width: '100%' }}>
      <div style={{
        maxWidth: '82%', padding: '9px 13px', borderRadius: 14,
        borderBottomRightRadius: self ? 3 : 14, borderBottomLeftRadius: self ? 14 : 3,
        fontSize: 13, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif",
        background: self ? (bad ? `${C.red}15` : C.ink) : C.warm1,
        border: self ? (bad ? `1px solid ${C.red}30` : 'none') : `1px solid ${C.warm2}`,
        color: self ? (bad ? C.red : C.cream) : C.ink,
      }}>{text}</div>
    </motion.div>
  );
}

// Signal tag chip
function Tag({ text, color, align = 'l', delay = 0 }: { text: string; color: string; align?: 'l' | 'r'; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }} transition={{ duration: 0.3, delay }}
      style={{ display: 'flex', justifyContent: align === 'r' ? 'flex-end' : 'flex-start' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        background: `${color}14`, border: `1px solid ${color}30`,
        borderRadius: 100, padding: '3px 10px',
      }}>
        <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, display: 'block', flexShrink: 0 }} />
        <span style={{ fontSize: 9.5, fontWeight: 800, color, textTransform: 'uppercase' as const, letterSpacing: '0.07em', fontFamily: 'monospace' }}>{text}</span>
      </div>
    </motion.div>
  );
}

// Shared label style (matches upgrade page)
const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, letterSpacing: '0.14em',
  textTransform: 'uppercase', fontFamily: 'monospace',
  color: C.red, display: 'block', marginBottom: 16,
};
const LABEL_DIM: React.CSSProperties = { ...LABEL, color: `${C.cream}35` };

// Section horizontal rule
const HR = () => <div style={{ height: 1, background: C.warm2, margin: 0 }} />;

// ─── SCENARIOS ────────────────────────────────────────────────────────────────
const SCENARIOS = [
  { emoji: '💘', label: 'Dating',        hot: true,  color: C.red,   preview: [{ t: 'so what are you looking for rn?', s: false }, { t: "idk just vibing lol", s: true, bad: true }], signal: 'Commitment avoidance detected', insight: 'She asked for intent. You deflected. She loses interest in 48h.' },
  { emoji: '😵‍💫', label: 'Situationship', hot: false, color: C.amber,preview: [{ t: 'i missed you though', s: false }, { t: 'same haha', s: true, bad: true }],              signal: 'Emotional mismatch — underdoing it', insight: '"Same haha" kills intimacy. She opened; you closed.' },
  { emoji: '💼', label: 'Work',          hot: false, color: '#5A8A5A',preview: [{ t: 'following up on the proposal', s: true }, { t: 'noted, will circle back', s: false }],   signal: 'Soft stall — reopening needed', insight: 'This is a soft no. AI suggests a re-frame that reopens it.' },
  { emoji: '🫂', label: 'Friendship',    hot: false, color: C.muted, preview: [{ t: 'you never text first anymore', s: false }, { t: 'been busy sorry 😭', s: true, bad: true }], signal: 'Passive aggression unaddressed', insight: 'This isn\'t about texting. Underlying tension — AI maps it.' },
  { emoji: '🤝', label: 'Networking',    hot: false, color: C.amber, preview: [{ t: 'Hi, I admire your work!', s: true, bad: true }, { t: 'Thanks! 👍', s: false }],            signal: 'Generic opener — polite rejection', insight: 'Reads as fan mail. AI rewrites it as peer-to-peer.' },
  { emoji: '👋', label: 'Reconnecting',  hot: false, color: '#5A8A5A',preview: [{ t: "hey! it's been forever 😊", s: false }, { t: 'omg yeah so crazy', s: true, bad: true }], signal: 'Opportunity window — door was open', insight: 'She reached out for a reason. Your reply closed it.' },
  { emoji: '🏠', label: 'Family',        hot: false, color: C.muted, preview: [{ t: 'are you okay? you seem off', s: false }, { t: 'im fine', s: true, bad: true }],            signal: 'Emotional suppression — trust gap', insight: '"I\'m fine" is our most-analyzed phrase. It never works.' },
];

// ─── PAIN POINT CARDS ────────────────────────────────────────────────────────
const PAINS = [
  { s: 'She asked a question. You answered.', label: 'Dead End', lc: C.red,
    chat: [{ t: 'what kind of music do you like?' }, { t: 'mostly indie rock. you?', s: true, bad: true }, { t: 'same haha' }] },
  { s: 'She was clearly testing you.', label: 'Boring Reply', lc: C.amber,
    chat: [{ t: 'so what do you do for fun?' }, { t: 'gym, netflix, hanging out', s: true, bad: true }, { t: 'oh cool' }] },
  { s: 'She opened with big energy.', label: 'Energy Drop', lc: '#5A8A5A',
    chat: [{ t: 'okay i have the funniest story 😭' }, { t: 'haha what happened', s: true, bad: true }, { t: '...' }] },
];

// ─── PERSONAS ────────────────────────────────────────────────────────────────
const PERSONAS = [
  { name: 'Zara',  trait: 'Sarcastic 😏', reply: "groundbreaking. you must be a blast at funerals." },
  { name: 'Emma',  trait: 'Shy 🌸',        reply: "haha yeah i guess... 😅 what do you like?" },
  { name: 'Sofia', trait: 'Interested 💜', reply: "omg SAME!! okay what artists?? 👀" },
  { name: 'Riley', trait: 'Bored 😑',      reply: "k" },
];

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
const TICKER = [
  '💘 Dating · 78% attraction detected',
  '💼 Work · Tone too passive — fix before sending',
  '😵‍💫 Situationship · She wants more. You\'re missing it.',
  '🫂 Friendship · Passive aggression in reply 3',
  '🤝 Networking · Cold message — warming it up',
  '💘 Dating · 3 missed escalation moments',
  '👋 Reconnecting · High interest. Low follow-through.',
  '🏠 Family · Emotional undercurrent — proceed carefully',
];

function Marquee() {
  const items = [...TICKER, ...TICKER];
  return (
    <div style={{ overflow: 'hidden', background: C.ink, borderTop: `1px solid rgba(243,237,226,0.07)`, borderBottom: `1px solid rgba(243,237,226,0.07)`, padding: '12px 0', position: 'relative' }}>
      <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to right, ${C.ink}, transparent)`, zIndex: 2, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, background: `linear-gradient(to left, ${C.ink}, transparent)`, zIndex: 2, pointerEvents: 'none' }} />
      <motion.div style={{ display: 'flex', width: 'max-content' }}
        animate={{ x: [0, `-${100 / items.length * TICKER.length}%`] }}
        transition={{ type: 'tween', duration: 35, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '0 32px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 12, color: `${C.cream}40`, fontFamily: "'DM Sans', sans-serif" }}>{item}</span>
            <span style={{ width: 3, height: 3, borderRadius: '50%', background: `${C.red}60`, display: 'block', flexShrink: 0 }} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── PHONE SHELL ─────────────────────────────────────────────────────────────
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      width: 265, height: 540, background: C.ink, borderRadius: 38,
      border: `6px solid #1A1611`, position: 'relative', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', flexShrink: 0,
      boxShadow: `0 0 0 1px rgba(243,237,226,0.06), 0 40px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(243,237,226,0.04)`,
    }}>
      {/* Notch */}
      <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 80, height: 20, background: C.ink, borderBottomLeftRadius: 12, borderBottomRightRadius: 12, zIndex: 20 }} />
      {/* Sheen */}
      <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '40%', background: 'linear-gradient(135deg, rgba(243,237,226,0.02) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 10 }} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>{children}</div>
    </div>
  );
}

// ─── SIGNAL ANALYSIS CARD (hero right side) ──────────────────────────────────
function AnalysisCard() {
  const { ref, rotateX, rotateY, onMove, onLeave } = useTilt(6);
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }}
      transition={{ ...EO, delay: 0.25 }}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', width: 340, flexShrink: 0, position: 'relative' }}>

      {/* Floating badges */}
      <motion.div animate={{ y: [-5, 5, -5] }} transition={{ type: 'tween', duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', top: -16, right: -18, background: C.cream, border: `1px solid ${C.warm2}`, borderRadius: 12, padding: '8px 13px', zIndex: 5, boxShadow: `4px 8px 24px rgba(15,12,9,0.18)` }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: C.red, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'monospace' }}>🔥 Roast mode</div>
        <div style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>"That reply was a crime."</div>
      </motion.div>
      <motion.div animate={{ y: [5, -5, 5] }} transition={{ type: 'tween', duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        style={{ position: 'absolute', bottom: -14, left: -20, background: C.cream, border: `1px solid ${C.warm2}`, borderRadius: 12, padding: '8px 13px', zIndex: 5, boxShadow: `4px 8px 24px rgba(15,12,9,0.18)` }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Momentum</div>
        <div style={{ fontSize: 13, color: C.red, fontWeight: 800 }}>📉 Dying fast</div>
      </motion.div>

      {/* Main card */}
      <div style={{
        background: C.ink, borderRadius: 24, padding: 26,
        boxShadow: `8px 16px 60px rgba(15,12,9,0.3), 0 0 0 1px rgba(243,237,226,0.06), inset 0 1px 0 rgba(243,237,226,0.05)`,
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 18, borderBottom: `1px solid rgba(243,237,226,0.08)` }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: `${C.red}20`, border: `1px solid ${C.red}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔍</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.cream, fontFamily: "'Bricolage Grotesque', sans-serif" }}>Analysis Complete</div>
            <div style={{ fontSize: 11, color: `${C.cream}35` }}>💘 Dating · 2 min ago</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(45,138,78,0.12)', border: '1px solid rgba(45,138,78,0.22)', borderRadius: 999, padding: '3px 9px' }}>
            <motion.span style={{ width: 5, height: 5, borderRadius: '50%', background: '#2D8A4E', display: 'block' }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ type: 'tween', duration: 2, repeat: Infinity, ease: 'easeInOut' }} />
            <span style={{ fontSize: 10, color: '#2D8A4E', fontWeight: 700 }}>Live</span>
          </div>
        </div>

        {/* Score arc row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Score', val: 74, color: C.red },
            { label: 'Interest', val: 81, color: C.amber },
            { label: 'Attract', val: 68, color: '#5A8A5A' },
          ].map(({ label, val, color }) => {
            const r = 26; const circ = 2 * Math.PI * r;
            return (
              <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                <div style={{ position: 'relative', width: 66, height: 66 }}>
                  <svg width={66} height={66} style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx={33} cy={33} r={r} fill="none" stroke="rgba(243,237,226,0.07)" strokeWidth={5} />
                    <motion.circle cx={33} cy={33} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
                      initial={{ strokeDasharray: `0 ${circ}` }}
                      whileInView={{ strokeDasharray: `${(val / 100) * circ} ${circ}` }}
                      viewport={{ once: true }} transition={{ duration: 1.3, ease: [0.16, 1, 0.3, 1], delay: 0.4 }} />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{val}%</span>
                  </div>
                </div>
                <span style={{ fontSize: 9.5, color: `${C.cream}35`, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'monospace' }}>{label}</span>
              </div>
            );
          })}
        </div>

        {/* Bars */}
        {[{ l: 'Humor', v: 76, c: C.red }, { l: 'Confidence', v: 62, c: C.amber }, { l: 'Curiosity', v: 88, c: '#5A8A5A' }].map((b, i) => (
          <div key={b.l} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: `${C.cream}40`, marginBottom: 5 }}>
              <span>{b.l}</span><span>{b.v}%</span>
            </div>
            <div style={{ height: 3, background: 'rgba(243,237,226,0.07)', borderRadius: 99, overflow: 'hidden' }}>
              <motion.div style={{ height: '100%', background: b.c, borderRadius: 99 }}
                initial={{ width: 0 }} whileInView={{ width: `${b.v}%` }} viewport={{ once: true }}
                transition={{ duration: 1.2, delay: 0.6 + i * 0.1, ease: [0.16, 1, 0.3, 1] }} />
            </div>
          </div>
        ))}

        {/* Insights */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 7 }}>
          {[
            { ok: true,  t: 'Strong opener — 3-line reply = genuine interest.' },
            { ok: false, t: 'Energy mismatch. Your reply is 60% shorter.' },
            { ok: null,  t: '2 missed opportunities detected' },
          ].map((ins, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: 8,
              background: ins.ok === null ? 'rgba(184,122,16,0.08)' : ins.ok ? 'rgba(90,138,90,0.08)' : `${C.red}08`,
              border: `1px solid ${ins.ok === null ? 'rgba(184,122,16,0.2)' : ins.ok ? 'rgba(90,138,90,0.18)' : `${C.red}20`}`,
              borderRadius: 9, padding: '8px 11px', filter: ins.ok === null ? 'blur(2px)' : 'none',
            }}>
              <span style={{ fontSize: 12, color: ins.ok === null ? C.amber : ins.ok ? '#5A8A5A' : C.red, marginTop: 1 }}>
                {ins.ok === null ? '🔒' : ins.ok ? '✓' : '!'}
              </span>
              <span style={{ fontSize: 11.5, color: ins.ok === null ? `${C.cream}30` : `${C.cream}75`, lineHeight: 1.5 }}>
                {ins.t}{ins.ok === null && <span style={{ color: C.amber, marginLeft: 6, fontSize: 10, fontWeight: 700 }}>PREMIUM</span>}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function Page() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY  = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroO  = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const heroSc = useTransform(scrollYProgress, [0, 1], [1, 0.96]);

  const [persona, setPersona] = useState(0);
  const [activeScenario, setActiveScenario] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveScenario(p => (p + 1) % SCENARIOS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const wrap: React.CSSProperties = { maxWidth: 1120, margin: '0 auto', padding: '88px 28px' };
  const wrapNarrow: React.CSSProperties = { maxWidth: 1120, margin: '0 auto', padding: '80px 28px' };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        ::selection { background: ${C.red}30; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.red}40; border-radius: 2px; }

        .hero-grid { display: grid; grid-template-columns: 1fr auto; gap: 56px; align-items: flex-start; }
        .scenario-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 14px; }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        .signals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 12px; }
        .practice-grid { display: grid; grid-template-columns: 1fr auto; gap: 64px; align-items: center; }
        .rank-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr; }
          .hero-card { display: none !important; }
          .practice-grid { grid-template-columns: 1fr; gap: 40px; }
          .phone-wrap { display: flex; justify-content: center; order: -1; }
          .rank-grid { grid-template-columns: 1fr 1fr; }
          .before-after { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .scenario-grid { grid-template-columns: 1fr; }
          .signals-grid { grid-template-columns: 1fr 1fr; }
          .rank-grid { grid-template-columns: 1fr 1fr; }
          .section-pad { padding: 60px 20px !important; }
        }
      `}} />

      

      <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden', paddingBottom: 80 }}>

        {/* ════════════════════════════════════════════════════════════════
            HERO
        ════════════════════════════════════════════════════════════════ */}
        <section ref={heroRef} style={{ position: 'relative', overflow: 'hidden' }}>
          <motion.div style={{ y: heroY, opacity: heroO, scale: heroSc }} >
           <div style={{ ...wrap, paddingTop: 60 }} className="section-pad">
              <div className="hero-grid">
                {/* Left */}
                <div>
                  <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} style={LABEL}>
                    AI Conversation Intelligence
                  </motion.span>

                  <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ...EO, delay: 0.08 }}
                    style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(52px, 7vw, 88px)', fontWeight: 900, lineHeight: 1.0, color: C.ink, letterSpacing: '-0.04em', marginBottom: 24 }}>
                    Read any<br />conversation.<br /><I c={C.red}>Know the truth.</I>
                  </motion.h1>

                  {/* Scenario pills */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                    style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 22 }}>
                    {SCENARIOS.map((s, i) => (
                      <button key={i} onClick={() => setActiveScenario(i)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                          background: activeScenario === i ? C.ink : C.warm1,
                          border: `1px solid ${activeScenario === i ? C.ink : C.warm2}`,
                          borderRadius: 999, padding: '5px 12px', transition: 'all 0.2s',
                          fontSize: 11.5, color: activeScenario === i ? C.cream : C.muted,
                          fontFamily: "'DM Sans', sans-serif", fontWeight: activeScenario === i ? 600 : 400,
                        }}>
                        <span>{s.emoji}</span> {s.label}
                        {s.hot && <span style={{ fontSize: 9, fontWeight: 800, color: C.red, background: `${C.red}15`, borderRadius: 999, padding: '1px 5px', letterSpacing: '0.06em' }}>HOT</span>}
                      </button>
                    ))}
                  </motion.div>

                  <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ...EO, delay: 0.18 }}
                    style={{ fontSize: 16, color: C.muted, maxWidth: 420, lineHeight: 1.75, marginBottom: 36 }}>
                    Upload any chat screenshot. AI reads 10 layers — attraction signals, energy, tone, missed moments — and tells you exactly what's happening.
                  </motion.p>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ ...EO, delay: 0.24 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
                    <Link href="/upload">
                      <motion.button whileHover={{ scale: 1.03, boxShadow: `0 8px 32px ${C.red}35` }} whileTap={{ scale: 0.97 }}
                        style={{ background: C.ink, color: C.cream, border: 'none', borderRadius: 14, padding: '15px 30px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'flex', alignItems: 'center', gap: 9 }}>
                        Analyze My Chat — Free
                        <span style={{ fontSize: 13 }}>→</span>
                      </motion.button>
                    </Link>
                    <Link href="/practice">
                      <motion.button whileHover={{ scale: 1.03, background: C.warm2 }} whileTap={{ scale: 0.97 }}
                        style={{ background: C.warm1, color: C.ink, border: `1px solid ${C.warm2}`, borderRadius: 14, padding: '15px 26px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s' }}>
                        Practice Mode
                      </motion.button>
                    </Link>
                  </motion.div>

                  {/* Stats row */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}
                    style={{ display: 'flex', gap: 44, paddingTop: 36, borderTop: `1px solid ${C.warm2}`, flexWrap: 'wrap' }}>
                    {[{ n: 50000, s: '+', l: 'Chats analyzed' }, { n: 94, s: '%', l: 'Accuracy rate' }, { n: 7, s: '', l: 'Scenario types' }].map(({ n, s, l }) => (
                      <div key={l}>
                        <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 30, fontWeight: 900, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1 }}>
                          <Counter to={n} sfx={s} />
                        </div>
                        <div style={{ fontSize: 11, color: C.mutedLt, marginTop: 3 }}>{l}</div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* Right: analysis card */}
                <div className="hero-card">
                  <AnalysisCard />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Marquee on ink strip */}
        <Marquee />

        {/* ════════════════════════════════════════════════════════════════
            SCENARIOS
        ════════════════════════════════════════════════════════════════ */}
        <section>
          <div style={wrapNarrow} className="section-pad">
            <Reveal>
              <span style={LABEL}>Every conversation type</span>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 48 }}>
                Dating is our core.<br /><I c={C.muted}>We read everything.</I>
              </h2>
            </Reveal>

            <div className="scenario-grid">
              {SCENARIOS.map((sc, i) => (
                <Reveal key={i} delay={i * 0.06}>
                  <Tilt str={5}>
                    <div style={{
                      background: C.cream, border: `1.5px solid ${activeScenario === i ? C.ink : C.warm2}`,
                      borderRadius: 20, padding: '20px 20px 18px', height: '100%',
                      boxShadow: activeScenario === i ? `0 8px 32px rgba(15,12,9,0.1)` : `0 2px 8px rgba(15,12,9,0.04)`,
                      transition: 'border-color 0.35s, box-shadow 0.35s', cursor: 'default',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                          <span style={{ fontSize: 22 }}>{sc.emoji}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: C.ink, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{sc.label}</span>
                        </div>
                        {sc.hot && (
                          <span style={{ fontSize: 9, fontWeight: 800, color: C.red, background: `${C.red}12`, border: `1px solid ${C.red}25`, borderRadius: 999, padding: '2px 7px', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                            Most Used
                          </span>
                        )}
                      </div>

                      {/* Mini chat */}
                      <div style={{ background: C.warm1, borderRadius: 12, padding: '10px 10px', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {sc.preview.map((m, j) => (
                          <Bub key={j} text={m.t} self={m.s} bad={m.bad} delay={i * 0.04 + j * 0.08} />
                        ))}
                      </div>

                      {/* Signal */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, background: `${sc.color}10`, border: `1px solid ${sc.color}25`, borderRadius: 9, padding: '7px 10px', marginBottom: 9 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: sc.color, display: 'block', flexShrink: 0, marginTop: 4 }} />
                        <span style={{ fontSize: 11, color: sc.color, fontWeight: 700, lineHeight: 1.4, letterSpacing: '0.02em' }}>{sc.signal}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.6 }}>{sc.insight}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HR />

        {/* ════════════════════════════════════════════════════════════════
            PAIN POINTS — ink background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.ink }}>
          <div style={wrapNarrow} className="section-pad">
            <Reveal>
              <span style={LABEL_DIM}>Sound familiar</span>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.cream, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 48 }}>
                You texted fine.<br /><I c={`${C.cream}35`}>She just stopped replying.</I>
              </h2>
            </Reveal>

            <div className="pain-grid">
              {PAINS.map((p, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <Tilt str={5}>
                    <div style={{
                      background: `${C.cream}04`, border: `1px solid rgba(243,237,226,0.08)`,
                      borderRadius: 20, padding: 22, height: '100%',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 16 }}>
                        <p style={{ fontSize: 13, color: `${C.cream}45`, lineHeight: 1.55 }}>{p.s}</p>
                        <span style={{ flexShrink: 0, background: `${p.lc}18`, border: `1px solid ${p.lc}35`, color: p.lc, fontSize: 9.5, fontWeight: 800, padding: '3px 9px', borderRadius: 999, letterSpacing: '0.06em', textTransform: 'uppercase' as const, fontFamily: 'monospace' }}>{p.label}</span>
                      </div>
                      {/* Dark-bg chat bubbles */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14, background: `${C.cream}03`, borderRadius: 12, padding: '10px 10px' }}>
                        {p.chat.map((m, j) => (
                          <motion.div key={j} initial={{ opacity: 0, x: (m as any).s ? 10 : -10 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.4, delay: j * 0.1 }}
                            style={{ display: 'flex', justifyContent: (m as any).s ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '82%', padding: '8px 12px', borderRadius: 12,
                              borderBottomRightRadius: (m as any).s ? 3 : 12,
                              borderBottomLeftRadius: (m as any).s ? 12 : 3,
                              fontSize: 12.5, lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif",
                              background: (m as any).s ? ((m as any).bad ? `${C.red}18` : 'rgba(243,237,226,0.12)') : 'rgba(243,237,226,0.06)',
                              border: `1px solid ${(m as any).s && (m as any).bad ? `${C.red}25` : 'rgba(243,237,226,0.08)'}`,
                              color: (m as any).s && (m as any).bad ? '#fca5a5' : `${C.cream}75`,
                            }}>{m.t}</div>
                          </motion.div>
                        ))}
                      </div>
                      <p style={{ fontSize: 11.5, color: `${C.cream}28`, borderTop: `1px solid rgba(243,237,226,0.07)`, paddingTop: 12, lineHeight: 1.6 }}>→ {p.s === PAINS[0].s ? 'No follow-up question. She has to carry it all.' : p.s === PAINS[1].s ? 'You gave facts. She wanted energy.' : 'Your reply was 4 words. Enthusiasm killed.'}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HR />

        {/* ════════════════════════════════════════════════════════════════
            10 SIGNALS — cream bg
        ════════════════════════════════════════════════════════════════ */}
        <section>
          <div style={wrapNarrow} className="section-pad">
            <Reveal>
              <span style={LABEL}>What gets decoded</span>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 48 }}>
                10 layers.<br /><I c={C.muted}>Every reply. Every signal.</I>
              </h2>
            </Reveal>
            <div className="signals-grid">
              {[
                { icon: '💘', label: 'Attraction Probability', desc: '% score from 11 behavioral signals', color: C.red, premium: true },
                { icon: '⚡', label: 'Conversation Momentum', desc: 'Heating up or dying? Per message.', color: C.amber, premium: true },
                { icon: '🎯', label: 'Missed Opportunities', desc: 'Exact moments you could have escalated', color: C.red, premium: true },
                { icon: '📊', label: 'Energy Ratio', desc: 'Reply length imbalance = disinterest', color: C.muted, premium: false },
                { icon: '🪞', label: 'Mirroring Detection', desc: 'They copy your words = attraction tell', color: '#5A8A5A', premium: false },
                { icon: '⏱', label: 'Response Time', desc: 'What their reply speed reveals right now', color: C.amber, premium: false },
                { icon: '🧠', label: 'Emotional Investment', desc: 'How much they revealed about themselves', color: C.muted, premium: false },
                { icon: '🔥', label: 'Roast Mode', desc: 'Brutal. Honest. Comedy format.', color: C.red, premium: false },
                { icon: '✍️', label: 'AI Reply Suggestions', desc: '3 options — witty, warm, direct', color: '#5A8A5A', premium: true },
                { icon: '🌊', label: 'Psychological Subtext', desc: "What they're actually saying", color: C.amber, premium: true },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <Tilt str={4}>
                    <div style={{
                      background: C.cream, border: `1.5px solid ${C.warm2}`, borderRadius: 16, padding: '16px 18px',
                      height: '100%', position: 'relative',
                      boxShadow: '0 2px 8px rgba(15,12,9,0.04)',
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${s.color}50, transparent)`, borderRadius: '16px 16px 0 0' }} />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                        <span style={{ fontSize: 20 }}>{s.icon}</span>
                        {s.premium && (
                          <span style={{ fontSize: 8.5, fontWeight: 800, color: C.amber, background: `${C.amber}12`, border: `1px solid ${C.amber}25`, borderRadius: 999, padding: '2px 6px', letterSpacing: '0.06em', fontFamily: 'monospace' }}>PREMIUM</span>
                        )}
                      </div>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: C.ink, marginBottom: 5, lineHeight: 1.3 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HR />

        {/* ════════════════════════════════════════════════════════════════
            HOW IT WORKS — ink background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.ink }}>
          <div style={wrapNarrow} className="section-pad">
            <Reveal>
              <span style={LABEL_DIM}>The process</span>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.cream, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 52 }}>
                Three steps.
              </h2>
            </Reveal>
            <div style={{ maxWidth: 640 }}>
              {[
                { n: '01', title: 'Upload a screenshot',        desc: 'Any app — iMessage, WhatsApp, Instagram, Hinge, Slack. OCR extracts text instantly. Screenshot deleted after 60s.' },
                { n: '02', title: 'AI reads the subtext',       desc: 'Not just words — response timing, energy ratios, question deflection, mirroring, emotional trajectory. 10 signal layers.' },
                { n: '03', title: 'Get your edge',              desc: 'Exact mistakes. What they felt. 3 suggested replies. Probability they\'re into you. Nothing withheld.' },
              ].map(({ n, title, desc }, i) => (
                <motion.div key={n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.6 }}
                  style={{ display: 'flex', gap: 28, padding: '28px 0', borderBottom: `1px solid rgba(243,237,226,0.07)` }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 48, fontWeight: 900, color: `${C.cream}18`, lineHeight: 1, flexShrink: 0, width: 56 }}>{n}</div>
                  <div style={{ paddingTop: 4 }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 800, color: C.cream, marginBottom: 7 }}>{title}</div>
                    <div style={{ fontSize: 14.5, color: `${C.cream}50`, lineHeight: 1.75 }}>{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <HR />

        {/* ════════════════════════════════════════════════════════════════
            ROAST MODE — cream background
        ════════════════════════════════════════════════════════════════ */}
        <section>
          <div style={wrapNarrow} className="section-pad">
            <Reveal>
              <span style={{ ...LABEL, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                🔥 Roast Mode
              </span>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 36 }}>
                Brutal honesty.<br /><I c={C.muted}>Delivered like a comedian.</I>
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ maxWidth: 680, background: C.warm1, border: `1.5px solid ${C.warm2}`, borderRadius: 20, padding: 'clamp(24px, 4vw, 40px)', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: -12, left: 16, fontSize: 88, color: C.warm2, fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none' }}>"</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24, background: C.cream, borderRadius: 14, padding: '12px 12px', border: `1px solid ${C.warm2}` }}>
                  <Bub text="I think we'd really get along if you gave me a chance 🙏" self bad />
                  <Bub text="aww haha thanks 🥰" delay={0.4} />
                </div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 0.8 }}>
                  <p style={{ fontSize: 'clamp(15px, 2vw, 21px)', fontFamily: 'Georgia, serif', fontStyle: 'italic', color: C.ink, lineHeight: 1.6, marginBottom: 12 }}>
                    "She said 'aww haha thanks'. That is not flirting. That is customer service. You are being handled, not pursued. The 🥰 is her way of returning your emotion without matching it — like tipping 10% on a good meal."
                  </p>
                  <p style={{ fontSize: 11, color: C.muted, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 700 }}>— ConvoCoach Roast Mode™</p>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </section>

        <HR />

        {/* ════════════════════════════════════════════════════════════════
            BEFORE / AFTER — ink background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.ink }}>
          <div style={wrapNarrow} className="section-pad">
            <Reveal>
              <span style={LABEL_DIM}>Before vs. after</span>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.cream, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 12 }}>
                Small shifts.
              </h2>
              <p style={{ fontSize: 15, color: `${C.cream}40`, marginBottom: 44, lineHeight: 1.7 }}>One reply change can flip the entire trajectory.</p>
            </Reveal>
            <div className="before-after">
              {[
                { title: 'The Mistake', tc: C.red, bc: `${C.red}06`, brd: `${C.red}18`,
                  msgs: [{ t: 'worked all day, went to gym. you?' }, { t: 'nice. just chilled.', s: true, bad: true }],
                  note: 'Zero acknowledgment. No follow-up. She has to carry it.' },
                { title: 'The Fix', tc: '#5A8A5A', bc: 'rgba(90,138,90,0.06)', brd: 'rgba(90,138,90,0.18)',
                  msgs: [{ t: 'worked all day, went to gym. you?' }, { t: "survived my inbox. gym people honestly intimidate me — what do you even lift?", s: true }],
                  note: 'Playful self-deprecation + real follow-up. She has something to work with.' },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <Tilt str={4}>
                    <div style={{ background: s.bc, border: `1px solid ${s.brd}`, borderRadius: 18, padding: '22px 22px', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.tc, display: 'block' }} />
                        <span style={{ fontSize: 10.5, color: s.tc, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontFamily: 'monospace' }}>{s.title}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, background: `${C.cream}04`, borderRadius: 12, padding: '10px 10px' }}>
                        {s.msgs.map((m, j) => (
                          <motion.div key={j} initial={{ opacity: 0, x: (m as any).s ? 10 : -10 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.4, delay: j * 0.12 }}
                            style={{ display: 'flex', justifyContent: (m as any).s ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '85%', padding: '8px 12px', borderRadius: 12,
                              borderBottomRightRadius: (m as any).s ? 3 : 12, borderBottomLeftRadius: (m as any).s ? 12 : 3,
                              fontSize: 12.5, lineHeight: 1.45, fontFamily: "'DM Sans', sans-serif",
                              background: (m as any).s ? ((m as any).bad ? `${C.red}18` : 'rgba(243,237,226,0.13)') : 'rgba(243,237,226,0.06)',
                              border: `1px solid ${(m as any).s && (m as any).bad ? `${C.red}25` : 'rgba(243,237,226,0.08)'}`,
                              color: (m as any).s && (m as any).bad ? '#fca5a5' : `${C.cream}75`,
                            }}>{m.t}</div>
                          </motion.div>
                        ))}
                      </div>
                      <p style={{ fontSize: 12, color: `${C.cream}35`, borderTop: `1px solid ${s.brd}`, paddingTop: 13, lineHeight: 1.65 }}>{s.note}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HR />

        {/* ════════════════════════════════════════════════════════════════
            PRACTICE MODE — cream background
        ════════════════════════════════════════════════════════════════ */}
        <section>
          <div style={wrapNarrow} className="section-pad">
            <div className="practice-grid">
              <Reveal>
                <div>
                  <span style={LABEL}>Practice Mode</span>
                  <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 4.5vw, 52px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 16 }}>
                    Train against<br /><I c={C.muted}>every personality.</I>
                  </h2>
                  <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, marginBottom: 28, maxWidth: 380 }}>
                    10 distinct AI characters across 3 scenario categories. Three difficulty levels. Real-time coaching on beginner.
                  </p>

                  {/* Category pills */}
                  <div style={{ display: 'flex', gap: 7, marginBottom: 22, flexWrap: 'wrap' }}>
                    {['💘 Dating', '💼 Professional', '🫂 Social'].map((cat) => (
                      <span key={cat} style={{ fontSize: 11, fontWeight: 600, color: C.muted, background: C.warm1, border: `1px solid ${C.warm2}`, borderRadius: 999, padding: '5px 12px', fontFamily: "'DM Sans', sans-serif" }}>{cat}</span>
                    ))}
                  </div>

                  {/* Persona list */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 26 }}>
                    {PERSONAS.map((p, i) => (
                      <motion.button key={i} onClick={() => setPersona(i)} whileHover={{ x: 3 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px',
                          borderRadius: 12, cursor: 'pointer', background: persona === i ? C.ink : 'transparent',
                          border: `1px solid ${persona === i ? C.ink : 'transparent'}`, transition: 'all 0.2s', textAlign: 'left',
                        }}>
                        <span style={{ fontSize: 18 }}>{['😏', '🌸', '💜', '😑'][i]}</span>
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: persona === i ? C.cream : C.ink, fontFamily: "'DM Sans', sans-serif" }}>{p.name}</div>
                          <div style={{ fontSize: 11, color: persona === i ? `${C.cream}50` : C.mutedLt }}>{p.trait}</div>
                        </div>
                        {persona === i && <motion.span layoutId="psel" style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: C.red, display: 'block' }} />}
                      </motion.button>
                    ))}
                  </div>

                  <Link href="/practice">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      style={{ background: C.warm1, border: `1.5px solid ${C.warm2}`, color: C.ink, borderRadius: 12, padding: '12px 22px', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Start Practicing →
                    </motion.button>
                  </Link>
                </div>
              </Reveal>

              {/* Phone mockup */}
              <Reveal delay={0.15} className="phone-wrap">
                <motion.div style={{ rotate: -3 }} whileHover={{ rotate: 0 }} transition={{ duration: 0.4 }}>
                  <Phone>
                    {/* Header */}
                    <div style={{ padding: '30px 14px 12px', borderBottom: `1px solid rgba(243,237,226,0.07)`, display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: `${C.cream}08`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                        {['😏', '🌸', '💜', '😑'][persona]}
                      </div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.cream, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{PERSONAS[persona].name}</div>
                        <motion.div key={persona} animate={{ opacity: [0, 1] }} transition={{ type: 'tween', duration: 0.4 }}
                          style={{ fontSize: 9.5, color: `${C.cream}30` }}>typing...</motion.div>
                      </div>
                    </div>
                    {/* Messages */}
                    <div style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 7 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ background: `${C.cream}12`, border: `1px solid rgba(243,237,226,0.1)`, borderRadius: '12px 12px 3px 12px', padding: '8px 12px', maxWidth: '82%', fontSize: 12.5, color: `${C.cream}80`, fontFamily: "'DM Sans', sans-serif" }}>
                          hey what kind of music do you like?
                        </div>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.div key={persona} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          transition={{ type: 'spring', stiffness: 180, damping: 24 }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                            <div style={{ background: `${C.cream}06`, border: `1px solid rgba(243,237,226,0.08)`, borderRadius: '12px 12px 12px 3px', padding: '8px 12px', maxWidth: '82%', fontSize: 12.5, color: `${C.cream}70`, fontFamily: "'DM Sans', sans-serif" }}>
                              {PERSONAS[persona].reply}
                            </div>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                      {/* Typing dots */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '8px 12px', background: `${C.cream}05`, borderRadius: '12px 12px 12px 3px', width: 'fit-content' }}>
                        {[0, 0.2, 0.4].map((d, i) => (
                          <motion.span key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: `${C.cream}30`, display: 'block' }}
                            animate={{ y: [0, -4, 0] }} transition={{ type: 'tween', duration: 0.8, delay: d, repeat: Infinity, ease: 'easeInOut' }} />
                        ))}
                      </div>
                    </div>
                    {/* Input */}
                    <div style={{ padding: '10px 12px', borderTop: `1px solid rgba(243,237,226,0.06)` }}>
                      <div style={{ background: `${C.cream}06`, borderRadius: 18, padding: '8px 14px' }}>
                        <span style={{ fontSize: 12, color: `${C.cream}20`, fontFamily: "'DM Sans', sans-serif" }}>Your message...</span>
                      </div>
                    </div>
                  </Phone>
                </motion.div>
              </Reveal>
            </div>
          </div>
        </section>

        <HR />

        {/* ════════════════════════════════════════════════════════════════
            RANK SYSTEM — ink background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.ink }}>
          <div style={wrapNarrow} className="section-pad">
            <Reveal>
              <span style={LABEL_DIM}>Skill system</span>
              <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.cream, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 48 }}>
                Your rank reflects<br /><I c={`${C.cream}30`}>what you've learned.</I>
              </h2>
            </Reveal>
            <div className="rank-grid">
              {[
                { e: '💤', n: 'Dry Texter',    pts: '0',   d: 'One-word replies. K energy.',     dim: true,  gold: false },
                { e: '😏', n: 'Average',        pts: '50',  d: 'Can hold a convo. Barely.',        dim: false, gold: false },
                { e: '✨', n: 'Smooth Talker',  pts: '150', d: 'Witty. Makes them lean in.',       dim: false, gold: false },
                { e: '👑', n: 'Elite Charmer',  pts: '300', d: 'They text first. Always.',         dim: false, gold: true  },
              ].map((l, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <div style={{
                    background: l.gold ? `${C.amber}08` : `${C.cream}03`,
                    border: `1px solid ${l.gold ? `${C.amber}20` : 'rgba(243,237,226,0.07)'}`,
                    borderRadius: 16, padding: '20px 18px', textAlign: 'center', opacity: l.dim ? 0.4 : 1,
                  }}>
                    <div style={{ fontSize: 26, marginBottom: 10 }}>{l.e}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: l.gold ? C.amber : C.cream, marginBottom: 4, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{l.n}</div>
                    <div style={{ fontSize: 10.5, color: `${C.cream}25`, marginBottom: 8, fontFamily: 'monospace' }}>{l.pts}+ pts</div>
                    <div style={{ fontSize: 11.5, color: `${C.cream}35`, lineHeight: 1.55 }}>{l.d}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <HR />

        {/* ════════════════════════════════════════════════════════════════
            FINAL CTA — cream, asymmetric
        ════════════════════════════════════════════════════════════════ */}
        <section>
          <div style={wrapNarrow} className="section-pad">
            <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(48px, 7vw, 80px)', fontWeight: 900, color: C.ink, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.0 }}>
                    Stop sending<br /><I c={C.red}>cringe texts.</I>
                  </h2>
                  <p style={{ fontSize: 15, color: C.muted, marginTop: 18, lineHeight: 1.7, maxWidth: 360 }}>
                    First analysis is 100% free. No account required. Find out what's actually going wrong.
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <Link href="/upload">
                    <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 48px ${C.red}30` }} whileTap={{ scale: 0.96 }}
                      style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 16, padding: '18px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'block' }}>
                      Analyze My Chat Now →
                    </motion.button>
                  </Link>
                  <p style={{ fontSize: 11, color: C.mutedLt, marginTop: 10, textAlign: 'center' }}>Free · Screenshot deleted instantly · No card</p>
                </div>
              </div>
              {/* Decorative rule */}
              <div style={{ height: 3, background: C.red, marginTop: 72, borderRadius: 2 }} />
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}