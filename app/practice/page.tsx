'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── TYPES ────────────────────────────────────────────────────────────────────
type CharId = 'cold_opener' | 'banter_queen' | 'warm_engaged' | 'intellectual' | 'soft_ghost' | 'playful_chaos';
type Diff = 'easy' | 'normal' | 'hard';

interface Analysis {
  score: number;
  interestChange: number;
  momentumChange: number;
  whatWorked: string | null;
  whatFailed: string | null;
  tip: string;
  flags: string[];
}

interface Msg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  analysis?: Analysis | null;
  timestamp: number;
}

interface SessionStats {
  interest: number;
  momentum: number;
  avgScore: number;
  msgCount: number;
  scores: number[];
  interestHistory: number[];
}

// ─── CHARACTER CONFIG ──────────────────────────────────────────────────────────
const CHARS = [
  {
    id: 'cold_opener' as CharId,
    name: 'Noa',
    tag: 'The Selective One',
    emoji: '🥶',
    color: '#A78BFA',
    colorDim: 'rgba(167,139,250,0.12)',
    colorBorder: 'rgba(167,139,250,0.2)',
    level: 'Entry' as const,
    opening: 'hi',
    bio: 'Gets 100+ texts a day and responds based on whether you earn it. You have 3 messages to prove you\'re worth her time.',
    traits: ['Very selective', 'Low patience', 'Rewards effort'],
  },
  {
    id: 'warm_engaged' as CharId,
    name: 'Mia',
    tag: 'The Warm Standard',
    emoji: '🌿',
    color: '#34D399',
    colorDim: 'rgba(52,211,153,0.12)',
    colorBorder: 'rgba(52,211,153,0.2)',
    level: 'Easy' as const,
    opening: 'hey! how are you doing?',
    bio: 'Friendly, emotionally intelligent, and genuinely curious. She notices everything — especially when you stop listening.',
    traits: ['Good listener', 'Asks real questions', 'Reads energy'],
  },
  {
    id: 'playful_chaos' as CharId,
    name: 'Liv',
    tag: 'The Chaos Agent',
    emoji: '⚡',
    color: '#FB923C',
    colorDim: 'rgba(251,146,60,0.12)',
    colorBorder: 'rgba(251,146,60,0.2)',
    level: 'Medium' as const,
    opening: 'okayy who even are you',
    bio: 'High energy, text bursts, completely unpredictable. She lives for the chaos and can immediately tell if you\'re stiff.',
    traits: ['Burst texter', 'Energy matching', 'Unpredictable'],
  },
  {
    id: 'banter_queen' as CharId,
    name: 'Zara',
    tag: 'The Banter Queen',
    emoji: '💅',
    color: '#F472B6',
    colorDim: 'rgba(244,114,182,0.12)',
    colorBorder: 'rgba(244,114,182,0.2)',
    level: 'Hard' as const,
    opening: 'oh. another text. state your purpose.',
    bio: 'Sharp wit, zero tolerance for boring. She will surgically dismantle every cliché. Win the sparring match and she\'s yours.',
    traits: ['Heavy sarcasm', 'Rewards wit', 'Tests limits'],
  },
  {
    id: 'intellectual' as CharId,
    name: 'Rei',
    tag: 'The Intellectual',
    emoji: '🔭',
    color: '#38BDF8',
    colorDim: 'rgba(56,189,248,0.12)',
    colorBorder: 'rgba(56,189,248,0.2)',
    level: 'Hard' as const,
    opening: 'hey',
    bio: 'Surface chat physically bores her. Say something real and she goes deep fast. Say nothing and she\'s completely gone.',
    traits: ['Ideas > small talk', 'Loves debate', 'Asks "why"'],
  },
  {
    id: 'soft_ghost' as CharId,
    name: 'Cass',
    tag: 'The Soft Ghost',
    emoji: '👻',
    color: '#94A3B8',
    colorDim: 'rgba(148,163,184,0.12)',
    colorBorder: 'rgba(148,163,184,0.2)',
    level: 'Expert' as const,
    opening: 'yeah',
    bio: 'Always half-present, impossible to hold. She doesn\'t ghost on purpose — you just have to be exceptional enough to matter.',
    traits: ['Ultra brief', 'Hard to impress', 'Rare warmth'],
  },
] as const;

const LEVEL_COLORS: Record<string, string> = {
  Entry: '#94A3B8',
  Easy: '#34D399',
  Medium: '#FBBF24',
  Hard: '#FB923C',
  Expert: '#F43F5E',
};

const DIFFS = [
  { id: 'easy' as Diff, label: 'Guided', sub: 'Full coaching after every message', dots: 1, color: '#34D399' },
  { id: 'normal' as Diff, label: 'Realistic', sub: 'Coaching at key moments only', dots: 2, color: '#FBBF24' },
  { id: 'hard' as Diff, label: 'Simulation', sub: 'No coaching. No hints. Survive.', dots: 3, color: '#F87171' },
] as const;

const POSITIVE_FLAGS = new Set([
  'good_hook','good_question','witty','specific','good_follow_up',
  'showed_personality','high_effort','deep_question','matched_energy','recovered_well'
]);

// ─── GLOBAL CSS ────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,600;12..96,700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
html { scroll-behavior: smooth; }
body { font-family: 'DM Sans', sans-serif; background: #090912; color: #EDE8E1; -webkit-font-smoothing: antialiased; }
.briq { font-family: 'Bricolage Grotesque', sans-serif; }
input, button, textarea { font-family: 'DM Sans', sans-serif; }
button { cursor: pointer; }

/* Custom scrollbar */
::-webkit-scrollbar { width: 3px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 99px; }
::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.18); }

/* iOS momentum scroll */
.ios-scroll { -webkit-overflow-scrolling: touch; overscroll-behavior-y: contain; }

/* Typing dots */
@keyframes blink { 0%,80%,100%{opacity:0.2} 40%{opacity:1} }
.dot { width:6px; height:6px; border-radius:50%; background:rgba(237,232,225,0.35); display:inline-block; animation: blink 1.4s infinite both; }
.dot:nth-child(2){animation-delay:.2s}
.dot:nth-child(3){animation-delay:.4s}

/* Slide-up animation */
@keyframes slideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
.slide-up { animation: slideUp 0.3s ease forwards; }

/* Hover on desktop only */
@media (hover:hover) {
  .char-card:hover { border-color: rgba(255,255,255,0.14) !important; transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.3) !important; }
  .diff-opt:hover { background: rgba(255,255,255,0.04) !important; }
  .send-btn:not(:disabled):hover { transform: scale(1.05); }
}
`;

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function ScoreRing({ score, size = 44, color }: { score: number; size?: number; color: string }) {
  const r = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.23,1,0.32,1)' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px`, fontSize: 11, fontWeight: 600, fill: color, fontFamily: 'DM Sans' }}>
        {score}
      </text>
    </svg>
  );
}

function MiniBar({ value, color, label }: { value: number; color: string; label: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(237,232,225,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>{Math.round(value)}</span>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
        <motion.div animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
          transition={{ duration: 0.7, ease: [0.23,1,0.32,1] }}
          style={{ height: '100%', background: color, borderRadius: 99 }} />
      </div>
    </div>
  );
}

function Chip({ text, positive }: { text: string; positive: boolean }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 6,
      textTransform: 'uppercase', letterSpacing: '0.06em',
      background: positive ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
      border: `1px solid ${positive ? 'rgba(52,211,153,0.22)' : 'rgba(248,113,113,0.22)'}`,
      color: positive ? '#6EE7B7' : '#FCA5A5',
    }}>
      {text.replace(/_/g, ' ')}
    </span>
  );
}

// ─── ANALYSIS BOTTOM SHEET ─────────────────────────────────────────────────────
function AnalysisSheet({
  open, onClose, stats, lastAnalysis, char,
}: {
  open: boolean;
  onClose: () => void;
  stats: SessionStats;
  lastAnalysis: Analysis | null;
  char: typeof CHARS[number];
}) {
  const scoreColor = stats.avgScore >= 70 ? '#34D399' : stats.avgScore >= 50 ? '#FBBF24' : '#F87171';
  const interestColor = stats.interest >= 60 ? '#34D399' : stats.interest >= 35 ? '#FBBF24' : '#F87171';

  const grade = stats.msgCount === 0 ? '—'
    : stats.avgScore >= 85 ? 'A+'
    : stats.avgScore >= 75 ? 'A'
    : stats.avgScore >= 65 ? 'B'
    : stats.avgScore >= 55 ? 'C'
    : stats.avgScore >= 40 ? 'D'
    : 'F';

  const interestLabel = stats.interest < 25 ? 'Losing her fast' :
    stats.interest < 40 ? 'Barely holding' :
    stats.interest < 55 ? 'Holding steady' :
    stats.interest < 70 ? 'She\'s interested' :
    stats.interest < 85 ? 'She\'s into it' : 'She\'s hooked';

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, backdropFilter: 'blur(4px)' }}
          />
          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 360 }}
            style={{
              position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 201,
              background: '#111118',
              borderRadius: '22px 22px 0 0',
              border: '1px solid rgba(255,255,255,0.08)',
              borderBottom: 'none',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 -20px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Handle + header */}
            <div style={{ padding: '12px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              <div style={{ width: 36, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.12)', margin: '0 auto 16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div className="briq" style={{ fontSize: 18, fontWeight: 600, marginBottom: 2 }}>Session Analysis</div>
                  <div style={{ fontSize: 12, color: 'rgba(237,232,225,0.4)' }}>
                    {stats.msgCount} {stats.msgCount === 1 ? 'message' : 'messages'} with {char.name}
                  </div>
                </div>
                <button onClick={onClose}
                  style={{ width: 32, height: 32, borderRadius: 99, background: 'rgba(255,255,255,0.06)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(237,232,225,0.5)' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="ios-scroll" style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

              {stats.msgCount === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(237,232,225,0.35)', fontSize: 14 }}>
                  Send your first message to start tracking.
                </div>
              ) : (
                <>
                  {/* Grade + stats row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
                    {[
                      { label: 'Grade', value: grade, color: scoreColor, large: true },
                      { label: 'Avg Score', value: stats.msgCount > 0 ? Math.round(stats.avgScore) : '--', color: scoreColor, large: false },
                      { label: 'Messages', value: stats.msgCount, color: 'rgba(237,232,225,0.8)', large: false },
                    ].map(s => (
                      <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 12px', textAlign: 'center' }}>
                        <div style={{ fontSize: s.large ? 28 : 22, fontWeight: 700, color: s.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1, marginBottom: 4 }} className="briq">
                          {s.value}
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(237,232,225,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Interest + Momentum bars */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 20 }}>
                      <MiniBar value={stats.interest} color={interestColor} label="Interest" />
                      <MiniBar value={stats.momentum} color={char.color} label="Momentum" />
                    </div>
                    <div style={{ marginTop: 12, fontSize: 12, color: interestColor, fontWeight: 500 }}>{interestLabel}</div>
                  </div>

                  {/* Score history mini chart */}
                  {stats.scores.length > 1 && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '16px', marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(237,232,225,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Score History</div>
                      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 48 }}>
                        {stats.scores.map((s, i) => {
                          const h = Math.max(4, (s / 100) * 48);
                          const c = s >= 70 ? '#34D399' : s >= 50 ? '#FBBF24' : '#F87171';
                          return (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                              <motion.div initial={{ height: 0 }} animate={{ height: h }} transition={{ delay: i * 0.04, duration: 0.5, ease: [0.23,1,0.32,1] }}
                                style={{ width: '100%', background: c, borderRadius: '3px 3px 1px 1px', minWidth: 6 }} />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Last message breakdown */}
                  {lastAnalysis && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(237,232,225,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Last Message</div>

                      {lastAnalysis.whatWorked && (
                        <div style={{ padding: '12px', borderRadius: 12, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>✓ Worked</div>
                          <div style={{ fontSize: 13, color: '#A7F3D0', lineHeight: 1.5 }}>{lastAnalysis.whatWorked}</div>
                        </div>
                      )}

                      {lastAnalysis.whatFailed && (
                        <div style={{ padding: '12px', borderRadius: 12, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>✗ Missed</div>
                          <div style={{ fontSize: 13, color: '#FCA5A5', lineHeight: 1.5 }}>{lastAnalysis.whatFailed}</div>
                        </div>
                      )}

                      {lastAnalysis.tip && (
                        <div style={{ padding: '12px', borderRadius: 12, background: `${char.colorDim}`, border: `1px solid ${char.colorBorder}` }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: char.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>→ Next Move</div>
                          <div style={{ fontSize: 13, color: '#EDE8E1', lineHeight: 1.5 }}>{lastAnalysis.tip}</div>
                        </div>
                      )}

                      {lastAnalysis.flags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {lastAnalysis.flags.map(f => (
                            <Chip key={f} text={f} positive={POSITIVE_FLAGS.has(f)} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Safe bottom */}
              <div style={{ height: 'max(20px, env(safe-area-inset-bottom))' }} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── CHAR SELECT SCREEN ────────────────────────────────────────────────────────
function CharSelect({ onPick }: { onPick: (c: typeof CHARS[number]) => void }) {
  return (
    <div style={{ minHeight: '100svh', background: '#090912', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px) 48px' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.23,1,0.32,1] }}
          style={{ marginBottom: 'clamp(32px,5vw,56px)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(237,232,225,0.3)', marginBottom: 14 }}>
            Practice Mode
          </div>
          <h1 className="briq" style={{ fontSize: 'clamp(32px,6vw,54px)', fontWeight: 600, lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 12 }}>
            Choose your{' '}
            <span style={{ fontStyle: 'italic', fontWeight: 300 }}>sparring partner.</span>
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(237,232,225,0.45)', lineHeight: 1.65, maxWidth: 460 }}>
            Six distinct personalities, each one designed to test a different part of your social intelligence. Pick the challenge level that matches your goal.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%,290px),1fr))', gap: 12 }}>
          {CHARS.map((c, i) => (
            <motion.div key={c.id}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.055, duration: 0.45, ease: [0.23,1,0.32,1] }}>
              <div className="char-card" onClick={() => onPick(c)}
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 'clamp(18px,3vw,24px)', cursor: 'pointer', transition: 'all 0.22s', position: 'relative', overflow: 'hidden', height: '100%' }}>

                {/* Subtle glow background */}
                <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: c.color, borderRadius: '50%', opacity: 0.04, pointerEvents: 'none' }} />

                {/* Top row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: c.colorDim, border: `1px solid ${c.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {c.emoji}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: LEVEL_COLORS[c.level], background: `${LEVEL_COLORS[c.level]}18`, border: `1px solid ${LEVEL_COLORS[c.level]}30`, padding: '4px 10px', borderRadius: 999, flexShrink: 0 }}>
                    {c.level}
                  </span>
                </div>

                {/* Name */}
                <div className="briq" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 2 }}>{c.name}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: c.color, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 12 }}>{c.tag}</div>

                {/* Bio */}
                <p style={{ fontSize: 13, color: 'rgba(237,232,225,0.45)', lineHeight: 1.65, marginBottom: 16 }}>{c.bio}</p>

                {/* Traits */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
                  {c.traits.map(t => (
                    <span key={t} style={{ fontSize: 11, fontWeight: 500, color: 'rgba(237,232,225,0.4)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '3px 9px', borderRadius: 6 }}>
                      {t}
                    </span>
                  ))}
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: c.color }}>
                  Start practice
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 2l3.5 4-3.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DIFFICULTY SELECT SCREEN ──────────────────────────────────────────────────
function DiffSelect({ char, onBack, onStart }: { char: typeof CHARS[number]; onBack: () => void; onStart: (d: Diff) => void }) {
  const [picked, setPicked] = useState<Diff>('easy');
  return (
    <div style={{ minHeight: '100svh', background: '#090912', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(24px,5vw,48px) clamp(16px,4vw,32px)' }}>
      <style>{CSS}</style>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.23,1,0.32,1] }}
        style={{ width: '100%', maxWidth: 440 }}>

        {/* Back */}
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(237,232,225,0.4)', background: 'none', border: 'none', fontSize: 13, fontWeight: 500, marginBottom: 36, padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>

        {/* Character preview card */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 18px', background: char.colorDim, border: `1px solid ${char.colorBorder}`, borderRadius: 16, marginBottom: 36 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
            {char.emoji}
          </div>
          <div>
            <div className="briq" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{char.name}</div>
            <div style={{ fontSize: 11, color: char.color, fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{char.tag}</div>
          </div>
        </div>

        <h2 className="briq" style={{ fontSize: 'clamp(26px,5vw,36px)', fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 6 }}>
          Set intensity.
        </h2>
        <p style={{ fontSize: 14, color: 'rgba(237,232,225,0.4)', lineHeight: 1.65, marginBottom: 24 }}>
          How much coaching do you want while you practice?
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
          {DIFFS.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
              className="diff-opt" onClick={() => setPicked(d.id)}
              style={{ padding: '16px 18px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.18s', border: `1px solid ${picked === d.id ? d.color + '50' : 'rgba(255,255,255,0.07)'}`, background: picked === d.id ? `${d.color}0E` : 'rgba(255,255,255,0.01)', boxShadow: picked === d.id ? `0 0 24px ${d.color}12` : 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span className="briq" style={{ fontSize: 15, fontWeight: 600, color: picked === d.id ? '#EDE8E1' : 'rgba(237,232,225,0.5)' }}>{d.label}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1,2,3].map(n => <div key={n} style={{ width: 7, height: 7, borderRadius: '50%', background: n <= d.dots ? d.color : 'rgba(255,255,255,0.08)', transition: 'background 0.2s' }} />)}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(237,232,225,0.35)' }}>{d.sub}</div>
            </motion.div>
          ))}
        </div>

        <motion.button whileTap={{ scale: 0.97 }} onClick={() => onStart(picked)}
          style={{ width: '100%', padding: '15px 20px', borderRadius: 14, background: char.color, border: 'none', color: '#09090D', fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: `0 8px 40px ${char.color}30`, letterSpacing: '-0.01em' }}
          className="briq">
          Begin Simulation
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 3.5l4.5 4.5L9 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── CHAT SCREEN ───────────────────────────────────────────────────────────────
// Layout: position:fixed inset:0 → flex column → messages (flex:1 overflow-y:auto) + input (flexShrink:0)
// This is the correct approach used by Telegram, WhatsApp, iMessage Web.
// The outer div fills the full viewport. Only the messages div scrolls internally.
// No overflow:hidden on html/body — only on the fixed chat container.
function ChatScreen({
  char, diff, onReset,
}: {
  char: typeof CHARS[number];
  diff: Diff;
  onReset: () => void;
}) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: '0', role: 'assistant', content: char.opening, timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [stats, setStats] = useState<SessionStats>({ interest: 35, momentum: 50, avgScore: 0, msgCount: 0, scores: [], interestHistory: [35] });
  const [lastAnalysis, setLastAnalysis] = useState<Analysis | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [msgs, loading, scrollToBottom]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Msg = { id: Date.now().toString(), role: 'user', content: text, timestamp: Date.now() };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          characterType: char.id,
          difficulty: diff,
          sessionId,
          history: msgs.slice(-18).map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.success) throw new Error(data.error || 'API error');

      const analysis: Analysis | null = data.analysis ?? null;

      const aiMsg: Msg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        analysis: diff !== 'hard' ? analysis : null,
        timestamp: Date.now(),
      };

      setMsgs(prev => [...prev, aiMsg]);
      if (!sessionId && data.sessionId) setSessionId(data.sessionId);

      if (analysis) {
        setLastAnalysis(analysis);
        setStats(prev => {
          const newCount = prev.msgCount + 1;
          const newAvg = (prev.avgScore * prev.msgCount + analysis.score) / newCount;
          const newInterest = Math.max(0, Math.min(100, prev.interest + analysis.interestChange));
          const newMomentum = Math.max(0, Math.min(100, prev.momentum + analysis.momentumChange));
          return {
            interest: newInterest,
            momentum: newMomentum,
            avgScore: newAvg,
            msgCount: newCount,
            scores: [...prev.scores, analysis.score],
            interestHistory: [...prev.interestHistory, newInterest],
          };
        });
      }
    } catch (err) {
      console.error('[Chat] Send error:', err);
      setMsgs(prev => [...prev, {
        id: 'err-' + Date.now(),
        role: 'assistant',
        content: 'Something went wrong. Try again.',
        timestamp: Date.now(),
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const interestColor = stats.interest >= 60 ? '#34D399' : stats.interest >= 35 ? '#FBBF24' : '#F87171';
  const diffConfig = DIFFS.find(d => d.id === diff)!;

  return (
    <>
      <style>{CSS}</style>
      {/* 
        CHAT LAYOUT — position:fixed inset:0
        This fills the full viewport on all devices.
        Only the messages div (flex:1 overflow-y:auto) scrolls.
        Header and input are fixed-height flex children.
        This is the WhatsApp/Telegram pattern. Works on all phones.
      */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', flexDirection: 'column',
        background: '#090912',
        zIndex: 1,
      }}>
        {/* ── HEADER ─────────────────────────────────────────── */}
        <div style={{
          flexShrink: 0, height: 60,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(9,9,18,0.92)',
          backdropFilter: 'blur(16px)',
          display: 'flex', alignItems: 'center',
          padding: '0 14px',
          gap: 10,
          zIndex: 10,
        }}>
          {/* Back */}
          <button onClick={onReset}
            style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(237,232,225,0.5)', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>

          {/* Avatar */}
          <div style={{ width: 36, height: 36, borderRadius: 11, background: char.colorDim, border: `1px solid ${char.colorBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
            {char.emoji}
          </div>

          {/* Name */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="briq" style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{char.name}</div>
            <div style={{ fontSize: 10, color: char.color, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{char.tag}</div>
          </div>

          {/* Interest pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: interestColor, flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: interestColor, fontVariantNumeric: 'tabular-nums' }}>{Math.round(stats.interest)}</span>
          </div>

          {/* Analysis button */}
          <button onClick={() => setShowSheet(true)}
            style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(237,232,225,0.55)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0, transition: 'all 0.18s' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x="1" y="7" width="2.5" height="5" rx="1" fill="currentColor"/><rect x="5" y="4" width="2.5" height="8" rx="1" fill="currentColor"/><rect x="9" y="1" width="2.5" height="11" rx="1" fill="currentColor"/></svg>
            Stats
          </button>
        </div>

        {/* ── MESSAGES — this div scrolls ────────────────────── */}
        <div
          ref={messagesRef}
          className="ios-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          {/* Character name label at top */}
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(237,232,225,0.25)', background: 'rgba(255,255,255,0.04)', padding: '4px 12px', borderRadius: 999, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {char.name} · {char.tag}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {msgs.map((m, i) => {
              const isUser = m.role === 'user';
              const prevSameRole = msgs[i - 1]?.role === m.role;
              const nextSameRole = msgs[i + 1]?.role === m.role;
              const isLastOfGroup = !nextSameRole;

              return (
                <motion.div key={m.id}
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.26, ease: [0.23,1,0.32,1] }}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', marginBottom: isLastOfGroup ? 10 : 1 }}>

                  {/* Message bubble */}
                  <div style={{
                    maxWidth: 'min(78%, 380px)',
                    wordBreak: 'break-word',
                    padding: '10px 14px',
                    fontSize: 14,
                    lineHeight: 1.55,
                    borderRadius: isUser
                      ? `18px 18px ${isLastOfGroup ? '5px' : '18px'} 18px`
                      : `18px 18px 18px ${isLastOfGroup ? '5px' : '18px'}`,
                    background: isUser ? `${char.color}22` : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isUser ? char.colorBorder : 'rgba(255,255,255,0.07)'}`,
                    color: isUser ? '#EDE8E1' : 'rgba(237,232,225,0.85)',
                  }}>
                    {m.content}
                  </div>

                  {/* Score badge on user messages with analysis */}
                  {isUser && m.analysis && diff !== 'hard' && (
                    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                      style={{ marginTop: 4 }}>
                      <ScoreRing score={m.analysis.score} size={38} color={m.analysis.score >= 70 ? '#34D399' : m.analysis.score >= 50 ? '#FBBF24' : '#F87171'} />
                    </motion.div>
                  )}

                  {/* Inline coach tip under AI message (easy mode) */}
                  {!isUser && m.analysis && diff === 'easy' && m.analysis.tip && isLastOfGroup && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ delay: 0.3 }}
                      style={{ marginTop: 6, maxWidth: 'min(78%, 380px)', padding: '9px 12px', borderRadius: 10, background: char.colorDim, border: `1px solid ${char.colorBorder}` }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: char.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>→ Next Move</div>
                      <div style={{ fontSize: 12, color: 'rgba(237,232,225,0.8)', lineHeight: 1.5 }}>{m.analysis.tip}</div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Typing indicator */}
          {loading && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10 }}>
              <div style={{ padding: '12px 16px', borderRadius: '18px 18px 18px 5px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: 5, alignItems: 'center' }}>
                <div className="dot" /><div className="dot" /><div className="dot" />
              </div>
            </motion.div>
          )}

          {/* Scroll anchor */}
          <div ref={bottomRef} style={{ height: 4 }} />
        </div>

        {/* ── INPUT BAR ──────────────────────────────────────── */}
        <div style={{
          flexShrink: 0,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(9,9,18,0.95)',
          backdropFilter: 'blur(16px)',
          padding: '10px 14px',
          paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
        }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={
                diff === 'hard' ? "No hints. Survive." :
                stats.msgCount === 0 ? `Open strong with ${char.name}…` :
                "Your move…"
              }
              style={{
                flex: 1, minWidth: 0,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14,
                padding: '12px 16px',
                fontSize: 14,
                color: '#EDE8E1',
                outline: 'none',
                transition: 'border-color 0.2s',
                caretColor: char.color,
              }}
              onFocus={e => { e.target.style.borderColor = `${char.color}60`; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; }}
            />
            <button
              className="send-btn"
              onClick={send}
              disabled={!input.trim() || loading}
              style={{
                width: 44, height: 44, borderRadius: 13, flexShrink: 0,
                background: input.trim() && !loading ? char.color : 'rgba(255,255,255,0.05)',
                border: `1px solid ${input.trim() && !loading ? 'transparent' : 'rgba(255,255,255,0.08)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.18s',
                boxShadow: input.trim() && !loading ? `0 4px 24px ${char.color}40` : 'none',
                cursor: input.trim() && !loading ? 'pointer' : 'default',
              }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M8.5 3.5l5.5 4.5-5.5 4.5" stroke={input.trim() && !loading ? '#09090D' : 'rgba(237,232,225,0.2)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Bottom status row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 7 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: diffConfig.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'rgba(237,232,225,0.25)', fontWeight: 500 }}>
                {diffConfig.label}{diff !== 'hard' ? ' · Coach on' : ''}
              </span>
            </div>
            {stats.msgCount > 0 && (
              <span style={{ fontSize: 11, color: 'rgba(237,232,225,0.25)', fontWeight: 500 }}>
                Avg {Math.round(stats.avgScore)}/100
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Analysis sheet (portal-style overlay) */}
      <AnalysisSheet
        open={showSheet}
        onClose={() => setShowSheet(false)}
        stats={stats}
        lastAnalysis={lastAnalysis}
        char={char}
      />
    </>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const [step, setStep] = useState<'char' | 'diff' | 'chat'>('char');
  const [char, setChar] = useState<typeof CHARS[number] | null>(null);
  const [diff, setDiff] = useState<Diff>('easy');

  return (
    <AnimatePresence mode="wait">
      {step === 'char' && (
        <motion.div key="char" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <CharSelect onPick={c => { setChar(c); setStep('diff'); }} />
        </motion.div>
      )}

      {step === 'diff' && char && (
        <motion.div key="diff" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <DiffSelect char={char} onBack={() => setStep('char')} onStart={d => { setDiff(d); setStep('chat'); }} />
        </motion.div>
      )}

      {step === 'chat' && char && (
        <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          <ChatScreen char={char} diff={diff} onReset={() => { setStep('char'); setChar(null); }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}