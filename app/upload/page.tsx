'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { isPremium as checkPremium, LIMITS } from '@/lib/premiumUtils';
import PremiumGate from '@/components/PremiumGate';
import PremiumModal from '@/components/PremiumModal';
import ShareScoreCard from '@/components/ShareCard';
import RewardAdModal from '@/components/RewardAdModal';

// ─── DESIGN TOKENS — matches landing page exactly ─────────────────────────────
const C = {
  yellow:  '#FFD84D',
  red:     '#FF3D3D',
  blue:    '#4338CA',
  green:   '#16A34A',
  pink:    '#EC4899',
  black:   '#0A0A0A',
  white:   '#FFFFFF',
  bgCream: '#FAF6EE',
  bgBlue:  '#EEF2FF',
  bgYellow:'#FFFBEA',
  bgPink:  '#FFF0F7',
  bgGreen: '#ECFDF5',
  amber:   '#B87A10',
  teal:    '#0D9488',
  purple:  '#A0426E',

  shadow:    '5px 5px 0px #0A0A0A',
  shadowLg:  '8px 8px 0px #0A0A0A',
  shadowSm:  '3px 3px 0px #0A0A0A',
  border:    '2.5px solid #0A0A0A',
  borderThin:'1.5px solid #0A0A0A',
};

const SNAP = { duration: 0.16, ease: [0.23, 1, 0.32, 1] } as const;
const EASE = [0.23, 1, 0.32, 1] as const;

// ─── CONTEXT DATA ─────────────────────────────────────────────────────────────
const CONTEXTS = [
  { id: 'dating',        label: 'Dating',        sub: 'Romantic / flirting',         color: C.red,    bg: '#FFF0F0', emoji: '💘' },
  { id: 'situationship', label: 'Situationship', sub: 'Talking stage / undefined',   color: C.purple, bg: '#FFF0F7', emoji: '😵‍💫' },
  { id: 'office',        label: 'Work',          sub: 'Colleague / client / boss',   color: C.teal,   bg: '#F0FFFE', emoji: '💼' },
  { id: 'friendship',    label: 'Friendship',    sub: 'Friends / group chat',        color: C.green,  bg: '#ECFDF5', emoji: '🫂' },
  { id: 'networking',    label: 'Networking',    sub: 'Professional outreach',       color: C.amber,  bg: '#FFFBEA', emoji: '🤝' },
  { id: 'family',        label: 'Family',        sub: 'Parent / sibling / relative', color: '#7B6FAA',bg: '#F3F0FF', emoji: '🏠' },
  { id: 'reconnecting',  label: 'Reconnecting',  sub: 'Someone from the past',       color: '#8B6914',bg: '#FFFBEA', emoji: '👋' },
];

const LANGUAGES = [
  { id: 'auto', label: 'Auto-detect' }, { id: 'en', label: 'English' }, { id: 'hi', label: 'Hindi / Hinglish' },
  { id: 'es', label: 'Spanish' }, { id: 'fr', label: 'French' }, { id: 'pt', label: 'Portuguese' },
  { id: 'ar', label: 'Arabic' }, { id: 'ja', label: 'Japanese' }, { id: 'ko', label: 'Korean' },
  { id: 'de', label: 'German' }, { id: 'tr', label: 'Turkish' }, { id: 'ru', label: 'Russian' },
  { id: 'it', label: 'Italian' }, { id: 'zh', label: 'Chinese' }, { id: 'id', label: 'Indonesian' },
];
const LANG_MAP = Object.fromEntries(LANGUAGES.map(l => [l.id, l.label]));

interface ScoreObj { score: number; explanation: string }
interface AnalysisResult {
  overallScore: number; interestLevel: number; attractionProbability: number;
  conversationMomentum: string; emotionalTone: string; replyEnergyMatch: string;
  detectedLanguage: string; context: string; inputMode: string; contextFit: string;
  tags: string[]; roastMode: boolean; roastText?: string;
  layer1_diagnosis: { summary: string; stage: string; verdict: string };
  layer2_scores: Record<string, ScoreObj>;
  layer3_psychSignals: Array<{ signal: string; detected: boolean; evidence: string; meaning: string }>;
  layer4_powerDynamics: { whoHoldsPower: string; whoIsChasing: string; whoIsLeading: string; analysis: string; rebalanceTip: string };
  layer5_mistakes: Array<{ mistake: string; whatHappened: string; whyItHurts: string; severity: string }>;
  layer6_missedOpportunities: Array<{ moment: string; whatWasMissed: string; betterResponse: string }>;
  layer7_rewrites: { originalMessage: string; playful: { message: string; why: string }; confident: { message: string; why: string }; curious: { message: string; why: string } };
  layer8_attractionSignals: Array<{ signal: string; type: string; evidence: string; interpretation: string }>;
  layer9_nextMoves: { playful: { message: string; intent: string }; curious: { message: string; intent: string }; confident: { message: string; intent: string } };
  layer10_strategy: { primaryAdvice: string; doThis: string; avoidThis: string; urgency: string; longTermRead: string };
  conversationPersonalityType?: { type: string; description: string; emoji: string };
  redFlags?: Array<{ pattern: string; evidence: string; severity: string; advice: string }>;
  extractedText: string;
}
interface CoachResult {
  verdict: string; verdictLabel: string; analysis: string;
  improvedVersion: string; whyItsBetter: string; quickTips: string[]; flags: string[];
}

// ─── SHARED PRIMITIVES — matches landing page ──────────────────────────────
function Noise({ opacity = 0.035 }: { opacity?: number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat', backgroundSize: '180px', opacity, mixBlendMode: 'multiply',
    }} />
  );
}

const Dot = ({ size = 10, color = C.yellow, style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: color, border: `2px solid ${C.black}`, flexShrink: 0, ...style }} />
);

const Star = ({ size = 20, color = C.yellow, style = {}, spin = false }: { size?: number; color?: string; style?: React.CSSProperties; spin?: boolean }) => (
  <motion.svg width={size} height={size} viewBox="0 0 20 20" style={style}
    animate={spin ? { rotate: 360 } : undefined}
    transition={spin ? { type: 'tween', duration: 8, repeat: Infinity, ease: 'linear' } : undefined}>
    <polygon points="10,1 12.2,7.4 19,7.4 13.6,11.6 15.8,18 10,14 4.2,18 6.4,11.6 1,7.4 7.8,7.4" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </motion.svg>
);

function FloatShape({ children, delay = 0, amplitude = 5, style = {} }: { children: React.ReactNode; delay?: number; amplitude?: number; style?: React.CSSProperties }) {
  return (
    <motion.div animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{ type: 'tween', duration: 3 + delay * 0.4, repeat: Infinity, ease: 'easeInOut', delay }}
      style={style}>{children}</motion.div>
  );
}

function Badge({ text, color = C.yellow, textColor = C.black, rotate = -2 }: { text: string; color?: string; textColor?: string; rotate?: number }) {
  return (
    <span style={{
      display: 'inline-block', background: color, color: textColor,
      border: C.border, borderRadius: 6, padding: '2px 8px',
      fontSize: 9, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase',
      fontFamily: "'DM Sans', sans-serif", transform: `rotate(${rotate}deg)`,
      boxShadow: C.shadowSm, flexShrink: 0,
    }}>{text}</span>
  );
}

function Label({ text, color = C.yellow }: { text: string; color?: string }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
      <div style={{ width: 10, height: 10, background: color, border: C.border, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", color: C.black }}>
        {text}
      </span>
    </div>
  );
}

function Fade({ children, delay = 0, y = 18 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: EASE, delay }}>{children}</motion.div>
  );
}

// Brutalist button — matches landing page exactly
function Btn({ children, bg = C.yellow, onClick, href, size = 'md', textColor = C.black, disabled = false, fullWidth = false }: {
  children: React.ReactNode; bg?: string; onClick?: () => void; href?: string;
  size?: 'sm' | 'md' | 'lg'; textColor?: string; disabled?: boolean; fullWidth?: boolean;
}) {
  const pad = size === 'lg' ? '15px 32px' : size === 'sm' ? '7px 14px' : '12px 24px';
  const fs  = size === 'lg' ? 16 : size === 'sm' ? 11 : 14;
  const el = (
    <motion.button onClick={onClick} disabled={disabled}
      whileHover={!disabled ? { y: -3, boxShadow: C.shadowLg } : {}}
      whileTap={!disabled ? { y: 1, boxShadow: '2px 2px 0px #0A0A0A', scale: 0.98 } : {}}
      transition={SNAP}
      style={{
        background: disabled ? '#E5E5E5' : bg,
        color: disabled ? '#999' : textColor,
        border: C.border, borderRadius: 10,
        padding: pad, fontSize: fs, fontWeight: 900, cursor: disabled ? 'default' : 'pointer',
        fontFamily: "'DM Sans', sans-serif", boxShadow: disabled ? 'none' : C.shadow,
        display: 'inline-flex', alignItems: 'center', gap: 7, letterSpacing: '-0.01em',
        whiteSpace: 'nowrap', width: fullWidth ? '100%' : undefined,
        justifyContent: fullWidth ? 'center' : undefined,
      }}>
      {children}
    </motion.button>
  );
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{el}</Link> : el;
}

// Brutalist pill/tag
function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 10, fontWeight: 900,
      padding: '3px 9px', borderRadius: 6, background: bg, color,
      textTransform: 'uppercase', letterSpacing: '0.1em',
      fontFamily: "'DM Sans', sans-serif", whiteSpace: 'nowrap',
      border: `1.5px solid ${color}40`,
    }}>{label}</span>
  );
}

// Brutalist section/accordion card
function Section({ title, accent, badge, defaultOpen = false, children }: {
  title: string; accent?: string; badge?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: C.bgCream, border: C.border, borderRadius: 16,
      boxShadow: open ? C.shadowLg : C.shadow,
      overflow: 'hidden', transition: 'box-shadow 0.18s',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        {accent && <div style={{ width: 4, height: 20, borderRadius: 2, background: accent, flexShrink: 0 }} />}
        <span style={{ flex: 1, fontSize: 15, fontWeight: 900, color: C.black, fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.01em' }}>{title}</span>
        {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}
          style={{ width: 22, height: 22, background: C.black, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: C.border }}>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 3.5l3 3 3-3" stroke={C.white} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.26, ease: EASE }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '4px 20px 20px', borderTop: C.border }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AnimBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div style={{ height: 10, background: '#E8E8E8', borderRadius: 5, border: C.borderThin, overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 1.1, ease: EASE, delay }}
        style={{ height: '100%', background: color, borderRadius: 4 }} />
    </div>
  );
}

// Brutalist ring — matches landing page card style
function Ring({ value, max, color, size, label }: { value: number; max: number; color: string; size: number; label: string }) {
  const r = size / 2 - 9;
  const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7 }}>
      <div style={{ position: 'relative', width: size, height: size, border: C.border, borderRadius: '50%', background: C.bgCream, boxShadow: C.shadowSm }}>
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E8E8E8" strokeWidth={6} />
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${(value/max)*circ} ${circ}` }}
            transition={{ duration: 1.4, ease: EASE, delay: 0.3 }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size < 90 ? 14 : 18, fontWeight: 900, color, fontFamily: "'DM Sans', sans-serif", lineHeight: 1 }}>
            {max === 10 ? value.toFixed(1) : `${Math.round(value)}`}
          </span>
          {max !== 10 && <span style={{ fontSize: 9, color: '#999', fontFamily: "'DM Sans', sans-serif" }}>%</span>}
        </div>
      </div>
      <span style={{ fontSize: 9.5, color: '#666', textAlign: 'center', fontWeight: 800, letterSpacing: '0.08em', fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

// ─── STEP 1 — CONTEXT ─────────────────────────────────────────────────────────
function StepContext({ onNext }: { onNext: (ctx: string) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <div>
      <Fade>
        <Label text="Step 1 of 3" color={C.red} />
        <h1 style={{
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 'clamp(38px, 7vw, 64px)',
  fontWeight: 900, lineHeight: 1.25, letterSpacing: '-0.04em', // Changed lineHeight
  color: C.black, margin: '0 0 14px',
}}>
  What kind of<br />
  <span style={{ display: 'inline-block', marginTop: 8, background: C.yellow, borderRadius: 8, padding: '2px 8px', border: C.border }}>
    conversation?
  </span>
</h1>
        <p style={{ fontSize: 15, color: '#666', lineHeight: 1.78, margin: '0 0 32px', maxWidth: 400, fontWeight: 500 }}>
          Context changes everything. A "hey" in dating hits different than a "hey" in a work email.
        </p>
      </Fade>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 188px), 1fr))', gap: 10, marginBottom: 28 }}>
        {CONTEXTS.map((ctx, i) => {
          const active = sel === ctx.id;
          return (
            <Fade key={ctx.id} delay={0.04 + i * 0.04}>
              <motion.button onClick={() => setSel(ctx.id)}
                whileHover={{ y: -3, boxShadow: C.shadowLg }}
                whileTap={{ scale: 0.97 }}
                transition={SNAP}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  background: active ? C.black : C.white,
                  border: C.border, borderRadius: 14,
                  padding: '15px 16px', outline: 'none',
                  boxShadow: active ? C.shadowLg : C.shadow,
                  transition: 'background 0.15s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{ctx.emoji}</span>
                    <span style={{ fontSize: 13.5, fontWeight: 800, color: active ? C.white : C.black, fontFamily: "'DM Sans', sans-serif", transition: 'color 0.15s' }}>
                      {ctx.label}
                    </span>
                  </div>
                  <AnimatePresence>
                    {active && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        style={{ width: 16, height: 16, borderRadius: '50%', background: C.yellow, border: `2px solid ${C.black}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l1.8 1.8L6.5 2" stroke={C.black} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.55)' : '#888', margin: 0, paddingLeft: 26, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{ctx.sub}</p>
              </motion.button>
            </Fade>
          );
        })}
      </div>

      <Fade delay={0.36}>
        <Btn bg={sel ? C.red : '#E5E5E5'} textColor={sel ? C.white : '#999'} size="lg" onClick={() => sel && onNext(sel)} disabled={!sel} fullWidth>
          Continue →
        </Btn>
      </Fade>
    </div>
  );
}

// ─── STEP 2 — UPLOAD ──────────────────────────────────────────────────────────
function StepUpload({ context, onBack, onAnalyze, isPaid }: {
  context: string; onBack: () => void;
  onAnalyze: (files: File[], text: string | null, lang: string, roast: boolean, userSide: string) => void;
  isPaid: boolean;
}) {
  const [mode, setMode] = useState<'screenshot' | 'text'>('screenshot');
  const [files, setFiles] = useState<{file: File, preview: string}[]>([]);
  const [text, setText] = useState('');
  const [lang, setLang] = useState('auto');
  const [roast, setRoast] = useState(false);
  const [drag, setDrag] = useState(false);
  const [sideChosen, setSideChosen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ctx = CONTEXTS.find(c => c.id === context)!;

  const maxFiles = isPaid ? 4 : 2;

  const onFiles = useCallback((newFiles: FileList | File[]) => {
    const validFiles = Array.from(newFiles).filter(f => f.type.startsWith('image/'));
    if (!validFiles.length) return;
    
    setFiles(prev => {
      const combined = [...prev];
      validFiles.forEach(f => {
        if (combined.length < maxFiles) {
          combined.push({ file: f, preview: URL.createObjectURL(f) });
        }
      });
      return combined;
    });
    setSideChosen(false);
  }, [maxFiles]);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Fade>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: '#666', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '0 0 18px', fontWeight: 700 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 7H2M5 3L2 7l3 4" stroke="#666" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
        <Label text="Step 2 of 3" color={ctx.color} />
        <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(30px, 5.5vw, 48px)', fontWeight: 900, lineHeight: 1.25, letterSpacing: '-0.03em', color: C.black, margin: '0 0 12px' }}>
  Add your<br />
  <span style={{ display: 'inline-block', marginTop: 8, background: ctx.color, color: C.white, borderRadius: 8, padding: '2px 8px', border: C.border }}>
    {ctx.label.toLowerCase()} chat.
  </span>
</h1>
        <p style={{ fontSize: 14.5, color: '#666', lineHeight: 1.78, margin: '0 0 24px', fontWeight: 500 }}>
          Screenshot or paste — the clearer it is, the sharper the analysis.
        </p>
      </Fade>

      {/* Mode toggle */}
      <Fade delay={0.06}>
        <div style={{ display: 'flex', background: C.white, borderRadius: 12, padding: 4, marginBottom: 20, border: C.border, boxShadow: C.shadow, gap: 4 }}>
          {(['screenshot', 'text'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '11px 12px', borderRadius: 8, border: mode === m ? C.border : 'none', cursor: 'pointer',
              background: mode === m ? C.black : 'transparent',
              color: mode === m ? C.white : '#888',
              fontSize: 13.5, fontWeight: 800,
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
              boxShadow: mode === m ? 'none' : undefined,
            }}>
              {m === 'screenshot' ? '📸 Screenshot' : '✍️ Paste Text'}
            </button>
          ))}
        </div>
      </Fade>

      <AnimatePresence mode="wait">
        {mode === 'screenshot' ? (
          <motion.div key="ss" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.26, ease: EASE }}>
            {/* Drop zone */}
            <div
              onClick={() => files.length < maxFiles && inputRef.current?.click()}
              onDrop={e => { e.preventDefault(); setDrag(false); onFiles(e.dataTransfer.files); }}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              style={{
                border: `3px dashed ${drag ? ctx.color : files.length > 0 ? C.black : '#CCC'}`,
                borderRadius: 16, cursor: files.length >= maxFiles ? 'default' : 'pointer', marginBottom: 14,
                background: drag ? `${ctx.color}08` : '#FAFAFA',
                transition: 'all 0.18s', overflow: 'hidden', minHeight: files.length > 0 ? 0 : 190,
                boxShadow: drag ? C.shadow : 'none', padding: files.length > 0 ? '16px' : '0'
              }}>
              {files.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
                  {files.map((f, i) => (
                    <div key={i} style={{ position: 'relative', border: C.border, borderRadius: '12px', overflow: 'hidden', background: C.black }}>
                      <div style={{ position: 'absolute', top: 6, left: 6, background: C.yellow, color: C.black, width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, zIndex: 10, border: C.borderThin }}>{i + 1}</div>
                      <img src={f.preview} alt={`preview ${i}`} style={{ width: '100%', height: '160px', objectFit: 'cover', display: 'block' }} />
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        style={{ position: 'absolute', top: 6, right: 6, background: C.red, border: C.borderThin, borderRadius: 6, padding: '4px 8px', color: C.white, fontSize: 11, fontWeight: 800, cursor: 'pointer', zIndex: 10 }}>
                        Remove
                      </button>
                    </div>
                  ))}
                  {files.length < maxFiles && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.02)', border: `2px dashed #ccc`, borderRadius: '12px', height: '160px', gap: 8 }}>
                      <span style={{ fontSize: 24, color: '#888' }}>+</span>
                      <span style={{ fontSize: 12, color: '#888', fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>Add Image</span>
                      <span style={{ fontSize: 11, color: '#AAA', fontFamily: "'DM Sans', sans-serif" }}>({files.length}/{maxFiles})</span>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 24px', gap: 14 }}>
                  <motion.div animate={drag ? { scale: 1.12 } : { scale: 1 }}
                    style={{ width: 52, height: 52, borderRadius: 14, background: '#F0F0F0', border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: C.shadowSm }}>
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                      <path d="M11 15V4M8 7l3-3 3 3" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 19h18" stroke="#BBB" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 15.5, fontWeight: 800, color: C.black, margin: '0 0 5px', fontFamily: "'DM Sans', sans-serif" }}>Drop screenshots here</p>
                    <p style={{ fontSize: 12.5, color: '#888', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Or tap to browse · Max {maxFiles} images</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
              onChange={e => { if (e.target.files) onFiles(e.target.files); e.target.value = ''; }} />

            {files.length > 0 && (
              <Fade>
                <div style={{ background: C.bgYellow, border: C.border, borderRadius: 16, padding: '18px 20px', marginBottom: 14, boxShadow: C.shadow, position: 'relative', overflow: 'hidden' }}>
                  <Noise opacity={0.03} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 16 }}>🎯</span>
                    <p style={{ fontSize: 14.5, fontWeight: 900, color: C.black, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Which side are YOUR messages?</p>
                  </div>
                  <p style={{ fontSize: 12.5, color: '#666', margin: '0 0 16px', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                    This stops the AI from mixing you up — the #1 cause of wrong analysis.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 9 }}>
                    {[
                      { side: 'right', label: 'Right side', sub: 'Blue / filled bubbles', preview: <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}><div style={{ background: C.black, borderRadius: '8px 8px 2px 8px', padding: '4px 8px', fontSize: 10, color: C.white }}>hey, you free?</div><div style={{ background: '#EEE', border: C.borderThin, borderRadius: '8px 8px 2px 8px', padding: '4px 8px', fontSize: 10, color: '#666' }}>yeah why?</div></div> },
                      { side: 'left', label: 'Left side', sub: 'Grey / hollow bubbles', preview: <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><div style={{ background: C.black, borderRadius: '8px 8px 8px 2px', padding: '4px 8px', fontSize: 10, color: C.white }}>hey, you free?</div><div style={{ background: '#EEE', border: C.borderThin, borderRadius: '8px 8px 8px 2px', padding: '4px 8px', fontSize: 10, color: '#666' }}>yeah why?</div></div> },
                    ].map(opt => (
                      <motion.button key={opt.side}
                        whileHover={{ y: -2, boxShadow: C.shadowLg }} whileTap={{ scale: 0.97 }} transition={SNAP}
                        onClick={() => { setSideChosen(true); onAnalyze(files.map(f => f.file), null, lang, roast, opt.side); }}
                        style={{ background: C.white, border: C.border, borderRadius: 12, padding: '12px 14px', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadow }}>
                        <div style={{ marginBottom: 8 }}>{opt.preview}</div>
                        <p style={{ fontSize: 13, fontWeight: 800, color: C.black, margin: '0 0 2px', fontFamily: "'DM Sans', sans-serif" }}>{opt.label}</p>
                        <p style={{ fontSize: 11, color: '#888', margin: 0 }}>{opt.sub}</p>
                      </motion.button>
                    ))}
                  </div>
                  <button onClick={() => { setSideChosen(true); onAnalyze(files.map(f => f.file), null, lang, roast, 'auto'); }}
                    style={{ width: '100%', background: 'none', border: C.border, borderRadius: 10, padding: '10px', color: '#777', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                    Not sure — let AI figure it out
                  </button>
                </div>
              </Fade>
            )}
          </motion.div>
        ) : (
          <motion.div key="txt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.26, ease: EASE }}>
            <label style={{ fontSize: 10, fontWeight: 900, color: '#666', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>
              Paste your conversation
            </label>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder={'Format:\nYou: hey whats up\nThem: not much hbu\nYou: just chilling\n\n(or paste however you have it)'}
              style={{ width: '100%', minHeight: 230, background: C.white, border: C.border, borderRadius: 14, padding: '16px 18px', color: C.black, fontSize: 14, lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif", resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 6, boxShadow: C.shadow }}
              onFocus={e => e.currentTarget.style.boxShadow = C.shadowLg}
              onBlur={e => e.currentTarget.style.boxShadow = C.shadow} />
            <p style={{ fontSize: 12.5, color: text.length > 30 ? C.green : '#CCC', marginBottom: 18, textAlign: 'right', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
              {text.length} chars {text.length < 30 && '— add more for better analysis'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Language */}
      <Fade delay={0.12}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 10, fontWeight: 900, color: '#666', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'block', marginBottom: 8, fontFamily: "'DM Sans', sans-serif" }}>Language</label>
          <div style={{ position: 'relative' }}>
            <select value={lang} onChange={e => setLang(e.target.value)}
              style={{ width: '100%', background: C.white, border: C.border, borderRadius: 11, padding: '12px 38px 12px 14px', color: C.black, fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', appearance: 'none', outline: 'none', boxShadow: C.shadow }}>
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', background: C.black, borderRadius: 4, width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 3.5l3 3 3-3" stroke={C.white} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </Fade>

      {/* Roast toggle */}
      <Fade delay={0.16}>
        <motion.button onClick={() => setRoast(r => !r)} whileTap={{ scale: 0.99 }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: roast ? C.black : C.white, border: C.border,
            borderRadius: 12, padding: '14px 18px', cursor: 'pointer',
            boxShadow: roast ? C.shadowLg : C.shadow, outline: 'none', marginBottom: 20,
            transition: 'background 0.18s, box-shadow 0.18s',
          }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 14.5, fontWeight: 900, color: roast ? C.yellow : C.black, fontFamily: "'DM Sans', sans-serif", margin: '0 0 3px' }}>🔥 Roast Mode</p>
            <p style={{ fontSize: 12, color: roast ? 'rgba(255,255,255,0.5)' : '#888', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Brutal honesty. No sugarcoating whatsoever.</p>
          </div>
          <div style={{ width: 44, height: 24, borderRadius: 12, background: roast ? C.red : '#DDD', border: C.border, transition: 'background 0.18s', position: 'relative', flexShrink: 0 }}>
            <motion.div animate={{ x: roast ? 21 : 2 }} transition={SNAP}
              style={{ position: 'absolute', top: 2, width: 18, height: 18, borderRadius: '50%', background: C.white, border: C.borderThin, boxShadow: C.shadowSm }} />
          </div>
        </motion.button>
      </Fade>

      {mode === 'text' && (
        <Fade delay={0.2}>
          <Btn bg={text.trim().length > 30 ? C.red : '#E5E5E5'} textColor={text.trim().length > 30 ? C.white : '#999'}
            size="lg" disabled={text.trim().length <= 30} fullWidth
            onClick={() => text.trim().length > 30 && onAnalyze([], text, lang, roast, 'auto')}>
            Run Deep Analysis →
          </Btn>
        </Fade>
      )}
    </div>
  );
}

// ─── LOADING ──────────────────────────────────────────────────────────────────
const LOAD_LINES = ['Reading your conversation…', 'Figuring out who is who…', 'Analyzing message patterns…', 'Detecting power dynamics…', 'Measuring attraction signals…', 'Finding missed moments…', 'Building your 10-layer report…'];

function LoadingView() {
  const [idx, setIdx] = useState(0);
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t1 = setInterval(() => setIdx(i => Math.min(i + 1, LOAD_LINES.length - 1)), 2200);
    const t2 = setInterval(() => setPct(p => Math.min(p + Math.random() * 5 + 2, 91)), 400);
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);
  return (
    <div style={{ textAlign: 'center', padding: '72px 0 96px' }}>
      {/* Brutalist loader box */}
      <div style={{ width: 88, height: 88, margin: '0 auto 36px', position: 'relative', background: C.black, borderRadius: 20, border: C.border, boxShadow: C.shadowLg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ type: 'tween', repeat: Infinity, duration: 2.5, ease: 'linear' }}
          style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: `3px solid transparent`, borderTopColor: C.yellow, borderRightColor: `${C.yellow}30` }} />
        <motion.div animate={{ rotate: -360 }} transition={{ type: 'tween', repeat: Infinity, duration: 1.8, ease: 'linear' }}
          style={{ position: 'absolute', inset: 20, borderRadius: '50%', border: `3px solid transparent`, borderTopColor: C.red, borderRightColor: `${C.red}30` }} />
        <motion.div style={{ width: 10, height: 10, borderRadius: '50%', background: C.yellow, border: `2px solid ${C.black}` }}
          animate={{ opacity: [1, 0.3, 1], scale: [1, 0.7, 1] }}
          transition={{ type: 'tween', duration: 1.4, repeat: Infinity, ease: 'easeInOut' }} />
      </div>

      <AnimatePresence mode="wait">
        <motion.p key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.28 }}
          style={{ fontSize: 16, color: '#555', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, marginBottom: 32, height: 26 }}>
          {LOAD_LINES[idx]}
        </motion.p>
      </AnimatePresence>

      {/* Brutalist progress bar */}
      <div style={{ maxWidth: 260, margin: '0 auto', height: 12, background: '#F0F0F0', borderRadius: 6, border: C.border, overflow: 'hidden', boxShadow: C.shadowSm }}>
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: C.black, borderRadius: 4 }} />
      </div>
      <p style={{ fontSize: 13, color: '#AAA', marginTop: 14, fontFamily: "'DM Sans', sans-serif" }}>Takes 15–30 seconds</p>
    </div>
  );
}

// ─── LIVE COACH ───────────────────────────────────────────────────────────────
function LiveCoach({ extractedText, context, isPaid }: { extractedText: string; context: string; isPaid: boolean }) {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<CoachResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [checksUsed, setChecksUsed] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const coachLimit = isPaid ? Infinity : LIMITS.FREE_COACH_CHECKS;

  const run = async () => {
    if (!draft.trim() || loading) return;
    if (checksUsed >= coachLimit) { setShowModal(true); return; }
    setLoading(true); setRes(null); setErr(null);
    try {
      const r = await fetch('/api/coach', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ draftMessage: draft, conversationHistory: extractedText, context }) });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || 'Failed');
      setRes(d); setChecksUsed(prev => prev + 1);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const vs: Record<string, { color: string; bg: string; text: string }> = {
    send_it:    { color: C.green,  bg: '#ECFDF5',   text: '✓ Send it'    },
    needs_work: { color: C.amber,  bg: '#FFFBEA',   text: '⚠ Needs work' },
    dont_send:  { color: C.red,    bg: '#FFF0F0',   text: "✗ Don't send" },
  };
  const v = res ? (vs[res.verdict] ?? vs.needs_work) : null;

  return (
    <div style={{ background: C.black, border: C.border, borderRadius: 18, overflow: 'hidden', boxShadow: C.shadowLg }}>
      <Noise opacity={0.04} />
      {/* Header bar */}
      <div style={{ padding: '16px 20px', borderBottom: `1.5px solid rgba(255,255,255,0.1)`, display: 'flex', alignItems: 'center', gap: 10, background: C.yellow, borderBottom: C.border }}>
        <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ type: 'tween', duration: 2, repeat: Infinity }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: C.black, border: `1.5px solid ${C.black}`, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 14.5, fontWeight: 900, color: C.black, fontFamily: "'DM Sans', sans-serif", margin: 0 }}>AI Live Coach</p>
          <p style={{ fontSize: 11.5, color: 'rgba(0,0,0,0.55)', margin: '1px 0 0', fontFamily: "'DM Sans', sans-serif" }}>Type what you're about to send — get instant feedback</p>
        </div>
        <div style={{ marginLeft: 'auto' }}><Badge text="Live" color={C.black} textColor={C.yellow} rotate={0} /></div>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <textarea value={draft} onChange={e => setDraft(e.target.value)}
          placeholder="Type your draft message here…"
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run(); }}
          style={{ width: '100%', minHeight: 96, background: 'rgba(255,255,255,0.07)', border: `1.5px solid rgba(255,255,255,0.15)`, borderRadius: 12, padding: '12px 14px', color: C.white, fontSize: 14, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 12 }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'} />
        <motion.button onClick={run} disabled={!draft.trim() || loading}
          whileHover={draft.trim() && !loading ? { y: -2, boxShadow: C.shadowLg } : {}}
          whileTap={draft.trim() && !loading ? { scale: 0.97 } : {}}
          style={{ width: '100%', padding: '13px', borderRadius: 10, border: C.border, background: draft.trim() && !loading ? C.red : 'rgba(255,255,255,0.07)', color: draft.trim() && !loading ? C.white : 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 900, cursor: draft.trim() && !loading ? 'pointer' : 'default', fontFamily: "'DM Sans', sans-serif", boxShadow: draft.trim() && !loading ? C.shadow : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {loading ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ type: 'tween', repeat: Infinity, duration: 0.8, ease: 'linear' }}
              style={{ width: 14, height: 14, borderRadius: '50%', border: `2px solid rgba(255,255,255,0.3)`, borderTopColor: C.white }} />Coaching…</>
          ) : 'Coach this message'}
        </motion.button>
        {err && <p style={{ fontSize: 13, color: C.red, marginTop: 12, padding: '10px 13px', background: '#FFF0F0', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", border: C.border }}>{err}</p>}
        <AnimatePresence>
          {res && v && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }} style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 900, padding: '5px 14px', borderRadius: 8, background: v.bg, color: v.color, fontFamily: "'DM Sans', sans-serif", border: `1.5px solid ${v.color}40` }}>{v.text}</span>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', fontFamily: "'DM Sans', sans-serif" }}>{res.verdictLabel}</span>
              </div>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{res.analysis}</p>
              <div style={{ background: C.bgYellow, border: C.border, borderRadius: 13, padding: '14px 16px', boxShadow: C.shadowSm }}>
                <p style={{ fontSize: 9.5, fontWeight: 900, color: '#888', textTransform: 'uppercase', letterSpacing: '0.12em', margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>Send this instead</p>
                <p style={{ fontSize: 15, color: C.black, lineHeight: 1.7, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>"{res.improvedVersion}"</p>
                <p style={{ fontSize: 13, color: '#666', margin: 0, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{res.whyItsBetter}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── CHAT REPLAY ──────────────────────────────────────────────────────────────
function ChatReplay({ extractedText }: { extractedText: string }) {
  const [open, setOpen] = useState(false);
  const msgs: Array<{ who: 'me' | 'them'; text: string }> = extractedText.split('\n').filter(l => l.trim()).map(line => {
    if (/^(user|me|you):/i.test(line)) return { who: 'me' as const, text: line.replace(/^(user|me|you):\s*/i, '').trim() };
    if (/^(them|her|him|they|she|he):/i.test(line)) return { who: 'them' as const, text: line.replace(/^(them|her|him|they|she|he):\s*/i, '').trim() };
    return null;
  }).filter(Boolean) as Array<{ who: 'me' | 'them'; text: string }>;
  if (msgs.length === 0) return null;
  const show = open ? msgs : msgs.slice(-8);
  return (
    <Section title="Chat Preview" accent={C.teal} badge={<Pill label={`${msgs.length} msgs`} color={C.teal} bg="rgba(13,148,136,0.1)" />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7, paddingTop: 14 }}>
        {!open && msgs.length > 8 && (
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: C.red, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 800, textAlign: 'left', padding: '0 0 4px' }}>
            ↑ Show all {msgs.length} messages
          </button>
        )}
        {show.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: m.who === 'me' ? 10 : -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
            style={{ display: 'flex', justifyContent: m.who === 'me' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '8px 13px', fontSize: 13, lineHeight: 1.6,
              borderRadius: m.who === 'me' ? '13px 13px 3px 13px' : '13px 13px 13px 3px',
              background: m.who === 'me' ? C.black : '#F0F0F0',
              border: C.borderThin,
              color: m.who === 'me' ? C.white : C.black,
              fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadowSm, wordBreak: 'break-word',
            }}>{m.text}</div>
          </motion.div>
        ))}
        {open && (
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, textAlign: 'center', paddingTop: 5 }}>
            ↑ Collapse
          </button>
        )}
      </div>
    </Section>
  );
}

// ─── FLAG GRID ────────────────────────────────────────────────────────────────
function FlagGrid({ result }: { result: AnalysisResult }) {
  const g: string[] = []; const r: string[] = [];
  result.layer8_attractionSignals?.forEach(s => { if (s.type === 'positive') g.push(s.signal); if (s.type === 'negative') r.push(s.signal); });
  result.layer5_mistakes?.filter(m => m.severity === 'high').forEach(m => r.push(m.mistake));
  if (result.replyEnergyMatch === 'matched') g.push('Energy matched');
  if (result.replyEnergyMatch === 'low') r.push('Low energy replies');
  if (result.conversationMomentum === 'escalating') g.push('Rising momentum');
  if (result.conversationMomentum === 'dying') r.push('Momentum dying');
  result.layer3_psychSignals?.filter(s => s.detected).slice(0, 2).forEach(s => g.push(s.signal));

  return (
    <Section title="Signal Flags" accent={result.overallScore >= 6 ? C.green : C.red}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, paddingTop: 14 }}>
        {[{ label: 'Green', color: C.green, items: g }, { label: 'Red', color: C.red, items: r }].map(col => (
          <div key={col.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color, border: `1.5px solid ${C.black}` }} />
              <p style={{ fontSize: 10, fontWeight: 900, color: col.color, textTransform: 'uppercase', letterSpacing: '0.12em', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                {col.label} ({col.items.length})
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {col.items.slice(0, 6).map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: col.color, marginTop: 7, flexShrink: 0, display: 'block' }} />
                  <p style={{ fontSize: 13, color: '#555', lineHeight: 1.55, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{f}</p>
                </div>
              ))}
              {col.items.length === 0 && <p style={{ fontSize: 13, color: '#CCC', fontStyle: 'italic', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>None detected</p>}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── SMART REPLY GENERATOR ────────────────────────────────────────────────────
const TONE_STYLES: Record<string, { color: string; bg: string; emoji: string }> = {
  playful:   { color: C.purple, bg: '#FFF0F7', emoji: '😏' },
  confident: { color: C.red,   bg: '#FFF0F0', emoji: '💪' },
  curious:   { color: C.teal,  bg: '#F0FFFE', emoji: '🤔' },
};

function SmartReplySection({ extractedText, context, score, isPaid }: { extractedText: string; context: string; score: number; isPaid: boolean }) {
  const [replies, setReplies] = useState<Array<{ tone: string; message: string; why: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch('/api/generate-reply', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ conversationText: extractedText, context, analysisScore: score }) });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.message || 'Failed');
      setReplies(d.replies || []);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const copy = (msg: string, tone: string) => { navigator.clipboard.writeText(msg); setCopied(tone); setTimeout(() => setCopied(null), 1800); };

  if (!isPaid) return <PremiumGate title="Smart Next Message" description="Generate 3 AI-crafted replies tailored to this conversation — playful, confident, and curious." compact />;

  return (
    <Section title="Generate Smart Reply" accent={C.teal}>
      <div style={{ paddingTop: 14 }}>
        {replies.length === 0 && !loading && (
          <Btn bg={C.teal} textColor={C.white} onClick={generate} fullWidth>
            ✨ Generate 3 Smart Replies
          </Btn>
        )}
        {loading && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              style={{ width: 18, height: 18, borderRadius: '50%', border: `2.5px solid rgba(13,148,136,0.3)`, borderTopColor: C.teal, margin: '0 auto 8px' }} />
            <p style={{ fontSize: 13, color: '#888', fontFamily: "'DM Sans', sans-serif" }}>Generating replies…</p>
          </div>
        )}
        {err && <p style={{ fontSize: 13, color: C.red, padding: '10px 13px', background: '#FFF0F0', borderRadius: 9, fontFamily: "'DM Sans', sans-serif", border: C.border }}>{err}</p>}
        {replies.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {replies.map(r => {
              const s = TONE_STYLES[r.tone] ?? TONE_STYLES.playful;
              return (
                <div key={r.tone} style={{ background: s.bg, border: C.border, borderRadius: 14, padding: '16px 18px', boxShadow: C.shadowSm }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                    <Pill label={`${s.emoji} ${r.tone}`} color={s.color} bg={`${s.color}18`} />
                    <motion.button onClick={() => copy(r.message, r.tone)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      style={{ background: copied === r.tone ? '#ECFDF5' : C.white, border: C.border, borderRadius: 7, padding: '4px 11px', fontSize: 11, fontWeight: 800, color: copied === r.tone ? C.green : C.black, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadowSm }}>
                      {copied === r.tone ? '✓ Copied' : 'Copy'}
                    </motion.button>
                  </div>
                  <p style={{ fontSize: 16, color: C.black, fontWeight: 700, lineHeight: 1.7, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>"{r.message}"</p>
                  <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{r.why}</p>
                </div>
              );
            })}
            <button onClick={generate} disabled={loading}
              style={{ background: 'none', border: C.border, borderRadius: 10, padding: '9px 14px', color: '#888', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}>
              Regenerate
            </button>
          </div>
        )}
      </div>
    </Section>
  );
}

// ─── RESULTS ──────────────────────────────────────────────────────────────────
const STAGE_MAP: Record<string, { label: string; color: string }> = {
  early_interest: { label: 'Early Interest', color: C.teal    },
  flirting:       { label: 'Flirting',       color: C.purple  },
  escalating:     { label: 'Escalating',     color: C.green   },
  neutral:        { label: 'Neutral',        color: '#888'    },
  fading:         { label: 'Fading',         color: C.red     },
  reconnecting:   { label: 'Reconnecting',   color: C.amber   },
  professional:   { label: 'Professional',   color: C.teal    },
  platonic:       { label: 'Platonic',       color: '#888'    },
};
const MOM_MAP: Record<string, { label: string; color: string; bg: string }> = {
  escalating: { label: '↑ Rising',  color: C.green, bg: '#ECFDF5'  },
  neutral:    { label: '→ Neutral', color: C.amber, bg: '#FFFBEA'  },
  dying:      { label: '↓ Fading',  color: C.red,   bg: '#FFF0F0'  },
};
const SEV_C: Record<string, string> = { high: C.red, medium: C.amber, low: '#888' };
const SIG_C: Record<string, string> = { positive: C.green, negative: C.red, neutral: '#888' };
const SCORES = [
  { key: 'attraction',              label: 'Attraction',    color: C.purple },
  { key: 'interestLevel',           label: 'Interest',      color: C.red    },
  { key: 'engagement',              label: 'Engagement',    color: C.green  },
  { key: 'curiosity',               label: 'Curiosity',     color: C.teal   },
  { key: 'confidence',              label: 'Confidence',    color: C.amber  },
  { key: 'humor',                   label: 'Humor',         color: '#B85C2A'},
  { key: 'emotionalConnection',     label: 'Emotional Bond',color: C.purple },
  { key: 'conversationalMomentum',  label: 'Momentum',      color: C.green  },
];

function ResultsView({ result, context, onReset, isPaid }: { result: AnalysisResult; context: string; onReset: () => void; isPaid: boolean }) {
  const [tab, setTab] = useState<'analysis' | 'rewrites' | 'coach'>('analysis');
  const ctx = CONTEXTS.find(c => c.id === context)!;
  const sc = result.overallScore;
  const scColor = sc >= 7 ? C.green : sc >= 5 ? C.amber : C.red;
  const stage = STAGE_MAP[result.layer1_diagnosis?.stage] ?? STAGE_MAP.neutral;
  const mom = MOM_MAP[result.conversationMomentum] ?? MOM_MAP.neutral;
  const lang = LANG_MAP[result.detectedLanguage] ?? result.detectedLanguage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <Fade>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 4 }}>
          <button onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'none', border: 'none', color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, padding: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 7H2M5 3L2 7l3 4" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            New analysis
          </button>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Pill label={ctx.label} color={ctx.color} bg={ctx.bg} />
            <Pill label={lang} color="#888" bg="#F0F0F0" />
          </div>
        </div>
      </Fade>

      {/* ── HERO SCORE CARD — black bg like landing page drama sections ── */}
      <Fade delay={0.05}>
        <div style={{ background: C.black, borderRadius: 20, padding: 'clamp(22px, 5vw, 36px)', border: C.border, boxShadow: C.shadowLg, position: 'relative', overflow: 'hidden' }}>
          <Noise opacity={0.04} />
          {/* Glow blob */}
          <div style={{ position: 'absolute', right: -40, top: -40, width: 220, height: 220, borderRadius: '50%', background: `radial-gradient(circle, ${scColor}20, transparent 65%)`, pointerEvents: 'none' }} />
          {/* Decorators */}
          <FloatShape delay={0} style={{ position: 'absolute', top: 16, right: 16 }}>
            <Star size={22} color={scColor} spin />
          </FloatShape>

          <Label text="Conversation Score" color={C.yellow} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(72px, 14vw, 96px)', fontWeight: 900, color: scColor, lineHeight: 1, letterSpacing: '-0.05em' }}>
                  {sc.toFixed(1)}
                </span>
                <span style={{ fontSize: 26, color: 'rgba(255,255,255,0.2)', fontFamily: "'DM Sans', sans-serif", fontWeight: 900 }}>/10</span>
              </div>
              <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0, maxWidth: 320, fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic' }}>
                {result.layer1_diagnosis?.verdict}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 18, flexShrink: 0 }}>
              <Ring value={result.interestLevel} max={100} color={C.purple} size={88} label="Their Interest" />
              <Ring value={result.attractionProbability} max={100} color={C.amber} size={88} label="Attraction" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Pill label={stage.label} color={stage.color} bg={`${stage.color}20`} />
            <Pill label={mom.label} color={mom.color} bg={mom.bg} />
            {result.roastMode && <Pill label="🔥 Roast" color={C.red} bg="#FFF0F0" />}
            {result.replyEnergyMatch === 'low' && <Pill label="Low energy" color={C.red} bg="#FFF0F0" />}
            {result.replyEnergyMatch === 'high' && <Pill label="Over-investing" color={C.amber} bg="#FFFBEA" />}
            {result.tags?.slice(0, 3).map((t, i) => <Pill key={i} label={t.replace(/-/g, ' ')} color="#888" bg="#F0F0F0" />)}
            {result.conversationPersonalityType?.type && (
              <Pill label={`${result.conversationPersonalityType.emoji} ${result.conversationPersonalityType.type}`} color={C.teal} bg="#F0FFFE" />
            )}
          </div>
        </div>
      </Fade>

      <Fade delay={0.08}>
        <ShareScoreCard
          score={result.overallScore} interestLevel={result.interestLevel}
          attractionProbability={result.attractionProbability} momentum={result.conversationMomentum}
          verdict={result.layer1_diagnosis?.verdict || ''}
          personalityType={result.conversationPersonalityType?.type}
          personalityEmoji={result.conversationPersonalityType?.emoji}
          tags={result.tags} roastText={result.roastText} isRoast={result.roastMode}
        />
      </Fade>

      {/* ── TAB SWITCHER (MOVED UP) ── */}
      <Fade delay={0.10}>
        <div style={{ display: 'flex', background: C.white, borderRadius: 12, padding: 4, border: C.border, gap: 4, boxShadow: C.shadow, marginTop: 12 }}>
          {(['analysis', 'rewrites', 'coach'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '11px 7px', borderRadius: 8, border: tab === t ? C.border : 'none', cursor: 'pointer',
              background: tab === t ? C.black : 'transparent',
              color: tab === t ? C.white : '#888',
              fontSize: 13.5, fontWeight: 800, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s',
            }}>
              {t === 'analysis' ? 'Analysis' : t === 'rewrites' ? 'Rewrites' : 'Live Coach'}
            </button>
          ))}
        </div>
      </Fade>

      <AnimatePresence mode="wait">

        {/* ══ ANALYSIS TAB ══ */}
        {tab === 'analysis' && (
          <motion.div key="a" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>

            {/* ── DIAGNOSIS (Moved inside Analysis tab) ── */}
            <div style={{ background: C.bgYellow, border: C.border, borderRadius: 16, padding: '22px', boxShadow: C.shadow, position: 'relative', overflow: 'hidden' }}>
              <Noise opacity={0.03} />
              <Label text="Diagnosis" color={C.red} />
              <p style={{ fontSize: 15.5, color: C.black, lineHeight: 1.85, margin: '0 0 18px', fontFamily: "'DM Sans', sans-serif" }}>
                {result.layer1_diagnosis?.summary}
              </p>
              {result.layer10_strategy?.primaryAdvice && (
                <div style={{ background: C.white, borderLeft: `4px solid ${C.red}`, border: C.border, borderRadius: '0 12px 12px 0', padding: '13px 16px', boxShadow: C.shadowSm }}>
                  <p style={{ fontSize: 14.5, color: C.black, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                    {result.layer10_strategy.primaryAdvice}
                  </p>
                </div>
              )}
            </div>

            {/* ── ROAST (Moved inside Analysis tab) ── */}
            {result.roastMode && result.roastText && (
              <div style={{ background: C.yellow, border: C.border, borderRadius: 16, padding: '22px', boxShadow: C.shadowLg, position: 'relative', overflow: 'hidden' }}>
                <Noise opacity={0.04} />
                <FloatShape delay={0.3} style={{ position: 'absolute', top: 12, right: 18 }}>
                  <Star size={24} color={C.red} spin />
                </FloatShape>
                <Label text="🔥 The Roast" color={C.red} />
                <p style={{ fontSize: 16, color: C.black, lineHeight: 1.85, fontFamily: "'DM Sans', sans-serif", fontWeight: 600, margin: 0 }}>
                  {result.roastText}
                </p>
              </div>
            )}

            <FlagGrid result={result} />
            <ChatReplay extractedText={result.extractedText} />

            <Section title="Score Breakdown" accent={C.red} defaultOpen>
            
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 14 }}>
                {SCORES.map((sm, i) => {
                  const s = result.layer2_scores?.[sm.key];
                  if (!s) return null;
                  return (
                    <div key={sm.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: C.black, fontFamily: "'DM Sans', sans-serif" }}>{sm.label}</span>
                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 20, fontWeight: 900, color: sm.color }}>{s.score.toFixed(1)}</span>
                      </div>
                      <AnimBar pct={(s.score / 10) * 100} color={sm.color} delay={0.04 + i * 0.06} />
                      {s.explanation && <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.75, margin: '8px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{s.explanation}</p>}
                    </div>
                  );
                })}
              </div>
            </Section>

            {result.layer4_powerDynamics?.analysis && (
              isPaid ? (
              <Section title="Power Dynamics" accent={C.amber} badge={<Pill label={`${result.layer4_powerDynamics.whoHoldsPower} holds power`} color={C.amber} bg="#FFFBEA" />}>
                <div style={{ display: 'flex', gap: 9, marginBottom: 18, flexWrap: 'wrap', paddingTop: 14 }}>
                  {[{ label: 'Power', val: result.layer4_powerDynamics.whoHoldsPower }, { label: 'Chasing', val: result.layer4_powerDynamics.whoIsChasing }, { label: 'Leading', val: result.layer4_powerDynamics.whoIsLeading }].map(item => (
                    <div key={item.label} style={{ flex: '1 1 70px', background: C.white, border: C.border, borderRadius: 11, padding: '13px 14px', textAlign: 'center', boxShadow: C.shadowSm }}>
                      <p style={{ fontSize: 9.5, color: '#AAA', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 5px', fontFamily: "'DM Sans', sans-serif", fontWeight: 800 }}>{item.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 900, color: item.val === 'user' ? C.red : item.val === 'them' ? C.amber : C.green, fontFamily: "'DM Sans', sans-serif", margin: 0, textTransform: 'capitalize' }}>{item.val || '—'}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.8, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>{result.layer4_powerDynamics.analysis}</p>
                {result.layer4_powerDynamics.rebalanceTip && (
                  <div style={{ background: '#FFFBEA', borderLeft: `4px solid ${C.amber}`, border: C.border, borderLeft: `4px solid ${C.amber}`, borderRadius: '0 11px 11px 0', padding: '13px 16px', boxShadow: C.shadowSm }}>
                    <p style={{ fontSize: 13.5, color: C.black, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{result.layer4_powerDynamics.rebalanceTip}</p>
                  </div>
                )}
              </Section>
              ) : <PremiumGate title="Power Dynamics" description="See who holds power, who is chasing, and how to rebalance." compact />
            )}

            {result.layer3_psychSignals?.filter(s => s.detected).length > 0 && (
              isPaid ? (
              <Section title="Psychological Signals" accent={C.teal} badge={<Pill label={`${result.layer3_psychSignals.filter(s => s.detected).length} detected`} color={C.teal} bg="#F0FFFE" />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 14 }}>
                  {result.layer3_psychSignals.filter(s => s.detected).map((s, i) => (
                    <div key={i} style={{ borderLeft: `3px solid ${C.black}`, paddingLeft: 14 }}>
                      <p style={{ fontSize: 14.5, fontWeight: 800, color: C.black, margin: '0 0 4px', fontFamily: "'DM Sans', sans-serif" }}>{s.signal}</p>
                      {s.evidence && <p style={{ fontSize: 12.5, color: '#AAA', fontStyle: 'italic', margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>"{s.evidence}"</p>}
                      <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{s.meaning}</p>
                    </div>
                  ))}
                </div>
              </Section>
              ) : <PremiumGate title="Psychological Signals" description={`${result.layer3_psychSignals.filter(s => s.detected).length} signals detected. Upgrade to see mirroring, breadcrumbing, and more.`} compact />
            )}

            {result.layer8_attractionSignals?.length > 0 && (
              isPaid ? (
              <Section title="Attraction Signals" accent={C.purple}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingTop: 14 }}>
                  {result.layer8_attractionSignals.map((sig, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: SIG_C[sig.type] ?? '#888', marginTop: 6, flexShrink: 0, display: 'block', border: `1.5px solid ${C.black}` }} />
                      <div>
                        <p style={{ fontSize: 14.5, fontWeight: 800, color: SIG_C[sig.type] ?? '#888', margin: '0 0 3px', fontFamily: "'DM Sans', sans-serif" }}>{sig.signal}</p>
                        {sig.evidence && <p style={{ fontSize: 12, color: '#AAA', fontStyle: 'italic', margin: '0 0 5px', fontFamily: "'DM Sans', sans-serif" }}>"{sig.evidence}"</p>}
                        <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{sig.interpretation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
              ) : <PremiumGate title="Attraction Signals" description={`${result.layer8_attractionSignals.length} attraction signals found. Upgrade to see all indicators.`} compact />
            )}

            {result.layer5_mistakes?.length > 0 && (
              <Section title="Mistakes Made" accent={C.red} badge={<Pill label={`${result.layer5_mistakes.length} found`} color={C.red} bg="#FFF0F0" />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 14 }}>
                  {(isPaid ? result.layer5_mistakes : result.layer5_mistakes.slice(0, 1)).map((m, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 14.5, fontWeight: 900, color: SEV_C[m.severity] ?? C.red, fontFamily: "'DM Sans', sans-serif" }}>{m.mistake}</span>
                        <Badge text={m.severity} color={SEV_C[m.severity] ?? C.red} textColor={C.white} rotate={0} />
                      </div>
                      {m.whatHappened && <p style={{ fontSize: 12.5, color: '#AAA', fontStyle: 'italic', margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>What happened: "{m.whatHappened}"</p>}
                      <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{m.whyItHurts}</p>
                    </div>
                  ))}
                  {!isPaid && result.layer5_mistakes.length > 1 && (
                    <PremiumGate title={`+${result.layer5_mistakes.length - 1} more mistakes`} description="Upgrade to see all mistakes and how to fix them." compact />
                  )}
                </div>
              </Section>
            )}

            {result.redFlags && result.redFlags.length > 0 && (
              isPaid ? (
              <Section title="Red Flags Detected" accent={C.red} badge={<Pill label={`${result.redFlags.length} warning${result.redFlags.length > 1 ? 's' : ''}`} color={C.red} bg="#FFF0F0" />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 14 }}>
                  {result.redFlags.map((rf, i) => (
                    <div key={i} style={{ background: '#FFF0F0', border: C.border, borderRadius: 13, padding: '14px 16px', boxShadow: C.shadowSm }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                        <span style={{ fontSize: 14 }}>🚩</span>
                        <span style={{ fontSize: 14.5, fontWeight: 900, color: C.red, fontFamily: "'DM Sans', sans-serif" }}>{rf.pattern}</span>
                        <Badge text={rf.severity} color={SEV_C[rf.severity] ?? C.red} textColor={C.white} rotate={0} />
                      </div>
                      {rf.evidence && <p style={{ fontSize: 12.5, color: '#AAA', fontStyle: 'italic', margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>"{rf.evidence}"</p>}
                      <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{rf.advice}</p>
                    </div>
                  ))}
                </div>
              </Section>
              ) : <PremiumGate title="Red Flags Detected" description={`${result.redFlags.length} potential red flag${result.redFlags.length > 1 ? 's' : ''} found. Upgrade to see all warnings.`} compact />
            )}

            {result.layer6_missedOpportunities?.length > 0 && (
              <Section title="Missed Opportunities" accent={C.amber} badge={<Pill label={`${result.layer6_missedOpportunities.length}`} color={C.amber} bg="#FFFBEA" />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingTop: 14 }}>
                  {result.layer6_missedOpportunities.map((mo, i) => (
                    <div key={i} style={{ borderLeft: `3px solid ${C.amber}`, paddingLeft: 16 }}>
                      <p style={{ fontSize: 12.5, color: '#AAA', fontStyle: 'italic', margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>You said: "{mo.moment}"</p>
                      <p style={{ fontSize: 13.5, color: '#555', lineHeight: 1.75, margin: '0 0 12px', fontFamily: "'DM Sans', sans-serif" }}>{mo.whatWasMissed}</p>
                      <div style={{ background: C.bgYellow, border: C.border, borderRadius: 11, padding: '13px 14px', boxShadow: C.shadowSm }}>
                        <p style={{ fontSize: 9.5, fontWeight: 900, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 7px', fontFamily: "'DM Sans', sans-serif" }}>Better response</p>
                        <p style={{ fontSize: 15, color: C.black, lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>"{mo.betterResponse}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.layer10_strategy?.doThis && (
              isPaid ? (
              <Section title="Strategy & Next Steps" accent={C.green} defaultOpen>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14 }}>
                  {result.layer10_strategy.doThis && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: C.bgGreen, border: C.border, borderRadius: 11, padding: '12px 14px', boxShadow: C.shadowSm }}>
                      <Badge text="Do this" color={C.green} textColor={C.white} rotate={0} />
                      <p style={{ fontSize: 14, color: C.black, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif", paddingTop: 1 }}>{result.layer10_strategy.doThis}</p>
                    </div>
                  )}
                  {result.layer10_strategy.avoidThis && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: '#FFF0F0', border: C.border, borderRadius: 11, padding: '12px 14px', boxShadow: C.shadowSm }}>
                      <Badge text="Avoid" color={C.red} textColor={C.white} rotate={0} />
                      <p style={{ fontSize: 14, color: C.black, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif", paddingTop: 1 }}>{result.layer10_strategy.avoidThis}</p>
                    </div>
                  )}
                  {result.layer10_strategy.longTermRead && (
                    <p style={{ fontSize: 13, color: '#888', lineHeight: 1.75, margin: '4px 0 0', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
                      {result.layer10_strategy.longTermRead}
                    </p>
                  )}
                </div>
              </Section>
              ) : <PremiumGate title="Strategy & Next Steps" description="Get personalized do's, don'ts, and long-term advice." compact />
            )}
          </motion.div>
        )}

        {/* ══ REWRITES TAB ══ */}
        {tab === 'rewrites' && (
          <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {result.layer7_rewrites?.originalMessage && (
              <Section title="Message Rewrites" accent={C.purple} defaultOpen>
                <div style={{ background: '#FFF0F0', border: C.border, borderRadius: 12, padding: '13px 14px', margin: '14px 0 16px', boxShadow: C.shadowSm }}>
                  <p style={{ fontSize: 9.5, fontWeight: 900, color: C.red, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 7px', fontFamily: "'DM Sans', sans-serif" }}>Original</p>
                  <p style={{ fontSize: 15, color: C.black, lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>"{result.layer7_rewrites.originalMessage}"</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { key: 'playful',   label: 'Playful',    color: C.purple, bg: '#FFF0F7' },
                    { key: 'confident', label: 'Confident',  color: C.red,    bg: '#FFF0F0' },
                    { key: 'curious',   label: 'Curious',    color: C.teal,   bg: '#F0FFFE' },
                  ].map(v => {
                    const ver = (result.layer7_rewrites as any)[v.key];
                    if (!ver) return null;
                    return (
                      <div key={v.key} style={{ background: v.bg, border: C.border, borderRadius: 13, padding: '16px 18px', boxShadow: C.shadowSm }}>
                        <div style={{ marginBottom: 9 }}><Badge text={v.label} color={v.color} textColor={C.white} rotate={0} /></div>
                        <p style={{ fontSize: 16, color: C.black, lineHeight: 1.7, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>"{ver.message}"</p>
                        <p style={{ fontSize: 13.5, color: '#666', lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{ver.why}</p>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {result.layer9_nextMoves?.playful && (
              <Section title="What to Send Next" accent={C.red} defaultOpen>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 14 }}>
                  {[
                    { key: 'playful',   label: 'Playful',    color: C.purple, bg: '#FFF0F7' },
                    { key: 'curious',   label: 'Curious',    color: C.teal,   bg: '#F0FFFE' },
                    { key: 'confident', label: 'Confident',  color: C.red,    bg: '#FFF0F0' },
                  ].map(nm => {
                    const move = (result.layer9_nextMoves as any)[nm.key];
                    if (!move) return null;
                    return (
                      <div key={nm.key} style={{ background: nm.bg, border: C.border, borderRadius: 13, padding: '16px 18px', boxShadow: C.shadowSm }}>
                        <div style={{ marginBottom: 9 }}><Badge text={nm.label} color={nm.color} textColor={C.white} rotate={0} /></div>
                        <p style={{ fontSize: 16, color: C.black, lineHeight: 1.7, margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>"{move.message}"</p>
                        <p style={{ fontSize: 13, color: '#666', lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{move.intent}</p>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            <SmartReplySection extractedText={result.extractedText} context={context} score={result.overallScore} isPaid={isPaid} />
          </motion.div>
        )}

        {/* ══ COACH TAB ══ */}
        {tab === 'coach' && (
          <motion.div key="c" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: EASE }}>
            <p style={{ fontSize: 14.5, color: '#666', lineHeight: 1.8, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>
              Draft your next message and get an instant verdict — send it, tweak it, or scrap it.
            </p>
            <LiveCoach extractedText={result.extractedText} context={context} isPaid={isPaid} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share */}
      <Fade delay={0.26}>
        <Section title="Share Your Score" accent={C.red}>
          <div style={{ paddingTop: 14 }}>
            <ShareScoreCard score={result.overallScore} interestLevel={result.interestLevel} attractionProbability={result.attractionProbability} momentum={result.conversationMomentum} verdict={result.layer1_diagnosis?.verdict || ''} personalityType={result.conversationPersonalityType?.type} personalityEmoji={result.conversationPersonalityType?.emoji} tags={result.tags} roastText={result.roastText} isRoast={result.roastMode} />
          </div>
        </Section>
      </Fade>

      {/* Bottom actions */}
      <Fade delay={0.28}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4 }}>
          <Link href="/practice" style={{ flex: '1 1 130px', textDecoration: 'none' }}>
            <Btn bg={C.black} textColor={C.yellow} fullWidth>Practice this →</Btn>
          </Link>
          <Btn bg={C.white} textColor="#888" onClick={onReset} fullWidth>
            Analyze another
          </Btn>
        </div>
      </Fade>
    </div>
  );
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
type Step = 'context' | 'upload' | 'loading' | 'result' | 'error';

export default function UploadPage() {
  const { data: session } = useSession();
  const isPaid = checkPremium(session);
  const [step, setStep] = useState<Step>('context');
  const [context, setContext] = useState('dating');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallMsg, setPaywallMsg] = useState('');
  const [showAdModal, setShowAdModal] = useState(false);

 const runAnalysis = async (files: File[], text: string | null, lang: string, roast: boolean, userSide = 'auto') => {
    setStep('loading'); setError(null);
    try {
      const fd = new FormData();
      if (files && files.length > 0) {
        files.forEach(file => fd.append('image', file));
      }
      if (text) fd.append('text', text);
      fd.append('context', context); fd.append('language', lang);
      fd.append('roastMode', String(roast)); fd.append('userSide', userSide);
      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.premiumRequired || data.error === 'paywall') {
        setPaywallMsg(data.message || 'You\'ve reached the free analysis limit. Upgrade to Premium for unlimited analysis.');
        setShowPaywall(true); setStep('upload'); return;
      }
      if (!res.ok || !data.success) { setError(data.error || 'Analysis failed.'); setStep('error'); return; }
      setResult(data); setStep('result');
    } catch (e: any) { setError(e.message || 'Something went wrong.'); setStep('error'); }
  };

  const reset = () => { setStep('context'); setResult(null); setError(null); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
        body { background: ${C.bgCream}; overflow-x: hidden; }
        ::selection { background: ${C.yellow}; color: ${C.black}; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${C.black}; border-radius: 3px; }
        ::-webkit-scrollbar-track { background: ${C.yellow}; }
        select option { background: ${C.white}; color: ${C.black}; }
        button { -webkit-tap-highlight-color: transparent; }
        textarea::placeholder { color: #CCC; font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div style={{ background: C.bgCream, color: C.black, fontFamily: "'DM Sans', sans-serif", minHeight: '100svh', overflowX: 'hidden', paddingBottom: 100, position: 'relative' }}>

        {/* Background dots decoration — matches landing page */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
          <FloatShape delay={0} style={{ position: 'absolute', top: '8%', right: '4%' }}>
            <Star size={20} color={C.yellow} spin style={{ opacity: 0.4 }} />
          </FloatShape>
          <FloatShape delay={1.5} style={{ position: 'absolute', top: '35%', left: '2%' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.red, border: `2px solid ${C.black}`, opacity: 0.3 }} />
          </FloatShape>
          <FloatShape delay={0.8} style={{ position: 'absolute', bottom: '20%', right: '3%' }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue, border: `2px solid ${C.black}`, opacity: 0.3 }} />
          </FloatShape>
        </div>

        <div style={{ maxWidth: 640, margin: '0 auto', padding: 'clamp(32px, 5vw, 56px) clamp(14px, 4vw, 28px) 80px', position: 'relative', zIndex: 1 }}>

          {step === 'context' && (
            <Fade>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: '#888', fontSize: 13, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", marginBottom: 32, fontWeight: 700, border: C.border, borderRadius: 8, padding: '6px 12px', background: C.white, boxShadow: C.shadowSm }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 6.5H1.5M4.5 3L1.5 6.5l3 3.5" stroke="#888" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Home
              </Link>
            </Fade>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: EASE }}>
              {step === 'context' && <StepContext onNext={ctx => { setContext(ctx); setStep('upload'); }} />}
              {step === 'upload' && <StepUpload context={context} onBack={() => setStep('context')} onAnalyze={runAnalysis} isPaid={isPaid} />}
              {step === 'loading' && <LoadingView />}
              {step === 'result' && result && <ResultsView result={result} context={context} onReset={reset} isPaid={isPaid} />}
              {step === 'error' && (
                <div style={{ textAlign: 'center', padding: '72px 0' }}>
                  {/* Brutalist error card */}
                  <div style={{ display: 'inline-block', background: C.red, border: C.border, borderRadius: 18, padding: '24px 32px', boxShadow: C.shadowLg, marginBottom: 24 }}>
                    <div style={{ fontSize: 44, marginBottom: 8 }}>😬</div>
                    <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 24, fontWeight: 900, color: C.white, margin: 0, letterSpacing: '-0.02em' }}>
                      Analysis failed
                    </h2>
                  </div>
                  <p style={{ fontSize: 15, color: '#555', lineHeight: 1.8, maxWidth: 340, margin: '0 auto 28px', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Btn bg={C.black} textColor={C.white} onClick={() => setStep('upload')}>Try again</Btn>
                    <Btn bg={C.white} textColor="#888" onClick={reset}>Start over</Btn>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <PremiumModal open={showPaywall} onClose={() => setShowPaywall(false)}
        type={session?.user ? 'upgrade' : 'signup'}
        title="You've reached the free analysis limit" subtitle={paywallMsg}
        onWatchAd={() => { setShowPaywall(false); setShowAdModal(true); }} />

      <RewardAdModal open={showAdModal} onClose={() => setShowAdModal(false)}
        onRewardGranted={() => { setShowAdModal(false); setShowPaywall(false); }} />
    </>
  );
}