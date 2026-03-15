'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { isPremium as checkPremium, LIMITS } from '@/lib/premiumUtils';
import PremiumGate from '@/components/PremiumGate';
import PremiumModal from '@/components/PremiumModal';
import ShareScoreCard from '@/components/ShareCard';
import RewardAdModal from '@/components/RewardAdModal';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  cream: '#F3EDE2', ink: '#0F0C09', red: '#D13920',
  warm1: '#E8E0D2', warm2: '#D4CBBA', muted: '#8A8074', mutedLt: '#BFB8AC',
  amber: '#B87A10', green: '#2D8A4E', teal: '#3A7A8A',
};

// Mapped to old T shape so all logic below works unchanged
const T = {
  bg: C.cream, panel: C.warm1, card: C.cream, cardHi: C.warm1,
  border: C.warm2, borderHi: C.ink,
  text: C.ink, sub: C.muted, muted: C.mutedLt,
  violet: C.red, violetLo: `${C.red}14`, violetHi: `${C.red}35`, violetBr: C.red,
  coral: C.red, coralLo: `${C.red}10`, coralHi: `${C.red}28`,
  green: C.green, greenLo: 'rgba(45,138,78,0.12)',
  gold: C.amber, goldLo: `${C.amber}15`,
  pink: '#A0426E', pinkLo: 'rgba(160,66,110,0.1)',
  cyan: C.teal, cyanLo: 'rgba(58,122,138,0.1)',
  red: C.red, redLo: `${C.red}10`,
};

const ease = [0.16, 1, 0.3, 1] as const;
const sp = { type: 'spring', stiffness: 300, damping: 30 } as const;

const CONTEXTS = [
  { id: 'dating',        label: 'Dating',        sub: 'Romantic / flirting',          color: C.red,   bg: `${C.red}10`,               emoji: '💘' },
  { id: 'situationship', label: 'Situationship', sub: 'Talking stage / undefined',    color: '#A0426E', bg: 'rgba(160,66,110,0.1)',     emoji: '😵‍💫' },
  { id: 'office',        label: 'Work',          sub: 'Colleague / client / boss',    color: C.teal,  bg: 'rgba(58,122,138,0.1)',      emoji: '💼' },
  { id: 'friendship',    label: 'Friendship',    sub: 'Friends / group chat',         color: C.green, bg: 'rgba(45,138,78,0.1)',       emoji: '🫂' },
  { id: 'networking',    label: 'Networking',    sub: 'Professional outreach',        color: C.amber, bg: `${C.amber}15`,              emoji: '🤝' },
  { id: 'family',        label: 'Family',        sub: 'Parent / sibling / relative',  color: C.muted, bg: `${C.muted}15`,              emoji: '🏠' },
  { id: 'reconnecting',  label: 'Reconnecting',  sub: 'Someone from the past',        color: '#8B6914', bg: 'rgba(139,105,20,0.1)',    emoji: '👋' },
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

// ─── SHARED UI ────────────────────────────────────────────────────────────────
function Fade({ children, delay = 0, y = 18 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease, delay }}>{children}</motion.div>
  );
}

// Editorial label (matches other pages)
const LABEL: React.CSSProperties = {
  fontSize: 11, fontWeight: 800, letterSpacing: '0.14em',
  textTransform: 'uppercase', fontFamily: 'monospace',
  color: C.red, display: 'block', marginBottom: 16,
};

// Pill badge – cream bg style
function Pill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', fontSize: 10.5, fontWeight: 800,
      padding: '4px 10px', borderRadius: 6, background: bg, color,
      textTransform: 'uppercase', letterSpacing: '0.07em',
      fontFamily: 'monospace', whiteSpace: 'nowrap', border: `1px solid ${color}30`,
    }}>{label}</span>
  );
}

function AnimBar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div style={{ height: 3, background: C.warm2, borderRadius: 99, overflow: 'hidden' }}>
      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
        transition={{ duration: 1.3, ease, delay }}
        style={{ height: '100%', background: color, borderRadius: 99 }} />
    </div>
  );
}

function Ring({ value, max, color, size, label }: { value: number; max: number; color: string; size: number; label: string }) {
  const r = size / 2 - 8; const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(243,237,226,0.15)" strokeWidth={6} />
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${(value/max)*circ} ${circ}` }}
            transition={{ duration: 1.5, ease, delay: 0.3 }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
          <span style={{ fontSize: size < 90 ? 16 : 20, fontWeight: 900, color, fontFamily: "'Bricolage Grotesque', sans-serif", lineHeight: 1 }}>
            {max === 10 ? value.toFixed(1) : `${Math.round(value)}`}
          </span>
          {max !== 10 && <span style={{ fontSize: 10, color: `${C.cream}50` }}>%</span>}
        </div>
      </div>
      <span style={{ fontSize: 10.5, color: `${C.cream}55`, textAlign: 'center', fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'monospace', textTransform: 'uppercase' }}>{label}</span>
    </div>
  );
}

// Accordion section — cream card style
function Section({ title, accent, badge, defaultOpen = false, children }: {
  title: string; accent?: string; badge?: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{
      background: C.cream, border: `1.5px solid ${open && accent ? `${accent}40` : C.warm2}`,
      borderRadius: 18, overflow: 'hidden', transition: 'border-color 0.2s',
      boxShadow: open ? '0 4px 16px rgba(15,12,9,0.06)' : '0 1px 4px rgba(15,12,9,0.03)',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '18px 22px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
      }}>
        {accent && <div style={{ width: 3, height: 18, borderRadius: 2, background: accent, flexShrink: 0 }} />}
        <span style={{ flex: 1, fontSize: 15, fontWeight: 800, color: C.ink, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{title}</span>
        {badge && <div style={{ flexShrink: 0 }}>{badge}</div>}
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.22 }}
          style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 4l4 4 4-4" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28, ease }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '4px 22px 22px', borderTop: `1px solid ${C.warm2}` }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── STEP 1 — CONTEXT ─────────────────────────────────────────────────────────
function StepContext({ onNext }: { onNext: (ctx: string) => void }) {
  const [sel, setSel] = useState<string | null>(null);
  return (
    <div>
      <Fade>
        <span style={LABEL}>Step 1 of 3</span>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 7vw, 62px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', color: C.ink, margin: '0 0 16px' }}>
          What kind of<br /><em style={{ fontStyle: 'italic', color: C.red, fontFamily: 'Georgia, serif', fontWeight: 400 }}>conversation?</em>
        </h1>
        <p style={{ fontSize: 15.5, color: C.muted, lineHeight: 1.75, margin: '0 0 36px', maxWidth: 420 }}>
          Context changes everything. A "hey" in dating hits different than a "hey" in a work email.
        </p>
      </Fade>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 195px), 1fr))', gap: 10, marginBottom: 32 }}>
        {CONTEXTS.map((ctx, i) => {
          const active = sel === ctx.id;
          return (
            <Fade key={ctx.id} delay={0.04 + i * 0.04}>
              <motion.button onClick={() => setSel(ctx.id)}
                whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                  background: active ? ctx.bg : C.cream,
                  border: `1.5px solid ${active ? ctx.color + '60' : C.warm2}`,
                  borderRadius: 16, padding: '16px 18px', outline: 'none',
                  boxShadow: active ? `0 4px 20px ${ctx.color}18` : '0 1px 4px rgba(15,12,9,0.04)',
                  transition: 'all 0.2s',
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                    <span style={{ fontSize: 18 }}>{ctx.emoji}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: active ? ctx.color : C.ink, fontFamily: "'Bricolage Grotesque', sans-serif", transition: 'color 0.2s' }}>
                      {ctx.label}
                    </span>
                  </div>
                  <AnimatePresence>
                    {active && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={sp}
                        style={{ width: 16, height: 16, borderRadius: '50%', background: ctx.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 4l1.8 1.8L6.5 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <p style={{ fontSize: 11.5, color: active ? ctx.color : C.mutedLt, margin: 0, paddingLeft: 27, fontFamily: "'DM Sans', sans-serif", transition: 'color 0.2s' }}>{ctx.sub}</p>
              </motion.button>
            </Fade>
          );
        })}
      </div>

      <Fade delay={0.36}>
        <motion.button onClick={() => sel && onNext(sel)}
          whileHover={sel ? { scale: 1.015 } : {}} whileTap={sel ? { scale: 0.985 } : {}}
          style={{
            width: '100%', padding: '17px 28px', borderRadius: 14, border: 'none',
            background: sel ? C.ink : C.warm1,
            color: sel ? C.cream : C.mutedLt,
            fontSize: 16, fontWeight: 800, cursor: sel ? 'pointer' : 'default',
            fontFamily: "'Bricolage Grotesque', sans-serif", transition: 'all 0.25s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
          Continue
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M3 9h12M9 4l5 5-5 5" stroke={sel ? C.cream : C.mutedLt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.button>
      </Fade>
    </div>
  );
}

// ─── STEP 2 — UPLOAD ──────────────────────────────────────────────────────────
function StepUpload({ context, onBack, onAnalyze }: {
  context: string; onBack: () => void;
  onAnalyze: (file: File | null, text: string | null, lang: string, roast: boolean, userSide: string) => void;
}) {
  const [mode, setMode] = useState<'screenshot' | 'text'>('screenshot');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [lang, setLang] = useState('auto');
  const [roast, setRoast] = useState(false);
  const [drag, setDrag] = useState(false);
  const [sideChosen, setSideChosen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const ctx = CONTEXTS.find(c => c.id === context)!;

  const onFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) return;
    setFile(f); setPreview(URL.createObjectURL(f)); setSideChosen(false);
  }, []);

  return (
    <div>
      <Fade>
        <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: C.muted, fontSize: 13.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", padding: '0 0 20px 0', fontWeight: 600 }}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 7.5H3M6 3.5L3 7.5l3 4" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Back
        </button>
        <span style={LABEL}>Step 2 of 3</span>
        <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 900, lineHeight: 1.0, letterSpacing: '-0.03em', color: C.ink, margin: '0 0 14px' }}>
          Add your <em style={{ fontStyle: 'italic', color: ctx.color, fontFamily: 'Georgia, serif', fontWeight: 400 }}>{ctx.label.toLowerCase()} chat.</em>
        </h1>
        <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, margin: '0 0 28px' }}>
          Screenshot or paste — the clearer it is, the sharper the analysis.
        </p>
      </Fade>

      <Fade delay={0.06}>
        <div style={{ display: 'flex', background: C.warm1, borderRadius: 12, padding: 4, marginBottom: 22, border: `1.5px solid ${C.warm2}`, gap: 4 }}>
          {(['screenshot', 'text'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '12px 14px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: mode === m ? C.ink : 'transparent',
              color: mode === m ? C.cream : C.muted,
              fontSize: 14.5, fontWeight: 700,
              fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}>
              {m === 'screenshot' ? '📸  Screenshot' : '✍️  Paste Text'}
            </button>
          ))}
        </div>
      </Fade>

      <AnimatePresence mode="wait">
        {mode === 'screenshot' ? (
          <motion.div key="ss" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }}>
            <div
              onClick={() => !file && inputRef.current?.click()}
              onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); }}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              style={{
                border: `2px dashed ${drag ? ctx.color : file ? C.ink : C.warm2}`,
                borderRadius: 18, cursor: file ? 'default' : 'pointer', marginBottom: 16,
                background: drag ? `${ctx.color}06` : C.warm1, transition: 'all 0.2s',
                overflow: 'hidden', minHeight: file ? 0 : 200,
              }}>
              {file && preview ? (
                <div style={{ position: 'relative' }}>
                  <img src={preview} alt="preview" style={{ width: '100%', maxHeight: 420, objectFit: 'contain', display: 'block' }} />
                  <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setSideChosen(false); }}
                    style={{ position: 'absolute', top: 12, right: 12, background: `${C.ink}E8`, backdropFilter: 'blur(8px)', border: `1px solid rgba(243,237,226,0.15)`, borderRadius: 9, padding: '8px 16px', color: C.cream, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                    Change
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '52px 28px', gap: 16 }}>
                  <motion.div animate={drag ? { scale: 1.15 } : { scale: 1 }} transition={sp}
                    style={{ width: 56, height: 56, borderRadius: 16, background: C.warm2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                      <path d="M13 17V4M9 8l4-4 4 4" stroke={C.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M2 21h22" stroke={C.mutedLt} strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </motion.div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: C.ink, margin: '0 0 6px', fontFamily: "'Bricolage Grotesque', sans-serif" }}>Drop your screenshot here</p>
                    <p style={{ fontSize: 13, color: C.muted, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Or tap to browse · JPG, PNG, WebP · Max 10MB</p>
                  </div>
                </div>
              )}
            </div>
            <input ref={inputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />

            {file && (
              <Fade>
                <div style={{ background: C.cream, border: `1.5px solid ${C.warm2}`, borderRadius: 16, padding: '20px 22px', marginBottom: 16 }}>
                  <p style={{ fontSize: 15, fontWeight: 800, color: C.ink, margin: '0 0 7px', fontFamily: "'Bricolage Grotesque', sans-serif" }}>🎯 Which side are YOUR messages?</p>
                  <p style={{ fontSize: 13.5, color: C.muted, margin: '0 0 18px', lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>
                    This stops the AI from mixing you up with the other person — the #1 cause of wrong analysis.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    {[
                      { side: 'right', label: 'Right side', sub: 'Blue / filled bubbles', preview: <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}><div style={{ background: `${C.ink}`, borderRadius: '9px 9px 2px 9px', padding: '5px 9px', fontSize: 10.5, color: C.cream }}>hey, you free?</div><div style={{ background: C.warm1, border: `1px solid ${C.warm2}`, borderRadius: '9px 9px 2px 9px', padding: '5px 9px', fontSize: 10.5, color: C.muted }}>yeah why?</div></div> },
                      { side: 'left', label: 'Left side', sub: 'Grey / hollow bubbles', preview: <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><div style={{ background: C.ink, borderRadius: '9px 9px 9px 2px', padding: '5px 9px', fontSize: 10.5, color: C.cream }}>hey, you free?</div><div style={{ background: C.warm1, border: `1px solid ${C.warm2}`, borderRadius: '9px 9px 9px 2px', padding: '5px 9px', fontSize: 10.5, color: C.muted }}>yeah why?</div></div> },
                    ].map(opt => (
                      <motion.button key={opt.side} whileHover={{ scale: 1.02, borderColor: C.ink }} whileTap={{ scale: 0.98 }}
                        onClick={() => { setSideChosen(true); onAnalyze(file, null, lang, roast, opt.side); }}
                        style={{ background: C.warm1, border: `1.5px solid ${C.warm2}`, borderRadius: 13, padding: '14px 16px', cursor: 'pointer', textAlign: 'left', fontFamily: "'DM Sans', sans-serif", transition: 'all 0.15s' }}>
                        <div style={{ marginBottom: 10 }}>{opt.preview}</div>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, margin: '0 0 3px', fontFamily: "'Bricolage Grotesque', sans-serif" }}>{opt.label}</p>
                        <p style={{ fontSize: 11.5, color: C.muted, margin: 0 }}>{opt.sub}</p>
                      </motion.button>
                    ))}
                  </div>
                  <button onClick={() => { setSideChosen(true); onAnalyze(file, null, lang, roast, 'auto'); }}
                    style={{ width: '100%', background: 'none', border: `1px solid ${C.warm2}`, borderRadius: 10, padding: '11px', color: C.muted, fontSize: 13.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, transition: 'border-color 0.15s' }}>
                    Not sure — let AI figure it out
                  </button>
                </div>
              </Fade>
            )}
          </motion.div>
        ) : (
          <motion.div key="txt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease }}>
            <label style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 10, fontFamily: 'monospace' }}>
              Paste your conversation
            </label>
            <textarea value={text} onChange={e => setText(e.target.value)}
              placeholder={'Format:\nYou: hey whats up\nThem: not much hbu\nYou: just chilling\n\n(or paste however you have it)'}
              style={{ width: '100%', minHeight: 240, background: C.warm1, border: `1.5px solid ${C.warm2}`, borderRadius: 16, padding: '18px 20px', color: C.ink, fontSize: 14.5, lineHeight: 1.8, fontFamily: "'DM Sans', sans-serif", resize: 'vertical', outline: 'none', transition: 'border-color 0.2s', boxSizing: 'border-box', marginBottom: 8 }}
              onFocus={e => e.currentTarget.style.borderColor = C.ink}
              onBlur={e => e.currentTarget.style.borderColor = C.warm2} />
            <p style={{ fontSize: 13, color: text.length > 30 ? C.green : C.mutedLt, marginBottom: 20, textAlign: 'right', fontFamily: "'DM Sans', sans-serif" }}>
              {text.length} chars {text.length < 30 && '— add more for better analysis'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <Fade delay={0.12}>
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', display: 'block', marginBottom: 10, fontFamily: 'monospace' }}>Language</label>
          <div style={{ position: 'relative' }}>
            <select value={lang} onChange={e => setLang(e.target.value)}
              style={{ width: '100%', background: C.warm1, border: `1.5px solid ${C.warm2}`, borderRadius: 12, padding: '13px 40px 13px 16px', color: C.ink, fontSize: 14.5, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", cursor: 'pointer', appearance: 'none', outline: 'none' }}>
              {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
            </select>
            <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
          </div>
        </div>
      </Fade>

      <Fade delay={0.16}>
        <motion.button onClick={() => setRoast(r => !r)} whileTap={{ scale: 0.99 }}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: roast ? `${C.red}08` : C.cream, border: `1.5px solid ${roast ? `${C.red}35` : C.warm2}`,
            borderRadius: 14, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s', marginBottom: 22, outline: 'none',
          }}>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: 15, fontWeight: 800, color: roast ? C.red : C.ink, fontFamily: "'Bricolage Grotesque', sans-serif", margin: '0 0 4px' }}>🔥 Roast Mode</p>
            <p style={{ fontSize: 13, color: C.muted, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>Brutal honesty. No sugarcoating whatsoever.</p>
          </div>
          <div style={{ width: 46, height: 26, borderRadius: 13, background: roast ? C.red : C.warm2, transition: 'background 0.2s', position: 'relative', flexShrink: 0 }}>
            <motion.div animate={{ x: roast ? 22 : 3 }} transition={sp}
              style={{ position: 'absolute', top: 3, width: 20, height: 20, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(15,12,9,0.2)' }} />
          </div>
        </motion.button>
      </Fade>

      {mode === 'text' && (
        <Fade delay={0.20}>
          <motion.button onClick={() => text.trim().length > 30 && onAnalyze(null, text, lang, roast, 'auto')}
            whileHover={text.trim().length > 30 ? { scale: 1.015 } : {}}
            whileTap={text.trim().length > 30 ? { scale: 0.985 } : {}}
            style={{
              width: '100%', padding: '17px 28px', borderRadius: 14, border: 'none',
              background: text.trim().length > 30 ? C.ink : C.warm1,
              color: text.trim().length > 30 ? C.cream : C.mutedLt,
              fontSize: 16, fontWeight: 800, cursor: text.trim().length > 30 ? 'pointer' : 'default',
              fontFamily: "'Bricolage Grotesque', sans-serif", transition: 'all 0.25s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            }}>
            Run Deep Analysis
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 9h12M9 4l5 5-5 5" stroke={text.trim().length > 30 ? C.cream : C.mutedLt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
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
    <div style={{ textAlign: 'center', padding: '80px 0 100px' }}>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 40px' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ type: 'tween', repeat: Infinity, duration: 3, ease: 'linear' }}
          style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2.5px solid transparent', borderTopColor: C.ink, borderRightColor: `${C.ink}25` }} />
        <motion.div animate={{ rotate: -360 }} transition={{ type: 'tween', repeat: Infinity, duration: 2, ease: 'linear' }}
          style={{ position: 'absolute', inset: 13, borderRadius: '50%', border: '2px solid transparent', borderTopColor: C.red, borderRightColor: `${C.red}25` }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div style={{ width: 10, height: 10, borderRadius: '50%', background: C.red }}
            animate={{ opacity: [1, 0.3, 1], scale: [1, 0.7, 1] }}
            transition={{ type: 'tween', duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.p key={idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.32 }}
          style={{ fontSize: 17, color: C.muted, fontFamily: "'DM Sans', sans-serif", fontWeight: 500, marginBottom: 36, height: 28 }}>
          {LOAD_LINES[idx]}
        </motion.p>
      </AnimatePresence>
      <div style={{ maxWidth: 280, margin: '0 auto', height: 3, background: C.warm2, borderRadius: 99, overflow: 'hidden' }}>
        <motion.div animate={{ width: `${pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{ height: '100%', background: C.ink, borderRadius: 99 }} />
      </div>
      <p style={{ fontSize: 13.5, color: C.mutedLt, marginTop: 18, fontFamily: "'DM Sans', sans-serif" }}>Takes 15–30 seconds</p>
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
      setRes(d);
      setChecksUsed(prev => prev + 1);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const vs: Record<string, { color: string; bg: string; text: string }> = {
    send_it:    { color: C.green,  bg: 'rgba(45,138,78,0.1)',   text: '✓ Send it'    },
    needs_work: { color: C.amber,  bg: `${C.amber}15`,           text: '⚠ Needs work' },
    dont_send:  { color: C.red,    bg: `${C.red}10`,             text: "✗ Don't send" },
  };
  const v = res ? (vs[res.verdict] ?? vs.needs_work) : null;

  return (
    <div style={{ background: C.ink, border: `1.5px solid rgba(243,237,226,0.1)`, borderRadius: 18, overflow: 'hidden' }}>
      <div style={{ padding: '18px 22px 16px', borderBottom: `1px solid rgba(243,237,226,0.07)`, display: 'flex', alignItems: 'center', gap: 12 }}>
        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ type: 'tween', duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ width: 8, height: 8, borderRadius: '50%', background: C.red, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 15, fontWeight: 800, color: C.cream, fontFamily: "'Bricolage Grotesque', sans-serif", margin: 0 }}>AI Live Coach</p>
          <p style={{ fontSize: 12.5, color: `${C.cream}45`, margin: '2px 0 0', fontFamily: "'DM Sans', sans-serif" }}>Type what you're about to send — get instant feedback</p>
        </div>
      </div>
      <div style={{ padding: '18px 20px' }}>
        <textarea value={draft} onChange={e => setDraft(e.target.value)}
          placeholder="Type your draft message here…"
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) run(); }}
          style={{ width: '100%', minHeight: 100, background: 'rgba(243,237,226,0.05)', border: `1.5px solid rgba(243,237,226,0.12)`, borderRadius: 12, padding: '13px 16px', color: C.cream, fontSize: 14.5, lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif", resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 12, transition: 'border-color 0.2s' }}
          onFocus={e => e.currentTarget.style.borderColor = 'rgba(243,237,226,0.3)'}
          onBlur={e => e.currentTarget.style.borderColor = 'rgba(243,237,226,0.12)'} />
        <motion.button onClick={run} disabled={!draft.trim() || loading}
          whileHover={draft.trim() && !loading ? { scale: 1.015 } : {}}
          whileTap={draft.trim() && !loading ? { scale: 0.985 } : {}}
          style={{ width: '100%', padding: '14px', borderRadius: 11, border: 'none', background: draft.trim() && !loading ? C.red : 'rgba(243,237,226,0.07)', color: draft.trim() && !loading ? '#fff' : `${C.cream}30`, fontSize: 14.5, fontWeight: 800, cursor: draft.trim() && !loading ? 'pointer' : 'default', fontFamily: "'Bricolage Grotesque', sans-serif", transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          {loading ? (
            <><motion.div animate={{ rotate: 360 }} transition={{ type: 'tween', repeat: Infinity, duration: 0.8, ease: 'linear' }}
              style={{ width: 15, height: 15, borderRadius: '50%', border: `2px solid rgba(255,255,255,0.3)`, borderTopColor: '#fff' }} />Coaching…</>
          ) : 'Coach this message'}
        </motion.button>
        {err && <p style={{ fontSize: 13.5, color: C.red, marginTop: 12, padding: '11px 14px', background: `${C.red}10`, borderRadius: 10, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${C.red}25` }}>{err}</p>}
        <AnimatePresence>
          {res && v && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease }} style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, fontWeight: 800, padding: '6px 16px', borderRadius: 9, background: v.bg, color: v.color, fontFamily: "'Bricolage Grotesque', sans-serif", border: `1px solid ${v.color}30` }}>{v.text}</span>
                <span style={{ fontSize: 14, color: `${C.cream}55`, fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>{res.verdictLabel}</span>
              </div>
              <p style={{ fontSize: 14.5, color: `${C.cream}65`, lineHeight: 1.8, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{res.analysis}</p>
              <div style={{ background: 'rgba(243,237,226,0.05)', border: `1.5px solid rgba(243,237,226,0.12)`, borderRadius: 14, padding: '16px 18px' }}>
                <p style={{ fontSize: 10.5, fontWeight: 800, color: `${C.cream}40`, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 10px', fontFamily: 'monospace' }}>Send this instead</p>
                <p style={{ fontSize: 16, color: C.cream, lineHeight: 1.7, margin: '0 0 10px', fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>"{res.improvedVersion}"</p>
                <p style={{ fontSize: 13.5, color: `${C.cream}45`, margin: 0, lineHeight: 1.65, fontFamily: "'DM Sans', sans-serif" }}>{res.whyItsBetter}</p>
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
    <Section title="Chat Preview" accent={C.teal} badge={<Pill label={`${msgs.length} msgs`} color={C.teal} bg="rgba(58,122,138,0.12)" />}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingTop: 14 }}>
        {!open && msgs.length > 8 && (
          <button onClick={() => setOpen(true)} style={{ background: 'none', border: 'none', color: C.red, fontSize: 13.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 700, textAlign: 'left', padding: '0 0 6px' }}>
            ↑ Show all {msgs.length} messages
          </button>
        )}
        {show.map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: m.who === 'me' ? 10 : -10 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, ...sp }}
            style={{ display: 'flex', justifyContent: m.who === 'me' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '78%', padding: '9px 14px', fontSize: 13.5, lineHeight: 1.6,
              borderRadius: m.who === 'me' ? '14px 14px 3px 14px' : '14px 14px 14px 3px',
              background: m.who === 'me' ? C.ink : C.warm1,
              border: `1px solid ${m.who === 'me' ? 'transparent' : C.warm2}`,
              color: m.who === 'me' ? C.cream : C.ink,
              fontFamily: "'DM Sans', sans-serif",
            }}>{m.text}</div>
          </motion.div>
        ))}
        {open && (
          <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: C.muted, fontSize: 13, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, textAlign: 'center', paddingTop: 6 }}>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, paddingTop: 16 }}>
        {[{ label: 'Green', color: C.green, items: g }, { label: 'Red', color: C.red, items: r }].map(col => (
          <div key={col.label}>
            <p style={{ fontSize: 10.5, fontWeight: 800, color: col.color, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px', fontFamily: 'monospace' }}>
              {col.label} ({col.items.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.items.slice(0, 6).map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: col.color, marginTop: 6, flexShrink: 0, display: 'block' }} />
                  <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.55, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{f}</p>
                </div>
              ))}
              {col.items.length === 0 && <p style={{ fontSize: 13.5, color: C.mutedLt, fontStyle: 'italic', margin: 0, fontFamily: "'DM Sans', sans-serif" }}>None detected</p>}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── RESULTS VIEW ─────────────────────────────────────────────────────────────
const STAGE_MAP: Record<string, { label: string; color: string }> = {
  early_interest: { label: 'Early Interest', color: C.teal },
  flirting:       { label: 'Flirting',       color: '#A0426E' },
  escalating:     { label: 'Escalating',     color: C.green },
  neutral:        { label: 'Neutral',        color: C.muted },
  fading:         { label: 'Fading',         color: C.red },
  reconnecting:   { label: 'Reconnecting',   color: C.amber },
  professional:   { label: 'Professional',   color: C.teal },
  platonic:       { label: 'Platonic',       color: C.muted },
};
const MOM_MAP: Record<string, { label: string; color: string; bg: string }> = {
  escalating: { label: '↑ Rising', color: C.green, bg: 'rgba(45,138,78,0.12)' },
  neutral:    { label: '→ Neutral', color: C.amber, bg: `${C.amber}15` },
  dying:      { label: '↓ Fading', color: C.red,   bg: `${C.red}10` },
};
const SEV_C: Record<string, string> = { high: C.red, medium: C.amber, low: C.muted };
const SIG_C: Record<string, string> = { positive: C.green, negative: C.red, neutral: C.muted };
const SCORES = [
  { key: 'attraction',           label: 'Attraction',      color: '#A0426E' },
  { key: 'interestLevel',        label: 'Interest',        color: C.red },
  { key: 'engagement',           label: 'Engagement',      color: C.green },
  { key: 'curiosity',            label: 'Curiosity',       color: C.teal },
  { key: 'confidence',           label: 'Confidence',      color: C.amber },
  { key: 'humor',                label: 'Humor',           color: '#B85C2A' },
  { key: 'emotionalConnection',  label: 'Emotional Bond',  color: '#A0426E' },
  { key: 'conversationalMomentum', label: 'Momentum',      color: C.green },
];

// ─── SMART REPLY GENERATOR ───────────────────────────────────────────────────
const TONE_STYLES: Record<string, { color: string; bg: string; emoji: string }> = {
  playful:   { color: '#A0426E', bg: 'rgba(160,66,110,0.08)', emoji: '😏' },
  confident: { color: C.red,    bg: `${C.red}08`,             emoji: '💪' },
  curious:   { color: C.teal,   bg: 'rgba(58,122,138,0.08)',  emoji: '🤔' },
};

function SmartReplySection({ extractedText, context, score, isPaid }: { extractedText: string; context: string; score: number; isPaid: boolean }) {
  const [replies, setReplies] = useState<Array<{ tone: string; message: string; why: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true); setErr(null);
    try {
      const r = await fetch('/api/generate-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationText: extractedText, context, analysisScore: score }),
      });
      const d = await r.json();
      if (!r.ok || !d.success) throw new Error(d.message || 'Failed');
      setReplies(d.replies || []);
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); }
  };

  const copy = (msg: string, tone: string) => {
    navigator.clipboard.writeText(msg);
    setCopied(tone);
    setTimeout(() => setCopied(null), 1800);
  };

  if (!isPaid) {
    return <PremiumGate title="Smart Next Message" description="Generate 3 AI-crafted replies tailored to this conversation — playful, confident, and curious." compact />;
  }

  return (
    <Section title="Generate Smart Reply" accent={C.teal}>
      <div style={{ paddingTop: 14 }}>
        {replies.length === 0 && !loading && (
          <motion.button onClick={generate} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            style={{ width: '100%', padding: '16px 20px', borderRadius: 14, border: `1.5px solid ${C.teal}40`, background: `${C.teal}08`, color: C.teal, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            ✨ Generate 3 Smart Replies
          </motion.button>
        )}
        {loading && (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
              style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${C.teal}40`, borderTopColor: C.teal, margin: '0 auto 10px' }} />
            <p style={{ fontSize: 13, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>Generating replies…</p>
          </div>
        )}
        {err && <p style={{ fontSize: 13.5, color: C.red, padding: '11px 14px', background: `${C.red}10`, borderRadius: 10, fontFamily: "'DM Sans', sans-serif", border: `1px solid ${C.red}25` }}>{err}</p>}
        {replies.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {replies.map(r => {
              const s = TONE_STYLES[r.tone] ?? TONE_STYLES.playful;
              return (
                <div key={r.tone} style={{ background: s.bg, border: `1.5px solid ${s.color}25`, borderRadius: 16, padding: '18px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <Pill label={`${s.emoji} ${r.tone}`} color={s.color} bg={`${s.color}18`} />
                    <motion.button onClick={() => copy(r.message, r.tone)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      style={{ background: copied === r.tone ? `${C.green}15` : `${s.color}10`, border: `1px solid ${copied === r.tone ? C.green : s.color}30`, borderRadius: 8, padding: '5px 12px', fontSize: 11.5, fontWeight: 700, color: copied === r.tone ? C.green : s.color, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      {copied === r.tone ? '✓ Copied' : 'Copy'}
                    </motion.button>
                  </div>
                  <p style={{ fontSize: 17, color: C.ink, fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 10px', fontFamily: 'Georgia, serif' }}>"{r.message}"</p>
                  <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{r.why}</p>
                </div>
              );
            })}
            <motion.button onClick={generate} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              disabled={loading}
              style={{ background: 'none', border: `1px solid ${C.warm2}`, borderRadius: 11, padding: '10px 16px', color: C.muted, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}>
              Regenerate
            </motion.button>
          </div>
        )}
      </div>
    </Section>
  );
}

function ResultsView({ result, context, onReset, isPaid }: { result: AnalysisResult; context: string; onReset: () => void; isPaid: boolean }) {
  const [tab, setTab] = useState<'analysis' | 'rewrites' | 'coach'>('analysis');
  const ctx = CONTEXTS.find(c => c.id === context)!;
  const sc = result.overallScore;
  const scColor = sc >= 7 ? C.green : sc >= 5 ? C.amber : C.red;
  const stage = STAGE_MAP[result.layer1_diagnosis?.stage] ?? STAGE_MAP.neutral;
  const mom = MOM_MAP[result.conversationMomentum] ?? MOM_MAP.neutral;
  const lang = LANG_MAP[result.detectedLanguage] ?? result.detectedLanguage;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Fade>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <button onClick={onReset} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', color: C.muted, fontSize: 13.5, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, padding: 0 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 7.5H3M6 3.5L3 7.5l3 4" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            New analysis
          </button>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <Pill label={ctx.label} color={ctx.color} bg={`${ctx.color}12`} />
            <Pill label={lang} color={C.muted} bg={`${C.muted}12`} />
          </div>
        </div>
      </Fade>

      {/* Hero — ink bg like other dramatic sections */}
      <Fade delay={0.05}>
        <div style={{ background: C.ink, borderRadius: 22, padding: 'clamp(24px, 5vw, 40px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: -50, top: -50, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${scColor}15, transparent 65%)`, pointerEvents: 'none' }} />
          <p style={{ fontSize: 10.5, fontWeight: 800, color: `${C.cream}30`, textTransform: 'uppercase', letterSpacing: '0.14em', margin: '0 0 18px', fontFamily: 'monospace' }}>Conversation Score</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 28, flexWrap: 'wrap', marginBottom: 22 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14 }}>
                <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(80px, 16vw, 108px)', fontWeight: 900, color: scColor, lineHeight: 1, letterSpacing: '-0.05em' }}>
                  {sc.toFixed(1)}
                </span>
                <span style={{ fontSize: 30, color: `${C.cream}25`, fontFamily: "'Bricolage Grotesque', sans-serif" }}>/10</span>
              </div>
              <p style={{ fontSize: 17, color: `${C.cream}60`, fontStyle: 'italic', lineHeight: 1.65, margin: 0, maxWidth: 360, fontFamily: 'Georgia, serif' }}>
                {result.layer1_diagnosis?.verdict}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 24, flexShrink: 0, alignItems: 'center' }}>
              <Ring value={result.interestLevel} max={100} color="#A0426E" size={96} label="Their Interest" />
              <Ring value={result.attractionProbability} max={100} color={C.amber} size={96} label="Attraction" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
            <Pill label={stage.label} color={stage.color} bg={`${stage.color}18`} />
            <Pill label={mom.label} color={mom.color} bg={mom.bg} />
            {result.roastMode && <Pill label="🔥 Roast" color={C.red} bg={`${C.red}15`} />}
            {result.replyEnergyMatch === 'low' && <Pill label="Low energy" color={C.red} bg={`${C.red}12`} />}
            {result.replyEnergyMatch === 'high' && <Pill label="Over-investing" color={C.amber} bg={`${C.amber}12`} />}
            {result.tags?.slice(0, 3).map((t, i) => <Pill key={i} label={t.replace(/-/g, ' ')} color={C.muted} bg={`${C.muted}12`} />)}
            {result.conversationPersonalityType?.type && (
              <Pill label={`${result.conversationPersonalityType.emoji} ${result.conversationPersonalityType.type}`} color={C.teal} bg={`${C.teal}18`} />
            )}
          </div>
        </div>
      </Fade>

      <Fade delay={0.08}>
        <ShareScoreCard
          score={result.overallScore}
          interestLevel={result.interestLevel}
          attractionProbability={result.attractionProbability}
          momentum={result.conversationMomentum}
          verdict={result.layer1_diagnosis?.verdict || ''}
          personalityType={result.conversationPersonalityType?.type}
          personalityEmoji={result.conversationPersonalityType?.emoji}
          tags={result.tags}
          roastText={result.roastText}
          isRoast={result.roastMode}
        />
      </Fade>

      {/* Diagnosis card — cream */}
      <Fade delay={0.10}>
        <div style={{ background: C.cream, border: `1.5px solid ${C.warm2}`, borderRadius: 18, padding: '24px 24px' }}>
          <span style={{ ...LABEL, marginBottom: 14 }}>Diagnosis</span>
          <p style={{ fontSize: 16, color: C.ink, lineHeight: 1.85, margin: '0 0 20px', fontFamily: "'DM Sans', sans-serif" }}>
            {result.layer1_diagnosis?.summary}
          </p>
          {result.layer10_strategy?.primaryAdvice && (
            <div style={{ background: C.warm1, borderLeft: `3px solid ${C.red}`, borderRadius: '0 12px 12px 0', padding: '14px 18px' }}>
              <p style={{ fontSize: 15, color: C.ink, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                {result.layer10_strategy.primaryAdvice}
              </p>
            </div>
          )}
        </div>
      </Fade>

      {/* Roast — ink bg */}
      {result.roastMode && result.roastText && (
        <Fade delay={0.11}>
          <div style={{ background: C.ink, border: `1.5px solid ${C.red}25`, borderRadius: 18, padding: '24px' }}>
            <span style={{ ...LABEL, marginBottom: 14 }}>🔥 The Roast</span>
            <p style={{ fontSize: 17, color: `${C.cream}85`, lineHeight: 1.85, fontStyle: 'italic', margin: 0, fontFamily: 'Georgia, serif' }}>
              {result.roastText}
            </p>
          </div>
        </Fade>
      )}

      <Fade delay={0.12}><FlagGrid result={result} /></Fade>
      <Fade delay={0.13}><ChatReplay extractedText={result.extractedText} /></Fade>

      {/* Tabs */}
      <Fade delay={0.14}>
        <div style={{ display: 'flex', background: C.warm1, borderRadius: 13, padding: 4, border: `1.5px solid ${C.warm2}`, gap: 4 }}>
          {(['analysis', 'rewrites', 'coach'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '12px 8px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: tab === t ? C.ink : 'transparent',
              color: tab === t ? C.cream : C.muted,
              fontSize: 14, fontWeight: 700, fontFamily: "'DM Sans', sans-serif", transition: 'all 0.2s',
            }}>
              {t === 'analysis' ? 'Analysis' : t === 'rewrites' ? 'Rewrites' : 'Live Coach'}
            </button>
          ))}
        </div>
      </Fade>

      <AnimatePresence mode="wait">
        {tab === 'analysis' && (
          <motion.div key="a" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            <Section title="Score Breakdown" accent={C.red} defaultOpen>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingTop: 16 }}>
                {SCORES.map((sm, i) => {
                  const s = result.layer2_scores?.[sm.key];
                  if (!s) return null;
                  return (
                    <div key={sm.key}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span style={{ fontSize: 14.5, fontWeight: 700, color: C.ink, fontFamily: "'DM Sans', sans-serif" }}>{sm.label}</span>
                        <span style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 900, color: sm.color, lineHeight: 1 }}>{s.score.toFixed(1)}</span>
                      </div>
                      <AnimBar pct={(s.score / 10) * 100} color={sm.color} delay={0.04 + i * 0.07} />
                      {s.explanation && <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: '10px 0 0', fontFamily: "'DM Sans', sans-serif" }}>{s.explanation}</p>}
                    </div>
                  );
                })}
              </div>
            </Section>

            {result.layer4_powerDynamics?.analysis && (
              isPaid ? (
              <Section title="Power Dynamics" accent={C.amber} badge={<Pill label={`${result.layer4_powerDynamics.whoHoldsPower} holds power`} color={C.amber} bg={`${C.amber}15`} />}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap', paddingTop: 16 }}>
                  {[{ label: 'Power', val: result.layer4_powerDynamics.whoHoldsPower }, { label: 'Chasing', val: result.layer4_powerDynamics.whoIsChasing }, { label: 'Leading', val: result.layer4_powerDynamics.whoIsLeading }].map(item => (
                    <div key={item.label} style={{ flex: '1 1 80px', background: C.warm1, border: `1px solid ${C.warm2}`, borderRadius: 12, padding: '14px 16px', textAlign: 'center' }}>
                      <p style={{ fontSize: 10.5, color: C.mutedLt, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 7px', fontFamily: 'monospace' }}>{item.label}</p>
                      <p style={{ fontSize: 15, fontWeight: 800, color: item.val === 'user' ? C.red : item.val === 'them' ? C.amber : C.green, fontFamily: "'Bricolage Grotesque', sans-serif", margin: 0, textTransform: 'capitalize' }}>{item.val || '—'}</p>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 14.5, color: C.muted, lineHeight: 1.8, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>{result.layer4_powerDynamics.analysis}</p>
                {result.layer4_powerDynamics.rebalanceTip && (
                  <div style={{ background: C.warm1, borderLeft: `3px solid ${C.amber}`, borderRadius: '0 12px 12px 0', padding: '14px 18px' }}>
                    <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{result.layer4_powerDynamics.rebalanceTip}</p>
                  </div>
                )}
              </Section>
              ) : (
              <PremiumGate title="Power Dynamics" description="See who holds power, who is chasing, and how to rebalance." compact />
              )
            )}

            {result.layer3_psychSignals?.filter(s => s.detected).length > 0 && (
              isPaid ? (
              <Section title="Psychological Signals" accent={C.teal} badge={<Pill label={`${result.layer3_psychSignals.filter(s => s.detected).length} detected`} color={C.teal} bg="rgba(58,122,138,0.12)" />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 16 }}>
                  {result.layer3_psychSignals.filter(s => s.detected).map((s, i) => (
                    <div key={i} style={{ borderLeft: `2px solid ${C.warm2}`, paddingLeft: 16 }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.ink, margin: '0 0 5px', fontFamily: "'Bricolage Grotesque', sans-serif" }}>{s.signal}</p>
                      {s.evidence && <p style={{ fontSize: 13, color: C.mutedLt, fontStyle: 'italic', margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>"{s.evidence}"</p>}
                      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{s.meaning}</p>
                    </div>
                  ))}
                </div>
              </Section>
              ) : (
              <PremiumGate title="Psychological Signals" description={`${result.layer3_psychSignals.filter(s => s.detected).length} signals detected. Upgrade to see mirroring, breadcrumbing, and more.`} compact />
              )
            )}

            {result.layer8_attractionSignals?.length > 0 && (
              isPaid ? (
              <Section title="Attraction Signals" accent="#A0426E">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 16 }}>
                  {result.layer8_attractionSignals.map((sig, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', background: SIG_C[sig.type] ?? C.muted, marginTop: 6, flexShrink: 0, display: 'block' }} />
                      <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: SIG_C[sig.type] ?? C.muted, margin: '0 0 4px', fontFamily: "'Bricolage Grotesque', sans-serif" }}>{sig.signal}</p>
                        {sig.evidence && <p style={{ fontSize: 12.5, color: C.mutedLt, fontStyle: 'italic', margin: '0 0 6px', fontFamily: "'DM Sans', sans-serif" }}>"{sig.evidence}"</p>}
                        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{sig.interpretation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
              ) : (
              <PremiumGate title="Attraction Signals" description={`${result.layer8_attractionSignals.length} attraction signals found. Upgrade to see positive, negative, and neutral indicators.`} compact />
              )
            )}

            {result.layer5_mistakes?.length > 0 && (
              <Section title="Mistakes Made" accent={C.red} badge={<Pill label={`${result.layer5_mistakes.length} found`} color={C.red} bg={`${C.red}12`} />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingTop: 16 }}>
                  {(isPaid ? result.layer5_mistakes : result.layer5_mistakes.slice(0, 1)).map((m, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: SEV_C[m.severity] ?? C.red, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{m.mistake}</span>
                        <Pill label={m.severity} color={SEV_C[m.severity] ?? C.red} bg={`${SEV_C[m.severity] ?? C.red}12`} />
                      </div>
                      {m.whatHappened && <p style={{ fontSize: 13.5, color: C.mutedLt, fontStyle: 'italic', margin: '0 0 7px', fontFamily: "'DM Sans', sans-serif" }}>What happened: "{m.whatHappened}"</p>}
                      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{m.whyItHurts}</p>
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
              <Section title="Red Flags Detected" accent={C.red} badge={<Pill label={`${result.redFlags.length} warning${result.redFlags.length > 1 ? 's' : ''}`} color={C.red} bg={`${C.red}12`} />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 18, paddingTop: 16 }}>
                  {result.redFlags.map((rf, i) => (
                    <div key={i} style={{ background: `${C.red}06`, border: `1.5px solid ${C.red}20`, borderRadius: 14, padding: '16px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                        <span style={{ fontSize: 14 }}>🚩</span>
                        <span style={{ fontSize: 15, fontWeight: 800, color: C.red, fontFamily: "'Bricolage Grotesque', sans-serif" }}>{rf.pattern}</span>
                        <Pill label={rf.severity} color={SEV_C[rf.severity] ?? C.red} bg={`${SEV_C[rf.severity] ?? C.red}12`} />
                      </div>
                      {rf.evidence && <p style={{ fontSize: 13, color: C.mutedLt, fontStyle: 'italic', margin: '0 0 8px', fontFamily: "'DM Sans', sans-serif" }}>"{rf.evidence}"</p>}
                      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{rf.advice}</p>
                    </div>
                  ))}
                </div>
              </Section>
              ) : (
              <PremiumGate title="Red Flags Detected" description={`${result.redFlags.length} potential red flag${result.redFlags.length > 1 ? 's' : ''} found. Upgrade to see warnings like breadcrumbing, mixed signals, and more.`} compact />
              )
            )}

            {result.layer6_missedOpportunities?.length > 0 && (
              <Section title="Missed Opportunities" accent={C.amber} badge={<Pill label={`${result.layer6_missedOpportunities.length}`} color={C.amber} bg={`${C.amber}15`} />}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingTop: 16 }}>
                  {result.layer6_missedOpportunities.map((mo, i) => (
                    <div key={i} style={{ borderLeft: `2px solid ${C.amber}40`, paddingLeft: 18 }}>
                      <p style={{ fontSize: 13, color: C.mutedLt, fontStyle: 'italic', margin: '0 0 7px', fontFamily: "'DM Sans', sans-serif" }}>You said: "{mo.moment}"</p>
                      <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, margin: '0 0 14px', fontFamily: "'DM Sans', sans-serif" }}>{mo.whatWasMissed}</p>
                      <div style={{ background: C.warm1, border: `1px solid ${C.warm2}`, borderRadius: 12, padding: '14px 16px' }}>
                        <p style={{ fontSize: 10.5, fontWeight: 800, color: C.amber, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 8px', fontFamily: 'monospace' }}>Better response</p>
                        <p style={{ fontSize: 16, color: C.ink, fontStyle: 'italic', lineHeight: 1.7, margin: 0, fontFamily: 'Georgia, serif' }}>"{mo.betterResponse}"</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {result.layer10_strategy?.doThis && (
              isPaid ? (
              <Section title="Strategy & Next Steps" accent={C.green} defaultOpen>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 16 }}>
                  {result.layer10_strategy.doThis && (
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <Pill label="Do this" color={C.green} bg="rgba(45,138,78,0.12)" />
                      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif", paddingTop: 2 }}>{result.layer10_strategy.doThis}</p>
                    </div>
                  )}
                  {result.layer10_strategy.avoidThis && (
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                      <Pill label="Avoid" color={C.red} bg={`${C.red}12`} />
                      <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, margin: 0, fontFamily: "'DM Sans', sans-serif", paddingTop: 2 }}>{result.layer10_strategy.avoidThis}</p>
                    </div>
                  )}
                  {result.layer10_strategy.longTermRead && (
                    <p style={{ fontSize: 13.5, color: C.mutedLt, lineHeight: 1.75, margin: '4px 0 0', fontStyle: 'italic', fontFamily: "'DM Sans', sans-serif" }}>
                      {result.layer10_strategy.longTermRead}
                    </p>
                  )}
                </div>
              </Section>
              ) : (
              <PremiumGate title="Strategy & Next Steps" description="Get personalized do's, don'ts, and long-term advice based on this conversation." compact />
              )
            )}
          </motion.div>
        )}

        {tab === 'rewrites' && (
          <motion.div key="r" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {result.layer7_rewrites?.originalMessage && (
              <Section title="Message Rewrites" accent="#A0426E" defaultOpen>
                <div style={{ background: C.warm1, borderRadius: 12, padding: '14px 16px', marginBottom: 20, borderLeft: `2px solid ${C.red}40`, paddingTop: 16 }}>
                  <p style={{ fontSize: 10.5, fontWeight: 800, color: C.red, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 9px', fontFamily: 'monospace' }}>Original</p>
                  <p style={{ fontSize: 16, color: C.ink, fontStyle: 'italic', lineHeight: 1.7, margin: 0, fontFamily: 'Georgia, serif' }}>"{result.layer7_rewrites.originalMessage}"</p>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {[
                    { key: 'playful',   label: 'Playful',    color: '#A0426E',    bg: 'rgba(160,66,110,0.08)'   },
                    { key: 'confident', label: 'Confident',  color: C.red,        bg: `${C.red}08`              },
                    { key: 'curious',   label: 'Curious',    color: C.teal,       bg: 'rgba(58,122,138,0.08)'   },
                  ].map(v => {
                    const ver = (result.layer7_rewrites as any)[v.key];
                    if (!ver) return null;
                    return (
                      <div key={v.key} style={{ background: v.bg, border: `1.5px solid ${v.color}25`, borderRadius: 16, padding: '18px 20px' }}>
                        <Pill label={v.label} color={v.color} bg={`${v.color}18`} />
                        <p style={{ fontSize: 17, color: C.ink, fontStyle: 'italic', lineHeight: 1.7, margin: '14px 0 10px', fontFamily: 'Georgia, serif' }}>"{ver.message}"</p>
                        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{ver.why}</p>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {result.layer9_nextMoves?.playful && (
              <Section title="What to Send Next" accent={C.red} defaultOpen>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 14 }}>
                  {[
                    { key: 'playful',   label: 'Playful',    color: '#A0426E' },
                    { key: 'curious',   label: 'Curious',    color: C.teal },
                    { key: 'confident', label: 'Confident',  color: C.red },
                  ].map(nm => {
                    const move = (result.layer9_nextMoves as any)[nm.key];
                    if (!move) return null;
                    return (
                      <div key={nm.key} style={{ background: C.warm1, border: `1.5px solid ${C.warm2}`, borderRadius: 16, padding: '18px 20px' }}>
                        <Pill label={nm.label} color={nm.color} bg={`${nm.color}12`} />
                        <p style={{ fontSize: 17, color: C.ink, fontStyle: 'italic', lineHeight: 1.7, margin: '12px 0 9px', fontFamily: 'Georgia, serif' }}>"{move.message}"</p>
                        <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.65, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{move.intent}</p>
                      </div>
                    );
                  })}
                </div>
              </Section>
            )}

            {/* Smart Reply Generator — Premium */}
            <SmartReplySection extractedText={result.extractedText} context={context} score={result.overallScore} isPaid={isPaid} />
          </motion.div>
        )}

        {tab === 'coach' && (
          <motion.div key="c" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.28, ease }}>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.8, margin: '0 0 16px', fontFamily: "'DM Sans', sans-serif" }}>
              Draft your next message and get an instant verdict — send it, tweak it, or scrap it.
            </p>
            <LiveCoach extractedText={result.extractedText} context={context} isPaid={isPaid} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Score Card */}
      <Fade delay={0.28}>
        <Section title="Share Your Score" accent={C.red}>
          <div style={{ paddingTop: 14 }}>
            <ShareScoreCard
              score={result.overallScore}
              interestLevel={result.interestLevel}
              attractionProbability={result.attractionProbability}
              momentum={result.conversationMomentum}
              verdict={result.layer1_diagnosis?.verdict || ''}
              personalityType={result.conversationPersonalityType?.type}
              personalityEmoji={result.conversationPersonalityType?.emoji}
              tags={result.tags}
              roastText={result.roastText}
              isRoast={result.roastMode}
            />
          </div>
        </Section>
      </Fade>

      <Fade delay={0.3}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 8 }}>
          <Link href="/practice" style={{ flex: '1 1 140px', textDecoration: 'none' }}>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '100%', background: C.warm1, border: `1.5px solid ${C.warm2}`, borderRadius: 14, padding: '16px 20px', color: C.ink, fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              Practice this →
            </motion.button>
          </Link>
          <motion.button onClick={onReset} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            style={{ flex: '1 1 140px', background: 'none', border: `1.5px solid ${C.warm2}`, borderRadius: 14, padding: '16px 20px', color: C.muted, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            Analyze another
          </motion.button>
        </div>
      </Fade>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
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

  const runAnalysis = async (file: File | null, text: string | null, lang: string, roast: boolean, userSide = 'auto') => {
    setStep('loading'); setError(null);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      if (text) fd.append('text', text);
      fd.append('context', context); fd.append('language', lang);
      fd.append('roastMode', String(roast)); fd.append('userSide', userSide);
      const res = await fetch('/api/analyze', { method: 'POST', body: fd });
      const data = await res.json();

      // ── Paywall handling: show upgrade modal, NOT error screen ──
      if (data.premiumRequired || data.error === 'paywall') {
        setPaywallMsg(data.message || 'You\'ve reached the free analysis limit. Upgrade to Premium for unlimited analysis.');
        setShowPaywall(true);
        setStep('upload'); // go back to upload, not error
        return;
      }

      if (!res.ok || !data.success) { setError(data.error || 'Analysis failed.'); setStep('error'); return; }
      setResult(data); setStep('result');
    } catch (e: any) { setError(e.message || 'Something went wrong.'); setStep('error'); }
  };

  const reset = () => { setStep('context'); setResult(null); setError(null); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,700;12..96,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
        body { background: ${C.cream}; }
        ::selection { background: ${C.red}25; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: ${C.red}40; border-radius: 2px; }
        select option { background: ${C.warm1}; color: ${C.ink}; }
        button { -webkit-tap-highlight-color: transparent; }
        textarea::placeholder { color: ${C.mutedLt}; }
      `}</style>

      <div style={{ background: C.cream, color: C.ink, fontFamily: "'DM Sans', sans-serif", minHeight: '100svh', overflowX: 'hidden', paddingBottom: 100 }}>
        <div style={{ maxWidth: 660, margin: '0 auto', padding: 'clamp(36px, 5vw, 60px) clamp(16px, 4vw, 28px) 60px' }}>

          {step === 'context' && (
            <Fade>
              <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: C.muted, fontSize: 13.5, textDecoration: 'none', fontFamily: "'DM Sans', sans-serif", marginBottom: 36, fontWeight: 600 }}>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M10 7.5H3M6 3.5L3 7.5l3 4" stroke={C.muted} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Home
              </Link>
            </Fade>
          )}

          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease }}>
              {step === 'context' && <StepContext onNext={ctx => { setContext(ctx); setStep('upload'); }} />}
              {step === 'upload' && <StepUpload context={context} onBack={() => setStep('context')} onAnalyze={runAnalysis} />}
              {step === 'loading' && <LoadingView />}
              {step === 'result' && result && <ResultsView result={result} context={context} onReset={reset} isPaid={isPaid} />}
              {step === 'error' && (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div style={{ fontSize: 48, marginBottom: 20 }}>😬</div>
                  <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 900, color: C.red, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
                    Analysis failed
                  </h2>
                  <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.8, maxWidth: 360, margin: '0 auto 32px', fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => setStep('upload')}
                      style={{ background: C.ink, border: 'none', color: C.cream, borderRadius: 13, padding: '14px 28px', fontSize: 15, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Try again
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={reset}
                      style={{ background: 'none', border: `1.5px solid ${C.warm2}`, color: C.muted, borderRadius: 13, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
                      Start over
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Paywall Modal — shows when free limit reached */}
      <PremiumModal
        open={showPaywall}
        onClose={() => setShowPaywall(false)}
        type={session?.user ? 'upgrade' : 'signup'}
        title="You've reached the free analysis limit"
        subtitle={paywallMsg}
        onWatchAd={() => { setShowPaywall(false); setShowAdModal(true); }}
      />

      {/* Reward Ad Modal */}
      <RewardAdModal
        open={showAdModal}
        onClose={() => setShowAdModal(false)}
        onRewardGranted={() => {
          setShowAdModal(false);
          setShowPaywall(false);
        }}
      />
    </>
  );
}