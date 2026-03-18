'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { getUserTier, isCharacterAvailable, isDifficultyAvailable, getPracticeMsgLimit, type UserTier } from '@/lib/premiumUtils';
import PremiumModal from '@/components/PremiumModal';

// ─── DESIGN TOKENS (Neo-Brutalism) ────────────────────────────────────────────
const C = {
  yellow:    '#FFD84D',
  red:       '#FF3D3D',
  blue:      '#4338CA',
  green:     '#16A34A',
  pink:      '#EC4899',
  black:     '#0A0A0A',
  white:     '#FFFFFF',
  bgCream:   '#FAF6EE',
  shadow:    '4px 4px 0px #0A0A0A',
  shadowSm:  '2px 2px 0px #0A0A0A',
  border:    '3px solid #0A0A0A',
  borderThin:'1.5px solid #0A0A0A',
};

const SNAP = { duration: 0.15, ease: [0.2, 0, 0.2, 1] } as const;

// ─── NOISE OVERLAY ────────────────────────────────────────────────────────────
function Noise() {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat', backgroundSize: '180px', opacity: 0.03, mixBlendMode: 'multiply',
    }} />
  );
}

// ─── TYPES ────────────────────────────────────────────────────────────────────
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

// ─── DATA ─────────────────────────────────────────────────────────────────────
const ALL_CHARS = [
  { id:'noa_selective',    name:'Noa',    gender:'female'  as const, scenario:'dating'       as const, tag:'The Selective',    emoji:'🥶', color:C.pink,  level:'Medium', opening:'hi',                                   description:'Gets 100+ texts daily. Responds only if you genuinely earn it. Will ghost without hesitation.', traits:['Rarely responds','Rewards effort','Low tolerance for generic'] },
  { id:'zara_banter',      name:'Zara',   gender:'female'  as const, scenario:'dating'       as const, tag:'The Banter Queen', emoji:'💅', color:C.red,   level:'Hard',   opening:'oh. another text. state your purpose.', description:'Sharp wit, zero tolerance for boring. Win the sparring match and she opens up.',              traits:['Heavy sarcasm','Tests everything','Rewards wit'] },
  { id:'mia_warm',         name:'Mia',    gender:'female'  as const, scenario:'dating'       as const, tag:'The Warm Standard',emoji:'🌿', color:C.green, level:'Easy',   opening:'hey! how are you doing?',               description:'Warm, emotionally intelligent. Asks real questions — but notices if you stop listening.',      traits:['Good listener','Asks real questions','Notices everything'] },
  { id:'rei_intellectual', name:'Rei',    gender:'female'  as const, scenario:'dating'       as const, tag:'The Deep Thinker', emoji:'🔭', color:C.blue,  level:'Hard',   opening:'hey',                                   description:"Surface chat bores her physically. Say something real and she'll go deep fast.",              traits:['Ideas over small talk','Loves debate','No exclamation marks'] },
  { id:'cass_ghost',       name:'Cass',   gender:'female'  as const, scenario:'dating'       as const, tag:'The Unreachable',  emoji:'👻', color:C.black, level:'Expert', opening:'yeah',                                  description:'Always half-present. Impossible to hold. The less you try, the more you get.',                traits:['Ultra brief','Impossible to impress','Rare bursts of warmth'] },
  { id:'liv_chaos',        name:'Liv',    gender:'female'  as const, scenario:'dating'       as const, tag:'The Chaos Agent',  emoji:'⚡', color:C.yellow,level:'Medium', opening:'okayy who even are you',                description:'Burst texts, all caps for emphasis, completely unpredictable. Can sense stiffness instantly.', traits:['Burst texter','All-caps energy','Match or be lost'] },
  { id:'leo_confident',    name:'Leo',    gender:'male'    as const, scenario:'dating'       as const, tag:'The Self-Assured', emoji:'😎', color:C.green, level:'Medium', opening:'hey',                                   description:"Confident, knows his worth. Low investment until you earn genuine interest.",                  traits:['Short responses','Dry humor','Not trying to impress'] },
  { id:'ash_aloof',        name:'Ash',    gender:'male'    as const, scenario:'dating'       as const, tag:'The Low-Key',      emoji:'🌙', color:C.blue,  level:'Hard',   opening:'yo',                                    description:'Hard to read. Genuinely curious about people but never shows cards first.',                   traits:['Economical words','Dry observations','Occasional real warmth'] },
  { id:'noah_playful',     name:'Noah',   gender:'male'    as const, scenario:'dating'       as const, tag:'The Fun Energy',   emoji:'🎯', color:C.yellow,level:'Easy',   opening:"ayy what's up",                         description:"High energy, makes every conversation fun. Immediately knows when you're being stiff.",        traits:['Playful jabs','Fast responses','Escalates easily'] },
  { id:'alex_tough_client',name:'Alex',   gender:'neutral' as const, scenario:'professional' as const, tag:'The Tough Client', emoji:'💼', color:C.red,   level:'Hard',   opening:'What can I help you with?',             description:'Senior client. Has seen every pitch. Asks hard follow-up questions relentlessly.',             traits:['Cuts through BS','Demands specifics','High standards'] },
  { id:'sam_interviewer',  name:'Sam',    gender:'neutral' as const, scenario:'professional' as const, tag:'The Interviewer',  emoji:'📋', color:C.blue,  level:'Medium', opening:'Thanks for coming in. Tell me about yourself.', description:'Analytical, fair interviewer. Probing follow-ups test every claim you make.',            traits:['Behavioral questions','Tests depth','Likes specific examples'] },
  { id:'morgan_exec',      name:'Morgan', gender:'neutral' as const, scenario:'professional' as const, tag:'The Executive',    emoji:'📱', color:C.yellow,level:'Expert', opening:"Hey — what's up?",                       description:'C-suite. Extremely protective of their time. Warm to driven people with clear asks.',         traits:['Time is precious','Needs clear agenda','Hates vague asks'] },
  { id:'jamie_new_friend', name:'Jamie',  gender:'neutral' as const, scenario:'social'       as const, tag:'The New Connection',emoji:'✨', color:C.green, level:'Easy',   opening:"hey! I think we met at the party?",     description:'Open, easy-going, genuinely curious. No pressure — just a good new connection.',               traits:['Warm','Curious','Easy to talk to'] },
  { id:'river_reconnect',  name:'River',  gender:'neutral' as const, scenario:'reconnecting' as const, tag:'The Old Friend',   emoji:'🌊', color:C.pink,  level:'Medium', opening:"Oh hey! It's been forever...",           description:"Someone from your past. Warm nostalgia mixed with slight distance — you've both changed.",     traits:['Warm nostalgia','Some guardedness','Wants genuine reconnection'] },
];

const SCENARIOS = [
  { id:'dating',        label:'Dating',        emoji:'💘', description:'Romantic interest — flirting, attraction, connection', color:C.red    },
  { id:'professional',  label:'Professional',  emoji:'💼', description:'Clients, interviews, networking, your boss',         color:C.blue   },
  { id:'social',        label:'Social',        emoji:'✨', description:'New friends, social events, casual connections',     color:C.green  },
  { id:'reconnecting',  label:'Reconnecting',  emoji:'🌊', description:'Old friends, exes, people from your past',          color:C.pink   },
];

const DIFFS = [
  { id:'easy'   as DiffMode, label:'Guided',     sub:'Full AI coaching after every message', dots:1, color:C.green },
  { id:'normal' as DiffMode, label:'Realistic',  sub:'Coaching at key moments only',         dots:2, color:C.yellow },
  { id:'hard'   as DiffMode, label:'Simulation', sub:'No hints. No coaching. Survive.',      dots:3, color:C.red   },
];

const LEVEL_COLORS: Record<string,string> = { Easy:C.green, Medium:C.yellow, Hard:C.red, Expert:C.black };
const POSITIVE_FLAGS = new Set(['good_hook','good_question','witty','specific','good_follow_up','showed_personality','high_effort','deep_question','matched_energy','recovered_well']);

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const LABEL: React.CSSProperties = { 
  display: 'inline-block', background: C.yellow, color: C.black, border: C.borderThin, 
  borderRadius: 6, padding: '4px 10px', fontSize: 10, fontWeight: 900, 
  letterSpacing: '0.14em', textTransform: 'uppercase', boxShadow: C.shadowSm, marginBottom: 18,
  transform: 'rotate(-2deg)'
};

function BackBtn({ onClick }: { onClick: () => void }) {
  return (
    <motion.button onClick={onClick} whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }} transition={SNAP}
      style={{ display:'inline-flex', alignItems:'center', gap:7, background:C.white, border:C.borderThin, color:C.black, fontSize:12, cursor:'pointer', fontWeight:800, padding:'6px 14px', borderRadius: 10, marginBottom: 24, boxShadow: C.shadowSm }}>
      ← Back
    </motion.button>
  );
}

function ScoreRing({ score, size=44, color }: { score:number; size?:number; color:string }) {
  const r = size/2-5; const circ = 2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{ transform:'rotate(-90deg)', flexShrink:0, background: C.white, borderRadius: '50%', border: C.borderThin, boxShadow: C.shadowSm }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E5E5" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={circ} strokeDashoffset={circ-(score/100)*circ} strokeLinecap="round"
        style={{ transition:'stroke-dashoffset 0.8s cubic-bezier(0.23,1,0.32,1)' }}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
        style={{ transform:`rotate(90deg)`, transformOrigin:`${size/2}px ${size/2}px`, fontSize:11, fontWeight:900, fill:C.black }}>
        {score}
      </text>
    </svg>
  );
}

// ─── STEP 1: SCENARIO ─────────────────────────────────────────────────────────
function StepScenario({ onNext }: { onNext:(s:ScenarioType)=>void }) {
  const [sel, setSel] = useState<ScenarioType|null>(null);
  return (
    <div style={{ minHeight:'100svh', background:C.bgCream, position: 'relative', overflow: 'hidden', padding:'clamp(36px,5vw,72px) clamp(20px,4vw,32px) 80px' }}>
      <Noise />
      <div style={{ maxWidth:800, margin:'0 auto', position: 'relative', zIndex: 1 }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <motion.div whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }} transition={SNAP}
            style={{ display:'inline-flex', alignItems:'center', background:C.white, border:C.borderThin, color:C.black, fontSize:12, cursor:'pointer', fontWeight:800, padding:'6px 14px', borderRadius: 10, marginBottom: 36, boxShadow: C.shadowSm }}>
            ← Home
          </motion.div>
        </Link>

        <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}>
          <span style={LABEL}>Practice Mode — Step 1</span>
          <h1 style={{ fontSize:'clamp(32px, 8vw, 68px)', fontWeight:900, lineHeight:1.15, letterSpacing:'-0.03em', color:C.black, margin:'0 0 16px', wordBreak: 'break-word' }}>
  What are you<br />
  <span style={{ background: C.black, color: C.yellow, padding: '2px 12px', borderRadius: 12, border: C.border, display: 'inline-block', marginTop: 8 }}>practicing?</span>
</h1>
          <p style={{ fontSize:16, color:'#555', lineHeight:1.75, maxWidth:480, margin:'0 0 40px', fontWeight: 500 }}>
            The AI adapts its behavior, expectations, and judgment based on the type of conversation you choose.
          </p>
        </motion.div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,290px),1fr))', gap:16, marginBottom:36 }}>
          {SCENARIOS.map((sc, i) => {
            const active = sel === sc.id;
            return (
              <motion.div key={sc.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07, duration:0.4, ease:[0.16,1,0.3,1] }}>
                <motion.div whileHover={{ y:-4, boxShadow:C.shadow }} whileTap={{ y:0, boxShadow:C.shadowSm }} onClick={() => setSel(sc.id as ScenarioType)} transition={SNAP}
                  style={{ background: active ? sc.color : C.white, border: C.border, borderRadius: 20, padding: 24, cursor: 'pointer', boxShadow: active ? C.shadow : C.shadowSm, position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <span style={{ fontSize:36, display:'block' }}>{sc.emoji}</span>
                    {active && (
                      <div style={{ width:24, height:24, borderRadius:'50%', background:C.white, border: C.borderThin, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6L5 9L10 3" stroke={C.black} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize:20, fontWeight:900, color: active ? C.white : C.black, marginBottom:6, letterSpacing:'-0.01em' }}>{sc.label}</div>
                  <p style={{ fontSize:13, color: active ? 'rgba(255,255,255,0.9)' : '#555', lineHeight:1.65, margin:0, fontWeight: 600 }}>{sc.description}</p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        <motion.button onClick={() => sel && onNext(sel)} 
          whileHover={sel ? { y: -3, boxShadow: C.shadow } : {}} whileTap={sel ? { y: 1, boxShadow: C.shadowSm } : {}} transition={SNAP}
          style={{ width:'100%', padding:'18px 24px', borderRadius:16, border: C.border, fontSize:16, fontWeight:900, cursor:sel?'pointer':'default', display:'flex', alignItems:'center', justifyContent:'center', gap:12, background:sel?C.black:'#E5E5E5', color:sel?C.yellow:'#999', boxShadow: sel ? C.shadowSm : 'none', opacity: sel ? 1 : 0.6 }}>
          Choose Character →
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
    <div style={{ minHeight:'100svh', background:C.bgCream, position: 'relative', overflow: 'hidden', padding:'clamp(32px,4vw,60px) clamp(20px,4vw,32px) 80px' }}>
      <Noise />
      <div style={{ maxWidth:1000, margin:'0 auto', position: 'relative', zIndex: 1 }}>
        <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:[0.16,1,0.3,1] }}>
          <BackBtn onClick={onBack} />
          <div style={{ marginBottom: 16 }}><span style={LABEL}>Step 2 · {sc.label}</span></div>
          <h1 style={{ fontSize:'clamp(36px,5.5vw,60px)', fontWeight:900, lineHeight:1.05, letterSpacing:'-0.03em', color:C.black, margin:'0 0 16px' }}>
            Choose your<br />
            <span style={{ background: sc.color, color: C.white, padding: '0 12px', borderRadius: 12, border: C.border, display: 'inline-block', marginTop: 8 }}>sparring partner.</span>
          </h1>
          <p style={{ fontSize:15.5, color:'#555', lineHeight:1.75, margin:'0 0 32px', maxWidth:460, fontWeight: 500 }}>
            Each character has distinct texting behavior, patience levels, and triggers. Pick your challenge.
          </p>
        </motion.div>

        {hasGenders && (
          <div style={{ display:'flex', gap:8, marginBottom:28, flexWrap:'wrap' }}>
            {(['all','female','male','neutral'] as GenderFilter[]).map(g => (
              <motion.button key={g} onClick={() => setGender(g)}
                whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }} transition={SNAP}
                style={{ padding:'8px 16px', borderRadius:10, border: C.borderThin, background:gender===g?sc.color:C.white, color:gender===g?C.white:C.black, fontSize:13, fontWeight:800, cursor:'pointer', textTransform:'capitalize', boxShadow: gender===g?C.shadowSm:'none' }}>
                {g==='all'?'All':g==='neutral'?'Non-binary':g==='female'?'♀ Female':'♂ Male'}
              </motion.button>
            ))}
          </div>
        )}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,280px),1fr))', gap:16 }}>
          {filtered.map((char, i) => {
            const locked = !isCharacterAvailable(char.id, userTier);
            return (
            <motion.div key={char.id} initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.05, duration:0.4, ease:[0.16,1,0.3,1] }} style={{ height: '100%' }}>
              <motion.div whileHover={locked?{}:{ y:-4, boxShadow:C.shadow }} whileTap={locked?{}:{ y:0, boxShadow:C.shadowSm }} onClick={() => !locked && onNext(char)} transition={SNAP}
                style={{ background: C.white, border: C.border, borderRadius:20, padding:'24px', cursor:locked?'not-allowed':'pointer', height:'100%', display:'flex', flexDirection:'column', boxShadow: C.shadowSm, position:'relative', opacity:locked?0.6:1 }}>
                
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div style={{ width:52, height:52, borderRadius:14, background: char.color, border: C.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, boxShadow: C.shadowSm }}>{char.emoji}</div>
                  <span style={{ fontSize:10, fontWeight:900, letterSpacing:'0.1em', textTransform:'uppercase', color: LEVEL_COLORS[char.level] === C.black ? C.white : C.black, background: LEVEL_COLORS[char.level]??C.black, border: C.borderThin, padding:'4px 10px', borderRadius:8, flexShrink:0, boxShadow: C.shadowSm }}>{char.level}</span>
                </div>

                <div style={{ fontSize:22, fontWeight:900, color:C.black, marginBottom:2, letterSpacing:'-0.02em' }}>{char.name}</div>
                <div style={{ fontSize:11, fontWeight:900, color:char.color, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12 }}>{char.tag}</div>
                <p style={{ fontSize:13.5, color:'#555', lineHeight:1.6, marginBottom:20, flex:1, fontWeight: 500 }}>{char.description}</p>

                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:20 }}>
                  {char.traits.map(t => (
                    <span key={t} style={{ fontSize:11, fontWeight: 700, color:C.black, background:C.bgCream, border: C.borderThin, padding:'4px 10px', borderRadius:8 }}>{t}</span>
                  ))}
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, fontWeight:900, color:locked?C.black:char.color }}>
                  {locked ? (
                    <><span style={{ fontSize:14 }}>🔒</span> {userTier === 'anonymous' ? 'Sign up to unlock' : 'Premium only'}</>
                  ) : (
                    <>Start practice →</>
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
    <div style={{ minHeight:'100svh', background:C.bgCream, position: 'relative', overflow: 'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(28px,4vw,52px) 20px' }}>
      <Noise />
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:[0.16,1,0.3,1] }} style={{ maxWidth:460, width:'100%', position: 'relative', zIndex: 1 }}>
        <BackBtn onClick={onBack} />

        {/* Character Card Preview */}
        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'20px', background: C.white, border: C.border, borderRadius:16, marginBottom:36, boxShadow: C.shadowSm }}>
          <div style={{ width:56, height:56, borderRadius:14, background: char.color, border: C.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{char.emoji}</div>
          <div>
            <div style={{ fontSize:22, fontWeight:900, color:C.black, letterSpacing:'-0.02em', marginBottom: 2 }}>{char.name}</div>
            <div style={{ fontSize:11, color:char.color, fontWeight:900, letterSpacing:'0.06em', textTransform:'uppercase' }}>{char.tag}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}><span style={LABEL}>Step 3</span></div>
        <h2 style={{ fontSize:'clamp(32px,5.5vw,48px)', fontWeight:900, letterSpacing:'-0.03em', color:C.black, margin:'0 0 14px', lineHeight:1.05 }}>
          Log this session?
        </h2>
        <p style={{ fontSize:15.5, color:'#555', lineHeight:1.75, margin:'0 0 32px', fontWeight: 500 }}>
          As a Premium member, you can save practice sessions to track improvement over time. Entirely optional.
        </p>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <motion.button onClick={() => onNext(true)} whileHover={{ y: -3, boxShadow: C.shadow }} whileTap={{ y: 1, boxShadow: C.shadowSm }} transition={SNAP}
            style={{ width:'100%', padding:'18px 20px', borderRadius:14, background:C.black, border:C.border, color:C.yellow, fontSize:15, fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
            Yes — log and track progress
          </motion.button>
          <motion.button onClick={() => onNext(false)} whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }} transition={SNAP}
            style={{ width:'100%', padding:'18px 20px', borderRadius:14, background:C.white, border:C.border, color:C.black, fontSize:15, fontWeight:900, cursor:'pointer' }}>
            No thanks — just practice
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── STEP 4: DIFFICULTY ───────────────────────────────────────────────────────
function StepDiff({ char, onBack, onStart, userTier }: { char:typeof ALL_CHARS[number]; onBack:()=>void; onStart:(d:DiffMode)=>void; userTier:UserTier }) {
  const [picked, setPicked] = useState<DiffMode>('easy');
  return (
    <div style={{ minHeight:'100svh', background:C.bgCream, position: 'relative', overflow: 'hidden', display:'flex', alignItems:'center', justifyContent:'center', padding:'clamp(28px,4vw,52px) 20px' }}>
      <Noise />
      <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.4, ease:[0.16,1,0.3,1] }} style={{ maxWidth:460, width:'100%', position: 'relative', zIndex: 1 }}>
        <BackBtn onClick={onBack} />

        <div style={{ display:'flex', alignItems:'center', gap:16, padding:'20px', background: C.white, border: C.border, borderRadius:16, marginBottom:36, boxShadow: C.shadowSm }}>
          <div style={{ width:56, height:56, borderRadius:14, background: char.color, border: C.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:26, flexShrink:0 }}>{char.emoji}</div>
          <div>
            <div style={{ fontSize:22, fontWeight:900, color:C.black, letterSpacing:'-0.02em', marginBottom: 2 }}>{char.name}</div>
            <div style={{ fontSize:11, color:char.color, fontWeight:900, letterSpacing:'0.06em', textTransform:'uppercase' }}>{char.tag}</div>
          </div>
        </div>

        <div style={{ marginBottom: 16 }}><span style={LABEL}>Intensity</span></div>
        <h2 style={{ fontSize:'clamp(32px,5.5vw,48px)', fontWeight:900, letterSpacing:'-0.03em', color:C.black, margin:'0 0 12px', lineHeight:1.05 }}>
          How much<br />
          <span style={{ background: C.black, color: C.yellow, padding: '0 12px', borderRadius: 12, border: C.border, display: 'inline-block', marginTop: 8 }}>guidance?</span>
        </h2>
        <p style={{ fontSize:15.5, color:'#555', lineHeight:1.75, margin:'0 0 28px', fontWeight: 500 }}>More guidance = more learning. Less = more realistic.</p>

        <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
          {DIFFS.map((d, i) => {
            const diffLocked = !isDifficultyAvailable(d.id, userTier);
            return (
            <motion.div key={d.id} initial={{ opacity:0, x:-14 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07, duration:0.4, ease:[0.16,1,0.3,1] }}
              onClick={() => !diffLocked && setPicked(d.id)}
              whileHover={!diffLocked ? { y: -2, boxShadow: C.shadowSm } : {}} whileTap={!diffLocked ? { y: 0, boxShadow: 'none' } : {}}
              style={{ padding:'18px 20px', borderRadius:16, cursor:diffLocked?'not-allowed':'pointer', transition:'all 0.15s', border: C.border, background:picked===d.id&&!diffLocked?d.color:C.white, boxShadow: picked===d.id&&!diffLocked?C.shadowSm:'none', opacity:diffLocked?0.6:1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                <span style={{ fontSize:16, fontWeight:900, color:picked===d.id? (d.color === C.yellow ? C.black : C.white) :C.black, letterSpacing:'-0.01em' }}>{d.label}</span>
                <div style={{ display:'flex', gap:6 }}>
                  {[1,2,3].map(n => <div key={n} style={{ width:10, height:10, borderRadius:'2px', background:n<=d.dots? (picked===d.id ? (d.color === C.yellow ? C.black : C.white) : C.black) : '#E5E5E5', border: picked===d.id&&n<=d.dots ? 'none' : C.borderThin }} />)}
                </div>
              </div>
              <div style={{ fontSize:13, fontWeight: 600, color:picked===d.id? (d.color === C.yellow ? C.black : C.white) : '#666' }}>{d.sub}{diffLocked ? ' 🔒' : ''}</div>
            </motion.div>
            );
          })}
        </div>

        <motion.button whileHover={{ y: -3, boxShadow: C.shadow }} whileTap={{ y: 1, boxShadow: C.shadowSm }} transition={SNAP} onClick={() => onStart(picked)}
          style={{ width:'100%', padding:'18px 20px', borderRadius:16, background:char.color, border:C.border, color:char.color === C.yellow ? C.black : C.white, fontSize:16, fontWeight:900, display:'flex', alignItems:'center', justifyContent:'center', gap:10, cursor:'pointer', boxShadow: C.shadowSm }}>
          Begin Session →
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

  const interestColor = stats.interest>=60?C.green:stats.interest>=35?C.yellow:C.red;
  const diffCfg = DIFFS.find(d=>d.id===diff)!;
  const grade = stats.msgCount===0?'—':stats.avgScore>=85?'A+':stats.avgScore>=75?'A':stats.avgScore>=65?'B':stats.avgScore>=50?'C':stats.avgScore>=35?'D':'F';

  return (
    <>
      <style>{`
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-thumb{background:${C.black};border-radius:3px;}
        .ios-scroll{-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;}
        @keyframes blink{0%,80%,100%{opacity:0.25}40%{opacity:1}}
        .dot{width:8px;height:8px;border-radius:50%;background:${C.black};display:inline-block;animation:blink 1.4s infinite both; border: 1.5px solid #000}
        .dot:nth-child(2){animation-delay:.2s}.dot:nth-child(3){animation-delay:.4s}
        .msg-input:focus{outline:none;}
      `}</style>

      <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, display:'flex', flexDirection:'column', background:C.bgCream, zIndex:1 }}>
        <Noise />

        {/* ── Header ── */}
        <div style={{ flexShrink:0, height:70, borderBottom:C.border, background:C.white, display:'flex', alignItems:'center', padding:'0 16px', gap:12, zIndex:10, position: 'relative' }}>
          <motion.button whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }} onClick={onReset} transition={SNAP}
            style={{ width:40, height:40, borderRadius:12, background:C.white, border:C.border, display:'flex', alignItems:'center', justifyContent:'center', color:C.black, flexShrink:0, cursor:'pointer', boxShadow: C.shadowSm }}>
            <svg width="16" height="16" viewBox="0 0 13 13" fill="none"><path d="M9 2L4 6.5 9 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </motion.button>

          {/* Avatar */}
          <div style={{ width:42, height:42, borderRadius:12, background:char.color, border:C.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:20, flexShrink:0, boxShadow: C.shadowSm }}>{char.emoji}</div>

          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:15, fontWeight:900, color:C.black, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', letterSpacing:'-0.02em' }}>{char.name}</div>
            <div style={{ fontSize:11, color:char.color, fontWeight:900, letterSpacing:'0.07em', textTransform:'uppercase' }}>{char.tag}</div>
          </div>

          {/* Interest meter */}
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:10, background:C.bgCream, border:C.borderThin, flexShrink:0, boxShadow: C.shadowSm }}>
            <motion.span style={{ width:8, height:8, borderRadius:'50%', background:interestColor, border: C.borderThin, display:'block' }}
              animate={{ opacity:[1,0.5,1] }} transition={{ type:'tween', duration:2, repeat:Infinity, ease:'easeInOut' }} />
            <span style={{ fontSize:13, fontWeight:900, color:C.black }}>{Math.round(stats.interest)}</span>
          </div>

          {/* Stats toggle */}
          <motion.button whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }} onClick={() => setShowStats(s=>!s)} transition={SNAP}
            style={{ padding:'8px 14px', borderRadius:10, background:showStats?C.black:C.white, border:C.border, color:showStats?C.white:C.black, fontSize:14, fontWeight:900, display:'flex', alignItems:'center', gap:6, flexShrink:0, cursor:'pointer', boxShadow: C.shadowSm }}>
            <svg width="14" height="14" viewBox="0 0 11 11" fill="none"><rect x="0.5" y="6.5" width="2" height="4" rx="0.4" fill="currentColor"/><rect x="4.5" y="3.5" width="2" height="7" rx="0.4" fill="currentColor"/><rect x="8.5" y="0.5" width="2" height="10" rx="0.4" fill="currentColor"/></svg>
            {grade}
          </motion.button>
        </div>

        {/* ── Stats panel ── */}
        <AnimatePresence>
          {showStats && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }} exit={{ height:0, opacity:0 }}
              transition={{ duration:0.25, ease:[0.16,1,0.3,1] }}
              style={{ flexShrink:0, borderBottom:C.border, background:C.white, overflow:'hidden', position: 'relative', zIndex: 9 }}>
              <div style={{ padding:'20px', display:'flex', flexWrap:'wrap', gap:28, alignItems:'flex-start' }}>
                {[
                  { label:'Messages', val:stats.msgCount, color:C.black },
                  { label:'Avg Score', val:stats.msgCount>0?Math.round(stats.avgScore):0, color:stats.avgScore>=70?C.green:stats.avgScore>=50?C.yellow:C.red },
                  { label:'Interest', val:Math.round(stats.interest), color:interestColor },
                  { label:'Momentum', val:Math.round(stats.momentum), color:char.color },
                ].map(s => (
                  <div key={s.label}>
                    <div style={{ fontSize:10, color:'#777', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:900, marginBottom:4 }}>{s.label}</div>
                    <div style={{ fontSize:26, fontWeight:900, color:s.color, lineHeight:1, fontVariantNumeric:'tabular-nums', letterSpacing:'-0.02em', textShadow: s.color !== C.black ? '1px 1px 0px #000' : 'none' }}>{s.val}</div>
                  </div>
                ))}
                
                {lastAnalysis?.proMove && (
                  <div style={{ flex:'1 1 220px', display: 'flex', flexDirection: 'column', gap: 12, borderLeft: C.borderThin, paddingLeft: 20 }}>
                    <div>
                      <div style={{ fontSize:10, color:'#777', textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:900, marginBottom:4 }}>The Subtext</div>
                      <div style={{ fontSize:13.5, color:C.black, lineHeight:1.6, fontWeight: 600 }}>{lastAnalysis.subtext}</div>
                    </div>
                    <div>
                      <div style={{ fontSize:10, color:char.color, textTransform:'uppercase', letterSpacing:'0.12em', fontWeight:900, marginBottom:4 }}>💡 Pro Move</div>
                      <div style={{ fontSize:13.5, color:C.black, lineHeight:1.6, fontWeight: 800 }}>{lastAnalysis.proMove}</div>
                    </div>
                  </div>
                )}
              </div>
              {lastAnalysis && lastAnalysis.flags.length>0 && (
                <div style={{ paddingLeft:20, paddingBottom:16, display:'flex', flexWrap:'wrap', gap:6 }}>
                  {lastAnalysis.flags.map(f => (
                    <span key={f} style={{ fontSize:10, fontWeight:900, padding:'4px 10px', borderRadius:6, textTransform:'uppercase', letterSpacing:'0.07em', background:POSITIVE_FLAGS.has(f)?C.green:C.red, color:C.white, border: C.borderThin, boxShadow: C.shadowSm }}>
                      {f.replace(/_/g,' ')}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Messages ── */}
        <div className="ios-scroll" style={{ flex:1, overflowY:'auto', padding:'clamp(20px,3vw,32px) clamp(16px,3vw,24px)', display:'flex', flexDirection:'column', gap:6, position: 'relative', zIndex: 1 }}>
          {/* Session label */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <span style={{ fontSize:11, fontWeight:900, color:C.black, background:C.white, border: C.borderThin, padding:'6px 16px', borderRadius:10, textTransform:'uppercase', letterSpacing:'0.1em', boxShadow: C.shadowSm }}>
              {char.name} · {char.tag}{logSession?' · 📊 Logging':''}
            </span>
          </div>

          <AnimatePresence initial={false}>
            {msgs.map((m, i) => {
              const isUser = m.role==='user';
              const nextSame = msgs[i+1]?.role===m.role;
              const isLast = !nextSame;
              return (
                <motion.div key={m.id} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.2, ease:[0.16,1,0.3,1] }}
                  style={{ display:'flex', flexDirection:'column', alignItems:isUser?'flex-end':'flex-start', marginBottom:isLast?12:2 }}>
                  <div style={{
                    maxWidth:'min(85%,460px)', wordBreak:'break-word',
                    padding:'clamp(12px,2.5vw,14px) clamp(16px,3vw,20px)',
                    fontSize:'clamp(14px,3.5vw,15.5px)', lineHeight:1.55, fontWeight: 500,
                    borderRadius:isUser?`16px 16px ${isLast?'4px':'16px'} 16px`:`16px 16px 16px ${isLast?'4px':'16px'}`,
                    background:isUser ? C.black : C.white,
                    border:C.borderThin,
                    color:isUser ? C.white : C.black,
                    boxShadow: C.shadowSm,
                  }}>
                    {m.content}
                  </div>

                  {/* Score ring */}
                  {isUser && m.analysis && diff!=='hard' && (
                    <motion.div initial={{ opacity:0, scale:0.7 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.15 }} style={{ marginTop:8 }}>
                      <ScoreRing score={m.analysis.score} size={40} color={m.analysis.score>=70?C.green:m.analysis.score>=50?C.yellow:C.red}/>
                    </motion.div>
                  )}

                  {/* Coach tip (easy mode) */}
                  {!isUser && m.analysis && diff==='easy' && m.analysis.proMove && isLast && (
                    <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }} transition={{ delay:0.28 }}
                      style={{ marginTop:10, maxWidth:'min(85%,460px)', padding:'16px', borderRadius:16, background: C.white, border: C.borderThin, boxShadow: C.shadowSm, display:'flex', flexDirection:'column', gap:10 }}>
                      
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontSize:10, fontWeight:900, color:C.black, background: C.yellow, padding: '3px 8px', borderRadius: 6, border: C.borderThin, textTransform:'uppercase', letterSpacing:'0.1em' }}>Vibe: {m.analysis.vibeCheck}</div>
                      </div>

                      {m.analysis.weaknesses?.length > 0 && (
                        <div>
                          <div style={{ fontSize:10, color:C.red, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:900, marginBottom:2 }}>The Trap</div>
                          <div style={{ fontSize:13, color:C.black, lineHeight:1.5, fontWeight: 600 }}>{m.analysis.weaknesses[0]}</div>
                        </div>
                      )}

                      {m.analysis.strengths?.length > 0 && (
                        <div>
                          <div style={{ fontSize:10, color:C.green, textTransform:'uppercase', letterSpacing:'0.1em', fontWeight:900, marginBottom:2 }}>What Worked</div>
                          <div style={{ fontSize:13, color:C.black, lineHeight:1.5, fontWeight: 600 }}>{m.analysis.strengths[0]}</div>
                        </div>
                      )}

                      <div style={{ paddingTop:8, borderTop:C.borderThin }}>
                        <div style={{ fontSize:10, fontWeight:900, color:C.black, textTransform:'uppercase', letterSpacing:'0.1em', marginBottom:4 }}>→ Next Move</div>
                        <div style={{ fontSize:'clamp(13px,3.2vw,14px)', color:C.black, lineHeight:1.55, fontWeight: 800 }}>{m.analysis.proMove}</div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} style={{ display:'flex', justifyContent:'flex-start', marginBottom:12 }}>
              <div style={{ padding:'12px 16px', borderRadius:'16px 16px 16px 4px', background:C.white, border:C.borderThin, display:'flex', gap:6, alignItems:'center', boxShadow: C.shadowSm }}>
                <div className="dot"/><div className="dot"/><div className="dot"/>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} style={{ height:4 }}/>
        </div>

        {/* ── Input bar ── */}
        <div style={{ flexShrink:0, borderTop:C.border, background:C.white, padding:'clamp(12px,2vw,16px) clamp(16px,2vw,20px)', paddingBottom:`max(clamp(12px,2vw,16px),env(safe-area-inset-bottom))`, position: 'relative', zIndex: 10 }}>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <input ref={inputRef} type="text" value={input} onChange={e=>setInput(e.target.value)} className="msg-input"
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder={diff==='hard'?'No hints. Good luck.':stats.msgCount===0?`Open strong with ${char.name}…`:'Your move…'}
              style={{ flex:1, minWidth:0, background:C.bgCream, border: C.border, borderRadius:14, padding:'clamp(12px,3vw,16px) clamp(16px,3vw,20px)', fontSize:'clamp(15px,3.5vw,16px)', color:C.black, fontWeight: 600, transition:'box-shadow 0.2s' }}
              onFocus={e=>{ e.target.style.boxShadow=C.shadowSm; }}
              onBlur={e=>{ e.target.style.boxShadow='none'; }}/>

            <motion.button whileHover={input.trim()&&!loading?{ y: -2, boxShadow: C.shadowSm }:{}} whileTap={input.trim()&&!loading?{ y: 0, boxShadow: 'none' }:{}} onClick={send} disabled={!input.trim()||loading} transition={SNAP}
              style={{ width:'clamp(48px,12vw,54px)', height:'clamp(48px,12vw,54px)', borderRadius:14, flexShrink:0, background:input.trim()&&!loading?char.color:'#E5E5E5', border:C.border, display:'flex', alignItems:'center', justifyContent:'center', cursor:input.trim()&&!loading?'pointer':'default', boxShadow: input.trim()&&!loading?C.shadowSm:'none' }}>
              <svg width="20" height="20" viewBox="0 0 15 15" fill="none">
                <path d="M2 7.5h11M8.5 3.5l4 4-4 4" stroke={input.trim()&&!loading?(char.color===C.yellow?C.black:C.white):'#999'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Footer info */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <div style={{ width:8, height:8, borderRadius:'2px', background:diffCfg.color, border: C.borderThin }} />
              <span style={{ fontSize:11, color:'#555', fontWeight:800 }}>
                {diffCfg.label}{diff!=='hard'?' · Coaching on':''}{logSession?' · Logged':''}
              </span>
            </div>
            {stats.msgCount>0 && <span style={{ fontSize:11, color:C.black, fontWeight:900 }}>Avg Score: {Math.round(stats.avgScore)}/100</span>}
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
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent;}
        html{scroll-behavior:smooth;}
        body{font-family:'DM Sans',sans-serif;-webkit-font-smoothing:antialiased;}
        button{cursor:pointer; font-family:'DM Sans',sans-serif;}
        ::-webkit-scrollbar{width:6px;}
        ::-webkit-scrollbar-thumb{background:${C.black};border-radius:3px;}
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