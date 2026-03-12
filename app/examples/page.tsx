'use client';

import { useRef, useState, useEffect } from 'react';
import {
  motion, useScroll, useTransform, useSpring,
  useMotionValue, AnimatePresence
} from 'framer-motion';
import Link from 'next/link';

// ─── Spring / easing configs (matches page.tsx) ───────────────────────────────
const SP = { type: 'spring', stiffness: 180, damping: 24 } as const;
const EO = { duration: 0.75, ease: [0.16, 1, 0.3, 1] } as const;

// ─── Magnetic tilt hook ───────────────────────────────────────────────────────
function useTilt(str = 10) {
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    rx.set(dy * -str); ry.set(dx * str);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return { ref, rotateX: useSpring(rx, { stiffness: 200, damping: 30 }), rotateY: useSpring(ry, { stiffness: 200, damping: 30 }), onMove, onLeave };
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 30, className = '' }:
  { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }} transition={{ ...EO, delay }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Tilt wrapper ─────────────────────────────────────────────────────────────
function Tilt({ children, str = 8, style = {} }:
  { children: React.ReactNode; str?: number; style?: React.CSSProperties }) {
  const { ref, rotateX, rotateY, onMove, onLeave } = useTilt(str);
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', ...style }}>
      {children}
    </motion.div>
  );
}

// ─── Italic serif accent ──────────────────────────────────────────────────────
function I({ children, c = '#a5b4fc' }: { children: React.ReactNode; c?: string }) {
  return <span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', color: c, fontWeight: 400 }}>{children}</span>;
}

// ─── Animated bar ─────────────────────────────────────────────────────────────
function Bar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
      <motion.div style={{ height: '100%', background: color, borderRadius: 99 }}
        initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}

// ─── SVG Score Ring ───────────────────────────────────────────────────────────
function Ring({ val, max, color, label, size = 72 }:
  { val: number; max: number; color: string; label: string; size?: number }) {
  const r = size / 2 - 7; const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4}/>
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
            strokeLinecap="round" initial={{ strokeDasharray: `0 ${circ}` }}
            whileInView={{ strokeDasharray: `${(val/max)*circ} ${circ}` }} viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16,1,0.3,1], delay: 0.3 }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize: 13, fontWeight: 700, color, fontFamily:"'DM Sans',sans-serif" }}>
            {max === 10 ? val.toFixed(1) : `${val}`}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 9, color: 'rgba(242,240,235,0.3)', textTransform:'uppercase', letterSpacing:'0.09em', fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
    </div>
  );
}

// ─── Chat bubble (matches page.tsx) ──────────────────────────────────────────
function Bub({ text, self, bad, delay = 0 }:
  { text: string; self?: boolean; bad?: boolean; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: self ? 10 : -10, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }} viewport={{ once: true }}
      transition={{ ...SP, delay }}
      style={{ display: 'flex', justifyContent: self ? 'flex-end' : 'flex-start', width: '100%' }}>
      <div style={{
        maxWidth: '82%', padding: '10px 14px', borderRadius: 16,
        borderBottomRightRadius: self ? 4 : 16, borderBottomLeftRadius: self ? 16 : 4,
        fontSize: 13, lineHeight: 1.55, fontFamily: "'DM Sans',sans-serif",
        background: self ? (bad ? 'rgba(255,60,40,0.1)' : 'rgba(91,79,233,0.16)') : 'rgba(255,255,255,0.05)',
        border: self ? (bad ? '1px solid rgba(255,60,40,0.22)' : '1px solid rgba(91,79,233,0.22)') : '1px solid rgba(255,255,255,0.08)',
        color: bad ? '#fca5a5' : 'rgba(242,240,235,0.88)',
      }}>{text}</div>
    </motion.div>
  );
}

// ─── Diagonal SVG divider (exact copy from page.tsx) ─────────────────────────
function DiagDivider({ flip = false, floatEl }: { flip?: boolean; floatEl?: React.ReactNode }) {
  const leftY = flip ? 0 : 80;
  const rightY = flip ? 80 : 0;
  return (
    <div style={{ position: 'relative', height: 120, width: '100%', overflow: 'visible', zIndex: 20, pointerEvents: 'none', marginTop: -30, marginBottom: -30 }}>
      <svg viewBox="0 0 1440 120" preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block', filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.8))' }}>
        <defs>
          <linearGradient id={`ng-${flip ? 'f' : 'n'}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(91,79,233,0.9)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id={`sh-${flip ? 'f' : 'n'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.9)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
        <path d={`M0,${leftY} L1440,${rightY} L1440,120 L0,120 Z`} fill="#030305" />
        <path d={`M0,${leftY} L1440,${rightY} L1440,120 L0,120 Z`} fill={`url(#sh-${flip ? 'f' : 'n'})`} />
        <line x1="0" y1={leftY} x2="1440" y2={rightY} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <line x1="0" y1={leftY} x2="1440" y2={rightY} stroke={`url(#ng-${flip ? 'f' : 'n'})`} strokeWidth="4" style={{ filter: 'blur(3px)' }} />
      </svg>
      {floatEl && (
        <div style={{ position: 'absolute', top: '33.3%', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto', zIndex: 30 }}>
          <motion.div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transformOrigin: 'top center' }}
            animate={{ rotateZ: [-3, 3, -3] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}>
            <div style={{ width: 2, height: 40, background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.1))', boxShadow: '0 0 10px rgba(255,255,255,0.5)', borderRadius: 2 }} />
            {floatEl}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── Chip (matches page.tsx) ──────────────────────────────────────────────────
function Chip({ label, sub, accent = '#a5b4fc' }: { label: string; sub?: string; accent?: string }) {
  return (
    <div style={{
      background: 'rgba(12,12,20,0.92)', backdropFilter: 'blur(20px)',
      border: `1px solid ${accent}30`, borderRadius: 16, padding: '10px 18px',
      boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`,
      display: 'flex', flexDirection: 'column', gap: 2, whiteSpace: 'nowrap',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: accent, letterSpacing: '0.05em', fontFamily: "'DM Sans',sans-serif" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'rgba(242,240,235,0.5)', fontFamily: "'DM Sans',sans-serif" }}>{sub}</div>}
    </div>
  );
}

// ─── Particle field (matches page.tsx) ───────────────────────────────────────
const DOTS = Array.from({ length: 16 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: Math.random() * 100,
  sz: Math.random() * 2 + 0.5, dur: Math.random() * 8 + 5, d: Math.random() * 4,
}));
function Particles() {
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {DOTS.map(d => (
        <motion.div key={d.id} style={{ position: 'absolute', left: `${d.x}%`, top: `${d.y}%`, width: d.sz, height: d.sz, borderRadius: '50%', background: 'rgba(91,79,233,0.5)' }}
          animate={{ y: [-8, 8, -8], opacity: [0.15, 0.55, 0.15] }}
          transition={{ duration: d.dur, delay: d.d, repeat: Infinity, ease: 'easeInOut' }} />
      ))}
    </div>
  );
}

// ─── DATA ──────────────────────────────────────────────────────────────────────
const CASES = [
  {
    id: '01',
    title: 'The Deflected Signal',
    category: 'Missed',
    verdict: 'Killed it',
    verdictOk: false,
    score: 6.1,
    short: 'She called you trouble. You denied it. Momentum died.',
    messages: [
      { text: "You seem like trouble lol", self: false },
      { text: "haha no I'm actually pretty chill", self: true, bad: true },
    ],
    fix: "Only on weekends. You scared?",
    metrics: { interest: 75, engagement: 40, humor: 10, momentum: 30 },
    diagnosis: 'When she calls you trouble, she is building a playful frame and inviting you in. Accepting the frame kills the tension she was creating.',
    flags: ['No escalation', 'Deflected frame', 'Momentum flatlined'],
  },
  {
    id: '02',
    title: 'The Job Interview',
    category: 'Killer',
    verdict: 'Interrogation',
    verdictOk: false,
    score: 4.5,
    short: 'Three questions. Zero statements. She answers out of politeness.',
    messages: [
      { text: "What do you do for work?", self: true },
      { text: "I'm a nurse", self: false },
      { text: "Oh nice. Do you like it?", self: true, bad: true },
    ],
    fix: "Respect. You must have wild night shift stories.",
    metrics: { interest: 45, engagement: 80, humor: 5, momentum: 20 },
    diagnosis: 'Questions extract information. Statements create connection. "I\'m a nurse" deserved imagination, not a follow-up question.',
    flags: ['3 questions, 0 statements', 'No emotional spike', 'Interview frame'],
    roast: "You are not HR. Stop conducting a job interview on a dating app.",
  },
  {
    id: '03',
    title: 'Textbook Escalation',
    category: 'Good',
    verdict: 'Nailed it',
    verdictOk: true,
    score: 9.2,
    short: 'Challenge accepted, escalated with specific detail, tension created.',
    messages: [
      { text: "I bet I could beat you at Mario Kart", self: false },
      { text: "I will literally ruin your self-esteem on Rainbow Road.", self: true },
    ],
    fix: null,
    metrics: { interest: 88, engagement: 90, humor: 85, momentum: 95 },
    diagnosis: '"Rainbow Road" is what separates banter from memorable banter. Specificity signals you actually play — and plants a future scenario without asking for one.',
    flags: ['Specific escalation', 'Created tension', 'Implicit date seed'],
  },
  {
    id: '04',
    title: 'The Low Effort Sink',
    category: 'Killer',
    verdict: 'Deflated',
    verdictOk: false,
    score: 3.8,
    short: 'High-intent question. Low-effort answer. You made her do all the work.',
    messages: [
      { text: "So what are you up to this weekend? Any fun plans?", self: false },
      { text: "Not much, just chilling. you?", self: true, bad: true },
    ],
    fix: "Escaping the city for a bit. What kind of trouble are you getting into?",
    metrics: { interest: 60, engagement: 20, humor: 0, momentum: 15 },
    diagnosis: 'She invested in a two-part question. You matched it with four words and a bounce-back. Effort mismatch signals either low interest or low care — neither is good.',
    flags: ['Effort mismatch', 'Bounce-back question', 'Zero personality'],
  },
];

const CATEGORIES = ['All', 'Good', 'Missed', 'Killer'];

// ─── MODAL ─────────────────────────────────────────────────────────────────────
function Modal({ c, onClose }: { c: typeof CASES[0]; onClose: () => void }) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', h);
    return () => document.removeEventListener('keydown', h);
  }, [onClose]);

  const scoreColor = c.verdictOk ? '#6ee7b7' : c.score >= 6 ? '#fcd34d' : '#fca5a5';
  const flagColor = c.verdictOk ? 'rgba(16,185,129,0.08)' : 'rgba(255,60,40,0.08)';
  const flagBorder = c.verdictOk ? 'rgba(16,185,129,0.18)' : 'rgba(255,60,40,0.18)';
  const flagText = c.verdictOk ? '#6ee7b7' : '#fca5a5';

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(3,3,5,0.85)', backdropFilter: 'blur(10px)' }} />

      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={{ ...SP }}
        style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 820, maxHeight: '88vh',
          background: '#07070f', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
          boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 10, color: 'rgba(242,240,235,0.25)', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>Case {c.id}</span>
            <div style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: 10, color: scoreColor, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>{c.verdict}</span>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'rgba(242,240,235,0.4)', fontSize: 18, lineHeight: 1 }}>
            ×
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap' }}>

          {/* Left: chat */}
          <div style={{ flex: '1 1 300px', padding: '24px', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ marginBottom: 20 }}>
              <h3 style={{ fontSize: 20, fontWeight: 600, color: '#F2F0EB', margin: '0 0 8px', fontFamily: "'DM Sans',sans-serif" }}>{c.title}</h3>
              <p style={{ fontSize: 13, color: 'rgba(242,240,235,0.4)', lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>{c.short}</p>
            </div>

            <div style={{ fontSize: 10, color: 'rgba(242,240,235,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>Thread</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 20 }}>
              {c.messages.map((m, i) => <Bub key={i} text={m.text} self={m.self} bad={(m as any).bad} delay={i * 0.1} />)}
            </div>

            {c.fix && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: 'rgba(242,240,235,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Better version</div>
                <div style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.16)', borderRadius: 14, padding: '11px 14px' }}>
                  <Bub text={c.fix} self />
                </div>
              </div>
            )}

            {/* Flags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.flags.map(f => (
                <span key={f} style={{ fontSize: 10, fontWeight: 600, padding: '4px 9px', borderRadius: 6, background: flagColor, border: `1px solid ${flagBorder}`, color: flagText, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Right: analysis */}
          <div style={{ flex: '1 1 260px', padding: '24px' }}>
            <div style={{ fontSize: 10, color: 'rgba(242,240,235,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 18, fontFamily: "'DM Sans',sans-serif" }}>Analysis</div>

            {/* Score rings */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 22, flexWrap: 'wrap' }}>
              <Ring val={c.score} max={10} color={scoreColor} label="Score" size={68} />
              <Ring val={c.metrics.interest} max={100} color="#a5b4fc" label="Interest" size={68} />
              <Ring val={c.metrics.momentum} max={100} color="#fcd34d" label="Momentum" size={68} />
            </div>

            {/* Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 22 }}>
              {[
                { l: 'Engagement', v: c.metrics.engagement, c: '#a5b4fc' },
                { l: 'Humor', v: c.metrics.humor, c: '#fcd34d' },
                { l: 'Momentum', v: c.metrics.momentum, c: '#86efac' },
              ].map((b, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(242,240,235,0.3)', marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
                    <span>{b.l}</span><span>{b.v}%</span>
                  </div>
                  <Bar pct={b.v} color={b.c} delay={0.2 + i * 0.1} />
                </div>
              ))}
            </div>

            {/* Diagnosis */}
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px', marginBottom: c.roast ? 14 : 0 }}>
              <div style={{ fontSize: 10, color: 'rgba(242,240,235,0.22)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Diagnosis</div>
              <p style={{ fontSize: 13, color: 'rgba(242,240,235,0.6)', lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans',sans-serif" }}>{c.diagnosis}</p>
            </div>

            {/* Roast */}
            {c.roast && (
              <div style={{ background: 'rgba(255,96,64,0.06)', border: '1px solid rgba(255,96,64,0.15)', borderRadius: 14, padding: '14px 16px' }}>
                <div style={{ fontSize: 10, color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 600, fontFamily: "'DM Sans',sans-serif" }}>Verdict</div>
                <p style={{ fontSize: 13, fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', color: 'rgba(242,240,235,0.7)', lineHeight: 1.65, margin: 0 }}>"{c.roast}"</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── CASE CARD ──────────────────────────────────────────────────────────────────
function CaseCard({ c, i, onClick }: { c: typeof CASES[0]; i: number; onClick: () => void }) {
  const scoreColor = c.verdictOk ? '#6ee7b7' : c.score >= 6 ? '#fcd34d' : '#fca5a5';
  const flagColor = c.verdictOk ? 'rgba(16,185,129,0.08)' : 'rgba(255,60,40,0.08)';
  const flagBorder = c.verdictOk ? 'rgba(16,185,129,0.15)' : 'rgba(255,60,40,0.15)';
  const flagText = c.verdictOk ? '#6ee7b7' : '#fca5a5';

  return (
    <Reveal delay={i * 0.08}>
      <Tilt str={6} style={{ height: '100%' }}>
        <motion.div
          onClick={onClick}
          whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.12)' }}
          transition={{ duration: 0.25 }}
          style={{
            height: '100%', cursor: 'pointer',
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 22, overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Thin score stripe */}
          <div style={{ height: 2, background: `linear-gradient(90deg, ${scoreColor}80, transparent)` }} />

          <div style={{ padding: '22px 22px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14, gap: 10 }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 10, color: scoreColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.09em', marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
                  {c.category} · {c.verdict}
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: '#F2F0EB', margin: 0, lineHeight: 1.2, fontFamily: "'DM Sans',sans-serif" }}>{c.title}</h3>
              </div>
              <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 24, fontWeight: 700, color: scoreColor, lineHeight: 1, fontFamily: "'DM Sans',sans-serif" }}>{c.score}</span>
                <span style={{ fontSize: 9, color: 'rgba(242,240,235,0.22)', fontFamily: "'DM Sans',sans-serif" }}>/ 10</span>
              </div>
            </div>

            {/* Mini chat preview */}
            <div style={{ background: 'rgba(6,6,8,0.8)', borderRadius: 14, padding: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 14, position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {c.messages.slice(0, 2).map((m, j) => (
                  <div key={j} style={{ display: 'flex', justifyContent: m.self ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '80%', padding: '7px 11px', borderRadius: 12,
                      borderBottomRightRadius: m.self ? 3 : 12, borderBottomLeftRadius: m.self ? 12 : 3,
                      fontSize: 12, lineHeight: 1.45, fontFamily: "'DM Sans',sans-serif",
                      background: m.self ? ((m as any).bad ? 'rgba(255,60,40,0.1)' : 'rgba(91,79,233,0.16)') : 'rgba(255,255,255,0.05)',
                      border: m.self ? ((m as any).bad ? '1px solid rgba(255,60,40,0.2)' : '1px solid rgba(91,79,233,0.2)') : '1px solid rgba(255,255,255,0.07)',
                      color: (m as any).bad ? '#fca5a5' : 'rgba(242,240,235,0.75)',
                    }}>{m.text}</div>
                  </div>
                ))}
              </div>
              {/* Fade */}
              <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: 28, background: 'linear-gradient(to top, rgba(6,6,8,0.9), transparent)' }} />
            </div>

            {/* Short desc */}
            <p style={{ fontSize: 12, color: 'rgba(242,240,235,0.35)', lineHeight: 1.6, margin: '0 0 14px', fontFamily: "'DM Sans',sans-serif" }}>{c.short}</p>

            {/* Flags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto' }}>
              {c.flags.map(f => (
                <span key={f} style={{ fontSize: 9, fontWeight: 600, padding: '3px 8px', borderRadius: 5, background: flagColor, border: `1px solid ${flagBorder}`, color: flagText, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div style={{ padding: '12px 22px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              {[['Interest', c.metrics.interest], ['Momentum', c.metrics.momentum]].map(([label, val]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <div style={{ width: 28, height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 1, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: scoreColor, borderRadius: 1 }} />
                  </div>
                  <span style={{ fontSize: 9, color: 'rgba(242,240,235,0.22)', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'DM Sans',sans-serif" }}>{(label as string).slice(0, 3)}</span>
                </div>
              ))}
            </div>
            <span style={{ fontSize: 11, color: 'rgba(242,240,235,0.22)', fontFamily: "'DM Sans',sans-serif" }}>View →</span>
          </div>
        </motion.div>
      </Tilt>
    </Reveal>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function ExamplesPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const heroO = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const { scrollY } = useScroll();
  const orb1Y = useTransform(scrollY, [0, 1500], [0, -100]);

  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState<typeof CASES[0] | null>(null);

  const filtered = filter === 'All' ? CASES : CASES.filter(c => c.category === filter);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        ::selection { background: rgba(91,79,233,0.3); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(91,79,233,0.35); border-radius: 2px; }

        @keyframes floatA {
          0%,100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .fa { animation: floatA 6s ease-in-out infinite; }

        .cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 18px;
        }

        @media (max-width: 768px) {
          .cases-grid { grid-template-columns: 1fr; }
          .hero-inner { padding: 100px 20px 60px !important; }
          .section-inner { padding: 80px 20px !important; }
          .two-col { flex-direction: column !important; }
          .before-after { grid-template-columns: 1fr !important; }
          .stat-strip { flex-wrap: wrap !important; gap: 20px !important; }
        }
        @media (max-width: 480px) {
          .cases-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div style={{ background: '#060608', color: '#F2F0EB', fontFamily: "'DM Sans',sans-serif", overflowX: 'hidden', minHeight: '100vh' }}>

        {/* ══════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════ */}
        <section ref={heroRef} style={{ minHeight: '90svh', position: 'relative', display: 'flex', alignItems: 'center', overflow: 'hidden' }}>

          {/* Orbs */}
          <motion.div style={{ y: orb1Y, position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)', width: 'min(800px,130vw)', height: 'min(800px,130vw)', background: 'radial-gradient(circle, rgba(91,79,233,0.11) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />

          {/* Grid */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

          <Particles />

          <motion.div style={{ y: heroY, opacity: heroO, width: '100%', position: 'relative', zIndex: 10 }}>
            <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%' }} className="hero-inner" >
              <div style={{ display: 'flex', alignItems: 'center', gap: 64, flexWrap: 'wrap', padding: '120px 32px 80px' }}>

                {/* Copy */}
                <div style={{ flex: '1 1 360px', minWidth: 0 }}>
                  <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={EO}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(91,79,233,0.1)', border: '1px solid rgba(91,79,233,0.22)', borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
                    <motion.div style={{ width: 6, height: 6, borderRadius: '50%', background: '#5B4FE9' }}
                      animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
                    <span style={{ fontSize: 11, fontWeight: 500, color: '#a5b4fc', letterSpacing: '0.07em', textTransform: 'uppercase' }}>Analysis Engine · Case Files</span>
                  </motion.div>

                  <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ ...EO, delay: 0.08 }}
                    style={{ fontSize: 'clamp(38px,6vw,72px)', fontWeight: 500, lineHeight: 1.0, letterSpacing: '-0.025em', marginBottom: 20 }}>
                    Real texts.<br /><I c="#a5b4fc">Real verdicts.</I>
                  </motion.h1>

                  <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...EO, delay: 0.15 }}
                    style={{ fontSize: 'clamp(14px,1.5vw,17px)', lineHeight: 1.7, color: 'rgba(242,240,235,0.45)', maxWidth: 440, marginBottom: 36 }}>
                    See exactly how the engine parses subtext, detects missed signals, and identifies the precise moment a conversation died — and why.
                  </motion.p>

                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ ...EO, delay: 0.22 }}
                    style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <Link href="/upload">
                      <motion.button whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(242,240,235,0.15)' }} whileTap={{ scale: 0.97 }}
                        style={{ background: '#F2F0EB', color: '#060608', border: 'none', borderRadius: 14, padding: '13px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
                        Analyze My Chat — Free
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7.5 2.5l4.5 4.5-4.5 4.5" stroke="#060608" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </motion.button>
                    </Link>
                    <Link href="/practice">
                      <motion.button whileHover={{ scale: 1.03, background: 'rgba(255,255,255,0.07)' }} whileTap={{ scale: 0.97 }}
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#F2F0EB', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '13px 24px', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                        Practice Mode
                      </motion.button>
                    </Link>
                  </motion.div>
                </div>

                {/* Floating analysis card */}
                <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ ...EO, delay: 0.2 }}
                  style={{ flex: '0 0 auto' }} className="fa">
                  <Tilt str={6}>
                    <div style={{
                      width: 'min(300px, calc(100vw - 64px))',
                      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 24, padding: 24, backdropFilter: 'blur(20px)',
                      boxShadow: '0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}>
                      {/* Header */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600 }}>Analysis Complete</div>
                          <div style={{ fontSize: 11, color: 'rgba(242,240,235,0.3)', marginTop: 2 }}>Sarah · Instagram · just now</div>
                        </div>
                        <div style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 999, padding: '4px 10px', fontSize: 11, color: '#6ee7b7', fontWeight: 500 }}>Live</div>
                      </div>

                      {/* Rings */}
                      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: 18 }}>
                        <Ring val={8.2} max={10} color="#a5b4fc" label="Score" size={68} />
                        <Ring val={74} max={100} color="#f9a8d4" label="Interest" size={68} />
                        <Ring val={68} max={100} color="#fcd34d" label="Attraction" size={68} />
                      </div>

                      {/* Bars */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                        {[{ l: 'Humor', v: 76, c: '#a5b4fc' }, { l: 'Confidence', v: 62, c: '#86efac' }].map((b, i) => (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(242,240,235,0.35)', marginBottom: 5 }}><span>{b.l}</span><span>{b.v}%</span></div>
                            <Bar pct={b.v} color={b.c} delay={0.6 + i * 0.1} />
                          </div>
                        ))}
                      </div>

                      {/* Insight */}
                      <div style={{ background: 'rgba(255,60,40,0.07)', border: '1px solid rgba(255,60,40,0.15)', borderRadius: 10, padding: '9px 12px', fontSize: 12, color: 'rgba(242,240,235,0.65)', lineHeight: 1.5 }}>
                        Energy mismatch detected — your reply is 60% shorter than hers.
                      </div>
                    </div>
                  </Tilt>
                </motion.div>
              </div>

              {/* Stat strip */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                style={{ borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: 0, flexWrap: 'wrap', margin: '0 32px' }}
                className="stat-strip">
                {[{ n: '42k+', l: 'Conversations analyzed' }, { n: '~18', l: 'Signals detected per chat' }, { n: '94%', l: 'Detection accuracy' }, { n: '3.1', l: 'Avg score improvement' }].map((s, i) => (
                  <div key={i} style={{ flex: '1 1 140px', padding: '20px 24px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#a5b4fc', lineHeight: 1, marginBottom: 4 }}>{s.n}</div>
                    <div style={{ fontSize: 11, color: 'rgba(242,240,235,0.28)' }}>{s.l}</div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── Divider ── */}
        <DiagDivider floatEl={<Chip label="Case Files" sub="Click any to open" accent="#a5b4fc" />} />

        {/* ══════════════════════════════════════════════════════════
            CASES GRID
        ══════════════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 32px 100px', position: 'relative' }} className="section-inner">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 40 }}>
                <div>
                  <p style={{ fontSize: 10, color: 'rgba(242,240,235,0.28)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>Documented cases</p>
                  <h2 style={{ fontSize: 'clamp(28px,4vw,46px)', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.05, color: '#F2F0EB' }}>
                    Where most people<br /><I c="rgba(242,240,235,0.28)">lose the conversation.</I>
                  </h2>
                </div>
                {/* Filters */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => (
                    <motion.button key={cat} onClick={() => setFilter(cat)} whileTap={{ scale: 0.96 }}
                      style={{ padding: '7px 14px', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontSize: 12, fontWeight: 500, border: filter === cat ? '1px solid rgba(91,79,233,0.3)' : '1px solid rgba(255,255,255,0.07)', background: filter === cat ? 'rgba(91,79,233,0.12)' : 'rgba(255,255,255,0.02)', color: filter === cat ? '#a5b4fc' : 'rgba(242,240,235,0.4)', transition: 'all 0.2s' }}>
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>
            </Reveal>

            <AnimatePresence mode="popLayout">
              <motion.div layout className="cases-grid">
                {filtered.map((c, i) => (
                  <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={SP}>
                    <CaseCard c={c} i={i} onClick={() => setModal(c)} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ── Divider ── */}
        <DiagDivider flip={true} floatEl={<Chip label="Before vs After" sub="One reply changes everything" accent="#6ee7b7" />} />

        {/* ══════════════════════════════════════════════════════════
            BEFORE / AFTER
        ══════════════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 32px 100px', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <h2 style={{ fontSize: 'clamp(28px,4.5vw,50px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#F2F0EB', lineHeight: 1.1, marginBottom: 12 }}>
                  Small shifts.<br /><I>Completely different outcomes.</I>
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(242,240,235,0.33)', maxWidth: 400, margin: '0 auto' }}>One reply change can flip the entire trajectory of a conversation.</p>
              </div>
            </Reveal>

            <div className="before-after" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                {
                  title: 'What happened', titleColor: '#fca5a5', bg: 'rgba(255,60,40,0.04)', border: 'rgba(255,60,40,0.1)',
                  msgs: [{ text: "worked all day, went to gym. you?", self: false }, { text: "nice. just chilled.", self: true, bad: true }],
                  note: 'Zero acknowledgment. No follow-up. She carries the whole thing forward.',
                },
                {
                  title: 'What works', titleColor: '#6ee7b7', bg: 'rgba(16,185,129,0.04)', border: 'rgba(16,185,129,0.1)',
                  msgs: [{ text: "worked all day, went to gym. you?", self: false }, { text: "survived my inbox. gym people honestly intimidate me — what do you lift?", self: true }],
                  note: 'Self-deprecation + genuine question. She has something to work with.',
                },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <Tilt str={5}>
                    <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 20, padding: 'clamp(18px,3vw,26px)', height: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.titleColor }} />
                        <span style={{ fontSize: 10, color: s.titleColor, fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase' }}>{s.title}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 16 }}>
                        {s.msgs.map((m, j) => <Bub key={j} text={m.text} self={m.self} bad={(m as any).bad} delay={j * 0.15} />)}
                      </div>
                      <p style={{ fontSize: 12, color: 'rgba(242,240,235,0.32)', borderTop: `1px solid ${s.border}`, paddingTop: 14, lineHeight: 1.65, margin: 0 }}>{s.note}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Divider ── */}
        <DiagDivider floatEl={<Chip label="Verdict Engine" sub="Brutal. Accurate." accent="#fca5a5" />} />

        {/* ══════════════════════════════════════════════════════════
            ROAST / VERDICT SECTION
        ══════════════════════════════════════════════════════════ */}
        <section style={{ padding: '80px 32px 100px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 55% 60% at 50% 50%, rgba(255,96,64,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 40 }}>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,96,64,0.08)', border: '1px solid rgba(255,96,64,0.18)', borderRadius: 999, padding: '5px 16px', marginBottom: 20 }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#fca5a5' }} />
                  <span style={{ fontSize: 10, fontWeight: 600, color: '#fca5a5', letterSpacing: '0.09em', textTransform: 'uppercase' }}>Verdict Engine</span>
                </motion.div>
                <h2 style={{ fontSize: 'clamp(26px,4.5vw,50px)', fontWeight: 500, letterSpacing: '-0.02em', color: '#F2F0EB', lineHeight: 1.1 }}>
                  Brutal honesty.<br /><I c="rgba(255,150,120,0.8)">Delivered with precision.</I>
                </h2>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <Tilt str={4}>
                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, padding: 'clamp(22px,4vw,38px)', position: 'relative', overflow: 'hidden' }}>
                  {/* Background quote mark */}
                  <div style={{ position: 'absolute', top: -20, left: 16, fontSize: 120, color: 'rgba(255,96,64,0.06)', fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>"</div>

                  {/* Thread */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24, padding: '14px', background: 'rgba(6,6,8,0.6)', borderRadius: 14 }}>
                    <Bub text="I had a really great time tonight. We should totally do it again next week!" self />
                    <Bub text="yeah for sure!" delay={0.4} />
                  </div>

                  {/* Verdict */}
                  <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
                    <p style={{ fontSize: 'clamp(15px,2vw,22px)', fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', color: '#F2F0EB', lineHeight: 1.6, marginBottom: 12 }}>
                      "She hit you with a lowercase 'yeah for sure!' That is not enthusiasm. That is customer service. The exclamation mark is doing all the emotional labour she isn't."
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.07)' }} />
                      <span style={{ fontSize: 10, color: 'rgba(242,240,235,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500 }}>ConvoCoach · Verdict Engine</span>
                      <div style={{ height: 1, flex: 1, background: 'rgba(255,255,255,0.07)' }} />
                    </div>
                  </motion.div>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </section>

        {/* ── Divider ── */}
        <DiagDivider flip={true} floatEl={<Chip label="Ready?" sub="First one's free" accent="#a5b4fc" />} />

        {/* ══════════════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════════════ */}
        <section style={{ padding: '100px 32px 120px', position: 'relative', overflow: 'hidden', textAlign: 'center' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(91,79,233,0.09) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <Particles />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto' }}>
            <Reveal>
              <h2 style={{ fontSize: 'clamp(42px,7vw,80px)', fontWeight: 500, letterSpacing: '-0.03em', lineHeight: 0.95, color: '#F2F0EB', marginBottom: 20 }}>
                Stop wondering.<br /><I c="#a5b4fc">Start knowing.</I>
              </h2>
              <p style={{ fontSize: 'clamp(14px,1.5vw,17px)', color: 'rgba(242,240,235,0.35)', marginBottom: 40, lineHeight: 1.7 }}>
                First analysis is 100% free. No account required.<br />Find out what's actually going wrong.
              </p>
              <Link href="/upload">
                <motion.button whileHover={{ scale: 1.04, boxShadow: '0 0 60px rgba(242,240,235,0.18)' }} whileTap={{ scale: 0.96 }}
                  style={{ background: '#F2F0EB', color: '#060608', border: 'none', borderRadius: 16, padding: '15px 34px', fontSize: 'clamp(13px,1.4vw,15px)', fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                  Analyze My Chat Now
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5h10M8 3.5l4.5 4-4.5 4" stroke="#060608" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </motion.button>
              </Link>
              <p style={{ marginTop: 16, fontSize: 11, color: 'rgba(242,240,235,0.18)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Free forever · Screenshot deleted instantly · No card</p>
            </Reveal>
          </div>
        </section>

      </div>

      {/* Modal */}
      <AnimatePresence>
        {modal && <Modal c={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </>
  );
}