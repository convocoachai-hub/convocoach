'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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

function Btn({ children, bg = C.yellow, href, size = 'md', textColor = C.black }: { children: React.ReactNode; bg?: string; href: string; size?: 'lg'; textColor?: string; }) {
  const pad = size === 'lg' ? '16px 36px' : '12px 26px';
  const fs  = size === 'lg' ? 17 : 14;
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <motion.button
        whileHover={{ y: -3, boxShadow: C.shadowLg }} whileTap={{ y: 1, boxShadow: '2px 2px 0px #0D0D0D' }}
        transition={SNAP}
        style={{
          background: bg, color: textColor, border: C.border, borderRadius: 12,
          padding: pad, fontSize: fs, fontWeight: 900, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadow,
          display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em', width: '100%', justifyContent: 'center'
        }}>
        {children}
      </motion.button>
    </Link>
  );
}

// ─── CHAT COMPONENTS ──────────────────────────────────────────────────────────
function Bub({ text, self, bad, delay = 0 }: { text: string; self?: boolean; bad?: boolean; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: self ? 10 : -10, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }} viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay }}
      style={{ display: 'flex', justifyContent: self ? 'flex-end' : 'flex-start', width: '100%' }}>
      <div style={{
        maxWidth: '85%', padding: '10px 14px',
        borderRadius: self ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        fontSize: 13, lineHeight: 1.5, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
        background: self ? (bad ? C.bgPink : C.black) : C.white,
        border: C.borderThin,
        color: self ? (bad ? C.red : C.white) : C.black,
        boxShadow: C.shadowSm, wordBreak: 'break-word'
      }}>{text}</div>
    </motion.div>
  );
}

function Bar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div style={{ height: 6, background: '#E8E8E8', borderRadius: 99, overflow: 'hidden', border: '1px solid #000' }}>
      <motion.div style={{ height: '100%', background: color, borderRadius: 99 }}
        initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}

function Ring({ val, max, color, label, size = 72 }: { val: number; max: number; color: string; label: string; size?: number }) {
  const r = size / 2 - 8; const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size, background: '#F8F8F8', borderRadius: '50%', border: C.borderThin, boxShadow: C.shadowSm }}>
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E8E8" strokeWidth={6}/>
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round" initial={{ strokeDasharray: `0 ${circ}` }}
            whileInView={{ strokeDasharray: `${(val/max)*circ} ${circ}` }} viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16,1,0.3,1], delay: 0.3 }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize: 16, fontWeight: 900, color: C.black, fontFamily:"'DM Sans',sans-serif" }}>
            {max === 10 ? val.toFixed(1) : `${val}`}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 10, color: '#555', textTransform:'uppercase', letterSpacing:'0.09em', fontFamily:"'DM Sans',sans-serif", fontWeight: 800 }}>{label}</span>
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
    diagnosis: 'When she calls you trouble, she is building a playful frame and inviting you in. Accepting the frame builds tension. Denying it kills the tension she was trying to create.',
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
    diagnosis: 'Questions extract information. Statements create connection. "I\'m a nurse" deserved imagination or an assumption, not a generic follow-up question.',
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
    diagnosis: '"Rainbow Road" is what separates generic banter from memorable banter. Specificity signals you actually play — and plants a future scenario without desperately asking for a date.',
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
    diagnosis: 'She invested in a two-part question. You matched it with four words and a lazy bounce-back. Effort mismatch signals either low interest or low care — neither is good.',
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

  const scoreColor = c.verdictOk ? C.green : c.score >= 6 ? C.yellow : C.red;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(15,12,9,0.85)', backdropFilter: 'blur(5px)' }} />

      <motion.div initial={{ opacity: 0, scale: 0.96, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }} transition={SNAP}
        style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: 820, maxHeight: '88vh',
          background: C.white, border: C.border, borderRadius: 24, overflow: 'hidden', 
          display: 'flex', flexDirection: 'column', boxShadow: C.shadowLg,
        }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: C.borderThin, background: C.bgCream, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 11, color: C.black, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>Case {c.id}</span>
            <div style={{ width: 2, height: 14, background: C.black }} />
            <span style={{ fontSize: 11, color: scoreColor, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif", textShadow: '1px 1px 0px #000' }}>{c.verdict}</span>
          </div>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 10, background: C.white, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: C.black, fontSize: 20, lineHeight: 1, boxShadow: C.shadowSm }}>
            ×
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexWrap: 'wrap' }}>
          {/* Left: chat */}
          <div style={{ flex: '1 1 300px', padding: '24px', borderRight: `2px solid ${C.black}`, background: C.bgCream }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: C.black, margin: '0 0 8px', fontFamily: "'DM Sans',sans-serif" }}>{c.title}</h3>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, margin: 0, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{c.short}</p>
            </div>

            <div style={{ fontSize: 11, color: C.black, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>Original Thread</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {c.messages.map((m, i) => <Bub key={i} text={m.text} self={m.self} bad={(m as any).bad} delay={i * 0.1} />)}
            </div>

            {c.fix && (
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, color: C.green, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10, fontFamily: "'DM Sans',sans-serif" }}>Pro Move (The Fix)</div>
                <div style={{ background: C.bgGreen, border: `2px solid ${C.green}`, borderRadius: 14, padding: '12px 14px', boxShadow: `2px 2px 0px ${C.green}` }}>
                  <Bub text={c.fix} self />
                </div>
              </div>
            )}

            {/* Flags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {c.flags.map(f => (
                <span key={f} style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 8, background: C.white, border: C.borderThin, color: C.black, textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>{f}</span>
              ))}
            </div>
          </div>

          {/* Right: analysis */}
          <div style={{ flex: '1 1 260px', padding: '24px', background: C.white }}>
            <div style={{ fontSize: 11, color: C.black, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 18, fontFamily: "'DM Sans',sans-serif" }}>AI Analysis</div>

            {/* Score rings */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
              <Ring val={c.score} max={10} color={scoreColor} label="Score" size={72} />
              <Ring val={c.metrics.interest} max={100} color={C.blue} label="Interest" size={72} />
              <Ring val={c.metrics.momentum} max={100} color={C.yellow} label="Momentum" size={72} />
            </div>

            {/* Bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {[
                { l: 'Engagement', v: c.metrics.engagement, c: C.blue },
                { l: 'Humor', v: c.metrics.humor, c: C.yellow },
                { l: 'Momentum', v: c.metrics.momentum, c: C.green },
              ].map((b, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.black, fontWeight: 800, marginBottom: 6, fontFamily: "'DM Sans',sans-serif", textTransform: 'uppercase' }}>
                    <span>{b.l}</span><span>{b.v}%</span>
                  </div>
                  <Bar pct={b.v} color={b.c} delay={0.2 + i * 0.1} />
                </div>
              ))}
            </div>

            {/* Diagnosis */}
            <div style={{ background: C.bgYellow, border: C.borderThin, borderRadius: 14, padding: '16px 18px', marginBottom: c.roast ? 16 : 0, boxShadow: C.shadowSm }}>
              <div style={{ fontSize: 11, color: C.black, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Diagnosis</div>
              <p style={{ fontSize: 14, color: C.black, lineHeight: 1.6, margin: 0, fontFamily: "'DM Sans',sans-serif", fontWeight: 600 }}>{c.diagnosis}</p>
            </div>

            {/* Roast */}
            {c.roast && (
              <div style={{ background: C.bgPink, border: C.borderThin, borderRadius: 14, padding: '16px 18px', boxShadow: C.shadowSm }}>
                <div style={{ fontSize: 11, color: C.red, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8, fontWeight: 900, fontFamily: "'DM Sans',sans-serif" }}>🔥 AI Roast</div>
                <p style={{ fontSize: 14, fontFamily: "'DM Sans',sans-serif", fontStyle: 'italic', color: C.black, lineHeight: 1.6, margin: 0, fontWeight: 700 }}>"{c.roast}"</p>
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
  const scoreColor = c.verdictOk ? C.green : c.score >= 6 ? C.yellow : C.red;

  return (
    <Reveal delay={i * 0.08}>
      <motion.div
        onClick={onClick}
        whileHover={{ y: -4, boxShadow: C.shadowLg }}
        transition={SNAP}
        style={{
          height: '100%', cursor: 'pointer',
          background: C.white, border: C.border,
          borderRadius: 20, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          boxShadow: C.shadow,
        }}
      >
        {/* Top thick color stripe */}
        <div style={{ height: 8, background: scoreColor, borderBottom: C.borderThin }} />

        <div style={{ padding: '22px 22px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Top row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 10, color: C.black, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontFamily: "'DM Sans',sans-serif" }}>
                {c.category} · {c.verdict}
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 900, color: C.black, margin: 0, lineHeight: 1.2, fontFamily: "'DM Sans',sans-serif" }}>{c.title}</h3>
            </div>
            <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, background: C.bgCream, border: C.borderThin, padding: '4px 10px', borderRadius: 10 }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: C.black, lineHeight: 1, fontFamily: "'DM Sans',sans-serif" }}>{c.score}</span>
            </div>
          </div>

          {/* Mini chat preview */}
          <div style={{ background: C.bgCream, borderRadius: 14, padding: '12px', border: C.borderThin, marginBottom: 16, position: 'relative', overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {c.messages.slice(0, 2).map((m, j) => (
                <div key={j} style={{ display: 'flex', justifyContent: m.self ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '85%', padding: '8px 12px',
                    borderRadius: m.self ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                    fontSize: 12, lineHeight: 1.45, fontFamily: "'DM Sans',sans-serif", fontWeight: 600,
                    background: m.self ? ((m as any).bad ? C.bgPink : C.black) : C.white,
                    border: C.borderThin,
                    color: m.self ? ((m as any).bad ? C.red : C.white) : C.black,
                  }}>{m.text}</div>
                </div>
              ))}
            </div>
            {/* Fade */}
            <div style={{ position: 'absolute', inset: 'auto 0 0 0', height: 20, background: `linear-gradient(to top, ${C.bgCream}, transparent)` }} />
          </div>

          {/* Short desc */}
          <p style={{ fontSize: 13, color: '#444', lineHeight: 1.6, margin: '0 0 16px', fontFamily: "'DM Sans',sans-serif", fontWeight: 500 }}>{c.short}</p>

          {/* Bottom row */}
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              {[['Interest', c.metrics.interest], ['Momentum', c.metrics.momentum]].map(([label, val]) => (
                <div key={label as string} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 24, height: 4, background: '#E8E8E8', borderRadius: 2, overflow: 'hidden', border: '1px solid #000' }}>
                    <div style={{ height: '100%', width: `${val}%`, background: scoreColor }} />
                  </div>
                  <span style={{ fontSize: 10, color: C.black, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'DM Sans',sans-serif" }}>{(label as string).slice(0, 3)}</span>
                </div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: C.black, fontWeight: 900, fontFamily: "'DM Sans',sans-serif" }}>View →</span>
          </div>
        </div>
      </motion.div>
    </Reveal>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function ExamplesPage() {
  const [filter, setFilter] = useState('All');
  const [modal, setModal] = useState<typeof CASES[0] | null>(null);

  const filtered = filter === 'All' ? CASES : CASES.filter(c => c.category === filter);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden; width: 100%; background: ${C.bgCream}; }
        
        .cases-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 20px;
        }

        @media (max-width: 640px) {
          .section-pad { padding: 56px 20px !important; }
          .cases-grid { grid-template-columns: 1fr; }
          .before-after { grid-template-columns: 1fr !important; }
        }
      `}} />

      <div style={{ background: C.bgCream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

        {/* ══════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════ */}
        <section style={{ position: 'relative', background: C.yellow, borderBottom: C.border, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Star size={32} color={C.white} style={{ position: 'absolute', top: '15%', right: '10%' }} />
            <Triangle size={24} color={C.blue} style={{ position: 'absolute', bottom: '20%', left: '5%' }} />
            <Squiggle color={C.red} style={{ position: 'absolute', bottom: '10%', right: '20%' }} />
          </div>

          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="AI Conversation Analysis" color={C.red} />
              <h1 style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(42px, 9vw, 84px)',
                fontWeight: 900, color: C.black, letterSpacing: '-0.04em',
                lineHeight: 1.15, marginBottom: 24, wordBreak: 'break-word',
              }}>
                Real texts.<br />
                <span style={{ background: C.black, color: C.white, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
                  Real verdicts.
                </span>
              </h1>
              <p style={{ fontSize: 17, color: '#333', lineHeight: 1.7, maxWidth: 640, fontWeight: 600, marginBottom: 36 }}>
                See exactly how the engine parses subtext, detects missed signals, and identifies the precise moment a conversation died — and why.
              </p>
              
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <Btn href="/upload" bg={C.red} textColor={C.white} size="lg">
                  Analyze My Chat — Free
                </Btn>
                <Btn href="/practice" bg={C.white} size="lg">
                  Practice Mode
                </Btn>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CASES GRID
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: C.bgCream, borderBottom: C.border }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20, marginBottom: 40 }}>
                <div>
                  <Label text="Documented Cases" color={C.blue} />
                  <h2 style={{ fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.15, color: C.black }}>
                    Where most people<br/>
                    <span style={{ background: C.blue, color: C.white, borderRadius: 8, padding: '0 8px', border: C.border, display: 'inline-block', marginTop: 4 }}>lose the conversation.</span>
                  </h2>
                </div>
                
                {/* Filters */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {CATEGORIES.map(cat => (
                    <motion.button key={cat} onClick={() => setFilter(cat)} whileTap={{ scale: 0.96 }}
                      style={{ 
                        padding: '8px 16px', borderRadius: 10, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", 
                        fontSize: 13, fontWeight: 900, border: C.borderThin, 
                        background: filter === cat ? C.black : C.white, 
                        color: filter === cat ? C.white : C.black, 
                        boxShadow: filter === cat ? C.shadowSm : 'none',
                        transition: 'all 0.2s' 
                      }}>
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </div>
            </Reveal>

            <AnimatePresence mode="popLayout">
              <motion.div layout className="cases-grid">
                {filtered.map((c, i) => (
                  <motion.div key={c.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={SNAP}>
                    <CaseCard c={c} i={i} onClick={() => setModal(c)} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            BEFORE / AFTER
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: C.white, borderBottom: C.border }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Label text="Before vs After" color={C.green} />
                <h2 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', color: C.black, lineHeight: 1.15, marginBottom: 16 }}>
                  Small shifts.<br/>
                  <span style={{ color: C.green }}>Different outcomes.</span>
                </h2>
                <p style={{ fontSize: 16, color: '#555', maxWidth: 500, margin: '0 auto', fontWeight: 600 }}>One reply change can flip the entire trajectory of a conversation. Stop making the other person carry the weight.</p>
              </div>
            </Reveal>

            <div className="before-after" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900, margin: '0 auto' }}>
              {[
                {
                  title: 'What happened', titleColor: C.red, bg: '#FFF0F0',
                  msgs: [{ text: "worked all day, went to gym. you?", self: false }, { text: "nice. just chilled.", self: true, bad: true }],
                  note: 'Zero acknowledgment. No follow-up. She carries the whole thing forward.',
                },
                {
                  title: 'What works', titleColor: C.green, bg: C.bgGreen,
                  msgs: [{ text: "worked all day, went to gym. you?", self: false }, { text: "survived my inbox. gym people honestly intimidate me — what do you lift?", self: true }],
                  note: 'Self-deprecation + genuine question. She has something to work with.',
                },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <motion.div whileHover={{ y: -4, boxShadow: C.shadowLg }} transition={SNAP}
                    style={{ background: s.bg, border: C.border, borderRadius: 20, padding: 'clamp(20px,4vw,32px)', height: '100%', boxShadow: C.shadow }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                      <div style={{ width: 12, height: 12, borderRadius: '50%', background: s.titleColor, border: C.borderThin }} />
                      <span style={{ fontSize: 12, color: C.black, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.title}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, background: C.white, padding: '16px', borderRadius: 16, border: C.borderThin }}>
                      {s.msgs.map((m, j) => <Bub key={j} text={m.text} self={m.self} bad={(m as any).bad} delay={j * 0.15} />)}
                    </div>
                    <p style={{ fontSize: 14, color: C.black, borderTop: C.borderThin, paddingTop: 16, lineHeight: 1.6, margin: 0, fontWeight: 600 }}>{s.note}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            ROAST / VERDICT SECTION
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: C.black, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Star size={40} color={C.yellow} style={{ position: 'absolute', top: '20%', right: '10%' }} />
            <Triangle size={32} color={C.red} style={{ position: 'absolute', bottom: '20%', left: '10%' }} />
          </div>
          
          <div className="section-pad" style={{ maxWidth: 860, margin: '0 auto', padding: '100px 28px', position: 'relative', zIndex: 1 }}>
            <Reveal>
              <div style={{ textAlign: 'center', marginBottom: 48 }}>
                <Label text="Verdict Engine" color={C.red} />
                <h2 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, letterSpacing: '-0.03em', color: C.white, lineHeight: 1.15 }}>
                  Brutal honesty.<br />
                  <span style={{ background: C.red, color: C.white, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>Delivered with precision.</span>
                </h2>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <motion.div whileHover={{ y: -4, boxShadow: C.shadowLg }} transition={SNAP}
                style={{ background: C.white, border: C.border, borderRadius: 24, padding: 'clamp(24px,5vw,48px)', position: 'relative', overflow: 'hidden', boxShadow: C.shadow }}>
                {/* Background quote mark */}
                <div style={{ position: 'absolute', top: -10, left: 16, fontSize: 100, color: C.bgCream, fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none', userSelect: 'none', fontWeight: 900 }}>"</div>

                {/* Thread */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32, padding: '20px', background: C.bgCream, borderRadius: 16, border: C.borderThin, position: 'relative', zIndex: 1 }}>
                  <Bub text="I had a really great time tonight. We should totally do it again next week!" self />
                  <Bub text="yeah for sure!" delay={0.4} />
                </div>

                {/* Verdict */}
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}>
                  <p style={{ fontSize: 'clamp(16px,2.5vw,22px)', fontFamily: "'DM Sans',sans-serif", fontStyle: 'italic', fontWeight: 700, color: C.black, lineHeight: 1.6, marginBottom: 20 }}>
                    "She hit you with a lowercase 'yeah for sure!' That is not enthusiasm. That is customer service. The exclamation mark is doing all the emotional labour she isn't."
                  </p>
                  <Badge text="ConvoCoach Roast Mode™" color={C.black} textColor={C.yellow} rotate={0} />
                </motion.div>
              </motion.div>
            </Reveal>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════════════ */}
        <section style={{ background: C.bgCream }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '100px 28px' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', background: C.blue, border: C.border, borderRadius: 24, padding: 'clamp(32px, 6vw, 56px)', boxShadow: C.shadowLg, position: 'relative', overflow: 'hidden' }}>
                <Star size={64} color={C.yellow} style={{ position: 'absolute', right: -20, top: -20, opacity: 0.9 }} />
                <div style={{ flex: '1 1 400px', zIndex: 1 }}>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(42px, 8vw, 72px)', fontWeight: 900, color: C.white, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.05 }}>
                    Stop wondering.<br />
                    <span style={{ color: C.yellow }}>Start knowing.</span>
                  </h2>
                  <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.9)', marginTop: 16, lineHeight: 1.6, fontWeight: 600, maxWidth: 440 }}>
                    First analysis is 100% free. No account required. Find out what's actually going wrong.
                  </p>
                </div>
                <div style={{ flexShrink: 0, zIndex: 1, width: '100%', maxWidth: 300 }}>
                  <Btn href="/upload" bg={C.yellow} textColor={C.black} size="lg">
                    Analyze My Chat →
                  </Btn>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 12, textAlign: 'center', fontWeight: 700 }}>
                    Free forever · Screenshots deleted instantly
                  </p>
                </div>
              </div>
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