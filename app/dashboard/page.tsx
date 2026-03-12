'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SkillInfo {
  level: string; nextLevel: string | null;
  pointsToNext: number | null; progressPct: number;
}

interface SkillProfile {
  avgPracticeScore: number | null; improvement: number | null;
  strengths: Array<{ flag: string; label: string; count: number }>;
  weaknesses: Array<{ flag: string; label: string; count: number }>;
  topCharacter: string | null; totalScoredMessages: number;
  difficultyBreakdown: { easy: number; normal: number; hard: number };
  scoreTrendPractice: 'up' | 'down' | 'flat'; hasEnoughData: boolean;
}

interface DashData {
  isPremium: boolean;
  stats: {
    totalAnalyses: number;
    practiceCount: number | null; // null = premium locked
    averageScore: number;
    totalPoints: number;
    skillInfo: SkillInfo;
    subscriptionStatus: 'free' | 'paid' | 'lifetime';
    freeTriesUsed: number;
    streak: number;
    scoreTrend: 'up' | 'down' | 'flat';
    bestScore: number | null;
    avgInterest: number;
    momentumBreakdown: { escalating: number; neutral: number; dying: number };
  };
  skillProfile: SkillProfile | null; // null = premium locked
  recentAnalyses: Array<{
    _id: string; conversationScore: number; interestLevel: number;
    attractionProbability: number | null; conversationMomentum: string;
    missedOpportunities: number; createdAt: string;
  }>;
  practiceSessions: Array<{
    _id: string; characterType: string; difficulty: string;
    messageCount: number; currentInterest: number; createdAt: string;
  }>;
  scoreHistory: Array<{ index: number; score: number; date: string }>;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const EO = { duration: 0.7, ease: [0.16, 1, 0.3, 1] } as const;
const SP = { type: 'spring', stiffness: 180, damping: 24 } as const;

const C = {
  bg: '#060608', surface: 'rgba(255,255,255,0.025)', surfaceHi: 'rgba(255,255,255,0.04)',
  border: 'rgba(255,255,255,0.07)', borderHi: 'rgba(255,255,255,0.12)',
  text: '#F2F0EB', muted: 'rgba(242,240,235,0.32)', muted2: 'rgba(242,240,235,0.5)',
  violet: '#5B4FE9', violetLo: 'rgba(91,79,233,0.1)', violetHi: 'rgba(91,79,233,0.22)',
  violetBr: '#a5b4fc', green: '#6ee7b7', greenLo: 'rgba(110,231,183,0.08)',
  gold: '#fcd34d', goldLo: 'rgba(252,211,77,0.08)', red: '#fca5a5',
  redLo: 'rgba(255,96,64,0.08)', pink: '#f9a8d4',
};

const SKILL_CFG: Record<string, { color: string; rank: number }> = {
  'Dry Texter': { color: C.muted2, rank: 1 },
  'Average Talker': { color: C.violetBr, rank: 2 },
  'Smooth Conversationalist': { color: C.gold, rank: 3 },
  'Elite Charmer': { color: C.green, rank: 4 },
};

const CHAR_LABELS: Record<string, string> = {
  cold_opener: 'Noa · The Selective One',
  warm_engaged: 'Mia · The Warm Standard',
  playful_chaos: 'Liv · The Chaos Agent',
  banter_queen: 'Zara · The Banter Queen',
  intellectual: 'Rei · The Intellectual',
  soft_ghost: 'Cass · The Soft Ghost',
};

const DIFF_C: Record<string, string> = {
  easy: C.green, normal: C.gold, hard: C.red
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function I({ children, c = C.violetBr }: { children: React.ReactNode; c?: string }) {
  return <span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', color: c, fontWeight: 400 }}>{children}</span>;
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ...EO, delay }}>
      {children}
    </motion.div>
  );
}

function Bar({ pct, color, delay = 0, h = 3 }: { pct: number; color: string; delay?: number; h?: number }) {
  return (
    <div style={{ height: h, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
      <motion.div style={{ height: '100%', background: color, borderRadius: 99 }}
        initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}

function Ring({ val, max, color, label, size = 72 }: { val: number; max: number; color: string; label: string; size?: number }) {
  const r = size / 2 - 7, circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={4} />
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
            strokeLinecap="round" initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${(val / max) * circ} ${circ}` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size > 64 ? 14 : 11, fontWeight: 700, color }}>
            {max === 10 ? val.toFixed(1) : val}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.09em' }}>{label}</span>
    </div>
  );
}

function Sparkline({ data, color = C.violetBr, height = 48 }: { data: number[]; color?: string; height?: number }) {
  if (data.length < 2) return <div style={{ fontSize: 12, color: C.muted, paddingTop: 16 }}>Analyze more chats to see trend</div>;
  const W = 200, H = height;
  const mn = Math.min(...data) - 0.5, mx = Math.max(...data) + 0.5, rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - mn) / rng) * H}`);
  const path = `M ${pts.join(' L ')}`;
  const area = `M 0,${H} L ${pts.join(' L ')} L ${W},${H} Z`;
  const lastX = W, lastY = H - ((data[data.length - 1] - mn) / rng) * H;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#sg)" />
      <motion.path d={path} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }} />
      <motion.circle cx={lastX} cy={lastY} r={3} fill={color}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.7, type: 'spring', stiffness: 300 }} />
    </svg>
  );
}

function MTag({ val }: { val: string }) {
  const m: Record<string, { label: string; color: string; bg: string }> = {
    escalating: { label: 'Rising', color: C.green, bg: C.greenLo },
    neutral: { label: 'Neutral', color: C.gold, bg: C.goldLo },
    dying: { label: 'Fading', color: C.red, bg: C.redLo },
  };
  const s = m[val] ?? m.neutral;
  return (
    <span style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
      {s.label}
    </span>
  );
}

// ─── Premium Locked Card ──────────────────────────────────────────────────────
function PremiumLock({ title, description }: { title: string; description: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '28px 24px', marginBottom: 12, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Blurred content behind */}
      <div style={{ filter: 'blur(8px)', opacity: 0.3, pointerEvents: 'none', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
          {[60, 75, 45, 80, 55].map((h, i) => (
            <div key={i} style={{ width: 24, height: h, background: C.violetBr, borderRadius: 4, opacity: 0.6 }} />
          ))}
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 99, marginBottom: 8, maxWidth: 200, margin: '0 auto' }} />
        <div style={{ height: 6, background: C.border, borderRadius: 99, maxWidth: 140, margin: '0 auto' }} />
      </div>
      {/* Lock overlay */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <div style={{ fontSize: 28 }}>🔒</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</div>
        <div style={{ fontSize: 12, color: C.muted, maxWidth: 280, textAlign: 'center', lineHeight: 1.6 }}>{description}</div>
        <Link href="/upgrade">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            style={{ background: C.gold, color: '#1A0E00', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 12, fontWeight: 700, cursor: 'pointer', marginTop: 4 }}>
            Upgrade — ₹100
          </motion.button>
        </Link>
      </div>
    </div>
  );
}

// ─── Skill Profile Card ───────────────────────────────────────────────────────
function SkillProfileCard({ profile }: { profile: SkillProfile }) {
  const { strengths, weaknesses, avgPracticeScore, improvement, hasEnoughData,
    difficultyBreakdown, topCharacter, totalScoredMessages } = profile;
  const impColor = improvement == null ? C.muted : improvement > 0 ? C.green : improvement < 0 ? C.red : C.muted;
  const maxS = Math.max(...strengths.map(s => s.count), 1);
  const maxW = Math.max(...weaknesses.map(w => w.count), 1);

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, overflow: 'hidden', marginBottom: 12 }}>
      <div style={{ padding: '22px 26px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 6 }}>Skill Profile · Practice</div>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: C.text, margin: 0, letterSpacing: '-0.01em' }}>
            {hasEnoughData ? <>What you're <I c={C.violetBr}>actually like</I></> : <>Not enough data yet</>}
          </h2>
        </div>
        {avgPracticeScore != null && (
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Avg practice score</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: avgPracticeScore >= 70 ? C.green : avgPracticeScore >= 45 ? C.gold : C.red, lineHeight: 1 }}>
              {avgPracticeScore}
            </div>
            <div style={{ fontSize: 10, color: C.muted }}>/ 100</div>
          </div>
        )}
      </div>

      {!hasEnoughData ? (
        <div style={{ padding: '32px 26px' }}>
          <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, maxWidth: 440, marginBottom: 16 }}>
            Complete at least 5 practice messages with coaching enabled to unlock your skill profile.
          </p>
          <Link href="/practice">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              style={{ background: C.violetLo, border: `1px solid ${C.violetHi}`, color: C.violetBr, borderRadius: 12, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Start practicing
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M6.5 2l4.5 4.5-4.5 4.5" stroke={C.violetBr} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </motion.button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* Strengths */}
          <div style={{ flex: '1 1 180px', padding: '20px 24px', borderRight: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.green, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 14 }}>Strengths</div>
            {strengths.length === 0 ? (
              <p style={{ fontSize: 12, color: C.muted }}>None detected yet</p>
            ) : strengths.map((s, i) => (
              <motion.div key={s.flag} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07, ...SP }}
                style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 500, color: C.text }}>{s.label}</span>
                  <span style={{ color: C.green, fontWeight: 600 }}>{s.count}×</span>
                </div>
                <Bar pct={Math.round((s.count / maxS) * 100)} color={C.green} delay={0.1 + i * 0.07} h={2} />
              </motion.div>
            ))}
          </div>

          {/* Weaknesses */}
          <div style={{ flex: '1 1 180px', padding: '20px 24px', borderRight: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 10, color: C.red, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 14 }}>Needs work</div>
            {weaknesses.length === 0 ? (
              <p style={{ fontSize: 12, color: C.muted }}>No consistent issues</p>
            ) : weaknesses.map((w, i) => (
              <motion.div key={w.flag} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.07, ...SP }}
                style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                  <span style={{ fontWeight: 500, color: C.text }}>{w.label}</span>
                  <span style={{ color: C.red, fontWeight: 600 }}>{w.count}×</span>
                </div>
                <Bar pct={Math.round((w.count / maxW) * 100)} color={C.red} delay={0.1 + i * 0.07} h={2} />
              </motion.div>
            ))}
          </div>

          {/* Meta stats */}
          <div style={{ flex: '1 1 120px', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {improvement !== null && (
              <div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 5 }}>Improvement</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontSize: 22, fontWeight: 700, color: impColor, lineHeight: 1 }}>
                    {improvement > 0 ? '+' : ''}{improvement}
                  </span>
                  <span style={{ fontSize: 11, color: C.muted }}>pts avg</span>
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 7 }}>Difficulty range</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {Object.entries(difficultyBreakdown).filter(([, v]) => v > 0).map(([d, count]) => (
                  <span key={d} style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 5, background: `${DIFF_C[d]}18`, color: DIFF_C[d], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    {d} · {count}
                  </span>
                ))}
              </div>
            </div>
            {topCharacter && (
              <div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 5 }}>Most practiced</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{CHAR_LABELS[topCharacter] ?? topCharacter}</div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 4 }}>Msgs scored</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: C.violetBr, lineHeight: 1 }}>{totalScoredMessages}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Tile({ label, value, sub, color = C.violetBr, delay = 0 }:
  { label: string; value: string | number; sub?: string; color?: string; delay?: number }) {
  return (
    <Reveal delay={delay}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '20px 22px', height: '100%' }}>
        <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1, marginTop: 6 }}>{value}</div>
        {sub && <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{sub}</div>}
      </div>
    </Reveal>
  );
}

// ─── Unauthenticated View ─────────────────────────────────────────────────────
function Unauth() {
  return (
    <div style={{ minHeight: '100svh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
      <Reveal>
        <div style={{ maxWidth: 400, textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: C.violetLo, border: `1px solid ${C.violetHi}`, borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
            <motion.div style={{ width: 6, height: 6, borderRadius: '50%', background: C.violet }}
              animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
            <span style={{ fontSize: 11, fontWeight: 500, color: C.violetBr, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Your Progress Hub</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px,6vw,54px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.025em', marginBottom: 16, color: C.text }}>
            Track your<br /><I>improvement.</I>
          </h1>
          <p style={{ fontSize: 15, lineHeight: 1.7, color: C.muted, marginBottom: 36 }}>
            Sign in to see your score history, skill level, and how your conversation ability changes over time.
          </p>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => signIn('google')}
            style={{ background: C.text, color: C.bg, border: 'none', borderRadius: 14, padding: '14px 28px', fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            Continue with Google
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7h10M7.5 2.5l4.5 4.5-4.5 4.5" stroke="#060608" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </motion.button>
        </div>
      </Reveal>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'analyses' | 'practice'>('analyses');

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { setLoading(false); return; }

    fetch('/api/dashboard')
      .then(r => {
        if (r.status === 401) throw new Error('LOGIN_REQUIRED');
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        if (json.success) setData(json);
        else throw new Error(json.error ?? 'Unknown error');
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === 'unauthenticated') return <Unauth />;

  if (status === 'loading' || loading) return (
    <div style={{ minHeight: '100svh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div style={{ width: 28, height: 28, borderRadius: '50%', border: `2px solid ${C.violetBr}`, borderTopColor: 'transparent' }}
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100svh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 13, color: C.red, marginBottom: 12 }}>Failed to load: {error}</div>
        <button onClick={() => window.location.reload()}
          style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 13 }}>
          Retry
        </button>
      </div>
    </div>
  );

  const s = data?.stats;
  const skill = s?.skillInfo;
  const scfg = SKILL_CFG[skill?.level ?? 'Dry Texter'] ?? SKILL_CFG['Average Talker'];
  const scores = data?.scoreHistory?.map(h => h.score) ?? [];
  const trendColor = s?.scoreTrend === 'up' ? C.green : s?.scoreTrend === 'down' ? C.red : C.muted2;
  const trendLabel = s?.scoreTrend === 'up' ? 'Improving' : s?.scoreTrend === 'down' ? 'Dropping' : 'Steady';
  const firstName = session?.user?.name?.split(' ')[0] ?? 'You';
  const isPremium = data?.isPremium ?? false;
  const freeLeft = Math.max(0, 3 - (s?.freeTriesUsed ?? 0));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: rgba(91,79,233,0.3); }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: rgba(91,79,233,0.35); border-radius: 2px; }
        .d4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
        @media (max-width: 768px) {
          .d4 { grid-template-columns: 1fr 1fr; }
          .sp-wrap { display: none; }
          .rings-row { flex-wrap: wrap; gap: 12px; }
          .anrow { flex-wrap: wrap; gap: 8px !important; }
          .skh { flex-direction: column !important; }
        }
        @media (max-width: 480px) { .d4 { grid-template-columns: 1fr 1fr; } }
      `}</style>

      <div style={{ background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif", minHeight: '100svh', overflowX: 'hidden', paddingBottom: 80 }}>

        {/* BG decoration */}
        <div style={{ position: 'fixed', top: 0, left: '50%', transform: 'translateX(-50%)', width: 700, height: 360, background: 'radial-gradient(circle, rgba(91,79,233,0.06) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.015) 1px,transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 clamp(16px,4vw,24px)', position: 'relative', zIndex: 1 }}>

          {/* ── Header ─────────────────────────────────────────── */}
          <Reveal>
            <div style={{ paddingTop: 56, paddingBottom: 36, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 10 }}>Dashboard</div>
                <h1 style={{ fontSize: 'clamp(32px,5vw,52px)', fontWeight: 500, lineHeight: 1, letterSpacing: '-0.025em', margin: 0 }}>
                  {firstName}'s<br /><I>progress.</I>
                </h1>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link href="/upload">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ background: C.text, color: C.bg, border: 'none', borderRadius: 12, padding: '11px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                    Analyze a chat
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2 6.5h9M6.5 2l4.5 4.5-4.5 4.5" stroke="#060608" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </motion.button>
                </Link>
                <Link href="/practice">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 20px', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                    Practice
                  </motion.button>
                </Link>
              </div>
            </div>
          </Reveal>

          {/* ── Free trial remaining notice ─────────────────────── */}
          {!isPremium && s && (
            <Reveal delay={0.04}>
              <div style={{ background: 'rgba(252,211,77,0.05)', border: `1px solid rgba(252,211,77,0.18)`, borderRadius: 12, padding: '12px 18px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                <div style={{ fontSize: 13, color: C.gold }}>
                  <strong>{freeLeft} free {freeLeft === 1 ? 'analysis' : 'analyses'} remaining.</strong>
                  <span style={{ color: C.muted, marginLeft: 8 }}>Practice sessions require premium.</span>
                </div>
                <Link href="/upgrade">
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.gold, padding: '4px 12px', borderRadius: 7, border: `1px solid rgba(252,211,77,0.3)`, cursor: 'pointer' }}>
                    Upgrade ₹100 →
                  </span>
                </Link>
              </div>
            </Reveal>
          )}

          {/* ── Skill Hero ──────────────────────────────────────── */}
          {skill && (
            <Reveal delay={0.08}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, padding: '26px 28px 22px', marginBottom: 12, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: -8, top: -20, fontSize: 140, fontWeight: 800, color: scfg.color, opacity: 0.03, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', fontFamily: "'Instrument Serif',serif", fontStyle: 'italic' }}>
                  {scfg.rank}
                </div>
                <div className="skh" style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                  <div style={{ flex: '1 1 180px' }}>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 8 }}>Current Level</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: scfg.color }}>{skill.level}</span>
                      {isPremium && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '3px 9px', borderRadius: 6, background: C.goldLo, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Premium</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>{s?.totalPoints.toLocaleString()} total points</div>
                    {skill.nextLevel && (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 7 }}>
                          <span>→ {skill.nextLevel}</span>
                          <span>{skill.pointsToNext} pts</span>
                        </div>
                        <Bar pct={skill.progressPct ?? 0} color={scfg.color} delay={0.4} h={4} />
                      </>
                    )}
                  </div>

                  <div className="sp-wrap" style={{ flex: '1 1 160px', minWidth: 0 }}>
                    <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      Score trend
                      <span style={{ fontSize: 10, fontWeight: 600, color: trendColor, padding: '2px 7px', borderRadius: 4, background: `${trendColor}18`, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                        {trendLabel}
                      </span>
                    </div>
                    <Sparkline data={scores} color={scfg.color} height={50} />
                  </div>

                  <div className="rings-row" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <Ring val={s?.averageScore ?? 0} max={10} color={C.violetBr} label="Avg Score" size={72} />
                    <Ring val={s?.avgInterest ?? 0} max={100} color={C.pink} label="Avg Interest" size={72} />
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* ── Stat tiles ──────────────────────────────────────── */}
          <div className="d4" style={{ marginBottom: 12 }}>
            <Tile label="Chats analyzed" value={s?.totalAnalyses ?? 0} color={C.violetBr} delay={0.12} />
            <Tile label="Practice sessions" value={isPremium ? (s?.practiceCount ?? 0) : '🔒'} color={isPremium ? C.gold : C.muted} delay={0.16} sub={!isPremium ? 'Premium only' : undefined} />
            <Tile label="Day streak" value={`${s?.streak ?? 0}d`} sub="consecutive days" color={C.green} delay={0.20} />
            <Tile label="Best score" value={s?.bestScore != null ? `${s.bestScore}/10` : '—'} color={C.pink} delay={0.24} />
          </div>

          {/* ── Skill Profile (premium gated) ───────────────────── */}
          <Reveal delay={0.28}>
            {isPremium && data?.skillProfile ? (
              <SkillProfileCard profile={data.skillProfile} />
            ) : (
              <PremiumLock
                title="Skill Profile — Premium"
                description="Your practice strengths, weaknesses, improvement graph, and personalized insights. Unlocks after your first practice session as a premium user."
              />
            )}
          </Reveal>

          {/* ── Momentum breakdown ──────────────────────────────── */}
          {s && s.totalAnalyses > 0 && (
            <Reveal delay={0.32}>
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '20px 24px', marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 16 }}>Chat momentum breakdown</div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Rising', val: s.momentumBreakdown.escalating, color: C.green },
                    { label: 'Neutral', val: s.momentumBreakdown.neutral, color: C.gold },
                    { label: 'Fading', val: s.momentumBreakdown.dying, color: C.red },
                  ].map((m, i) => {
                    const pct = s.totalAnalyses > 0 ? Math.round((m.val / s.totalAnalyses) * 100) : 0;
                    return (
                      <div key={i} style={{ flex: '1 1 80px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                          <span style={{ color: m.color, fontWeight: 600 }}>{m.label}</span>
                          <span style={{ color: C.muted }}>{m.val} ({pct}%)</span>
                        </div>
                        <Bar pct={pct} color={m.color} delay={0.3 + i * 0.1} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </Reveal>
          )}

          {/* ── History tabs ─────────────────────────────────────── */}
          <Reveal delay={0.36}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, overflow: 'hidden', marginBottom: 12 }}>
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
                {(['analyses', 'practice'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ flex: 1, padding: '14px 20px', fontSize: 12, fontWeight: 600, cursor: 'pointer', border: 'none', background: tab === t ? C.surfaceHi : 'transparent', color: tab === t ? C.text : C.muted, textTransform: 'uppercase', letterSpacing: '0.09em', transition: 'all 0.2s', borderBottom: tab === t ? `2px solid ${C.violetBr}` : '2px solid transparent' }}>
                    {t === 'analyses' ? 'Chat Analyses' : `Practice${!isPremium ? ' 🔒' : ''}`}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                  {/* ANALYSES tab */}
                  {tab === 'analyses' && (
                    <div>
                      {!data?.recentAnalyses.length ? (
                        <div style={{ textAlign: 'center', padding: '56px 24px' }}>
                          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>No analyses yet</div>
                          <Link href="/upload">
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              style={{ background: C.text, color: C.bg, border: 'none', borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                              Analyze your first chat
                            </motion.button>
                          </Link>
                        </div>
                      ) : data.recentAnalyses.map((a, i) => {
                        const sc = a.conversationScore;
                        const scC = sc >= 7 ? C.green : sc >= 5 ? C.gold : C.red;
                        const dt = new Date(a.createdAt);
                        return (
                          <motion.div key={a._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, ...SP }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 24px', borderBottom: i < data.recentAnalyses.length - 1 ? `1px solid ${C.border}` : 'none', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 60 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted2 }}>
                                {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                              <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>
                                {dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                              </div>
                            </div>
                            <div style={{ flex: '1 1 70px', maxWidth: 110 }}>
                              <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                                <motion.div style={{ height: '100%', background: scC, borderRadius: 99 }}
                                  initial={{ width: 0 }} animate={{ width: `${(sc / 10) * 100}%` }}
                                  transition={{ duration: 1, delay: 0.1 + i * 0.05 }} />
                              </div>
                            </div>
                            <div className="anrow" style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: scC, lineHeight: 1 }}>{sc.toFixed(1)}</div>
                                <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>Score</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: C.pink, lineHeight: 1 }}>{a.interestLevel}%</div>
                                <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>Interest</div>
                              </div>
                              {a.attractionProbability != null && (
                                <div style={{ textAlign: 'center' }}>
                                  <div style={{ fontSize: 16, fontWeight: 700, color: C.gold, lineHeight: 1 }}>{a.attractionProbability}%</div>
                                  <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>Attract</div>
                                </div>
                              )}
                              <MTag val={a.conversationMomentum} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* PRACTICE tab */}
                  {tab === 'practice' && (
                    <div>
                      {!isPremium ? (
                        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
                          <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8 }}>Practice tracking is premium</div>
                          <div style={{ fontSize: 13, color: C.muted, marginBottom: 20, lineHeight: 1.6, maxWidth: 300, margin: '0 auto 20px' }}>
                            Upgrade to track your practice sessions, see your improvement over time, and unlock your full skill profile.
                          </div>
                          <Link href="/upgrade">
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              style={{ background: C.gold, color: '#1A0E00', border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                              Upgrade — ₹100
                            </motion.button>
                          </Link>
                        </div>
                      ) : !data?.practiceSessions.length ? (
                        <div style={{ textAlign: 'center', padding: '56px 24px' }}>
                          <div style={{ fontSize: 13, color: C.muted, marginBottom: 14 }}>No practice sessions yet</div>
                          <Link href="/practice">
                            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                              style={{ background: C.text, color: C.bg, border: 'none', borderRadius: 12, padding: '10px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                              Start your first session
                            </motion.button>
                          </Link>
                        </div>
                      ) : data.practiceSessions.map((p, i) => {
                        const dc = DIFF_C[p.difficulty] ?? C.muted;
                        const cl = CHAR_LABELS[p.characterType] ?? p.characterType;
                        const ic = p.currentInterest >= 60 ? C.green : p.currentInterest >= 35 ? C.gold : C.red;
                        return (
                          <motion.div key={p._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, ...SP }}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px 24px', borderBottom: i < data.practiceSessions.length - 1 ? `1px solid ${C.border}` : 'none', gap: 12, flexWrap: 'wrap' }}>
                            <div style={{ minWidth: 60 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.muted2 }}>
                                {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                            <div style={{ flex: '1 1 110px', minWidth: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 600, color: C.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cl}</div>
                              <span style={{ fontSize: 9, fontWeight: 600, padding: '2px 7px', borderRadius: 4, background: `${dc}18`, color: dc, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{p.difficulty}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: C.violetBr, lineHeight: 1 }}>{p.messageCount}</div>
                                <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>Msgs</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: ic, lineHeight: 1 }}>{p.currentInterest}</div>
                                <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 3 }}>Interest</div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </Reveal>

          {/* ── Upgrade CTA ──────────────────────────────────────── */}
          {!isPremium && (
            <Reveal delay={0.42}>
              <div style={{ background: C.surface, border: `1px solid rgba(252,211,77,0.18)`, borderRadius: 18, padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div>
                  <div style={{ fontSize: 10, color: C.gold, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, marginBottom: 6 }}>Unlock Premium</div>
                  <h3 style={{ fontSize: 17, fontWeight: 600, color: C.text, margin: '0 0 4px' }}>See the full picture.</h3>
                  <p style={{ fontSize: 13, color: C.muted, margin: 0, maxWidth: 360 }}>
                    Unlimited analyses, practice tracking, skill profile, attraction signals — one payment.
                  </p>
                </div>
                <Link href="/upgrade">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ background: C.gold, color: '#1A0E00', border: 'none', borderRadius: 12, padding: '12px 22px', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    Upgrade — ₹100
                  </motion.button>
                </Link>
              </div>
            </Reveal>
          )}

        </div>
      </div>
    </>
  );
}