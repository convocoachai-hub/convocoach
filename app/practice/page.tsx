'use client';

// app/practice/page.tsx — FULL REPLACEMENT
// Scenarios: Dating (M/F), Professional, Social, Reconnecting
// Premium-only logging with explicit consent
// Mobile-first, generous spacing

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
type ScenarioType = 'dating' | 'professional' | 'social' | 'reconnecting';
type GenderFilter = 'all' | 'female' | 'male' | 'neutral';
type DiffMode = 'easy' | 'normal' | 'hard';
type Step = 'scenario' | 'character' | 'consent' | 'diff' | 'chat';

interface Analysis {
  score: number; interestChange: number; momentumChange: number;
  whatWorked: string | null; whatFailed: string | null; tip: string; flags: string[];
}

interface Msg {
  id: string; role: 'user' | 'assistant'; content: string;
  analysis?: Analysis | null; timestamp: number;
}

interface SessionStats {
  interest: number; momentum: number; avgScore: number;
  msgCount: number; scores: number[]; interestHistory: number[];
}

// ─── Character data ────────────────────────────────────────────────────────────
const ALL_CHARS = [
  // DATING FEMALE
  {
    id: 'noa_selective',  name: 'Noa',   gender: 'female'  as const, scenario: 'dating'        as const,
    tag: 'The Selective One',    emoji: '🥶', color: '#A78BFA', colorDim: 'rgba(167,139,250,0.12)', colorBorder: 'rgba(167,139,250,0.22)',
    level: 'Medium', opening: 'hi',
    description: 'Gets 100+ texts daily. Responds only if you genuinely earn it. Will ghost without hesitation.',
    traits: ['Rarely responds', 'Rewards effort', 'Low tolerance for generic'],
  },
  {
    id: 'zara_banter',    name: 'Zara',  gender: 'female'  as const, scenario: 'dating'        as const,
    tag: 'The Banter Queen',     emoji: '💅', color: '#F472B6', colorDim: 'rgba(244,114,182,0.12)', colorBorder: 'rgba(244,114,182,0.22)',
    level: 'Hard', opening: 'oh. another text. state your purpose.',
    description: 'Sharp wit, zero tolerance for boring. Win the sparring match and she opens up.',
    traits: ['Heavy sarcasm', 'Tests everything', 'Rewards wit'],
  },
  {
    id: 'mia_warm',       name: 'Mia',   gender: 'female'  as const, scenario: 'dating'        as const,
    tag: 'The Warm Standard',    emoji: '🌿', color: '#34D399', colorDim: 'rgba(52,211,153,0.12)',  colorBorder: 'rgba(52,211,153,0.22)',
    level: 'Easy', opening: 'hey! how are you doing?',
    description: 'Warm, emotionally intelligent. Asks real questions — but notices if you stop listening.',
    traits: ['Good listener', 'Asks real questions', 'Notices everything'],
  },
  {
    id: 'rei_intellectual', name: 'Rei', gender: 'female'  as const, scenario: 'dating'        as const,
    tag: 'The Deep Thinker',     emoji: '🔭', color: '#38BDF8', colorDim: 'rgba(56,189,248,0.12)',  colorBorder: 'rgba(56,189,248,0.22)',
    level: 'Hard', opening: 'hey',
    description: 'Surface chat bores her physically. Say something real and she\'ll go deep fast.',
    traits: ['Ideas over small talk', 'Loves debate', 'No exclamation marks'],
  },
  {
    id: 'cass_ghost',     name: 'Cass',  gender: 'female'  as const, scenario: 'dating'        as const,
    tag: 'The Unreachable',      emoji: '👻', color: '#94A3B8', colorDim: 'rgba(148,163,184,0.12)', colorBorder: 'rgba(148,163,184,0.22)',
    level: 'Expert', opening: 'yeah',
    description: 'Always half-present. Impossible to hold. The less you try, the more you get.',
    traits: ['Ultra brief', 'Impossible to impress', 'Rare bursts of warmth'],
  },
  {
    id: 'liv_chaos',      name: 'Liv',   gender: 'female'  as const, scenario: 'dating'        as const,
    tag: 'The Chaos Agent',      emoji: '⚡', color: '#FB923C', colorDim: 'rgba(251,146,60,0.12)',  colorBorder: 'rgba(251,146,60,0.22)',
    level: 'Medium', opening: 'okayy who even are you',
    description: 'Burst texts, all caps for emphasis, completely unpredictable. Can sense stiffness instantly.',
    traits: ['Burst texter', 'All-caps energy', 'Match or be lost'],
  },
  // DATING MALE
  {
    id: 'leo_confident',  name: 'Leo',   gender: 'male'    as const, scenario: 'dating'        as const,
    tag: 'The Self-Assured',     emoji: '😎', color: '#6EE7B7', colorDim: 'rgba(110,231,183,0.12)', colorBorder: 'rgba(110,231,183,0.22)',
    level: 'Medium', opening: 'hey',
    description: 'Confident, knows his worth. Low investment until you earn genuine interest.',
    traits: ['Short responses', 'Dry humor', 'Not trying to impress'],
  },
  {
    id: 'ash_aloof',      name: 'Ash',   gender: 'male'    as const, scenario: 'dating'        as const,
    tag: 'The Low-Key',          emoji: '🌙', color: '#C4B5FD', colorDim: 'rgba(196,181,253,0.12)', colorBorder: 'rgba(196,181,253,0.22)',
    level: 'Hard', opening: 'yo',
    description: 'Hard to read. Genuinely curious about people but never shows cards first.',
    traits: ['Economical words', 'Dry observations', 'Occasional real warmth'],
  },
  {
    id: 'noah_playful',   name: 'Noah',  gender: 'male'    as const, scenario: 'dating'        as const,
    tag: 'The Fun Energy',       emoji: '🎯', color: '#FCD34D', colorDim: 'rgba(252,211,77,0.12)',  colorBorder: 'rgba(252,211,77,0.22)',
    level: 'Easy', opening: "ayy what's up",
    description: 'High energy, makes every conversation fun. Immediately knows when you\'re being stiff.',
    traits: ['Playful jabs', 'Fast responses', 'Escalates easily'],
  },
  // PROFESSIONAL
  {
    id: 'alex_tough_client', name: 'Alex', gender: 'neutral' as const, scenario: 'professional' as const,
    tag: 'The Demanding Client', emoji: '💼', color: '#F87171', colorDim: 'rgba(248,113,113,0.12)', colorBorder: 'rgba(248,113,113,0.22)',
    level: 'Hard', opening: 'What can I help you with?',
    description: 'Senior client. Has seen every pitch. Asks hard follow-up questions relentlessly.',
    traits: ['Cuts through BS', 'Demands specifics', 'High standards'],
  },
  {
    id: 'sam_interviewer', name: 'Sam',  gender: 'neutral' as const, scenario: 'professional' as const,
    tag: 'The Interviewer',      emoji: '📋', color: '#60A5FA', colorDim: 'rgba(96,165,250,0.12)',  colorBorder: 'rgba(96,165,250,0.22)',
    level: 'Medium', opening: 'Thanks for coming in. Tell me about yourself.',
    description: 'Analytical, fair interviewer. Probing follow-ups test every claim you make.',
    traits: ['Behavioral questions', 'Tests depth', 'Likes specific examples'],
  },
  {
    id: 'morgan_exec',    name: 'Morgan', gender: 'neutral' as const, scenario: 'professional' as const,
    tag: 'The Busy Executive',   emoji: '📱', color: '#FBBF24', colorDim: 'rgba(251,191,36,0.12)',  colorBorder: 'rgba(251,191,36,0.22)',
    level: 'Expert', opening: "Hey — what's up?",
    description: 'C-suite. Extremely protective of their time. Warm to driven people with clear asks.',
    traits: ['Time is precious', 'Needs clear agenda', 'Hates vague asks'],
  },
  // SOCIAL
  {
    id: 'jamie_new_friend', name: 'Jamie', gender: 'neutral' as const, scenario: 'social' as const,
    tag: 'The New Connection',   emoji: '✨', color: '#86EFAC', colorDim: 'rgba(134,239,172,0.12)', colorBorder: 'rgba(134,239,172,0.22)',
    level: 'Easy', opening: "hey! I think we met at the party?",
    description: 'Open, easy-going, genuinely curious. No pressure — just a good new connection.',
    traits: ['Warm', 'Curious', 'Easy to talk to'],
  },
  {
    id: 'river_reconnect', name: 'River', gender: 'neutral' as const, scenario: 'reconnecting' as const,
    tag: 'The Old Friend',       emoji: '🌊', color: '#FCA5A5', colorDim: 'rgba(252,165,165,0.12)', colorBorder: 'rgba(252,165,165,0.22)',
    level: 'Medium', opening: "Oh hey! It's been forever...",
    description: 'Someone from your past. Warm nostalgia mixed with slight distance — you\'ve both changed.',
    traits: ['Warm nostalgia', 'Some guardedness', 'Wants genuine reconnection'],
  },
];

const SCENARIOS = [
  { id: 'dating', label: 'Dating', emoji: '💘', description: 'Romantic interest — flirting, attraction, connection', color: '#F472B6', bg: 'rgba(244,114,182,0.1)' },
  { id: 'professional', label: 'Professional', emoji: '💼', description: 'Clients, interviews, networking, your boss', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' },
  { id: 'social', label: 'Social', emoji: '✨', description: 'New friends, social events, casual connections', color: '#86EFAC', bg: 'rgba(134,239,172,0.1)' },
  { id: 'reconnecting', label: 'Reconnecting', emoji: '🌊', description: 'Old friends, exes, people from your past', color: '#FCA5A5', bg: 'rgba(252,165,165,0.1)' },
];

const DIFFS = [
  { id: 'easy' as DiffMode,   label: 'Guided',      sub: 'Full AI coaching after every message', dots: 1, color: '#34D399' },
  { id: 'normal' as DiffMode, label: 'Realistic',   sub: 'Coaching at key moments only',         dots: 2, color: '#FBBF24' },
  { id: 'hard' as DiffMode,   label: 'Simulation',  sub: 'No hints. No coaching. Survive.',      dots: 3, color: '#F87171' },
];

const LEVEL_COLORS: Record<string, string> = {
  Easy: '#34D399', Medium: '#FBBF24', Hard: '#FB923C', Expert: '#F43F5E',
};

const POSITIVE_FLAGS = new Set([
  'good_hook','good_question','witty','specific','good_follow_up',
  'showed_personality','high_effort','deep_question','matched_energy','recovered_well',
]);

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
html{scroll-behavior:smooth;}
body{font-family:'DM Sans',sans-serif;background:#090912;color:#EDE8E1;-webkit-font-smoothing:antialiased;}
.briq{font-family:'Bricolage Grotesque',sans-serif;}
input,button,textarea{font-family:'DM Sans',sans-serif;}
button{cursor:pointer;}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
.ios-scroll{-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;}
@keyframes blink{0%,80%,100%{opacity:0.2}40%{opacity:1}}
.dot{width:7px;height:7px;border-radius:50%;background:rgba(237,232,225,0.35);display:inline-block;animation:blink 1.4s infinite both;}
.dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
@keyframes slideIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@media(hover:hover){
  .char-card:hover{border-color:rgba(255,255,255,0.18)!important;transform:translateY(-3px);box-shadow:0 12px 40px rgba(0,0,0,0.4)!important;}
  .diff-opt:hover{background:rgba(255,255,255,0.05)!important;}
  .scen-card:hover{border-color:rgba(255,255,255,0.2)!important;transform:translateY(-2px);}
  .send-btn:not(:disabled):hover{transform:scale(1.06);}
}
`;

// ─── Score Ring ────────────────────────────────────────────────────────────────
function ScoreRing({ score, size = 44, color }: { score: number; size?: number; color: string }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.23,1,0.32,1)' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform:`rotate(90deg)`, transformOrigin:`${size/2}px ${size/2}px`, fontSize:11, fontWeight:600, fill:color, fontFamily:'DM Sans' }}>
        {score}
      </text>
    </svg>
  );
}

// ─── STEP 1: Scenario ─────────────────────────────────────────────────────────
function StepScenario({ onNext }: { onNext: (s: ScenarioType) => void }) {
  const [sel, setSel] = useState<ScenarioType | null>(null);
  return (
    <div style={{ minHeight: '100svh', background: '#090912', padding: 'clamp(28px,5vw,60px) clamp(16px,4vw,28px) 60px' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }} style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(237,232,225,0.3)', marginBottom: 14 }}>
            Practice Mode — Step 1 of 3
          </div>
          <h1 className="briq" style={{ fontSize: 'clamp(32px,6vw,54px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 14 }}>
            What are you practicing?
          </h1>
          <p style={{ fontSize: 15, color: 'rgba(237,232,225,0.45)', lineHeight: 1.7, maxWidth: 460 }}>
            Choose the type of conversation. The AI characters adapt their behavior, expectations, and judgment accordingly.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap: 14, marginBottom: 32 }}>
          {SCENARIOS.map((sc, i) => {
            const active = sel === sc.id;
            return (
              <motion.div key={sc.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay: i*0.07 }}>
                <div className="scen-card" onClick={() => setSel(sc.id as ScenarioType)}
                  style={{ background: active ? sc.bg : 'rgba(255,255,255,0.025)', border: `1px solid ${active ? sc.color+'60' : 'rgba(255,255,255,0.08)'}`, borderRadius: 20, padding: 24, cursor: 'pointer', transition: 'all 0.22s', boxShadow: active ? `0 0 28px ${sc.color}18` : 'none', position: 'relative' }}>
                  {active && (
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:300 }}
                      style={{ position:'absolute', top:14, right:14, width:20, height:20, borderRadius:'50%', background:sc.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 5l2 2 4-4" stroke="#090912" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </motion.div>
                  )}
                  <div style={{ fontSize: 36, marginBottom: 14 }}>{sc.emoji}</div>
                  <div className="briq" style={{ fontSize: 20, fontWeight: 600, color: active ? sc.color : '#EDE8E1', marginBottom: 6, transition: 'color 0.2s' }}>{sc.label}</div>
                  <div style={{ fontSize: 13, color: 'rgba(237,232,225,0.45)', lineHeight: 1.6 }}>{sc.description}</div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.button onClick={() => sel && onNext(sel)} whileHover={sel ? { scale:1.02 } : {}} whileTap={sel ? { scale:0.97 } : {}}
          style={{ width:'100%', padding:'16px 24px', borderRadius:14, border:'none', fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:15, fontWeight:700, letterSpacing:'-0.01em', cursor: sel ? 'pointer' : 'not-allowed', transition:'all 0.25s', display:'flex', alignItems:'center', justifyContent:'center', gap:10, background: sel ? '#EDE8E1' : 'rgba(255,255,255,0.07)', color: sel ? '#090912' : 'rgba(237,232,225,0.3)' }}>
          Choose Character
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8.5 3.5l4.5 4.5-4.5 4.5" stroke={sel ? '#090912' : 'rgba(237,232,225,0.3)'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </div>
    </div>
  );
}

// ─── STEP 2: Character ────────────────────────────────────────────────────────
function StepCharacter({ scenario, onBack, onNext }: { scenario: ScenarioType; onBack: () => void; onNext: (c: typeof ALL_CHARS[number]) => void }) {
  const [gender, setGender] = useState<GenderFilter>('all');
  const filtered = ALL_CHARS.filter(c => c.scenario === scenario && (gender === 'all' || c.gender === gender));
  const sc = SCENARIOS.find(s => s.id === scenario)!;
  const hasGenders = ALL_CHARS.filter(c => c.scenario === scenario).some(c => c.gender !== 'neutral');

  return (
    <div style={{ minHeight: '100svh', background: '#090912', padding: 'clamp(24px,4vw,56px) clamp(16px,4vw,28px) 60px' }}>
      <style>{CSS}</style>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} style={{ marginBottom: 32 }}>
          <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'rgba(237,232,225,0.35)', fontSize:12, cursor:'pointer', padding:0, marginBottom:16, fontFamily:"'DM Sans',sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H2M5.5 3L2 7l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Back
          </button>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
            <span style={{ fontSize:28 }}>{sc.emoji}</span>
            <div>
              <div style={{ fontSize:10, color:'rgba(237,232,225,0.3)', textTransform:'uppercase', letterSpacing:'0.14em', fontWeight:700 }}>Step 2 of 3 · {sc.label}</div>
              <h1 className="briq" style={{ fontSize:'clamp(26px,5vw,42px)', fontWeight:700, letterSpacing:'-0.02em' }}>Choose your sparring partner.</h1>
            </div>
          </div>
        </motion.div>

        {/* Gender filter */}
        {hasGenders && (
          <div style={{ display:'flex', gap:8, marginBottom:24, flexWrap:'wrap' }}>
            {(['all','female','male','neutral'] as GenderFilter[]).map(g => (
              <button key={g} onClick={() => setGender(g)}
                style={{ padding:'7px 16px', borderRadius:20, border:`1px solid ${gender===g ? sc.color+'60' : 'rgba(255,255,255,0.1)'}`, background: gender===g ? `${sc.color}15` : 'transparent', color: gender===g ? sc.color : 'rgba(237,232,225,0.45)', fontSize:12, fontWeight:600, cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize', fontFamily:"'DM Sans',sans-serif" }}>
                {g === 'all' ? 'All' : g === 'neutral' ? 'Non-binary' : g === 'female' ? '♀ Female' : '♂ Male'}
              </button>
            ))}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,260px),1fr))', gap:12 }}>
          {filtered.map((c, i) => (
            <motion.div key={c.id} initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.055 }}>
              <div className="char-card" onClick={() => onNext(c)}
                style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:20, padding:'clamp(18px,3vw,24px)', cursor:'pointer', transition:'all 0.22s', position:'relative', overflow:'hidden', height:'100%', display:'flex', flexDirection:'column' }}>
                <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, background:c.color, borderRadius:'50%', opacity:0.04, pointerEvents:'none' }} />
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
                  <div style={{ width:50, height:50, borderRadius:16, background:c.colorDim, border:`1px solid ${c.colorBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>{c.emoji}</div>
                  <span style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:LEVEL_COLORS[c.level]??'#94A3B8', background:`${LEVEL_COLORS[c.level]??'#94A3B8'}18`, border:`1px solid ${LEVEL_COLORS[c.level]??'#94A3B8'}30`, padding:'4px 10px', borderRadius:999, flexShrink:0 }}>{c.level}</span>
                </div>
                <div className="briq" style={{ fontSize:20, fontWeight:600, marginBottom:3 }}>{c.name}</div>
                <div style={{ fontSize:11, fontWeight:700, color:c.color, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:12 }}>{c.tag}</div>
                <p style={{ fontSize:13, color:'rgba(237,232,225,0.45)', lineHeight:1.65, marginBottom:16, flex:1 }}>{c.description}</p>
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:18 }}>
                  {c.traits.map(t => (
                    <span key={t} style={{ fontSize:11, color:'rgba(237,232,225,0.35)', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', padding:'3px 9px', borderRadius:6 }}>{t}</span>
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, fontWeight:600, color:c.color }}>
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

// ─── STEP 3: Consent (premium only) ──────────────────────────────────────────
function StepConsent({ char, onBack, onNext }: { char: typeof ALL_CHARS[number]; onBack: () => void; onNext: (log: boolean) => void }) {
  return (
    <div style={{ minHeight:'100svh', background:'#090912', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(24px,4vw,48px) 16px' }}>
      <style>{CSS}</style>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:400, width:'100%' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'rgba(237,232,225,0.35)', fontSize:12, cursor:'pointer', padding:0, marginBottom:32, fontFamily:"'DM Sans',sans-serif" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H2M5.5 3L2 7l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>

        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:char.colorDim, border:`1px solid ${char.colorBorder}`, borderRadius:16, marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{char.emoji}</div>
          <div>
            <div className="briq" style={{ fontSize:18, fontWeight:700 }}>{char.name}</div>
            <div style={{ fontSize:11, color:char.color, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{char.tag}</div>
          </div>
        </div>

        <h2 className="briq" style={{ fontSize:'clamp(26px,5vw,36px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:10 }}>Log this session?</h2>
        <p style={{ fontSize:14, color:'rgba(237,232,225,0.45)', lineHeight:1.7, marginBottom:28 }}>
          As a Premium member, you can save your practice sessions to your dashboard to track improvement over time. This is entirely optional.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <motion.button onClick={() => onNext(true)} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            style={{ width:'100%', padding:'15px 20px', borderRadius:14, background:char.color, border:'none', color:'#09090D', fontSize:14, fontWeight:700, cursor:'pointer', fontFamily:"'Bricolage Grotesque',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:`0 8px 40px ${char.color}30` }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8.5 3.5l4.5 4.5L8.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Yes — log and track progress
          </motion.button>
          <motion.button onClick={() => onNext(false)} whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }}
            style={{ width:'100%', padding:'14px 20px', borderRadius:14, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(237,232,225,0.55)', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            No thanks — just practice without saving
          </motion.button>
        </div>

        <p style={{ fontSize:11, color:'rgba(237,232,225,0.25)', textAlign:'center', marginTop:16, lineHeight:1.6 }}>
          You can change this preference in your Dashboard settings at any time.
        </p>
      </motion.div>
    </div>
  );
}

// ─── STEP 4: Difficulty ────────────────────────────────────────────────────────
function StepDiff({ char, onBack, onStart }: { char: typeof ALL_CHARS[number]; onBack: () => void; onStart: (d: DiffMode) => void }) {
  const [picked, setPicked] = useState<DiffMode>('easy');
  return (
    <div style={{ minHeight:'100svh', background:'#090912', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(24px,4vw,48px) 16px' }}>
      <style>{CSS}</style>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:420, width:'100%' }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:6, background:'none', border:'none', color:'rgba(237,232,225,0.35)', fontSize:12, cursor:'pointer', padding:0, marginBottom:32, fontFamily:"'DM Sans',sans-serif" }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H2M5.5 3L2 7l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Back
        </button>
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:char.colorDim, border:`1px solid ${char.colorBorder}`, borderRadius:16, marginBottom:32 }}>
          <div style={{ width:48, height:48, borderRadius:14, background:'rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{char.emoji}</div>
          <div>
            <div className="briq" style={{ fontSize:18, fontWeight:700 }}>{char.name}</div>
            <div style={{ fontSize:11, color:char.color, fontWeight:600, letterSpacing:'0.05em', textTransform:'uppercase' }}>{char.tag}</div>
          </div>
        </div>
        <h2 className="briq" style={{ fontSize:'clamp(26px,5vw,36px)', fontWeight:700, letterSpacing:'-0.02em', marginBottom:8 }}>Set intensity.</h2>
        <p style={{ fontSize:14, color:'rgba(237,232,225,0.4)', lineHeight:1.65, marginBottom:24 }}>How much guidance do you want?</p>
        <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
          {DIFFS.map((d, i) => (
            <motion.div key={d.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}
              className="diff-opt" onClick={() => setPicked(d.id)}
              style={{ padding:'16px 18px', borderRadius:14, cursor:'pointer', transition:'all 0.18s', border:`1px solid ${picked===d.id ? d.color+'50' : 'rgba(255,255,255,0.07)'}`, background: picked===d.id ? `${d.color}0E` : 'rgba(255,255,255,0.01)', boxShadow: picked===d.id ? `0 0 24px ${d.color}12` : 'none' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                <span className="briq" style={{ fontSize:15, fontWeight:600, color: picked===d.id ? '#EDE8E1' : 'rgba(237,232,225,0.5)' }}>{d.label}</span>
                <div style={{ display:'flex', gap:4 }}>
                  {[1,2,3].map(n => <div key={n} style={{ width:7, height:7, borderRadius:'50%', background: n<=d.dots ? d.color : 'rgba(255,255,255,0.08)', transition:'background 0.2s' }} />)}
                </div>
              </div>
              <div style={{ fontSize:12, color:'rgba(237,232,225,0.35)' }}>{d.sub}</div>
            </motion.div>
          ))}
        </div>
        <motion.button whileTap={{ scale:0.97 }} onClick={() => onStart(picked)}
          style={{ width:'100%', padding:'16px 20px', borderRadius:14, background:char.color, border:'none', color:'#09090D', fontSize:15, fontWeight:700, fontFamily:"'Bricolage Grotesque',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:8, boxShadow:`0 8px 40px ${char.color}30`, letterSpacing:'-0.01em', cursor:'pointer' }}>
          Begin Session
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8.5 3.5l4.5 4.5L8.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── CHAT SCREEN ──────────────────────────────────────────────────────────────
function ChatScreen({ char, diff, logSession, onReset }: { char: typeof ALL_CHARS[number]; diff: DiffMode; logSession: boolean; onReset: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ id:'0', role:'assistant', content:char.opening, timestamp:Date.now() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string|null>(null);
  const [stats, setStats] = useState<SessionStats>({ interest:35, momentum:50, avgScore:0, msgCount:0, scores:[], interestHistory:[35] });
  const [lastAnalysis, setLastAnalysis] = useState<Analysis|null>(null);
  const [showStats, setShowStats] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, []);
  useEffect(() => { scrollBottom(); }, [msgs, loading, scrollBottom]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    const userMsg: Msg = { id: Date.now().toString(), role:'user', content:text, timestamp:Date.now() };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/practice', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          message: text,
          characterType: char.id, // <-- Changed to characterType
          difficulty: diff,
          sessionId: sessionId,
          logData: logSession,    // <-- Changed to logData
          history: msgs.slice(-18).map(m => ({ role:m.role, content:m.content })),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'API error');

      const analysis: Analysis|null = data.analysis ?? null;
      const aiMsg: Msg = { id:(Date.now()+1).toString(), role:'assistant', content:data.reply, analysis: diff!=='hard' ? analysis : null, timestamp:Date.now() };
      setMsgs(prev => [...prev, aiMsg]);

      if (!sessionId && data.sessionId) setSessionId(data.sessionId);

      if (analysis) {
        setLastAnalysis(analysis);
        setStats(prev => {
          const newCount  = prev.msgCount + 1;
          const newAvg    = (prev.avgScore * prev.msgCount + analysis.score) / newCount;
          const newInter  = Math.max(0, Math.min(100, prev.interest + analysis.interestChange));
          const newMom    = Math.max(0, Math.min(100, prev.momentum + analysis.momentumChange));
          return { interest:newInter, momentum:newMom, avgScore:newAvg, msgCount:newCount, scores:[...prev.scores, analysis.score], interestHistory:[...prev.interestHistory, newInter] };
        });
      }
    } catch (err) {
      console.error('[Chat]', err);
      setMsgs(prev => [...prev, { id:'err-'+Date.now(), role:'assistant', content:'Something went wrong. Try again.', timestamp:Date.now() }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  };

  const interestColor = stats.interest >= 60 ? '#34D399' : stats.interest >= 35 ? '#FBBF24' : '#F87171';
  const diffCfg = DIFFS.find(d => d.id === diff)!;
  const grade = stats.msgCount === 0 ? '—' : stats.avgScore >= 85 ? 'A+' : stats.avgScore >= 75 ? 'A' : stats.avgScore >= 65 ? 'B' : stats.avgScore >= 50 ? 'C' : stats.avgScore >= 35 ? 'D' : 'F';

  return (
    <>
      <style>{CSS}</style>
      <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, display:'flex', flexDirection:'column', background:'#090912', zIndex:1 }}>
        {/* Header */}
        <div style={{ flexShrink:0, height:62, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(9,9,18,0.95)', backdropFilter:'blur(16px)', display:'flex', alignItems:'center', padding:'0 14px', gap:10, zIndex:10 }}>
          <button onClick={onReset} style={{ width:36, height:36, borderRadius:11, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.08)', display:'flex', alignItems:'center', justifyContent:'center', color:'rgba(237,232,225,0.5)', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
          <div style={{ width:38, height:38, borderRadius:12, background:char.colorDim, border:`1px solid ${char.colorBorder}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{char.emoji}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="briq" style={{ fontSize:14, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{char.name}</div>
            <div style={{ fontSize:10, color:char.color, fontWeight:600, letterSpacing:'0.04em', textTransform:'uppercase' }}>{char.tag}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:999, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', flexShrink:0 }}>
            <div style={{ width:6, height:6, borderRadius:'50%', background:interestColor }} />
            <span style={{ fontSize:12, fontWeight:700, color:interestColor, fontVariantNumeric:'tabular-nums' }}>{Math.round(stats.interest)}</span>
          </div>
          <button onClick={() => setShowStats(s => !s)} style={{ padding:'6px 12px', borderRadius:10, background:showStats?`${char.color}20`:'rgba(255,255,255,0.04)', border:`1px solid ${showStats?char.colorBorder:'rgba(255,255,255,0.08)'}`, color: showStats?char.color:'rgba(237,232,225,0.55)', fontSize:12, fontWeight:600, display:'flex', alignItems:'center', gap:5, flexShrink:0, transition:'all 0.18s' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="7" width="2" height="4" rx="0.5" fill="currentColor"/><rect x="5" y="4" width="2" height="7" rx="0.5" fill="currentColor"/><rect x="9" y="1" width="2" height="10" rx="0.5" fill="currentColor"/></svg>
            {grade}
          </button>
        </div>

        {/* Stats panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              style={{ flexShrink:0, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(255,255,255,0.02)', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', display:'flex', flexWrap:'wrap', gap:20 }}>
                {[
                  { label:'Messages', val:stats.msgCount, color:'#EDE8E1' },
                  { label:'Avg Score', val: stats.msgCount>0?Math.round(stats.avgScore):0, color: stats.avgScore>=70?'#34D399':stats.avgScore>=50?'#FBBF24':'#F87171' },
                  { label:'Interest', val:Math.round(stats.interest), color:interestColor },
                  { label:'Momentum', val:Math.round(stats.momentum), color:char.color },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize:9, color:'rgba(237,232,225,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600, marginBottom:3 }}>{s.label}</div>
                    <div style={{ fontSize:20, fontWeight:700, color:s.color, lineHeight:1, fontVariantNumeric:'tabular-nums' }}>{s.val}</div>
                  </div>
                ))}
                {lastAnalysis?.tip && (
                  <div style={{ flex:'1 1 200px' }}>
                    <div style={{ fontSize:9, color:'rgba(237,232,225,0.35)', textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:600, marginBottom:3 }}>Coach Tip</div>
                    <div style={{ fontSize:12, color:'rgba(237,232,225,0.8)' }}>{lastAnalysis.tip}</div>
                  </div>
                )}
              </div>
              {lastAnalysis && lastAnalysis.flags.length > 0 && (
                <div style={{ paddingLeft:18, paddingBottom:12, display:'flex', flexWrap:'wrap', gap:5 }}>
                  {lastAnalysis.flags.map(f => (
                    <span key={f} style={{ fontSize:9, fontWeight:700, padding:'3px 8px', borderRadius:5, textTransform:'uppercase', letterSpacing:'0.06em', background: POSITIVE_FLAGS.has(f) ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)', color: POSITIVE_FLAGS.has(f) ? '#6EE7B7' : '#FCA5A5' }}>
                      {f.replace(/_/g,' ')}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="ios-scroll" style={{ flex:1, overflowY:'auto', padding:'clamp(16px,3vw,24px) clamp(14px,3vw,20px)', display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ textAlign:'center', marginBottom:18 }}>
            <span style={{ fontSize:11, fontWeight:600, color:'rgba(237,232,225,0.22)', background:'rgba(255,255,255,0.04)', padding:'4px 14px', borderRadius:999, textTransform:'uppercase', letterSpacing:'0.1em' }}>
              {char.name} · {char.tag}
              {logSession && ' · 📊 Logging'}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {msgs.map((m, i) => {
              const isUser = m.role === 'user';
              const nextSame = msgs[i+1]?.role === m.role;
              const isLast = !nextSame;
              return (
                <motion.div key={m.id} initial={{ opacity:0, y:10, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:0.25 }}
                  style={{ display:'flex', flexDirection:'column', alignItems: isUser?'flex-end':'flex-start', marginBottom: isLast?12:2 }}>
                  <div style={{ maxWidth:'min(80%,400px)', wordBreak:'break-word', padding:'clamp(10px,2vw,12px) clamp(12px,2vw,16px)', fontSize:'clamp(14px,3.5vw,15px)', lineHeight:1.55, borderRadius: isUser ? `18px 18px ${isLast?'5px':'18px'} 18px` : `18px 18px 18px ${isLast?'5px':'18px'}`, background: isUser ? `${char.color}22` : 'rgba(255,255,255,0.04)', border:`1px solid ${isUser?char.colorBorder:'rgba(255,255,255,0.07)'}`, color: isUser?'#EDE8E1':'rgba(237,232,225,0.85)' }}>
                    {m.content}
                  </div>
                  {isUser && m.analysis && diff!=='hard' && (
                    <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15 }} style={{ marginTop:4 }}>
                      <ScoreRing score={m.analysis.score} size={36} color={m.analysis.score>=70?'#34D399':m.analysis.score>=50?'#FBBF24':'#F87171'} />
                    </motion.div>
                  )}
                  {!isUser && m.analysis && diff==='easy' && m.analysis.tip && isLast && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} transition={{ delay:0.3 }}
                      style={{ marginTop:6, maxWidth:'min(80%,400px)', padding:'10px 13px', borderRadius:10, background:char.colorDim, border:`1px solid ${char.colorBorder}` }}>
                      <div style={{ fontSize:9, fontWeight:700, color:char.color, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3 }}>→ Next Move</div>
                      <div style={{ fontSize:'clamp(12px,3.2vw,13px)', color:'rgba(237,232,225,0.8)', lineHeight:1.5 }}>{m.analysis.tip}</div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', justifyContent:'flex-start', marginBottom:12 }}>
              <div style={{ padding:'12px 16px', borderRadius:'18px 18px 18px 5px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', display:'flex', gap:5, alignItems:'center' }}>
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} style={{ height:4 }} />
        </div>

        {/* Input */}
        <div style={{ flexShrink:0, borderTop:'1px solid rgba(255,255,255,0.06)', background:'rgba(9,9,18,0.97)', backdropFilter:'blur(16px)', padding:'clamp(10px,2vw,12px) clamp(12px,2vw,16px)', paddingBottom:'max(clamp(10px,2vw,12px),env(safe-area-inset-bottom))' }}>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder={ diff==='hard' ? 'No hints. Good luck.' : stats.msgCount===0 ? `Open strong with ${char.name}…` : 'Your move…' }
              style={{ flex:1, minWidth:0, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.09)', borderRadius:14, padding:'clamp(11px,2.5vw,13px) clamp(14px,3vw,16px)', fontSize:'clamp(14px,3.5vw,15px)', color:'#EDE8E1', outline:'none', transition:'border-color 0.2s', caretColor:char.color }}
              onFocus={e => { e.target.style.borderColor=`${char.color}60`; }}
              onBlur={e => { e.target.style.borderColor='rgba(255,255,255,0.09)'; }} />
            <button className="send-btn" onClick={send} disabled={!input.trim()||loading}
              style={{ width:'clamp(44px,10vw,48px)', height:'clamp(44px,10vw,48px)', borderRadius:13, flexShrink:0, background: input.trim()&&!loading?char.color:'rgba(255,255,255,0.05)', border:`1px solid ${input.trim()&&!loading?'transparent':'rgba(255,255,255,0.08)'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.18s', boxShadow: input.trim()&&!loading?`0 4px 24px ${char.color}40`:'none', cursor: input.trim()&&!loading?'pointer':'default' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8h12M8.5 3.5l4.5 4.5-4.5 4.5" stroke={input.trim()&&!loading?'#09090D':'rgba(237,232,225,0.2)'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:diffCfg.color }} />
              <span style={{ fontSize:11, color:'rgba(237,232,225,0.22)', fontWeight:500 }}>{diffCfg.label}{diff!=='hard'?' · Coach on':''}{logSession?' · Logged':''}</span>
            </div>
            {stats.msgCount > 0 && <span style={{ fontSize:11, color:'rgba(237,232,225,0.22)', fontWeight:500 }}>Avg {Math.round(stats.avgScore)}/100</span>}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>('scenario');
  const [scenario, setScenario] = useState<ScenarioType>('dating');
  const [char, setChar] = useState<typeof ALL_CHARS[number] | null>(null);
  const [diff, setDiff] = useState<DiffMode>('easy');
  const [logSession, setLogSession] = useState(false);

  const handleCharPick = (c: typeof ALL_CHARS[number]) => {
    setChar(c);
    // 🔥 FIXED: Always show the consent screen so logSession can be true!
    if (session?.user) {
      setStep('consent');
    } else {
      setLogSession(false);
      setStep('diff');
    }
  };

  const reset = () => { setStep('scenario'); setChar(null); setDiff('easy'); setLogSession(false); };

  return (
    <AnimatePresence mode="wait">
      {step === 'scenario' && (
        <motion.div key="scen" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
          <StepScenario onNext={s => { setScenario(s); setStep('character'); }} />
        </motion.div>
      )}
      {step === 'character' && (
        <motion.div key="char" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
          <StepCharacter scenario={scenario} onBack={() => setStep('scenario')} onNext={handleCharPick} />
        </motion.div>
      )}
      {step === 'consent' && char && (
        <motion.div key="cons" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
          <StepConsent char={char} onBack={() => setStep('character')} onNext={log => { setLogSession(log); setStep('diff'); }} />
        </motion.div>
      )}
      {step === 'diff' && char && (
        <motion.div key="diff" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
          <StepDiff char={char} onBack={() => setStep(session?.user ? 'consent' : 'character')} onStart={d => { setDiff(d); setStep('chat'); }} />
        </motion.div>
      )}
      {step === 'chat' && char && (
        <motion.div key="chat" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:0.2 }}>
          <ChatScreen char={char} diff={diff} logSession={logSession} onReset={reset} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}