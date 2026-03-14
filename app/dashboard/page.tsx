'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Types (unchanged from API) ───────────────────────────────────────────────
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
    totalAnalyses: number; practiceCount: number | null;
    averageScore: number; totalPoints: number; skillInfo: SkillInfo;
    subscriptionStatus: 'free' | 'paid' | 'lifetime';
    freeTriesUsed: number; streak: number;
    scoreTrend: 'up' | 'down' | 'flat'; bestScore: number | null;
    avgInterest: number;
    momentumBreakdown: { escalating: number; neutral: number; dying: number };
  };
  skillProfile: SkillProfile | null;
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

// ─── Design System ────────────────────────────────────────────────────────────
const C = {
  bg: '#08080F',
  paper: '#0D0D18',
  surface: 'rgba(255,255,255,0.03)',
  surfaceHi: 'rgba(255,255,255,0.055)',
  border: 'rgba(255,255,255,0.07)',
  borderHi: 'rgba(255,255,255,0.14)',
  text: '#F0EDE8',
  muted: 'rgba(240,237,232,0.3)',
  muted2: 'rgba(240,237,232,0.55)',
  // Signature accents
  coral: '#FF5B3A',
  coralLo: 'rgba(255,91,58,0.1)',
  coralHi: 'rgba(255,91,58,0.22)',
  violet: '#7B6CF6',
  violetLo: 'rgba(123,108,246,0.1)',
  violetHi: 'rgba(123,108,246,0.22)',
  violetBr: '#B8AFFF',
  green: '#4DEBA1',
  greenLo: 'rgba(77,235,161,0.08)',
  gold: '#F5C842',
  goldLo: 'rgba(245,200,66,0.08)',
  goldHi: 'rgba(245,200,66,0.2)',
  red: '#FF6B6B',
  redLo: 'rgba(255,107,107,0.08)',
  cyan: '#42D4F5',
};

const EO = { duration: 0.6, ease: [0.16, 1, 0.3, 1] } as const;
const SP = { type: 'spring', stiffness: 200, damping: 24 } as const;

const CHAR_LABELS: Record<string, string> = {
  cold_opener: 'Noa · The Selective One',
  warm_engaged: 'Mia · The Warm Standard',
  playful_chaos: 'Liv · The Chaos Agent',
  banter_queen: 'Zara · The Banter Queen',
  intellectual: 'Rei · The Intellectual',
  soft_ghost: 'Cass · The Soft Ghost',
  hiring_manager: 'Jordan · Hiring Manager',
  networking_contact: 'Sam · Networker',
  difficult_client: 'Alex · Difficult Client',
  reconnecting_friend: 'Maya · Old Friend',
};

const LEVEL_META: Record<string, { color: string; glyph: string; desc: string }> = {
  'Dry Texter':              { color: C.muted2,   glyph: '💤', desc: 'Just getting started' },
  'Average Talker':          { color: C.violetBr, glyph: '💬', desc: 'Making progress' },
  'Smooth Conversationalist':{ color: C.gold,     glyph: '✨', desc: 'Above average' },
  'Elite Charmer':           { color: C.green,    glyph: '👑', desc: 'Top tier' },
};

// ─── Primitives ───────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 18 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ ...EO, delay }}>
      {children}
    </motion.div>
  );
}

function Bar({ pct, color, delay = 0, h = 3 }: { pct: number; color: string; delay?: number; h?: number }) {
  return (
    <div style={{ height: h, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
      <motion.div style={{ height: '100%', background: color, borderRadius: 99 }}
        initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ duration: 1.3, delay, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}

function Ring({ val, max, color, label, size = 72, sub }: {
  val: number; max: number; color: string; label: string; size?: number; sub?: string;
}) {
  const r = size / 2 - 6, circ = 2 * Math.PI * r;
  const displayVal = max === 10 ? val.toFixed(1) : Math.round(val);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
            strokeLinecap="round" initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${(val / max) * circ} ${circ}` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size > 70 ? 15 : 12, fontWeight: 800, color, fontFamily: "'Bricolage Grotesque',sans-serif", lineHeight: 1 }}>{displayVal}</span>
          {sub && <span style={{ fontSize: 8, color: C.muted, marginTop: 2 }}>{sub}</span>}
        </div>
      </div>
      <span style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
    </div>
  );
}

function MTag({ val }: { val: string }) {
  const m: Record<string, { label: string; color: string; bg: string }> = {
    escalating: { label: '↑ Rising', color: C.green, bg: C.greenLo },
    neutral:    { label: '→ Flat',   color: C.gold,  bg: C.goldLo },
    dying:      { label: '↓ Fading', color: C.red,   bg: C.redLo },
  };
  const s = m[val] ?? m.neutral;
  return (
    <span style={{ fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 5, background: s.bg, color: s.color, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ data, color, height = 52 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: 11, color: C.muted }}>Analyze more chats to see trend</span>
    </div>
  );
  const W = 280, H = height;
  const mn = Math.min(...data) - 0.5, mx = Math.max(...data) + 0.5, rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - mn) / rng) * H}`);
  const path = `M ${pts.join(' L ')}`;
  const area = `M 0,${H} L ${pts.join(' L ')} L ${W},${H} Z`;
  const lx = W, ly = H - ((data[data.length - 1] - mn) / rng) * H;
  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${color.replace('#','')})`} />
      <motion.path d={path} fill="none" stroke={color} strokeWidth={1.8}
        strokeLinecap="round" strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }} />
      <motion.circle cx={lx} cy={ly} r={3.5} fill={color}
        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8, ...SP }} />
    </svg>
  );
}

// ─── Streak mini calendar ─────────────────────────────────────────────────────
function StreakCalendar({ analyses }: { analyses: Array<{ createdAt: string }> }) {
  const days = 28;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const activitySet = new Set(analyses.map(a => new Date(a.createdAt).toDateString()));
  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (days - 1 - i));
    return { date: d, active: activitySet.has(d.toDateString()), isToday: i === days - 1 };
  });
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
      {cells.map((c, i) => (
        <motion.div key={i} initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 0.02 * i, ...SP }}
          title={c.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          style={{
            aspectRatio: '1', borderRadius: 4,
            background: c.active ? C.violet : c.isToday ? 'rgba(123,108,246,0.15)' : 'rgba(255,255,255,0.04)',
            border: c.isToday ? `1px solid ${C.violetHi}` : '1px solid transparent',
            cursor: 'default',
          }} />
      ))}
    </div>
  );
}

// ─── Premium Lock overlay ─────────────────────────────────────────────────────
function Lock({ title, desc, compact = false }: { title: string; desc: string; compact?: boolean }) {
  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: C.surface, border: `1px solid ${C.border}` }}>
      {/* blurred mock content */}
      <div style={{ filter: 'blur(7px)', opacity: 0.25, pointerEvents: 'none', padding: compact ? '16px 18px' : '24px', userSelect: 'none' }}>
        <div style={{ height: 10, background: C.border, borderRadius: 4, marginBottom: 10, width: '60%' }} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {[55, 75, 40, 65, 80].map((h, i) => (
            <div key={i} style={{ flex: 1, height: h, background: C.violetBr, borderRadius: 3, opacity: 0.5 }} />
          ))}
        </div>
        <div style={{ height: 8, background: C.border, borderRadius: 4, width: '80%' }} />
      </div>
      {/* lock overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(8,8,15,0.65)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20 }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: C.goldLo, border: `1px solid ${C.goldHi}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>🔒</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: C.text, marginBottom: 4, fontFamily: "'Bricolage Grotesque',sans-serif" }}>{title}</div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.55, maxWidth: 220 }}>{desc}</div>
        </div>
        <Link href="/upgrade">
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            style={{ background: C.gold, color: '#1A0E00', border: 'none', borderRadius: 9, padding: '8px 18px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque',sans-serif" }}>
            Upgrade — ₹99/mo
          </motion.button>
        </Link>
      </div>
    </div>
  );
}

// ─── What to Work On card ─────────────────────────────────────────────────────
function WorkOnCard({ data }: { data: DashData }) {
  const { stats, skillProfile, isPremium } = data;
  const items: { icon: string; text: string; color: string }[] = [];

  if (stats.scoreTrend === 'down') items.push({ icon: '↓', text: 'Your scores are dropping — analyze a recent chat to find the pattern', color: C.red });
  if (stats.streak === 0) items.push({ icon: '🔥', text: 'No activity today — stay consistent for faster improvement', color: C.coral });
  if (stats.momentumBreakdown.dying > stats.momentumBreakdown.escalating) items.push({ icon: '⚠', text: 'Most of your chats are fading — focus on conversation momentum', color: C.gold });

  if (isPremium && skillProfile?.weaknesses.length) {
    const w = skillProfile.weaknesses[0];
    items.push({ icon: '📌', text: `Your biggest issue: ${w.label} (${w.count}× detected). Work on this in practice mode`, color: C.violet });
  }

  if (stats.averageScore >= 7) items.push({ icon: '🎯', text: 'You\'re performing well — try harder practice characters to level up', color: C.green });
  else if (stats.averageScore < 5) items.push({ icon: '💡', text: 'Average score below 5 — focus on asking more questions and matching their energy', color: C.violetBr });

  if (!items.length) items.push({ icon: '✓', text: 'Looking good — keep analyzing conversations to track improvement', color: C.green });

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '18px 20px', height: '100%' }}>
      <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: 14, fontFamily: "'DM Sans',sans-serif" }}>Focus This Week</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.slice(0, 3).map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08, ...SP }}
            style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: item.color + '18', border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0, marginTop: 1 }}>
              {item.icon}
            </div>
            <p style={{ fontSize: 12, color: C.muted2, lineHeight: 1.55, margin: 0 }}>{item.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Unauthenticated ──────────────────────────────────────────────────────────
function Unauth() {
  return (
    <div style={{ minHeight: '100svh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📊</div>
        <h1 style={{ fontSize: 'clamp(34px,6vw,52px)', fontWeight: 800, color: C.text, fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 14 }}>
          Track your<br /><em style={{ color: C.violet, fontStyle: 'italic' }}>growth.</em>
        </h1>
        <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 32 }}>Sign in to see your score history, skill level, and how your conversation game evolves.</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => signIn('google')}
          style={{ background: C.text, color: C.bg, border: 'none', borderRadius: 13, padding: '14px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque',sans-serif" }}>
          Continue with Google →
        </motion.button>
      </div>
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
  const [histTab, setHistTab] = useState<'analyses' | 'practice'>('analyses');
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    if (status === 'unauthenticated') { setLoading(false); return; }
    fetch('/api/dashboard')
      .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then(json => { if (json.success) setData(json); else throw new Error(json.error); })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [status]);

  if (status === 'unauthenticated') return <Unauth />;

  if (status === 'loading' || loading) return (
    <div style={{ minHeight: '100svh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div style={{ width: 26, height: 26, borderRadius: '50%', border: `2px solid ${C.violet}`, borderTopColor: 'transparent' }}
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100svh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <p style={{ color: C.red, fontSize: 13 }}>{error}</p>
      <button onClick={() => window.location.reload()} style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.text, borderRadius: 10, padding: '10px 20px', cursor: 'pointer', fontSize: 13 }}>Retry</button>
    </div>
  );

  const s = data?.stats;
  const skill = s?.skillInfo;
  const lm = LEVEL_META[skill?.level ?? 'Dry Texter'] ?? LEVEL_META['Average Talker'];
  const scores = data?.scoreHistory?.map(h => h.score) ?? [];
  const isPremium = data?.isPremium ?? false;
  const freeLeft = Math.max(0, 3 - (s?.freeTriesUsed ?? 0));
  const name = session?.user?.name?.split(' ')[0] ?? 'You';
  const scColor = (sc: number) => sc >= 7 ? C.green : sc >= 5 ? C.gold : C.red;
  const trendArrow = { up: '↑', down: '↓', flat: '→' }[s?.scoreTrend ?? 'flat'];
  const trendColor = { up: C.green, down: C.red, flat: C.muted2 }[s?.scoreTrend ?? 'flat'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=Geist+Mono:wght@400;500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        ::selection{background:rgba(123,108,246,0.3);}
        ::-webkit-scrollbar{width:2px;}
        ::-webkit-scrollbar-thumb{background:rgba(123,108,246,0.3);border-radius:2px;}
        .mono{font-family:'Geist Mono',monospace;}
        button{-webkit-tap-highlight-color:transparent;}

        .main-grid{display:grid;grid-template-columns:1fr;gap:10px;}
        .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;}
        .mid-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .profile-inner{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;}
        .rings{display:flex;gap:16px;flex-wrap:wrap;justify-content:center;}

        @media(max-width:860px){
          .stat-row{grid-template-columns:1fr 1fr;}
          .mid-grid{grid-template-columns:1fr;}
          .profile-inner{grid-template-columns:1fr 1fr;}
        }
        @media(max-width:520px){
          .stat-row{grid-template-columns:1fr 1fr;}
          .profile-inner{grid-template-columns:1fr;}
          .rings{gap:10px;}
          .hide-xs{display:none!important;}
        }

        @media(hover:hover){
          .hist-row:hover{background:rgba(255,255,255,0.025)!important;}
          .qbtn:hover{opacity:0.72;}
        }
      `}</style>

      <div style={{ background: C.bg, color: C.text, fontFamily: "'DM Sans',sans-serif", minHeight: '100svh', overflowX: 'hidden', paddingBottom: 100 }}>

        {/* ── ambient glow ────────────────────────────────────────── */}
        <div style={{ position: 'fixed', top: -60, left: '50%', transform: 'translateX(-50%)', width: 600, height: 300, background: `radial-gradient(ellipse, ${C.violet}08, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 clamp(14px,4vw,24px)', position: 'relative', zIndex: 1 }}>

          {/* ── FREE TRIAL BANNER ────────────────────────────────────── */}
          {!isPremium && s && (
            <Reveal>
              <Link href="/upgrade" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ scale: 1.005 }}
                  style={{ background: `linear-gradient(135deg, ${C.goldLo}, rgba(123,108,246,0.06))`, border: `1px solid ${C.gold}35`, borderRadius: 14, padding: '13px 18px', marginTop: 16, marginBottom: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, cursor: 'pointer', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ fontSize: 18 }}>⚡</div>
                    <div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: C.gold, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                        {freeLeft > 0 ? `${freeLeft} free ${freeLeft === 1 ? 'analysis' : 'analyses'} left` : 'Free limit reached'}
                      </span>
                      <span style={{ fontSize: 12, color: C.muted, marginLeft: 10 }}>Practice, skill profile, unlimited analyses — ₹99/mo</span>
                    </div>
                  </div>
                  <div style={{ background: C.gold, color: '#1A0E00', padding: '6px 14px', borderRadius: 8, fontSize: 11, fontWeight: 800, fontFamily: "'Bricolage Grotesque',sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Upgrade →
                  </div>
                </motion.div>
              </Link>
            </Reveal>
          )}

          {/* ── HEADER ──────────────────────────────────────────────── */}
          <Reveal delay={0.04}>
            <div style={{ paddingTop: isPremium ? 48 : 20, paddingBottom: 28, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 700, marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>Dashboard</div>
                <h1 style={{ fontSize: 'clamp(36px,6vw,58px)', fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 0.95, fontFamily: "'Bricolage Grotesque',sans-serif", color: C.text }}>
                  {name}'s<br />
                  <em style={{ color: C.violet, fontStyle: 'italic' }}>progress.</em>
                </h1>
                {isPremium && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: C.goldLo, border: `1px solid ${C.gold}35`, borderRadius: 20, padding: '4px 12px' }}>
                    <span style={{ fontSize: 10 }}>👑</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: C.gold, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Premium Active</span>
                  </div>
                )}
              </div>
              {/* Quick actions */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Link href="/upload">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ background: C.text, color: C.bg, border: 'none', borderRadius: 12, padding: '11px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque',sans-serif", display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap' }}>
                    Analyze chat →
                  </motion.button>
                </Link>
                <Link href="/practice">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    style={{ background: C.surface, color: C.text, border: `1px solid ${C.border}`, borderRadius: 12, padding: '11px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {isPremium ? 'Practice' : '🔒 Practice'}
                  </motion.button>
                </Link>
              </div>
            </div>
          </Reveal>

          {/* ── SKILL HERO CARD ──────────────────────────────────────── */}
          {skill && (
            <Reveal delay={0.08}>
              <div style={{ background: C.paper, border: `1px solid ${C.borderHi}`, borderRadius: 22, padding: 'clamp(18px,3vw,28px)', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                {/* Giant watermark glyph */}
                <div style={{ position: 'absolute', right: -10, top: -24, fontSize: 160, opacity: 0.04, lineHeight: 1, pointerEvents: 'none', userSelect: 'none', fontFamily: "'Bricolage Grotesque',sans-serif", fontWeight: 900 }}>
                  {lm.glyph}
                </div>

                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
                  {/* Level + progress */}
                  <div style={{ flex: '1 1 200px' }}>
                    <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.13em', fontWeight: 700, marginBottom: 10 }}>Skill Level</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontSize: 28, fontWeight: 900, color: lm.color, fontFamily: "'Bricolage Grotesque',sans-serif", lineHeight: 1 }}>{skill.level}</span>
                      <div style={{ fontSize: 11, color: trendColor, fontFamily: "'Geist Mono',monospace", fontWeight: 700 }}>{trendArrow} {s?.scoreTrend}</div>
                    </div>
                    <div style={{ fontSize: 12, color: C.muted, marginBottom: 18 }}>{lm.desc} · <span className="mono" style={{ color: C.muted2 }}>{s?.totalPoints.toLocaleString()} pts</span></div>

                    {skill.nextLevel && (
                      <div style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.muted, marginBottom: 7 }}>
                          <span>→ {skill.nextLevel}</span>
                          <span className="mono">{skill.pointsToNext} pts away</span>
                        </div>
                        <Bar pct={skill.progressPct ?? 0} color={lm.color} delay={0.5} h={5} />
                      </div>
                    )}
                    {!skill.nextLevel && (
                      <div style={{ fontSize: 12, color: C.green, fontWeight: 700 }}>👑 Max level reached</div>
                    )}
                  </div>

                  {/* Score sparkline */}
                  <div style={{ flex: '1 1 160px', minWidth: 0 }} className="hide-xs">
                    <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.13em', fontWeight: 700, marginBottom: 10 }}>Score History</div>
                    <Sparkline data={scores} color={lm.color} height={56} />
                  </div>

                  {/* Rings */}
                  <div className="rings" style={{ alignItems: 'flex-start', paddingTop: 4 }}>
                    <Ring val={s?.averageScore ?? 0} max={10} color={C.violet} label="Avg Score" size={76} sub="/10" />
                    <Ring val={s?.avgInterest ?? 0} max={100} color={C.coral} label="Avg Interest" size={76} sub="%" />
                    {isPremium && s?.practiceCount != null && (
                      <Ring val={s.practiceCount} max={Math.max(s.practiceCount, 10)} color={C.gold} label="Sessions" size={76} />
                    )}
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* ── STAT ROW ─────────────────────────────────────────────── */}
          <Reveal delay={0.12}>
            <div className="stat-row" style={{ marginBottom: 10 }}>
              {[
                { label: 'Chats Analyzed', val: s?.totalAnalyses ?? 0, color: C.violet, icon: '📊', mono: true },
                { label: 'Day Streak', val: `${s?.streak ?? 0}d`, color: C.coral, icon: '🔥', mono: false, sub: s?.streak ? 'keep it up' : 'start today' },
                { label: 'Best Score', val: s?.bestScore != null ? `${s.bestScore.toFixed(1)}/10` : '—', color: C.green, icon: '🏆', mono: false },
                {
                  label: isPremium ? 'Practice Sessions' : 'Practice 🔒',
                  val: isPremium ? (s?.practiceCount ?? 0) : '—',
                  color: isPremium ? C.gold : C.muted,
                  icon: '🎭', mono: true,
                  sub: !isPremium ? 'Premium only' : undefined,
                },
              ].map((tile, i) => (
                <motion.div key={tile.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06, ...EO }}>
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '18px 18px 14px', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: -4, right: 10, fontSize: 42, opacity: 0.06, lineHeight: 1 }}>{tile.icon}</div>
                    <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 8 }}>{tile.label}</div>
                    <div className={tile.mono ? 'mono' : ''} style={{ fontSize: 26, fontWeight: 800, color: tile.color, fontFamily: tile.mono ? "'Geist Mono',monospace" : "'Bricolage Grotesque',sans-serif", lineHeight: 1, marginBottom: 4 }}>{String(tile.val)}</div>
                    {tile.sub && <div style={{ fontSize: 10, color: C.muted }}>{tile.sub}</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* ── MID GRID: Focus + Momentum ──────────────────────────── */}
          <Reveal delay={0.16}>
            <div className="mid-grid" style={{ marginBottom: 10 }}>
              {/* Focus this week */}
              {data && <WorkOnCard data={data} />}

              {/* Momentum breakdown */}
              {s && s.totalAnalyses > 0 ? (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '18px 20px' }}>
                  <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 16, fontFamily: "'DM Sans',sans-serif" }}>Chat Momentum</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {[
                      { label: 'Rising', val: s.momentumBreakdown.escalating, color: C.green },
                      { label: 'Neutral', val: s.momentumBreakdown.neutral, color: C.gold },
                      { label: 'Fading', val: s.momentumBreakdown.dying, color: C.red },
                    ].map((m, i) => {
                      const pct = s.totalAnalyses > 0 ? Math.round((m.val / s.totalAnalyses) * 100) : 0;
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                            <span style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.label}</span>
                            <span className="mono" style={{ fontSize: 11, color: C.muted }}>{m.val} · {pct}%</span>
                          </div>
                          <Bar pct={pct} color={m.color} delay={0.2 + i * 0.1} h={4} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <p style={{ fontSize: 13, color: C.muted, textAlign: 'center' }}>Analyze your first chat to see momentum breakdown</p>
                </div>
              )}
            </div>
          </Reveal>

          {/* ── SKILL PROFILE (premium gated) ───────────────────────── */}
          <Reveal delay={0.20}>
            {isPremium && data?.skillProfile ? (
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ padding: '20px 22px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 5 }}>Skill Profile · Practice Analysis</div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, fontFamily: "'Bricolage Grotesque',sans-serif", letterSpacing: '-0.01em' }}>
                      {data.skillProfile.hasEnoughData ? "What you're actually like" : 'Not enough data yet'}
                    </h2>
                  </div>
                  {data.skillProfile.avgPracticeScore != null && (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>Practice avg</div>
                      <div className="mono" style={{ fontSize: 30, fontWeight: 800, color: data.skillProfile.avgPracticeScore >= 70 ? C.green : data.skillProfile.avgPracticeScore >= 45 ? C.gold : C.red, lineHeight: 1 }}>
                        {data.skillProfile.avgPracticeScore}
                      </div>
                    </div>
                  )}
                </div>

                {!data.skillProfile.hasEnoughData ? (
                  <div style={{ padding: '28px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, maxWidth: 380 }}>Complete 5+ practice messages with coaching to unlock your full skill profile — strengths, weak spots, improvement rate.</p>
                    <Link href="/practice">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        style={{ background: C.violetLo, border: `1px solid ${C.violetHi}`, color: C.violetBr, borderRadius: 11, padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                        Start Practicing
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="profile-inner">
                    {/* Strengths */}
                    <div style={{ padding: '18px 20px', borderRight: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.green, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: 14 }}>✓ Strengths</div>
                      {data.skillProfile.strengths.length === 0 ? (
                        <p style={{ fontSize: 12, color: C.muted }}>None detected yet</p>
                      ) : data.skillProfile.strengths.map((str, i) => {
                        const max = data.skillProfile!.strengths[0].count;
                        return (
                          <div key={str.flag} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                              <span style={{ color: C.text, fontWeight: 500 }}>{str.label}</span>
                              <span className="mono" style={{ color: C.green, fontWeight: 700, fontSize: 11 }}>{str.count}×</span>
                            </div>
                            <Bar pct={(str.count / max) * 100} color={C.green} delay={0.1 + i * 0.06} h={2} />
                          </div>
                        );
                      })}
                    </div>
                    {/* Weaknesses */}
                    <div style={{ padding: '18px 20px', borderRight: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: 9, color: C.red, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: 14 }}>✗ Needs Work</div>
                      {data.skillProfile.weaknesses.length === 0 ? (
                        <p style={{ fontSize: 12, color: C.muted }}>No consistent issues</p>
                      ) : data.skillProfile.weaknesses.map((w, i) => {
                        const max = data.skillProfile!.weaknesses[0].count;
                        return (
                          <div key={w.flag} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                              <span style={{ color: C.text, fontWeight: 500 }}>{w.label}</span>
                              <span className="mono" style={{ color: C.red, fontWeight: 700, fontSize: 11 }}>{w.count}×</span>
                            </div>
                            <Bar pct={(w.count / max) * 100} color={C.red} delay={0.1 + i * 0.06} h={2} />
                          </div>
                        );
                      })}
                    </div>
                    {/* Meta stats */}
                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: 14 }}>Stats</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {data.skillProfile.improvement != null && (
                          <div>
                            <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Improvement</div>
                            <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: data.skillProfile.improvement > 0 ? C.green : data.skillProfile.improvement < 0 ? C.red : C.muted, lineHeight: 1 }}>
                              {data.skillProfile.improvement > 0 ? '+' : ''}{data.skillProfile.improvement}
                            </div>
                            <div style={{ fontSize: 10, color: C.muted }}>pts avg</div>
                          </div>
                        )}
                        {data.skillProfile.topCharacter && (
                          <div>
                            <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Most Practiced</div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{CHAR_LABELS[data.skillProfile.topCharacter] ?? data.skillProfile.topCharacter}</div>
                          </div>
                        )}
                        <div>
                          <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Msgs Scored</div>
                          <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: C.violetBr, lineHeight: 1 }}>{data.skillProfile.totalScoredMessages}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 10 }}>
                <Lock
                  title="Skill Profile — Premium"
                  desc="See your practice strengths, weak spots, improvement trend, and personalized coaching insights."
                />
              </div>
            )}
          </Reveal>

          {/* ── ACTIVITY CALENDAR ────────────────────────────────────── */}
          <Reveal delay={0.22}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '18px 20px', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 4 }}>Activity · Last 28 Days</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="mono" style={{ fontSize: 20, fontWeight: 800, color: C.violet }}>{s?.streak ?? 0}d</div>
                    <div style={{ fontSize: 12, color: C.muted }}>current streak</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: 'rgba(255,255,255,0.04)' }} />
                  <span style={{ fontSize: 10, color: C.muted }}>No activity</span>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: C.violet, marginLeft: 8 }} />
                  <span style={{ fontSize: 10, color: C.muted }}>Active</span>
                </div>
              </div>
              <StreakCalendar analyses={data?.recentAnalyses ?? []} />
            </div>
          </Reveal>

          {/* ── HISTORY TABS ─────────────────────────────────────────── */}
          <Reveal delay={0.26}>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 22, overflow: 'hidden', marginBottom: 10 }}>
              {/* Tab bar */}
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}` }}>
                {(['analyses', 'practice'] as const).map(t => (
                  <button key={t} onClick={() => setHistTab(t)}
                    style={{ flex: 1, padding: '14px 18px', background: histTab === t ? C.surfaceHi : 'transparent', border: 'none', borderBottom: `2px solid ${histTab === t ? C.violet : 'transparent'}`, color: histTab === t ? C.text : C.muted, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.2s', fontFamily: "'DM Sans',sans-serif" }}>
                    {t === 'analyses' ? 'Chat Analyses' : isPremium ? 'Practice Sessions' : '🔒 Practice'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={histTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                  {/* ANALYSES tab */}
                  {histTab === 'analyses' && (
                    <div>
                      {!data?.recentAnalyses.length ? (
                        <div style={{ textAlign: 'center', padding: '52px 24px' }}>
                          <div style={{ fontSize: 32, marginBottom: 12 }}>📱</div>
                          <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>No analyses yet</div>
                          <Link href="/upload">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                              style={{ background: C.text, color: C.bg, border: 'none', borderRadius: 11, padding: '11px 22px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                              Analyze first chat →
                            </motion.button>
                          </Link>
                        </div>
                      ) : data.recentAnalyses.map((a, i) => {
                        const sc = a.conversationScore;
                        const scc = scColor(sc);
                        const dt = new Date(a.createdAt);
                        return (
                          <motion.div key={a._id} className="hist-row"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: i < data.recentAnalyses.length - 1 ? `1px solid ${C.border}` : 'none', flexWrap: 'wrap', transition: 'background 0.14s' }}>
                            {/* Score bubble */}
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: scc + '14', border: `1px solid ${scc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <span className="mono" style={{ fontSize: 14, fontWeight: 800, color: scc }}>{sc.toFixed(1)}</span>
                            </div>
                            {/* Mini score bar + date */}
                            <div style={{ flex: '1 1 80px', minWidth: 60 }}>
                              <div style={{ fontSize: 11, fontWeight: 600, color: C.muted2, marginBottom: 5 }}>
                                {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                <span style={{ color: C.muted, marginLeft: 6 }}>{dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                              </div>
                              <Bar pct={(sc / 10) * 100} color={scc} delay={0.05 + i * 0.04} h={2} />
                            </div>
                            {/* Metrics */}
                            <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: C.coral }}>{a.interestLevel}%</div>
                                <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>Interest</div>
                              </div>
                              {a.attractionProbability != null && (
                                <div style={{ textAlign: 'center' }}>
                                  <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: C.gold }}>{a.attractionProbability}%</div>
                                  <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>Attract</div>
                                </div>
                              )}
                              {a.missedOpportunities > 0 && (
                                <div style={{ textAlign: 'center' }}>
                                  <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: C.muted2 }}>{a.missedOpportunities}</div>
                                  <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>Missed</div>
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
                  {histTab === 'practice' && (
                    <div>
                      {!isPremium ? (
                        <div style={{ padding: '32px 24px 28px' }}>
                          <Lock
                            title="Practice tracking is premium"
                            desc="Track every session, see improvement over time, unlock your skill profile."
                            compact
                          />
                        </div>
                      ) : !data?.practiceSessions.length ? (
                        <div style={{ textAlign: 'center', padding: '52px 24px' }}>
                          <div style={{ fontSize: 32, marginBottom: 12 }}>🎭</div>
                          <div style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>No practice sessions yet</div>
                          <Link href="/practice">
                            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                              style={{ background: C.text, color: C.bg, border: 'none', borderRadius: 11, padding: '11px 22px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                              Start first session →
                            </motion.button>
                          </Link>
                        </div>
                      ) : data.practiceSessions.map((p, i) => {
                        const dc = { easy: C.green, normal: C.gold, hard: C.red }[p.difficulty] ?? C.muted;
                        const ic = p.currentInterest >= 60 ? C.green : p.currentInterest >= 35 ? C.gold : C.red;
                        const charLabel = CHAR_LABELS[p.characterType] ?? p.characterType;
                        return (
                          <motion.div key={p._id} className="hist-row"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: i < data.practiceSessions.length - 1 ? `1px solid ${C.border}` : 'none', flexWrap: 'wrap', transition: 'background 0.14s' }}>
                            <div style={{ width: 44, height: 44, borderRadius: 12, background: C.goldLo, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>🎭</div>
                            <div style={{ flex: '1 1 100px', minWidth: 80 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>{charLabel}</div>
                              <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 7px', borderRadius: 4, background: dc + '18', color: dc, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{p.difficulty}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                              <div style={{ textAlign: 'center' }}>
                                <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: C.violetBr }}>{p.messageCount}</div>
                                <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>Msgs</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div className="mono" style={{ fontSize: 14, fontWeight: 800, color: ic }}>{p.currentInterest}%</div>
                                <div style={{ fontSize: 8, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 2 }}>Interest</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 11, color: C.muted }}>
                                  {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
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

          {/* ── PREMIUM UPGRADE BLOCK (free users) ──────────────────── */}
          {!isPremium && (
            <Reveal delay={0.30}>
              <div style={{ background: `linear-gradient(135deg, rgba(123,108,246,0.08), rgba(245,200,66,0.05))`, border: `1px solid ${C.violet}30`, borderRadius: 20, padding: 'clamp(20px,4vw,32px)', marginBottom: 10, position: 'relative', overflow: 'hidden' }}>
                {/* Large background text */}
                <div style={{ position: 'absolute', right: -20, bottom: -30, fontSize: 120, fontWeight: 900, opacity: 0.03, color: C.violet, fontFamily: "'Bricolage Grotesque',sans-serif", lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>PRO</div>

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24, position: 'relative', zIndex: 1 }}>
                  <div>
                    <div style={{ fontSize: 9, color: C.violet, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800, marginBottom: 10 }}>Upgrade to Premium</div>
                    <h3 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 800, letterSpacing: '-0.025em', color: C.text, marginBottom: 10, fontFamily: "'Bricolage Grotesque',sans-serif", lineHeight: 1.1 }}>
                      You're seeing<br />10% of what we know.
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {[
                        { icon: '∞', text: 'Unlimited chat analyses', color: C.violetBr },
                        { icon: '🎭', text: 'All 10 AI practice characters', color: C.coral },
                        { icon: '📈', text: 'Full skill profile + improvement tracking', color: C.green },
                        { icon: '💡', text: 'Attraction signals, rewrites, missed moments', color: C.gold },
                      ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: f.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, flexShrink: 0 }}>{f.icon}</div>
                          <span style={{ fontSize: 13, color: C.muted2 }}>{f.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ flexShrink: 0 }}>
                    <div style={{ background: C.paper, border: `1px solid ${C.borderHi}`, borderRadius: 16, padding: '22px 24px', minWidth: 180, textAlign: 'center', marginBottom: 12 }}>
                      <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700, marginBottom: 8 }}>Launch Price</div>
                      <div style={{ fontFamily: "'Bricolage Grotesque',sans-serif", fontSize: 46, fontWeight: 900, color: C.text, lineHeight: 1, letterSpacing: '-0.04em' }}>₹99</div>
                      <div style={{ fontSize: 12, color: C.muted, marginBottom: 16 }}>/month · cancel anytime</div>
                      <Link href="/upgrade">
                        <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                          style={{ width: '100%', background: C.violet, color: '#fff', border: 'none', borderRadius: 11, padding: '12px 20px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                          Upgrade Now →
                        </motion.button>
                      </Link>
                    </div>
                    <div style={{ fontSize: 10, color: C.muted, textAlign: 'center', lineHeight: 1.5 }}>No screenshots stored · Secured by Razorpay</div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* ── RESET OWN DATA (both tiers) ─────────────────────────── */}
          <Reveal delay={0.34}>
            <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20, paddingBottom: 10 }}>
              <AnimatePresence>
                {!resetConfirm ? (
                  <button onClick={() => setResetConfirm(true)} className="qbtn"
                    style={{ background: 'none', border: 'none', color: C.muted, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'opacity 0.15s' }}>
                    <span style={{ fontSize: 10 }}>⚠</span> Reset my data
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 12, color: C.red }}>Delete all your analyses and practice sessions? Cannot be undone.</span>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => { /* call API */ setResetConfirm(false); }}
                        style={{ background: C.redLo, border: `1px solid ${C.red}40`, color: C.red, borderRadius: 8, padding: '6px 14px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                        Yes, delete
                      </button>
                      <button onClick={() => setResetConfirm(false)}
                        style={{ background: C.surface, border: `1px solid ${C.border}`, color: C.muted, borderRadius: 8, padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>

        </div>
      </div>
    </>
  );
}