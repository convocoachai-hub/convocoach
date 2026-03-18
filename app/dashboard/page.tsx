'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import UsernameCard from '@/components/UsernameCard';
import RizzFeedbackSection from '@/components/RizzFeedbackSection';
import RizzLinkBuilder from '@/components/RizzLinkBuilder';
import { ArrowRight, Lock as LockIcon, Check, Zap, TrendingUp, AlertTriangle } from 'lucide-react';

// Recharts (dynamic import to avoid SSR issues)
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });
const LineChart = dynamic(() => import('recharts').then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(m => m.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import('recharts').then(m => m.CartesianGrid), { ssr: false });
const RechartsTooltip = dynamic(() => import('recharts').then(m => m.Tooltip), { ssr: false });

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
  username: string | null;
  usernameSetAt: string | null;
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

// ─── Design System — Neo-Brutalism ────────────────────────────────────────────
const C = {
  cream:     '#F3EDE2',
  ink:       '#0F0C09',
  red:       '#D13920',
  yellow:    '#FFD84D',
  blue:      '#4F46E5',
  green:     '#22C55E',
  pink:      '#FF6FD8',
  warm1:     '#E8E0D2',
  warm2:     '#D4CBBA',
  muted:     '#8A8074',
  shadow:    '4px 4px 0px #0F0C09',
  shadowLg:  '8px 8px 0px #0F0C09',
  border:    '3px solid #0F0C09',
  borderThin:'2px solid #0F0C09',
};

const EO = { duration: 0.4, ease: [0.2, 0, 0.2, 1] } as const;
const SNAP = { duration: 0.18, ease: [0.2, 0, 0.2, 1] } as const;
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
  'Dry Texter':              { color: C.muted,   glyph: '💤', desc: 'Just getting started' },
  'Average Talker':          { color: C.blue,    glyph: '💬', desc: 'Making progress' },
  'Smooth Conversationalist':{ color: C.pink,    glyph: '✨', desc: 'Above average' },
  'Elite Charmer':           { color: C.red,     glyph: '👑', desc: 'Top tier' },
};

// ─── Primitives ───────────────────────────────────────────────────────────────

function Reveal({ children, delay = 0, y = 20 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y }} animate={{ opacity: 1, y: 0 }} transition={{ ...EO, delay }}>
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
function Bar({ pct, color, delay = 0, h = 6 }: { pct: number; color: string; delay?: number; h?: number }) {
  return (
    <div style={{ height: h, background: C.warm1, border: '1px solid #0F0C09', borderRadius: 99, overflow: 'hidden' }}>
      <motion.div style={{ height: '100%', background: color, borderRight: '1px solid #0F0C09' }}
        initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
        transition={{ duration: 1.0, delay, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}

function Ring({ val, max, color, label, size = 80, sub }: {
  val: number; max: number; color: string; label: string; size?: number; sub?: string;
}) {
  const r = size / 2 - 8, circ = 2 * Math.PI * r;
  const displayVal = max === 10 ? val.toFixed(1) : Math.round(val);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size, background: C.white, borderRadius: '50%', border: C.borderThin, boxShadow: C.shadowSm }}>
        <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.warm1} strokeWidth={6} />
          <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
            strokeLinecap="round" initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${(val / max) * circ} ${circ}` }}
            transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.25 }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size > 70 ? 20 : 16, fontWeight: 900, color: C.ink, fontFamily: "'DM Sans',sans-serif", lineHeight: 1 }}>{displayVal}</span>
          {sub && <span style={{ fontSize: 9, color: C.muted, marginTop: 2, fontWeight: 800 }}>{sub}</span>}
        </div>
      </div>
      <span style={{ fontSize: 10, color: C.ink, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.08em', textAlign: 'center', fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
    </div>
  );
}

function MTag({ val }: { val: string }) {
  const m: Record<string, { label: string; bg: string; color: string }> = {
    escalating: { label: '↑ RISING', bg: C.green,  color: C.ink },
    neutral:    { label: '→ FLAT',   bg: C.yellow, color: C.ink },
    dying:      { label: '↓ FADING', bg: C.red,    color: C.white },
  };
  const s = m[val] ?? m.neutral;
  return (
    <span style={{ fontSize: 9, fontWeight: 900, padding: '4px 8px', borderRadius: 6, background: s.bg, color: s.color, border: '1px solid #000', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap' }}>
      {s.label}
    </span>
  );
}

// ─── Sparkline (Brutalist) ────────────────────────────────────────────────────
function Sparkline({ data, color, height = 52 }: { data: number[]; color: string; height?: number }) {
  if (data.length < 2) return (
    <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: C.warm1, border: C.borderThin, borderRadius: 8 }}>
      <span style={{ fontSize: 10, color: C.muted, fontWeight: 800, textTransform: 'uppercase' }}>Need more data</span>
    </div>
  );
  const W = 280, H = height;
  const mn = Math.min(...data) - 0.5, mx = Math.max(...data) + 0.5, rng = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - mn) / rng) * H}`);
  const path = `M ${pts.join(' L ')}`;
  const lx = W, ly = H - ((data[data.length - 1] - mn) / rng) * H;
  
  return (
    <div style={{ background: C.white, border: C.borderThin, borderRadius: 12, padding: '8px 0', height: H + 16, overflow: 'hidden' }}>
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <motion.path d={path} fill="none" stroke={color} strokeWidth={3}
          strokeLinecap="square" strokeLinejoin="miter"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1], delay: 0.4 }} />
        <motion.circle cx={lx} cy={ly} r={5} fill={C.ink}
          initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.8, ...SP }} />
      </svg>
    </div>
  );
}

// ─── Premium Lock overlay ─────────────────────────────────────────────────────
function Lock({ title, desc, compact = false }: { title: string; desc: string; compact?: boolean }) {
  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: C.white, border: C.borderThin }}>
      {/* striped mock content */}
      <div style={{ opacity: 0.1, pointerEvents: 'none', padding: compact ? '16px 18px' : '24px', userSelect: 'none', background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 12px)' }}>
        <div style={{ height: 100 }} />
      </div>
      {/* lock overlay */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(243,237,226,0.85)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, padding: 20 }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: C.yellow, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: C.shadowSm }}>
          <LockIcon style={{ width: 20, height: 20, color: C.ink }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: C.ink, marginBottom: 4, fontFamily: "'DM Sans',sans-serif", textTransform: 'uppercase' }}>{title}</div>
          <div style={{ fontSize: 13, color: '#555', lineHeight: 1.55, maxWidth: 260, fontWeight: 500 }}>{desc}</div>
        </div>
        <Link href="/upgrade" style={{ textDecoration: 'none' }}>
          <motion.button whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
            style={{ background: C.ink, color: C.white, border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 900, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", marginTop: 4 }}>
            Upgrade to Unlock
          </motion.button>
        </Link>
      </div>
    </div>
  );
}

// ─── What to Work On card ─────────────────────────────────────────────────────
function WorkOnCard({ data }: { data: DashData }) {
  const { stats, skillProfile, isPremium } = data;
  const items: { icon: any; text: string; color: string }[] = [];

  if (stats.scoreTrend === 'down') items.push({ icon: <TrendingUp style={{width:16, height:16, transform:'rotate(180deg)'}}/>, text: 'Scores are dropping. Review your last chat.', color: C.red });
  if (stats.streak === 0) items.push({ icon: <Zap style={{width:16, height:16}}/>, text: 'No activity today. Analyze one chat to build momentum.', color: C.yellow });
  if (stats.momentumBreakdown.dying > stats.momentumBreakdown.escalating) items.push({ icon: <AlertTriangle style={{width:16, height:16}}/>, text: 'Conversations are fading. Work on asking open questions.', color: C.blue });

  if (isPremium && skillProfile?.weaknesses.length) {
    const w = skillProfile.weaknesses[0];
    items.push({ icon: <LockIcon style={{width:16, height:16}}/>, text: `Primary weakness: ${w.label} (${w.count}× detected).`, color: C.pink });
  }

  if (stats.averageScore >= 7) items.push({ icon: <Check style={{width:16, height:16}}/>, text: 'Performing well. Try Hard mode in Practice.', color: C.green });
  else if (stats.averageScore < 5) items.push({ icon: <AlertTriangle style={{width:16, height:16}}/>, text: 'Avg score < 5. Focus on matching text length.', color: C.red });

  if (!items.length) items.push({ icon: <Check style={{width:16, height:16}}/>, text: 'Looking solid. Keep analyzing new conversations.', color: C.green });

  return (
    <div style={{ background: C.white, border: C.border, borderRadius: 20, padding: '24px', height: '100%', boxShadow: C.shadow }}>
      <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: 16, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, background: C.red, borderRadius: '50%', border: '1px solid #000' }}/> Focus This Week
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.slice(0, 3).map((item, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.08, ...EO }}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: C.warm1, padding: '12px', borderRadius: 12, border: C.borderThin }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: C.white, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, flexShrink: 0 }}>
              {item.icon}
            </div>
            <p style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, margin: 0, fontWeight: 600, paddingTop: 2 }}>{item.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Unauthenticated ──────────────────────────────────────────────────────────
function Unauth() {
  return (
    <div style={{ minHeight: '100svh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center', maxWidth: 420, background: C.white, padding: 40, borderRadius: 24, border: C.border, boxShadow: C.shadowLg }}>
        <div style={{ width: 64, height: 64, background: C.yellow, borderRadius: 16, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32, boxShadow: C.shadowSm }}>📊</div>
        <h1 style={{ fontSize: 'clamp(32px,6vw,46px)', fontWeight: 900, color: C.ink, fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.04em', lineHeight: 1.05, marginBottom: 16 }}>
          Track your<br />progress.
        </h1>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.6, marginBottom: 32, fontWeight: 500 }}>Sign in to see your score history, skill level, and how your conversation game evolves over time.</p>
        <motion.button whileHover={{ y: -3, boxShadow: C.shadow }} whileTap={{ y: 1, boxShadow: 'none' }} onClick={() => signIn('google')}
          style={{ width: '100%', background: C.ink, color: C.white, border: C.border, borderRadius: 14, padding: '16px', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
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
    <div style={{ minHeight: '100svh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div style={{ width: 40, height: 40, borderRadius: '50%', border: `4px solid ${C.ink}`, borderTopColor: 'transparent' }}
        animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100svh', background: C.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#FFF0F0', border: C.border, padding: 24, borderRadius: 16, textAlign: 'center', boxShadow: C.shadow }}>
        <p style={{ color: C.red, fontSize: 16, fontWeight: 800, margin: '0 0 16px' }}>{error}</p>
        <button onClick={() => window.location.reload()} style={{ background: C.ink, border: 'none', color: C.white, borderRadius: 10, padding: '10px 24px', cursor: 'pointer', fontSize: 14, fontWeight: 800 }}>Retry</button>
      </div>
    </div>
  );

  const s = data?.stats;
  const skill = s?.skillInfo;
  const lm = LEVEL_META[skill?.level ?? 'Dry Texter'] ?? LEVEL_META['Average Talker'];
  const scores = data?.scoreHistory?.map(h => h.score) ?? [];
  const isPremium = data?.isPremium ?? false;
  const freeLeft = Math.max(0, 3 - (s?.freeTriesUsed ?? 0));
  const name = session?.user?.name?.split(' ')[0] ?? 'You';
  const scColor = (sc: number) => sc >= 7 ? C.green : sc >= 5 ? C.yellow : C.red;
  
  // Brutalist Arrow symbols
  const trendArrow = { up: '↑', down: '↓', flat: '→' }[s?.scoreTrend ?? 'flat'];
  const trendColor = { up: C.green, down: C.red, flat: C.muted }[s?.scoreTrend ?? 'flat'];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth; overflow-x: hidden;}
        body{background: ${C.cream}; overflow-x: hidden; width: 100%;}
        ::selection{background:${C.yellow}; color: ${C.ink};}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:${C.ink};border-radius:0px;}

        .stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;}
        .mid-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
        .profile-inner{display:grid;grid-template-columns:1fr 1fr 1fr;gap:0;}
        .rings{display:flex;gap:24px;flex-wrap:wrap;justify-content:center;}

        @media(max-width:860px){
          .stat-row{grid-template-columns:1fr 1fr;}
          .mid-grid{grid-template-columns:1fr;}
          .profile-inner{grid-template-columns:1fr 1fr;}
        }
        @media(max-width:520px){
          .stat-row{grid-template-columns:1fr;}
          .profile-inner{grid-template-columns:1fr;}
          .rings{gap:16px;}
          .hide-xs{display:none!important;}
          .dash-wrap { padding: 32px 16px !important; }
        }

        .hist-row { transition: all 0.2s; }
        @media(hover:hover){
          .hist-row:hover{background: ${C.warm1}!important; transform: translateX(4px); border-radius: 8px;}
        }
      `}} />

      <div style={{ background: C.cream, color: C.ink, fontFamily: "'DM Sans',sans-serif", minHeight: '100svh', paddingBottom: 100 }}>
        <div className="dash-wrap" style={{ maxWidth: 960, margin: '0 auto', padding: '40px 24px', position: 'relative' }}>

          {/* ── FREE TRIAL BANNER ────────────────────────────────────── */}
          {!isPremium && s && (
            <Reveal>
              <Link href="/upgrade" style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ y: -3, boxShadow: C.shadow }} whileTap={{ y: 0, boxShadow: 'none' }}
                  style={{ background: C.yellow, border: C.border, borderRadius: 16, padding: '16px 20px', marginBottom: 32, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, cursor: 'pointer', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, background: C.white, border: C.borderThin, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, boxShadow: C.shadowSm, flexShrink: 0 }}>⚡</div>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 900, color: C.ink, fontFamily: "'DM Sans',sans-serif", textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
                        {freeLeft > 0 ? `${freeLeft} free ${freeLeft === 1 ? 'analysis' : 'analyses'} left` : 'Free limit reached'}
                      </div>
                      <div style={{ fontSize: 13, color: '#444', fontWeight: 600 }}>Unlock unlimited scans, practice mode & rewrites.</div>
                    </div>
                  </div>
                  <div style={{ background: C.ink, color: C.white, padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 900, fontFamily: "'DM Sans',sans-serif", whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Upgrade Now →
                  </div>
                </motion.div>
              </Link>
            </Reveal>
          )}

          {/* ── HEADER ──────────────────────────────────────────────── */}
          <Reveal delay={0.04}>
            <div style={{ paddingBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <Label text="Dashboard" color={C.blue} />
                <h1 style={{ fontSize: 'clamp(42px,7vw,64px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.0, fontFamily: "'DM Sans',sans-serif", color: C.ink, margin: 0 }}>
                  {name}'s<br />
                  Data.
                </h1>
                {isPremium && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, background: C.white, border: C.borderThin, borderRadius: 8, padding: '6px 12px', boxShadow: C.shadowSm }}>
                    <span style={{ fontSize: 14 }}>👑</span>
                    <span style={{ fontSize: 11, fontWeight: 900, color: C.ink, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Premium Active</span>
                  </div>
                )}
              </div>
              {/* Quick actions */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href="/upload" style={{ textDecoration: 'none' }}>
                  <motion.button whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
                    style={{ background: C.red, color: C.white, border: C.borderThin, borderRadius: 12, padding: '14px 24px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
                    Analyze Chat →
                  </motion.button>
                </Link>
                <Link href="/practice" style={{ textDecoration: 'none' }}>
                  <motion.button whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
                    style={{ background: C.white, color: C.ink, border: C.borderThin, borderRadius: 12, padding: '14px 20px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                    {isPremium ? 'Practice Mode' : '🔒 Practice'}
                  </motion.button>
                </Link>
              </div>
            </div>
          </Reveal>

          {/* ── SKILL HERO CARD ──────────────────────────────────────── */}
          {skill && (
            <Reveal delay={0.08}>
              <div style={{ background: C.white, border: C.border, borderRadius: 24, padding: 'clamp(24px,4vw,36px)', marginBottom: 24, boxShadow: C.shadow, position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
                  {/* Level + progress */}
                  <div style={{ flex: '1 1 240px' }}>
                    <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, background: lm.color, borderRadius: '50%', border: '1px solid #000' }} />
                      Skill Level
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                      <span style={{ fontSize: 'clamp(32px, 4vw, 42px)', fontWeight: 900, color: C.ink, fontFamily: "'DM Sans',sans-serif", lineHeight: 1, letterSpacing: '-0.02em' }}>{skill.level}</span>
                    </div>
                    <div style={{ fontSize: 14, color: '#555', marginBottom: 24, fontWeight: 600 }}>{lm.desc} · <span style={{ color: C.ink, fontWeight: 800 }}>{s?.totalPoints.toLocaleString()} pts</span></div>

                    {skill.nextLevel ? (
                      <div style={{ marginBottom: 6, background: C.warm1, padding: 16, borderRadius: 12, border: C.borderThin }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: C.ink, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase' }}>
                          <span>Next: {skill.nextLevel}</span>
                          <span>{skill.pointsToNext} pts away</span>
                        </div>
                        <Bar pct={skill.progressPct ?? 0} color={lm.color} delay={0.5} h={8} />
                      </div>
                    ) : (
                      <div style={{ fontSize: 14, color: C.white, background: C.ink, padding: '10px 16px', borderRadius: 8, display: 'inline-block', fontWeight: 800 }}>👑 Max level reached</div>
                    )}
                  </div>

                  {/* Score sparkline */}
                  <div style={{ flex: '1 1 200px', minWidth: 0 }} className="hide-xs">
                    <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 12 }}>Trend</div>
                    <Sparkline data={scores} color={C.red} height={64} />
                  </div>

                  {/* Rings */}
                  <div className="rings" style={{ alignItems: 'center' }}>
                    <Ring val={s?.averageScore ?? 0} max={10} color={C.blue} label="Avg Score" size={90} sub="/10" />
                    <Ring val={s?.avgInterest ?? 0} max={100} color={C.yellow} label="Interest" size={90} sub="%" />
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* ── STAT ROW ─────────────────────────────────────────────── */}
          <Reveal delay={0.12}>
            <div className="stat-row" style={{ marginBottom: 24 }}>
              {[
                { label: 'Chats Analyzed', val: s?.totalAnalyses ?? 0, color: C.blue, icon: '📊' },
                { label: 'Day Streak', val: `${s?.streak ?? 0}d`, color: C.red, icon: '🔥', sub: s?.streak ? 'Keep it up' : 'Start today' },
                { label: 'Best Score', val: s?.bestScore != null ? `${s.bestScore.toFixed(1)}/10` : '—', color: C.green, icon: '🏆' },
                {
                  label: isPremium ? 'Practice Sessions' : 'Practice 🔒',
                  val: isPremium ? (s?.practiceCount ?? 0) : '—',
                  color: isPremium ? C.yellow : C.muted,
                  icon: '🎭',
                  sub: !isPremium ? 'Premium only' : undefined,
                },
              ].map((tile, i) => (
                <motion.div key={tile.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + i * 0.06, ...EO }}>
                  <div style={{ background: C.white, border: C.border, borderRadius: 20, padding: '24px', height: '100%', position: 'relative', overflow: 'hidden', boxShadow: C.shadow }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: C.warm1, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{tile.icon}</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: C.ink, fontFamily: "'DM Sans',sans-serif", lineHeight: 1, marginBottom: 8 }}>{String(tile.val)}</div>
                    <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800 }}>{tile.label}</div>
                    {tile.sub && <div style={{ fontSize: 11, color: '#666', marginTop: 6, fontWeight: 600 }}>{tile.sub}</div>}
                  </div>
                </motion.div>
              ))}
            </div>
          </Reveal>

          {/* ── Username / Rizz Link Card ──────────────────────────── */}
          <Reveal delay={0.15}>
            <div style={{ marginBottom: 24 }}>
              <UsernameCard currentUsername={data?.username || null} usernameSetAt={data?.usernameSetAt || null} isPremium={data?.isPremium || false} />
            </div>
          </Reveal>

          {/* ── Rizz Link Builder ───────────────────────────────── */}
          <Reveal delay={0.16}>
            <div style={{ marginBottom: 24 }}>
              <RizzLinkBuilder username={data?.username || null} />
            </div>
          </Reveal>

          {/* ── Rizz Feedback Section ──────────────────────────────── */}
          <Reveal delay={0.17}>
            <div style={{ marginBottom: 24 }}>
              <RizzFeedbackSection />
            </div>
          </Reveal>

          {/* ── MID GRID: Focus + Momentum ──────────────────────────── */}
          <Reveal delay={0.16}>
            <div className="mid-grid" style={{ marginBottom: 24 }}>
              {/* Focus this week */}
              {data && <WorkOnCard data={data} />}

              {/* Momentum breakdown */}
              {s && s.totalAnalyses > 0 ? (
                <div style={{ background: C.white, border: C.border, borderRadius: 20, padding: '24px', boxShadow: C.shadow }}>
                  <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 900, marginBottom: 20, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, background: C.blue, borderRadius: '50%', border: '1px solid #000' }}/> Chat Momentum
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {[
                      { label: 'Rising', val: s.momentumBreakdown.escalating, color: C.green },
                      { label: 'Neutral', val: s.momentumBreakdown.neutral, color: C.yellow },
                      { label: 'Fading', val: s.momentumBreakdown.dying, color: C.red },
                    ].map((m, i) => {
                      const pct = s.totalAnalyses > 0 ? Math.round((m.val / s.totalAnalyses) * 100) : 0;
                      return (
                        <div key={i}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 900, color: C.ink }}>{m.label}</span>
                            <span style={{ fontSize: 13, color: '#555', fontWeight: 700 }}>{m.val} ({pct}%)</span>
                          </div>
                          <Bar pct={pct} color={m.color} delay={0.2 + i * 0.1} h={8} />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div style={{ background: C.white, border: C.border, borderRadius: 20, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: C.shadow }}>
                  <p style={{ fontSize: 14, color: '#555', textAlign: 'center', fontWeight: 600 }}>Analyze your first chat to see momentum breakdown</p>
                </div>
              )}
            </div>
          </Reveal>

          {/* ── SKILL PROFILE (premium gated) ───────────────────────── */}
          <Reveal delay={0.20}>
            {isPremium && data?.skillProfile ? (
              <div style={{ background: C.white, border: C.border, borderRadius: 24, overflow: 'hidden', marginBottom: 24, boxShadow: C.shadow }}>
                <div style={{ padding: '24px', borderBottom: C.borderThin, background: C.bgCream, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 8 }}>Skill Profile Dossier</div>
                    <h2 style={{ fontSize: 'clamp(24px,4vw,32px)', fontWeight: 900, color: C.ink, fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.02em', margin: 0 }}>
                      {data.skillProfile.hasEnoughData ? "Your Communication Blueprint" : 'Data Gathering Phase'}
                    </h2>
                  </div>
                  {data.skillProfile.avgPracticeScore != null && (
                    <div style={{ textAlign: 'right', background: C.white, padding: '12px 20px', borderRadius: 14, border: C.borderThin, boxShadow: C.shadowSm }}>
                      <div style={{ fontSize: 10, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4, fontWeight: 800 }}>Practice Avg</div>
                      <div style={{ fontSize: 36, fontWeight: 900, color: data.skillProfile.avgPracticeScore >= 70 ? C.green : data.skillProfile.avgPracticeScore >= 45 ? C.yellow : C.red, lineHeight: 1 }}>
                        {data.skillProfile.avgPracticeScore}
                      </div>
                    </div>
                  )}
                </div>

                {!data.skillProfile.hasEnoughData ? (
                  <div style={{ padding: '36px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
                    <p style={{ fontSize: 15, color: '#444', lineHeight: 1.6, maxWidth: 440, fontWeight: 600, margin: 0 }}>Complete 5+ practice messages with coaching to unlock your full skill profile — strengths, weak spots, and exact improvement rates.</p>
                    <Link href="/practice" style={{ textDecoration: 'none' }}>
                      <motion.button whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
                        style={{ background: C.ink, border: 'none', color: C.white, borderRadius: 12, padding: '14px 28px', fontSize: 14, fontWeight: 900, cursor: 'pointer' }}>
                        Start Practicing →
                      </motion.button>
                    </Link>
                  </div>
                ) : (
                  <div className="profile-inner">
                    {/* Strengths */}
                    <div style={{ padding: '24px', borderRight: C.borderThin }}>
                      <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{width:8,height:8,background:C.green,borderRadius:'50%',border:'1px solid #000'}}/> Strengths</div>
                      {data.skillProfile.strengths.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>None detected yet</p>
                      ) : data.skillProfile.strengths.map((str, i) => {
                        const max = data.skillProfile!.strengths[0].count;
                        return (
                          <div key={str.flag} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, fontWeight: 700, color: C.ink }}>
                              <span>{str.label}</span>
                              <span>{str.count}×</span>
                            </div>
                            <Bar pct={(str.count / max) * 100} color={C.green} delay={0.1 + i * 0.06} h={6} />
                          </div>
                        );
                      })}
                    </div>
                    {/* Weaknesses */}
                    <div style={{ padding: '24px', borderRight: C.borderThin }}>
                      <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}><div style={{width:8,height:8,background:C.red,borderRadius:'50%',border:'1px solid #000'}}/> Needs Work</div>
                      {data.skillProfile.weaknesses.length === 0 ? (
                        <p style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>No consistent issues</p>
                      ) : data.skillProfile.weaknesses.map((w, i) => {
                        const max = data.skillProfile!.weaknesses[0].count;
                        return (
                          <div key={w.flag} style={{ marginBottom: 16 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, fontWeight: 700, color: C.ink }}>
                              <span>{w.label}</span>
                              <span>{w.count}×</span>
                            </div>
                            <Bar pct={(w.count / max) * 100} color={C.red} delay={0.1 + i * 0.06} h={6} />
                          </div>
                        );
                      })}
                    </div>
                    {/* Meta stats */}
                    <div style={{ padding: '24px', background: C.bgCream }}>
                      <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 20 }}>Metadata</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {data.skillProfile.improvement != null && (
                          <div style={{ background: C.white, border: C.borderThin, padding: '16px', borderRadius: 12 }}>
                            <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 800 }}>Improvement Trend</div>
                            <div style={{ fontSize: 28, fontWeight: 900, color: data.skillProfile.improvement > 0 ? C.green : data.skillProfile.improvement < 0 ? C.red : C.ink, lineHeight: 1 }}>
                              {data.skillProfile.improvement > 0 ? '+' : ''}{data.skillProfile.improvement} <span style={{ fontSize: 12, color: C.ink }}>pts</span>
                            </div>
                          </div>
                        )}
                        {data.skillProfile.topCharacter && (
                          <div style={{ background: C.white, border: C.borderThin, padding: '16px', borderRadius: 12 }}>
                            <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 800 }}>Primary Opponent</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: C.ink }}>{CHAR_LABELS[data.skillProfile.topCharacter] ?? data.skillProfile.topCharacter}</div>
                          </div>
                        )}
                        <div style={{ background: C.white, border: C.borderThin, padding: '16px', borderRadius: 12 }}>
                          <div style={{ fontSize: 10, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6, fontWeight: 800 }}>Total Scored Msgs</div>
                          <div style={{ fontSize: 28, fontWeight: 900, color: C.ink, lineHeight: 1 }}>{data.skillProfile.totalScoredMessages}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ marginBottom: 24 }}>
                <Lock
                  title="Skill Profile Dossier"
                  desc="Upgrade to Premium to see your practice strengths, weak spots, improvement trends, and personalized coaching insights."
                />
              </div>
            )}
          </Reveal>

          {/* ── RECHARTS: SCORE TREND (Brutalist) ────────────────────── */}
          {scores.length >= 2 && (
            <Reveal delay={0.24}>
              <div style={{ background: C.white, border: C.border, borderRadius: 24, padding: 'clamp(20px,4vw,32px)', marginBottom: 24, boxShadow: C.shadow }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 8 }}>Score Trend</div>
                    <div style={{ fontSize: 14, color: '#555', fontWeight: 600 }}>Your conversation scores over time</div>
                  </div>
                </div>
                <div style={{ width: '100%', height: 240, background: C.bgCream, border: C.borderThin, borderRadius: 16, padding: '16px 16px 0 0' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data?.scoreHistory ?? []} margin={{ top: 5, right: 15, bottom: 5, left: -20 }}>
                      <CartesianGrid stroke={C.ink} strokeDasharray="3 3" opacity={0.15} vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#666', fontWeight: 700 }} axisLine={{ stroke: C.ink, strokeWidth: 2 }} tickLine={false} dy={10} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#666', fontWeight: 700 }} axisLine={false} tickLine={false} />
                      <RechartsTooltip
                        contentStyle={{ background: C.white, border: C.borderThin, borderRadius: 8, fontSize: 14, color: C.ink, fontWeight: 900, boxShadow: C.shadowSm }}
                        itemStyle={{ color: C.red }}
                        labelStyle={{ color: '#666', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' }}
                        formatter={(value: number) => [value.toFixed(1), 'Score']}
                      />
                      <Line type="monotone" dataKey="score" stroke={C.red} strokeWidth={4} dot={{ r: 5, fill: C.white, stroke: C.ink, strokeWidth: 2 }} activeDot={{ r: 7, fill: C.red, stroke: C.ink, strokeWidth: 2 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Reveal>
          )}

          {/* ── HISTORY TABS ─────────────────────────────────────────── */}
          <Reveal delay={0.26}>
            <div style={{ background: C.white, border: C.border, borderRadius: 24, overflow: 'hidden', marginBottom: 24, boxShadow: C.shadow }}>
              {/* Tab bar */}
              <div style={{ display: 'flex', borderBottom: C.borderThin, background: C.bgCream }}>
                {(['analyses', 'practice'] as const).map(t => (
                  <button key={t} onClick={() => setHistTab(t)}
                    style={{ flex: 1, padding: '18px', background: histTab === t ? C.white : 'transparent', border: 'none', borderRight: t === 'analyses' ? C.borderThin : 'none', color: C.ink, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.2s', fontFamily: "'DM Sans',sans-serif", borderBottom: histTab === t ? `4px solid ${C.red}` : '4px solid transparent' }}>
                    {t === 'analyses' ? 'Chat Analyses' : isPremium ? 'Practice Sessions' : '🔒 Practice'}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={histTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

                  {/* ANALYSES tab */}
                  {histTab === 'analyses' && (
                    <div>
                      {!data?.recentAnalyses.length ? (
                        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                          <div style={{ fontSize: 40, marginBottom: 16 }}>📱</div>
                          <div style={{ fontSize: 15, color: '#555', marginBottom: 24, fontWeight: 600 }}>No analyses logged yet.</div>
                          <Link href="/upload" style={{ textDecoration: 'none' }}>
                            <motion.button whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
                              style={{ background: C.ink, color: C.white, border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                              Analyze First Chat →
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
                            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderBottom: i < data.recentAnalyses.length - 1 ? C.borderThin : 'none', flexWrap: 'wrap' }}>
                            {/* Score bubble */}
                            <div style={{ width: 56, height: 56, borderRadius: 14, background: C.bgCream, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: C.shadowSm }}>
                              <span style={{ fontSize: 18, fontWeight: 900, color: scc, fontFamily: "'DM Sans',sans-serif" }}>{sc.toFixed(1)}</span>
                            </div>
                            
                            {/* Date */}
                            <div style={{ flex: '1 1 100px', minWidth: 80 }}>
                              <div style={{ fontSize: 14, fontWeight: 800, color: C.ink, marginBottom: 6 }}>
                                {dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                              <div style={{ fontSize: 12, color: '#666', fontWeight: 600 }}>{dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}</div>
                            </div>

                            {/* Metrics */}
                            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'center', background: C.bgCream, border: C.borderThin, padding: '8px 16px', borderRadius: 10 }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.ink }}>{a.interestLevel}%</div>
                                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 800 }}>Interest</div>
                              </div>
                              {a.attractionProbability != null && (
                                <div style={{ textAlign: 'center', background: C.bgCream, border: C.borderThin, padding: '8px 16px', borderRadius: 10 }}>
                                  <div style={{ fontSize: 16, fontWeight: 900, color: C.red }}>{a.attractionProbability}%</div>
                                  <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 800 }}>Attract</div>
                                </div>
                              )}
                              {a.missedOpportunities > 0 && (
                                <div style={{ textAlign: 'center', background: C.bgCream, border: C.borderThin, padding: '8px 16px', borderRadius: 10 }}>
                                  <div style={{ fontSize: 16, fontWeight: 900, color: C.blue }}>{a.missedOpportunities}</div>
                                  <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 800 }}>Missed</div>
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
                        <div style={{ padding: '40px 24px' }}>
                          <Lock
                            title="Practice History Locked"
                            desc="Premium members can track every practice session, see their improvement over time, and unlock their full skill profile."
                          />
                        </div>
                      ) : !data?.practiceSessions.length ? (
                        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
                          <div style={{ fontSize: 40, marginBottom: 16 }}>🎭</div>
                          <div style={{ fontSize: 15, color: '#555', marginBottom: 24, fontWeight: 600 }}>No practice sessions completed yet.</div>
                          <Link href="/practice" style={{ textDecoration: 'none' }}>
                            <motion.button whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
                              style={{ background: C.ink, color: C.white, border: 'none', borderRadius: 12, padding: '12px 24px', fontSize: 14, fontWeight: 900, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                              Start Practicing →
                            </motion.button>
                          </Link>
                        </div>
                      ) : data.practiceSessions.map((p, i) => {
                        const dc = { easy: C.green, normal: C.yellow, hard: C.red }[p.difficulty] ?? C.muted;
                        const ic = p.currentInterest >= 60 ? C.green : p.currentInterest >= 35 ? C.yellow : C.red;
                        const charLabel = CHAR_LABELS[p.characterType] ?? p.characterType;
                        return (
                          <motion.div key={p._id} className="hist-row"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                            style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px', borderBottom: i < data.practiceSessions.length - 1 ? C.borderThin : 'none', flexWrap: 'wrap' }}>
                            
                            <div style={{ width: 56, height: 56, borderRadius: 14, background: C.bgCream, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: C.shadowSm }}>🎭</div>
                            
                            <div style={{ flex: '1 1 140px', minWidth: 100 }}>
                              <div style={{ fontSize: 15, fontWeight: 900, color: C.ink, marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{charLabel}</div>
                              <span style={{ fontSize: 10, fontWeight: 900, padding: '4px 10px', borderRadius: 6, background: C.white, border: `1px solid #000`, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{p.difficulty}</span>
                            </div>

                            <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                              <div style={{ textAlign: 'center', background: C.bgCream, border: C.borderThin, padding: '8px 16px', borderRadius: 10 }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: C.blue }}>{p.messageCount}</div>
                                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 800 }}>Msgs</div>
                              </div>
                              <div style={{ textAlign: 'center', background: C.bgCream, border: C.borderThin, padding: '8px 16px', borderRadius: 10 }}>
                                <div style={{ fontSize: 16, fontWeight: 900, color: ic }}>{p.currentInterest}%</div>
                                <div style={{ fontSize: 9, color: '#555', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4, fontWeight: 800 }}>Interest</div>
                              </div>
                              <div style={{ fontSize: 12, color: '#666', fontWeight: 600, minWidth: 60, textAlign: 'right' }}>
                                {new Date(p.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
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
              <div style={{ background: C.red, border: C.border, borderRadius: 24, padding: 'clamp(24px,5vw,40px)', marginBottom: 24, position: 'relative', overflow: 'hidden', boxShadow: C.shadowLg }}>
                {/* Large background text */}
                <div style={{ position: 'absolute', right: -10, bottom: -20, fontSize: 140, fontWeight: 900, opacity: 0.1, color: C.ink, fontFamily: "'Bricolage Grotesque',sans-serif", lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>PRO</div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32, position: 'relative', zIndex: 1 }}>
                  <div style={{ flex: '1 1 300px' }}>
                    <div style={{ fontSize: 11, color: C.yellow, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 900, marginBottom: 12 }}>Upgrade to Premium</div>
                    <h3 style={{ fontSize: 'clamp(28px,5vw,42px)', fontWeight: 900, letterSpacing: '-0.03em', color: C.white, marginBottom: 20, fontFamily: "'DM Sans',sans-serif", lineHeight: 1.1 }}>
                      You're seeing 10%<br />of what we know.
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {[
                        { text: 'Unlimited chat analyses' },
                        { text: 'All 10 AI practice characters' },
                        { text: 'Full skill profile & improvement tracking' },
                        { text: 'Attraction signals, rewrites & missed moments' },
                      ].map((f, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 24, height: 24, borderRadius: '50%', background: C.white, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Check style={{ width: 14, height: 14, color: C.ink }} />
                          </div>
                          <span style={{ fontSize: 15, color: C.white, fontWeight: 700 }}>{f.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ flexShrink: 0, width: '100%', maxWidth: 280 }}>
                    <div style={{ background: C.white, border: C.border, borderRadius: 20, padding: '24px', textAlign: 'center', marginBottom: 16, boxShadow: C.shadow }}>
                      <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 12 }}>Launch Price</div>
                      <div style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 56, fontWeight: 900, color: C.ink, lineHeight: 1, letterSpacing: '-0.04em' }}>₹99</div>
                      <div style={{ fontSize: 13, color: '#666', marginBottom: 20, fontWeight: 600, marginTop: 8 }}>/month · cancel anytime</div>
                      <Link href="/upgrade" style={{ textDecoration: 'none' }}>
                        <motion.button whileHover={{ y: -3, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
                          style={{ width: '100%', background: C.yellow, color: C.ink, border: C.border, borderRadius: 12, padding: '16px 20px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                          Upgrade Now →
                        </motion.button>
                      </Link>
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', textAlign: 'center', fontWeight: 600 }}>No screenshots stored · Secure checkout</div>
                  </div>
                </div>
              </div>
            </Reveal>
          )}

          {/* ── RESET OWN DATA ─────────────────────────── */}
          <Reveal delay={0.34}>
            <div style={{ borderTop: C.border, paddingTop: 24, paddingBottom: 24 }}>
              <AnimatePresence mode="wait">
                {!resetConfirm ? (
                  <button onClick={() => setResetConfirm(true)} 
                    style={{ background: 'none', border: 'none', color: '#666', fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, transition: 'color 0.2s' }}>
                    <AlertTriangle style={{ width: 14, height: 14 }} /> Reset my data
                  </button>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: '#FFF0F0', border: C.borderThin, padding: '16px', borderRadius: 12 }}>
                    <span style={{ fontSize: 14, color: C.red, fontWeight: 700 }}>Delete all your analyses and practice sessions? Cannot be undone.</span>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <button onClick={() => { /* call API */ setResetConfirm(false); }}
                        style={{ background: C.red, border: C.borderThin, color: C.white, borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}>
                        Yes, delete
                      </button>
                      <button onClick={() => setResetConfirm(false)}
                        style={{ background: C.white, border: C.borderThin, color: C.ink, borderRadius: 8, padding: '10px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
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