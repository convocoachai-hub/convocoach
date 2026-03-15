'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getUserTier, isCharacterAvailable, isDifficultyAvailable, getPracticeMsgLimit, type UserTier } from '@/lib/premiumUtils';
import PremiumModal from '@/components/PremiumModal';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  cream: '#F3EDE2', ink: '#0F0C09', red: '#D13920',
  warm1: '#E8E0D2', warm2: '#D4CBBA', muted: '#8A8074', mutedLt: '#BFB8AC',
  amber: '#B87A10', green: '#2D8A4E', teal: '#3A7A8A',
};

// ─── TYPES (unchanged) ────────────────────────────────────────────────────────
type ScenarioType = 'dating' | 'professional' | 'social' | 'reconnecting';
type GenderFilter  = 'all' | 'female' | 'male' | 'neutral';
type DiffMode      = 'easy' | 'normal' | 'hard';
type Step          = 'scenario' | 'character' | 'consent' | 'diff' | 'chat';

interface Analysis {
  score: number; interestChange: number; momentumChange: number;
  vibeCheck: string; strengths: string[]; weaknesses: string[]; subtext: string; proMove: string; flags: string[];
}
interface Msg {
  id: string; role: 'user' | 'assistant'; content: string;
  analysis?: Analysis | null; timestamp: number;
}
interface SessionStats {
  interest: number; momentum: number; avgScore: number;
  msgCount: number; scores: number[]; interestHistory: number[];
}

// ─── DATA (unchanged) ────────────────────────────────────────────────────────
const ALL_CHARS = [
  { id:'noa_selective',    name:'Noa',    gender:'female'  as const, scenario:'dating'       as const, tag:'The Selective One',    emoji:'🥶', color:'#A06A9A', colorDim:'rgba(160,106,154,0.12)', colorBorder:'rgba(160,106,154,0.28)', level:'Medium', opening:'hi',                                   description:'Gets 100+ texts daily. Responds only if you genuinely earn it. Will ghost without hesitation.', traits:['Rarely responds','Rewards effort','Low tolerance for generic'] },
  { id:'zara_banter',      name:'Zara',   gender:'female'  as const, scenario:'dating'       as const, tag:'The Banter Queen',     emoji:'💅', color:C.red,     colorDim:`${C.red}12`,              colorBorder:`${C.red}30`,            level:'Hard',   opening:'oh. another text. state your purpose.', description:'Sharp wit, zero tolerance for boring. Win the sparring match and she opens up.',              traits:['Heavy sarcasm','Tests everything','Rewards wit'] },
  { id:'mia_warm',         name:'Mia',    gender:'female'  as const, scenario:'dating'       as const, tag:'The Warm Standard',    emoji:'🌿', color:C.green,   colorDim:'rgba(45,138,78,0.1)',      colorBorder:'rgba(45,138,78,0.25)',   level:'Easy',   opening:'hey! how are you doing?',               description:'Warm, emotionally intelligent. Asks real questions — but notices if you stop listening.',      traits:['Good listener','Asks real questions','Notices everything'] },
  { id:'rei_intellectual', name:'Rei',    gender:'female'  as const, scenario:'dating'       as const, tag:'The Deep Thinker',     emoji:'🔭', color:C.teal,    colorDim:'rgba(58,122,138,0.1)',     colorBorder:'rgba(58,122,138,0.25)', level:'Hard',   opening:'hey',                                   description:"Surface chat bores her physically. Say something real and she'll go deep fast.",              traits:['Ideas over small talk','Loves debate','No exclamation marks'] },
  { id:'cass_ghost',       name:'Cass',   gender:'female'  as const, scenario:'dating'       as const, tag:'The Unreachable',      emoji:'👻', color:C.muted,   colorDim:`${C.muted}14`,            colorBorder:`${C.muted}30`,          level:'Expert', opening:'yeah',                                  description:'Always half-present. Impossible to hold. The less you try, the more you get.',                traits:['Ultra brief','Impossible to impress','Rare bursts of warmth'] },
  { id:'liv_chaos',        name:'Liv',    gender:'female'  as const, scenario:'dating'       as const, tag:'The Chaos Agent',      emoji:'⚡', color:C.amber,   colorDim:`${C.amber}12`,            colorBorder:`${C.amber}30`,          level:'Medium', opening:'okayy who even are you',                description:'Burst texts, all caps for emphasis, completely unpredictable. Can sense stiffness instantly.', traits:['Burst texter','All-caps energy','Match or be lost'] },
  { id:'leo_confident',    name:'Leo',    gender:'male'    as const, scenario:'dating'       as const, tag:'The Self-Assured',     emoji:'😎', color:C.green,   colorDim:'rgba(45,138,78,0.1)',      colorBorder:'rgba(45,138,78,0.25)',   level:'Medium', opening:'hey',                                   description:"Confident, knows his worth. Low investment until you earn genuine interest.",                  traits:['Short responses','Dry humor','Not trying to impress'] },
  { id:'ash_aloof',        name:'Ash',    gender:'male'    as const, scenario:'dating'       as const, tag:'The Low-Key',          emoji:'🌙', color:'#7A6AA0', colorDim:'rgba(122,106,160,0.1)',    colorBorder:'rgba(122,106,160,0.25)',level:'Hard',   opening:'yo',                                    description:'Hard to read. Genuinely curious about people but never shows cards first.',                   traits:['Economical words','Dry observations','Occasional real warmth'] },
  { id:'noah_playful',     name:'Noah',   gender:'male'    as const, scenario:'dating'       as const, tag:'The Fun Energy',       emoji:'🎯', color:C.amber,   colorDim:`${C.amber}12`,            colorBorder:`${C.amber}30`,          level:'Easy',   opening:"ayy what's up",                         description:"High energy, makes every conversation fun. Immediately knows when you're being stiff.",        traits:['Playful jabs','Fast responses','Escalates easily'] },
  { id:'alex_tough_client',name:'Alex',   gender:'neutral' as const, scenario:'professional' as const, tag:'The Demanding Client', emoji:'💼', color:C.red,     colorDim:`${C.red}10`,              colorBorder:`${C.red}28`,            level:'Hard',   opening:'What can I help you with?',             description:'Senior client. Has seen every pitch. Asks hard follow-up questions relentlessly.',             traits:['Cuts through BS','Demands specifics','High standards'] },
  { id:'sam_interviewer',  name:'Sam',    gender:'neutral' as const, scenario:'professional' as const, tag:'The Interviewer',      emoji:'📋', color:C.teal,    colorDim:'rgba(58,122,138,0.1)',     colorBorder:'rgba(58,122,138,0.25)', level:'Medium', opening:'Thanks for coming in. Tell me about yourself.', description:'Analytical, fair interviewer. Probing follow-ups test every claim you make.',            traits:['Behavioral questions','Tests depth','Likes specific examples'] },
  { id:'morgan_exec',      name:'Morgan', gender:'neutral' as const, scenario:'professional' as const, tag:'The Busy Executive',   emoji:'📱', color:C.amber,   colorDim:`${C.amber}10`,            colorBorder:`${C.amber}28`,          level:'Expert', opening:"Hey — what's up?",                       description:'C-suite. Extremely protective of their time. Warm to driven people with clear asks.',         traits:['Time is precious','Needs clear agenda','Hates vague asks'] },
  { id:'jamie_new_friend', name:'Jamie',  gender:'neutral' as const, scenario:'social'       as const, tag:'The New Connection',   emoji:'✨', color:C.green,   colorDim:'rgba(45,138,78,0.1)',      colorBorder:'rgba(45,138,78,0.25)',   level:'Easy',   opening:"hey! I think we met at the party?",     description:'Open, easy-going, genuinely curious. No pressure — just a good new connection.',               traits:['Warm','Curious','Easy to talk to'] },
  { id:'river_reconnect',  name:'River',  gender:'neutral' as const, scenario:'reconnecting' as const, tag:'The Old Friend',       emoji:'🌊', color:'#A0426E', colorDim:'rgba(160,66,110,0.1)',     colorBorder:'rgba(160,66,110,0.25)',  level:'Medium', opening:"Oh hey! It's been forever...",           description:"Someone from your past. Warm nostalgia mixed with slight distance — you've both changed.",     traits:['Warm nostalgia','Some guardedness','Wants genuine reconnection'] },
];

const SCENARIOS = [
  { id:'dating',        label:'Dating',        emoji:'💘', description:'Romantic interest — flirting, attraction, connection', color:C.red,   bg:`${C.red}10`              },
  { id:'professional',  label:'Professional',  emoji:'💼', description:'Clients, interviews, networking, your boss',         color:C.teal,  bg:'rgba(58,122,138,0.1)'    },
  { id:'social',        label:'Social',        emoji:'✨', description:'New friends, social events, casual connections',     color:C.green, bg:'rgba(45,138,78,0.1)'     },
  { id:'reconnecting',  label:'Reconnecting',  emoji:'🌊', description:'Old friends, exes, people from your past',          color:'#A0426E',bg:'rgba(160,66,110,0.1)'   },
];

const DIFFS = [
  { id:'easy'   as DiffMode, label:'Guided',     sub:'Full AI coaching after every message', dots:1, color:C.green },
  { id:'normal' as DiffMode, label:'Realistic',  sub:'Coaching at key moments only',         dots:2, color:C.amber },
  { id:'hard'   as DiffMode, label:'Simulation', sub:'No hints. No coaching. Survive.',      dots:3, color:C.red   },
];

const LEVEL_COLORS: Record<string,string> = { Easy:C.green, Medium:C.amber, Hard:C.red, Expert:'#8B0000' };
const POSITIVE_FLAGS = new Set(['good_hook','good_question','witty','specific','good_follow_up','showed_personality','high_effort','deep_question','matched_energy','recovered_well']);

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const LABEL: React.CSSProperties = { fontSize:11, fontWeight:800, letterSpacing:'0.14em', textTransform:'uppercase', fontFamily:'monospace', color:C.red, display:'block', marginBottom:16 };

function BackBtn({ onClick, light = false }: { onClick: () => void; light?: boolean }) {
  return (
    <button onClick={onClick} style={{ display:'inline-flex', alignItems:'center', gap:7, background:'none', border:'none', color:light?`${C.cream}50`:C.muted, fontSize:13, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", padding:'0 0 22px 0', fontWeight:600 }}>
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H2M5.5 3L2 7l3.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      Back
    </button>
  );
}

function ScoreRing({ score, size=44, color }: { score:number; size?:number; color:string }) {
  const r = size/2-5; const circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(243,237,226,0.1)" strokeWidth="3"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="3"
        strokeDasharray={circ} strokeDashoffset={circ-(score/100)*circ} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 0.8s cubic-bezier(0.23,1,0.32,1)' }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform:`rotate(90deg)`, transformOrigin:`${size/2}px ${size/2}px`, fontSize:10, fontWeight:700, fill:color, fontFamily:'monospace' }}>
        {score}
      </text>
    </svg>
  );
}

// ─── STEP 1: SCENARIO ─────────────────────────────────────────────────────────
function StepScenario({ onNext }: { onNext:(s:ScenarioType)=>void }) {
  const [sel, setSel] = useState<ScenarioType|null>(null);
  return (
    <div style={{ minHeight:'100svh', background:C.cream, fontFamily:"'DM Sans',sans-serif", padding:'clamp(36px,5vw,72px) clamp(20px,4vw,32px) 80px' }}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>
        <Link href="/" style={{ display:'inline-flex', alignItems:'center', gap:7, color:C.muted, fontSize:13, textDecoration:'none', marginBottom:36, fontWeight:600 }}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M10 7H2M5.5 3L2 7l3.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Home
        </Link>

        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.16,1,0.3,1] }}>
          <span style={LABEL}>Practice Mode — Step 1 of 3</span>
          <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(40px,6vw,68px)', fontWeight:900, lineHeight:1.0, letterSpacing:'-0.04em', color:C.ink, margin:'0 0 16px' }}>
            What are you<br /><em style={{ fontStyle:'italic', color:C.red, fontFamily:'Georgia,serif', fontWeight:400 }}>practicing?</em>
          </h1>
          <p style={{ fontSize:15.5, color:C.muted, lineHeight:1.75, maxWidth:440, margin:'0 0 40px' }}>
            The AI adapts its behavior, expectations, and judgment based on the type of conversation you choose.
          </p>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,290px),1fr))', gap:12, marginBottom:32 }}>
          {SCENARIOS.map((sc, i) => {
            const active = sel === sc.id;
            return (
              <motion.div key={sc.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07, duration:0.55, ease:[0.16,1,0.3,1] }}>
                <motion.div whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }} onClick={() => setSel(sc.id as ScenarioType)}
                  style={{ background:active?sc.bg:C.cream, border:`1.5px solid ${active?sc.color+'50':C.warm2}`, borderRadius:20, padding:'22px 22px', cursor:'pointer', transition:'border-color 0.2s, background 0.2s', boxShadow:active?`0 8px 32px ${sc.color}14`:'0 2px 8px rgba(15,12,9,0.04)', position:'relative' }}>
                  {active && (
                    <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ type:'spring', stiffness:320 }}
                      style={{ position:'absolute', top:14, right:14, width:18, height:18, borderRadius:'50%', background:sc.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M2 4.5l1.8 1.8L7 2" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </motion.div>
                  )}
                  <span style={{ fontSize:32, display:'block', marginBottom:14 }}>{sc.emoji}</span>
                  <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:19, fontWeight:800, color:active?sc.color:C.ink, marginBottom:6, transition:'color 0.2s', letterSpacing:'-0.01em' }}>{sc.label}</div>
                  <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, margin:0 }}>{sc.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.button onClick={() => sel && onNext(sel)} whileHover={sel?{scale:1.015}:{}} whileTap={sel?{scale:0.985}:{}}
          style={{ width:'100%', padding:'17px 24px', borderRadius:14, border:'none', fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:16, fontWeight:800, cursor:sel?'pointer':'default', transition:'all 0.25s', display:'flex', alignItems:'center', justifyContent:'center', gap:12, background:sel?C.ink:C.warm1, color:sel?C.cream:C.mutedLt, letterSpacing:'-0.01em' }}>
          Choose Character
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8h12M8.5 3.5l4.5 4.5-4.5 4.5" stroke={sel?C.cream:C.mutedLt} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </div>
    </div>
  );
}

// ─── STEP 2: CHARACTER ────────────────────────────────────────────────────────
function StepCharacter({ scenario, onBack, onNext, userTier }: { scenario:ScenarioType; onBack:()=>void; onNext:(c:typeof ALL_CHARS[number])=>void; userTier:UserTier }) {
  const [gender, setGender] = useState<GenderFilter>('all');
  const filtered = ALL_CHARS.filter(c => c.scenario===scenario && (gender==='all'||c.gender===gender));
  const sc = SCENARIOS.find(s => s.id===scenario)!;
  const hasGenders = ALL_CHARS.filter(c => c.scenario===scenario).some(c => c.gender!=='neutral');

  return (
    <div style={{ minHeight:'100svh', background:C.cream, fontFamily:"'DM Sans',sans-serif", padding:'clamp(32px,4vw,60px) clamp(20px,4vw,32px) 80px' }}>
      <div style={{ maxWidth:900, margin:'0 auto' }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease:[0.16,1,0.3,1] }}>
          <BackBtn onClick={onBack} />
          <span style={LABEL}>Step 2 of 3 · {sc.label}</span>
          <h1 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(36px,5.5vw,60px)', fontWeight:900, lineHeight:1.0, letterSpacing:'-0.04em', color:C.ink, margin:'0 0 14px' }}>
            Choose your<br /><em style={{ fontStyle:'italic', color:sc.color, fontFamily:'Georgia,serif', fontWeight:400 }}>sparring partner.</em>
          </h1>
          <p style={{ fontSize:15, color:C.muted, lineHeight:1.75, margin:'0 0 32px', maxWidth:460 }}>
            Each character has distinct texting behavior, patience levels, and triggers. Pick your challenge.
          </p>
        </motion.div>

        {hasGenders && (
          <div style={{ display:'flex', gap:7, marginBottom:28, flexWrap:'wrap' }}>
            {(['all','female','male','neutral'] as GenderFilter[]).map(g => (
              <button key={g} onClick={() => setGender(g)}
                style={{ padding:'7px 16px', borderRadius:999, border:`1.5px solid ${gender===g?`${sc.color}50`:C.warm2}`, background:gender===g?`${sc.color}10`:C.cream, color:gender===g?sc.color:C.muted, fontSize:12, fontWeight:700, cursor:'pointer', transition:'all 0.18s', textTransform:'capitalize', fontFamily:"'DM Sans',sans-serif" }}>
                {g==='all'?'All':g==='neutral'?'Non-binary':g==='female'?'♀ Female':'♂ Male'}
              </button>
            ))}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,265px),1fr))', gap:12 }}>
          {filtered.map((char, i) => {
            const locked = !isCharacterAvailable(char.id, userTier);
            return (
            <motion.div key={char.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05, duration:0.5, ease:[0.16,1,0.3,1] }}>
              <motion.div whileHover={locked?{}:{ scale:1.025, y:-3, boxShadow:`0 12px 40px ${char.color}18` }} whileTap={locked?{}:{ scale:0.98 }} onClick={() => !locked && onNext(char)}
                style={{ background:locked?`${C.warm1}80`:C.cream, border:`1.5px solid ${C.warm2}`, borderRadius:20, padding:'clamp(18px,3vw,24px)', cursor:locked?'not-allowed':'pointer', transition:'border-color 0.2s', height:'100%', display:'flex', flexDirection:'column', boxShadow:'0 2px 8px rgba(15,12,9,0.04)', position:'relative', overflow:'hidden', opacity:locked?0.55:1 }}>
                {/* Top accent bar */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:`linear-gradient(to right, transparent, ${char.color}60, transparent)` }} />

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div style={{ width:48, height:48, borderRadius:14, background:`${char.color}14`, border:`1.5px solid ${char.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>{char.emoji}</div>
                  <span style={{ fontSize:10, fontWeight:800, letterSpacing:'0.1em', textTransform:'uppercase', color:LEVEL_COLORS[char.level]??C.muted, background:`${LEVEL_COLORS[char.level]??C.muted}14`, border:`1px solid ${LEVEL_COLORS[char.level]??C.muted}30`, padding:'3px 9px', borderRadius:999, flexShrink:0, fontFamily:'monospace' }}>{char.level}</span>
                </div>

                <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:20, fontWeight:800, color:C.ink, marginBottom:2, letterSpacing:'-0.01em' }}>{char.name}</div>
                <div style={{ fontSize:10.5, fontWeight:800, color:char.color, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12, fontFamily:'monospace' }}>{char.tag}</div>
                <p style={{ fontSize:13, color:C.muted, lineHeight:1.65, marginBottom:16, flex:1 }}>{char.description}</p>

                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:18 }}>
                  {char.traits.map(t => (
                    <span key={t} style={{ fontSize:11, color:C.muted, background:C.warm1, border:`1px solid ${C.warm2}`, padding:'3px 9px', borderRadius:6, fontFamily:"'DM Sans',sans-serif" }}>{t}</span>
                  ))}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12.5, fontWeight:700, color:locked?C.muted:char.color, fontFamily:"'Bricolage Grotesque',sans-serif" }}>
                  {locked ? (
                    <><span style={{ fontSize:13 }}>🔒</span> {userTier === 'anonymous' ? 'Sign up to unlock' : 'Premium only'}</>
                  ) : (
                    <>Start practice <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M6.5 2l3.5 4-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></>
                  )}
                </div>
              </motion.div>
            </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── STEP 3: CONSENT ─────────────────────────────────────────────────────────
function StepConsent({ char, onBack, onNext }: { char:typeof ALL_CHARS[number]; onBack:()=>void; onNext:(log:boolean)=>void }) {
  return (
    <div style={{ minHeight:'100svh', background:C.cream, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(28px,4vw,52px) 20px' }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease:[0.16,1,0.3,1] }} style={{ maxWidth:420, width:'100%' }}>
        <BackBtn onClick={onBack} />

        {/* Character card */}
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:`${char.color}10`, border:`1.5px solid ${char.color}30`, borderRadius:16, marginBottom:36 }}>
          <div style={{ width:46, height:46, borderRadius:13, background:`${char.color}18`, border:`1.5px solid ${char.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{char.emoji}</div>
          <div>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:18, fontWeight:800, color:C.ink, letterSpacing:'-0.01em' }}>{char.name}</div>
            <div style={{ fontSize:10.5, color:char.color, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'monospace' }}>{char.tag}</div>
          </div>
        </div>

        <span style={LABEL}>Step 3 of 3</span>
        <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(32px,5.5vw,48px)', fontWeight:900, letterSpacing:'-0.04em', color:C.ink, margin:'0 0 14px', lineHeight:1.0 }}>
          Log this session?
        </h2>
        <p style={{ fontSize:15, color:C.muted, lineHeight:1.75, margin:'0 0 32px' }}>
          As a Premium member, you can save practice sessions to track improvement over time. Entirely optional.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <motion.button onClick={() => onNext(true)} whileHover={{ scale:1.02, boxShadow:`0 10px 36px ${char.color}30` }} whileTap={{ scale:0.97 }}
            style={{ width:'100%', padding:'16px 20px', borderRadius:14, background:char.color, border:'none', color:'#fff', fontSize:15, fontWeight:800, cursor:'pointer', fontFamily:"'Bricolage Grotesque',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:9, letterSpacing:'-0.01em' }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2 7.5h11M8.5 3.5l4 4-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Yes — log and track progress
          </motion.button>
          <motion.button onClick={() => onNext(false)} whileHover={{ scale:1.015 }} whileTap={{ scale:0.98 }}
            style={{ width:'100%', padding:'15px 20px', borderRadius:14, background:'none', border:`1.5px solid ${C.warm2}`, color:C.muted, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
            No thanks — just practice without saving
          </motion.button>
        </div>
        <p style={{ fontSize:11, color:C.mutedLt, textAlign:'center', marginTop:14, lineHeight:1.65, fontFamily:'monospace' }}>
          Change this anytime in Dashboard settings.
        </p>
      </motion.div>
    </div>
  );
}

// ─── STEP 4: DIFFICULTY ───────────────────────────────────────────────────────
function StepDiff({ char, onBack, onStart, userTier }: { char:typeof ALL_CHARS[number]; onBack:()=>void; onStart:(d:DiffMode)=>void; userTier:UserTier }) {
  const [picked, setPicked] = useState<DiffMode>('easy');
  return (
    <div style={{ minHeight:'100svh', background:C.cream, fontFamily:"'DM Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(28px,4vw,52px) 20px' }}>
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.55, ease:[0.16,1,0.3,1] }} style={{ maxWidth:420, width:'100%' }}>
        <BackBtn onClick={onBack} />

        <div style={{ display:'flex', alignItems:'center', gap:14, padding:'16px 18px', background:`${char.color}10`, border:`1.5px solid ${char.color}30`, borderRadius:16, marginBottom:36 }}>
          <div style={{ width:46, height:46, borderRadius:13, background:`${char.color}18`, border:`1.5px solid ${char.color}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0 }}>{char.emoji}</div>
          <div>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:18, fontWeight:800, color:C.ink, letterSpacing:'-0.01em' }}>{char.name}</div>
            <div style={{ fontSize:10.5, color:char.color, fontWeight:800, letterSpacing:'0.06em', textTransform:'uppercase', fontFamily:'monospace' }}>{char.tag}</div>
          </div>
        </div>

        <span style={LABEL}>Set intensity</span>
        <h2 style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:'clamp(32px,5.5vw,48px)', fontWeight:900, letterSpacing:'-0.04em', color:C.ink, margin:'0 0 10px', lineHeight:1.0 }}>
          How much<br /><em style={{ fontStyle:'italic', color:C.red, fontFamily:'Georgia,serif', fontWeight:400 }}>guidance?</em>
        </h2>
        <p style={{ fontSize:15, color:C.muted, lineHeight:1.75, margin:'0 0 28px' }}>More guidance = more learning. Less = more realistic.</p>

        <div style={{ display:'flex', flexDirection:'column', gap:9, marginBottom:28 }}>
          {DIFFS.map((d, i) => {
            const diffLocked = !isDifficultyAvailable(d.id, userTier);
            return (
            <motion.div key={d.id} initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07, duration:0.5, ease:[0.16,1,0.3,1] }}
              onClick={() => !diffLocked && setPicked(d.id)}
              style={{ padding:'16px 18px', borderRadius:14, cursor:diffLocked?'not-allowed':'pointer', transition:'all 0.18s', border:`1.5px solid ${picked===d.id&&!diffLocked?`${d.color}50`:C.warm2}`, background:picked===d.id&&!diffLocked?`${d.color}08`:C.cream, boxShadow:picked===d.id&&!diffLocked?`0 4px 20px ${d.color}12`:'none', opacity:diffLocked?0.5:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:5 }}>
                <span style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:15, fontWeight:800, color:picked===d.id?C.ink:C.muted, letterSpacing:'-0.01em', transition:'color 0.15s' }}>{d.label}</span>
                <div style={{ display:'flex', gap:4 }}>
                  {[1,2,3].map(n => <div key={n} style={{ width:7, height:7, borderRadius:'50%', background:n<=d.dots?d.color:C.warm2, transition:'background 0.2s' }} />)}
                </div>
              </div>
              <div style={{ fontSize:12.5, color:C.muted }}>{d.sub}{diffLocked ? ' 🔒' : ''}</div>
            </motion.div>
            );
          })}
        </div>

        <motion.button whileHover={{ scale:1.02, boxShadow:`0 10px 36px ${char.color}30` }} whileTap={{ scale:0.97 }} onClick={() => onStart(picked)}
          style={{ width:'100%', padding:'17px 20px', borderRadius:14, background:char.color, border:'none', color:'#fff', fontSize:16, fontWeight:800, fontFamily:"'Bricolage Grotesque',sans-serif", display:'flex', alignItems:'center', justifyContent:'center', gap:9, cursor:'pointer', letterSpacing:'-0.01em' }}>
          Begin Session
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M8.5 3.5l4.5 4.5L8.5 12.5" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </motion.button>
      </motion.div>
    </div>
  );
}

// ─── CHAT SCREEN ──────────────────────────────────────────────────────────────
function ChatScreen({ char, diff, logSession, onReset, userTier }: { char:typeof ALL_CHARS[number]; diff:DiffMode; logSession:boolean; onReset:()=>void; userTier:UserTier }) {
  const [msgs, setMsgs] = useState<Msg[]>([{ id:'0', role:'assistant', content:char.opening, timestamp:Date.now() }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string|null>(null);
  const [stats, setStats] = useState<SessionStats>({ interest:35, momentum:50, avgScore:0, msgCount:0, scores:[], interestHistory:[35] });
  const [lastAnalysis, setLastAnalysis] = useState<Analysis|null>(null);
  const [showStats, setShowStats] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const msgLimit = getPracticeMsgLimit(userTier);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollBottom = useCallback(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, []);
  useEffect(() => { scrollBottom(); }, [msgs, loading, scrollBottom]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    // Enforce message limit
    if (stats.msgCount >= msgLimit) {
      setShowPremiumModal(true);
      return;
    }
    setInput('');
    const userMsg: Msg = { id:Date.now().toString(), role:'user', content:text, timestamp:Date.now() };
    setMsgs(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await fetch('/api/practice', {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ message:text, characterType:char.id, difficulty:diff, sessionId, logData:logSession, history:msgs.slice(-18).map(m=>({role:m.role,content:m.content})) }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error||'API error');
      const analysis: Analysis|null = data.analysis ?? null;
      const aiMsg: Msg = { id:(Date.now()+1).toString(), role:'assistant', content:data.reply, analysis:diff!=='hard'?analysis:null, timestamp:Date.now() };
      setMsgs(prev => [...prev, aiMsg]);
      if (!sessionId && data.sessionId) setSessionId(data.sessionId);
      if (analysis) {
        setLastAnalysis(analysis);
        setStats(prev => {
          const newCount = prev.msgCount+1;
          const newAvg = (prev.avgScore*prev.msgCount+analysis.score)/newCount;
          const newInter = Math.max(0,Math.min(100,prev.interest+analysis.interestChange));
          const newMom = Math.max(0,Math.min(100,prev.momentum+analysis.momentumChange));
          return { interest:newInter, momentum:newMom, avgScore:newAvg, msgCount:newCount, scores:[...prev.scores,analysis.score], interestHistory:[...prev.interestHistory,newInter] };
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

  const interestColor = stats.interest>=60?C.green:stats.interest>=35?C.amber:C.red;
  const diffCfg = DIFFS.find(d=>d.id===diff)!;
  const grade = stats.msgCount===0?'—':stats.avgScore>=85?'A+':stats.avgScore>=75?'A':stats.avgScore>=65?'B':stats.avgScore>=50?'C':stats.avgScore>=35?'D':'F';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:rgba(243,237,226,0.12);border-radius:99px;}
        .ios-scroll{-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;}
        @keyframes blink{0%,80%,100%{opacity:0.25}40%{opacity:1}}
        .dot{width:6px;height:6px;border-radius:50%;background:rgba(243,237,226,0.4);display:inline-block;animation:blink 1.4s infinite both;}
        .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
        .msg-input:focus{outline:none;}
      `}</style>

      <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, display:'flex', flexDirection:'column', background:C.ink, zIndex:1 }}>

        {/* ── Header ── */}
        <div style={{ flexShrink:0, height:62, borderBottom:`1px solid rgba(243,237,226,0.07)`, background:`${C.ink}F8`, backdropFilter:'blur(20px)', display:'flex', alignItems:'center', padding:'0 14px', gap:10, zIndex:10 }}>
          <motion.button whileTap={{ scale:0.92 }} onClick={onReset}
            style={{ width:36, height:36, borderRadius:10, background:'rgba(243,237,226,0.06)', border:`1px solid rgba(243,237,226,0.1)`, display:'flex', alignItems:'center', justifyContent:'center', color:`${C.cream}55`, flexShrink:0, cursor:'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M9 2L4 6.5 9 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>

          {/* Avatar */}
          <div style={{ width:36, height:36, borderRadius:11, background:`${char.color}18`, border:`1.5px solid ${char.color}35`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}>{char.emoji}</div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:14, fontWeight:800, color:C.cream, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.01em' }}>{char.name}</div>
            <div style={{ fontSize:10, color:char.color, fontWeight:700, letterSpacing:'0.07em', textTransform:'uppercase', fontFamily:'monospace' }}>{char.tag}</div>
          </div>

          {/* Interest meter */}
          <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:999, background:'rgba(243,237,226,0.05)', border:`1px solid rgba(243,237,226,0.1)`, flexShrink:0 }}>
            <motion.span style={{ width:6, height:6, borderRadius:'50%', background:interestColor, display:'block' }}
              animate={{ opacity:[1,0.4,1] }} transition={{ type:'tween', duration:2, repeat:Infinity, ease:'easeInOut' }} />
            <span style={{ fontSize:12, fontWeight:800, color:interestColor, fontVariantNumeric:'tabular-nums', fontFamily:'monospace' }}>{Math.round(stats.interest)}</span>
          </div>

          {/* Stats toggle */}
          <motion.button whileTap={{ scale:0.94 }} onClick={() => setShowStats(s=>!s)}
            style={{ padding:'6px 11px', borderRadius:9, background:showStats?`${char.color}20`:'rgba(243,237,226,0.05)', border:`1px solid ${showStats?`${char.color}40`:'rgba(243,237,226,0.1)'}`, color:showStats?char.color:`${C.cream}50`, fontSize:13, fontWeight:800, display:'flex', alignItems:'center', gap:5, flexShrink:0, transition:'all 0.18s', cursor:'pointer', fontFamily:'monospace' }}>
            <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><rect x="0.5" y="6.5" width="2" height="4" rx="0.4" fill="currentColor"/><rect x="4.5" y="3.5" width="2" height="7" rx="0.4" fill="currentColor"/><rect x="8.5" y="0.5" width="2" height="10" rx="0.4" fill="currentColor"/></svg>
            {grade}
          </motion.button>
        </div>

        {/* ── Stats panel ── */}
        <AnimatePresence>
          {showStats && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
              style={{ flexShrink:0, borderBottom:`1px solid rgba(243,237,226,0.07)`, background:'rgba(243,237,226,0.03)', overflow:'hidden' }}>
              <div style={{ padding:'14px 18px', display:'flex', flexWrap:'wrap', gap:22, alignItems:'flex-start' }}>
                {[
                  { label:'Messages', val:stats.msgCount,              color:C.cream },
                  { label:'Avg Score', val:stats.msgCount>0?Math.round(stats.avgScore):0, color:stats.avgScore>=70?C.green:stats.avgScore>=50?C.amber:C.red },
                  { label:'Interest', val:Math.round(stats.interest),  color:interestColor },
                  { label:'Momentum', val:Math.round(stats.momentum),  color:char.color },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize:9, color:`${C.cream}30`, textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700, marginBottom:3, fontFamily:'monospace' }}>{s.label}</div>
                    <div style={{ fontFamily:"'Bricolage Grotesque',sans-serif", fontSize:22, fontWeight:900, color:s.color, lineHeight:1, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em' }}>{s.val}</div>
                  </div>
                ))}
                {lastAnalysis?.proMove && (
  <div style={{ flex:'1 1 180px', display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div>
      <div style={{ fontSize:9, color:`${C.cream}30`, textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700, marginBottom:3, fontFamily:'monospace' }}>The Subtext</div>
      <div style={{ fontSize:13, color:`${C.cream}75`, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{lastAnalysis.subtext}</div>
    </div>
    <div>
      <div style={{ fontSize:9, color:char.color, textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:700, marginBottom:3, fontFamily:'monospace' }}>💡 Pro Move</div>
      <div style={{ fontSize:13, color:`${C.cream}90`, lineHeight:1.6, fontFamily:"'DM Sans',sans-serif" }}>{lastAnalysis.proMove}</div>
    </div>
  </div>
)}
              </div>
              {lastAnalysis && lastAnalysis.flags.length>0 && (
                <div style={{ paddingLeft:18, paddingBottom:12, display:'flex', flexWrap:'wrap', gap:5 }}>
                  {lastAnalysis.flags.map(f => (
                    <span key={f} style={{ fontSize:9, fontWeight:800, padding:'3px 8px', borderRadius:5, textTransform:'uppercase', letterSpacing:'0.07em', fontFamily:'monospace', background:POSITIVE_FLAGS.has(f)?'rgba(45,138,78,0.15)':'rgba(209,57,32,0.12)', color:POSITIVE_FLAGS.has(f)?C.green:C.red }}>
                      {f.replace(/_/g,' ')}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Messages ── */}
        <div className="ios-scroll" style={{ flex:1, overflowY:'auto', padding:'clamp(16px,3vw,24px) clamp(14px,3vw,20px)', display:'flex', flexDirection:'column', gap:2 }}>
          {/* Session label */}
          <div style={{ textAlign:'center', marginBottom:22 }}>
            <span style={{ fontSize:10.5, fontWeight:700, color:`${C.cream}22`, background:'rgba(243,237,226,0.04)', padding:'4px 14px', borderRadius:999, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'monospace' }}>
              {char.name} · {char.tag}{logSession?' · 📊 Logging':''}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {msgs.map((m, i) => {
              const isUser = m.role==='user';
              const nextSame = msgs[i+1]?.role===m.role;
              const isLast = !nextSame;
              return (
                <motion.div key={m.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.22, ease:[0.16,1,0.3,1] }}
                  style={{ display:'flex', flexDirection:'column', alignItems:isUser?'flex-end':'flex-start', marginBottom:isLast?10:2 }}>
                  <div style={{
                    maxWidth:'min(82%,420px)', wordBreak:'break-word',
                    padding:'clamp(10px,2vw,12px) clamp(13px,2vw,16px)',
                    fontSize:'clamp(14px,3.5vw,15px)', lineHeight:1.55,
                    borderRadius:isUser?`17px 17px ${isLast?'4px':'17px'} 17px`:`17px 17px 17px ${isLast?'4px':'17px'}`,
                    background:isUser?`${C.cream}12`:'rgba(243,237,226,0.04)',
                    border:`1px solid ${isUser?`rgba(243,237,226,0.18)`:'rgba(243,237,226,0.07)'}`,
                    color:isUser?`${C.cream}90`:`${C.cream}75`,
                    fontFamily:"'DM Sans',sans-serif",
                  }}>
                    {m.content}
                  </div>

                  {/* Score ring */}
                  {isUser && m.analysis && diff!=='hard' && (
                    <motion.div initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15 }} style={{ marginTop:5 }}>
                      <ScoreRing score={m.analysis.score} size={34} color={m.analysis.score>=70?C.green:m.analysis.score>=50?C.amber:C.red}/>
                    </motion.div>
                  )}

                  {/* Coach tip (easy mode) */}
{!isUser && m.analysis && diff==='easy' && m.analysis.proMove && isLast && (
  <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} transition={{ delay:0.28 }}
    style={{ marginTop:7, maxWidth:'min(82%,420px)', padding:'12px 14px', borderRadius:11, background:`${char.color}12`, border:`1px solid ${char.color}25`, display:'flex', flexDirection:'column', gap:8 }}>
    
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
      <div style={{ fontSize:9, fontWeight:800, color:char.color, textTransform:'uppercase', letterSpacing:'0.1em', fontFamily:'monospace' }}>Vibe: {m.analysis.vibeCheck}</div>
    </div>

    {m.analysis.weaknesses?.length > 0 && (
      <div>
        <div style={{ fontSize:9, color:C.red, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:800, marginBottom:2, fontFamily:'monospace' }}>The Trap</div>
        <div style={{ fontSize:12, color:`${C.cream}70`, lineHeight:1.4 }}>{m.analysis.weaknesses[0]}</div>
      </div>
    )}

    {m.analysis.strengths?.length > 0 && (
      <div>
        <div style={{ fontSize:9, color:C.green, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:800, marginBottom:2, fontFamily:'monospace' }}>What Worked</div>
        <div style={{ fontSize:12, color:`${C.cream}70`, lineHeight:1.4 }}>{m.analysis.strengths[0]}</div>
      </div>
    )}

    <div style={{ paddingTop:6, borderTop:`1px solid ${char.color}20` }}>
      <div style={{ fontSize:9, fontWeight:800, color:char.color, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:3, fontFamily:'monospace' }}>→ Next Move</div>
      <div style={{ fontSize:'clamp(12px,3.2vw,13px)', color:`${C.cream}90`, lineHeight:1.55, fontFamily:"'DM Sans',sans-serif" }}>{m.analysis.proMove}</div>
    </div>
  </motion.div>
)}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', justifyContent:'flex-start', marginBottom:10 }}>
              <div style={{ padding:'11px 15px', borderRadius:'16px 16px 16px 4px', background:'rgba(243,237,226,0.04)', border:'1px solid rgba(243,237,226,0.07)', display:'flex', gap:5, alignItems:'center' }}>
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} style={{ height:4 }}/>
        </div>

        {/* ── Input bar ── */}
        <div style={{ flexShrink:0, borderTop:`1px solid rgba(243,237,226,0.07)`, background:`${C.ink}FA`, backdropFilter:'blur(20px)', padding:'clamp(10px,2vw,13px) clamp(12px,2vw,16px)', paddingBottom:`max(clamp(10px,2vw,13px),env(safe-area-inset-bottom))` }}>
          <div style={{ display:'flex', gap:8, alignItems:'center' }}>
            <input ref={inputRef} type="text" value={input} onChange={e=>setInput(e.target.value)} className="msg-input"
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder={diff==='hard'?'No hints. Good luck.':stats.msgCount===0?`Open strong with ${char.name}…`:'Your move…'}
              style={{ flex:1, minWidth:0, background:'rgba(243,237,226,0.06)', border:`1.5px solid rgba(243,237,226,0.1)`, borderRadius:13, padding:'clamp(11px,2.5vw,13px) clamp(13px,2.5vw,15px)', fontSize:'clamp(14px,3.5vw,15px)', color:C.cream, caretColor:char.color, fontFamily:"'DM Sans',sans-serif", transition:'border-color 0.2s' }}
              onFocus={e=>{ e.target.style.borderColor=`${char.color}50`; }}
              onBlur={e=>{ e.target.style.borderColor='rgba(243,237,226,0.1)'; }}/>

            <motion.button whileHover={input.trim()&&!loading?{scale:1.06}:{}} whileTap={input.trim()&&!loading?{scale:0.94}:{}} onClick={send} disabled={!input.trim()||loading}
              style={{ width:'clamp(44px,10vw,48px)', height:'clamp(44px,10vw,48px)', borderRadius:12, flexShrink:0, background:input.trim()&&!loading?char.color:'rgba(243,237,226,0.06)', border:`1px solid ${input.trim()&&!loading?'transparent':'rgba(243,237,226,0.1)'}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.18s', boxShadow:input.trim()&&!loading?`0 4px 20px ${char.color}40`:'none', cursor:input.trim()&&!loading?'pointer':'default' }}>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 7.5h11M8.5 3.5l4 4-4 4" stroke={input.trim()&&!loading?'#fff':`${C.cream}25`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Footer info */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:7 }}>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <div style={{ width:5, height:5, borderRadius:'50%', background:diffCfg.color }} />
              <span style={{ fontSize:10.5, color:`${C.cream}22`, fontWeight:600, fontFamily:'monospace' }}>
                {diffCfg.label}{diff!=='hard'?' · Coaching on':''}{logSession?' · Logged':''}
              </span>
            </div>
            {stats.msgCount>0 && <span style={{ fontSize:10.5, color:`${C.cream}22`, fontWeight:600, fontFamily:'monospace' }}>Avg {Math.round(stats.avgScore)}/100</span>}
          </div>
        </div>
      </div>
      <PremiumModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        type={userTier === 'anonymous' ? 'signup' : 'upgrade'}
        title={userTier === 'anonymous' ? 'Create a Free Account to Continue' : 'Upgrade to Continue Practicing'}
        subtitle={userTier === 'anonymous'
          ? `You've reached the ${msgLimit}-message limit. Sign up to unlock ${25} messages per session.`
          : 'Upgrade to Premium for unlimited practice sessions, all characters, and full coaching.'}
      />
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function PracticePage() {
  const { data: session } = useSession();
  const userTier = getUserTier(session);
  const [step, setStep] = useState<Step>('scenario');
  const [scenario, setScenario] = useState<ScenarioType>('dating');
  const [char, setChar] = useState<typeof ALL_CHARS[number]|null>(null);
  const [diff, setDiff] = useState<DiffMode>('easy');
  const [logSession, setLogSession] = useState(false);

  const handleCharPick = (c: typeof ALL_CHARS[number]) => {
    setChar(c);
    if (session?.user) { setStep('consent'); }
    else { setLogSession(false); setStep('diff'); }
  };

  const reset = () => { setStep('scenario'); setChar(null); setDiff('easy'); setLogSession(false); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800;12..96,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
        button{cursor:pointer;}
        ::-webkit-scrollbar{width:3px;}
        ::-webkit-scrollbar-thumb{background:${C.warm2};border-radius:99px;}
      `}</style>

      <AnimatePresence mode="wait">
        {step==='scenario' && (
          <motion.div key="scen" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}>
            <StepScenario onNext={s=>{ setScenario(s); setStep('character'); }}/>
          </motion.div>
        )}
        {step==='character' && (
          <motion.div key="char" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}>
            <StepCharacter scenario={scenario} onBack={()=>setStep('scenario')} onNext={handleCharPick} userTier={userTier}/>
          </motion.div>
        )}
        {step==='consent' && char && (
          <motion.div key="cons" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}>
            <StepConsent char={char} onBack={()=>setStep('character')} onNext={log=>{ setLogSession(log); setStep('diff'); }}/>
          </motion.div>
        )}
        {step==='diff' && char && (
          <motion.div key="diff" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}>
            <StepDiff char={char} onBack={()=>setStep(session?.user?'consent':'character')} onStart={d=>{ setDiff(d); setStep('chat'); }} userTier={userTier}/>
          </motion.div>
        )}
        {step==='chat' && char && (
          <motion.div key="chat" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:0.2}}>
            <ChatScreen char={char} diff={diff} logSession={logSession} onReset={reset} userTier={userTier}/>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}