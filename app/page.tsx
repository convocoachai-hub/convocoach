'use client';

import { useRef, useState, useEffect } from 'react';
import {
  motion, useScroll, useTransform, useSpring,
  useMotionValue, AnimatePresence
} from 'framer-motion';
import Link from 'next/link';

// ─── Spring configs ───────────────────────────────────────────────────────────
const SP = { type: 'spring', stiffness: 180, damping: 24 } as const;
const EO = { duration: 0.75, ease: [0.16, 1, 0.3, 1] } as const;

// ─── Magnetic tilt hook ───────────────────────────────────────────────────────
function useTilt(str = 10) {
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
    const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
    rx.set(dy * -str); ry.set(dx * str);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return { ref, rotateX: useSpring(rx, { stiffness: 200, damping: 30 }), rotateY: useSpring(ry, { stiffness: 200, damping: 30 }), onMove, onLeave };
}

// ─── Scroll reveal ────────────────────────────────────────────────────────────
function Reveal({ children, delay = 0, y = 30, className = '' }:
  { children: React.ReactNode; delay?: number; y?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }} transition={{ ...EO, delay }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Tilt wrapper ─────────────────────────────────────────────────────────────
function Tilt({ children, str = 8, className = '' }:
  { children: React.ReactNode; str?: number; className?: string }) {
  const { ref, rotateX, rotateY, onMove, onLeave } = useTilt(str);
  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── Italic serif accent ──────────────────────────────────────────────────────
function I({ children, c = '#a5b4fc' }: { children: React.ReactNode; c?: string }) {
  return <span style={{ fontFamily: "'Instrument Serif',serif", fontStyle: 'italic', color: c, fontWeight: 400 }}>{children}</span>;
}

// ─── Animated bar ─────────────────────────────────────────────────────────────
function Bar({ pct, color, delay = 0 }: { pct: number; color: string; delay?: number }) {
  return (
    <div style={{ height: 3, background: 'rgba(255,255,255,0.07)', borderRadius: 99, overflow: 'hidden' }}>
      <motion.div style={{ height: '100%', background: color, borderRadius: 99 }}
        initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }}
        transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }} />
    </div>
  );
}

// ─── SVG Score Ring ───────────────────────────────────────────────────────────
function Ring({ val, max, color, label, size = 80 }:
  { val: number; max: number; color: string; label: string; size?: number }) {
  const r = size / 2 - 7; const circ = 2 * Math.PI * r;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={5}/>
          <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5}
            strokeLinecap="round" initial={{ strokeDasharray: `0 ${circ}` }}
            whileInView={{ strokeDasharray: `${(val/max)*circ} ${circ}` }} viewport={{ once: true }}
            transition={{ duration: 1.4, ease: [0.16,1,0.3,1], delay: 0.3 }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontSize: size > 70 ? 16 : 13, fontWeight: 700, color, fontFamily:"'DM Sans',sans-serif" }}>
            {max===10 ? val.toFixed(1) : `${val}%`}
          </span>
        </div>
      </div>
      <span style={{ fontSize: 10, color: 'rgba(242,240,235,0.35)', textTransform:'uppercase', letterSpacing:'0.08em', textAlign:'center', fontFamily:"'DM Sans',sans-serif" }}>{label}</span>
    </div>
  );
}

// ─── Chat bubble ──────────────────────────────────────────────────────────────
function Bub({ text, self, bad, delay = 0 }:
  { text: string; self?: boolean; bad?: boolean; delay?: number }) {
  return (
    <motion.div initial={{ opacity:0, x: self ? 10:-10, scale:0.97 }}
      whileInView={{ opacity:1, x:0, scale:1 }} viewport={{ once:true }}
      transition={{ ...SP, delay }}
      style={{ display:'flex', justifyContent: self ? 'flex-end':'flex-start', width:'100%' }}>
      <div style={{
        maxWidth:'80%', padding:'10px 14px', borderRadius: 16,
        borderBottomRightRadius: self ? 4 : 16, borderBottomLeftRadius: self ? 16 : 4,
        fontSize: 13, lineHeight: 1.55, fontFamily:"'DM Sans',sans-serif",
        background: self ? (bad?'rgba(255,60,40,0.1)':'rgba(91,79,233,0.16)') : 'rgba(255,255,255,0.05)',
        border: self ? (bad?'1px solid rgba(255,60,40,0.22)':'1px solid rgba(91,79,233,0.22)') : '1px solid rgba(255,255,255,0.08)',
        color: bad ? '#fca5a5' : 'rgba(242,240,235,0.88)',
      }}>{text}</div>
    </motion.div>
  );
}

// ─── Phone shell ──────────────────────────────────────────────────────────────
function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="phone-shell">
      <div className="phone-notch" />
      <div className="phone-sheen" />
      <div className="phone-inner">{children}</div>
    </div>
  );
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter({ to, sfx='' }: { to:number; sfx?:string }) {
  const [n,setN]=useState(0); const [go,setGo]=useState(false);
  const ref=useRef<HTMLSpanElement>(null);
  useEffect(()=>{
    const ob=new IntersectionObserver(([e])=>{ if(e.isIntersecting && !go) setGo(true); });
    if(ref.current) ob.observe(ref.current);
    return ()=>ob.disconnect();
  },[go]);
  useEffect(()=>{
    if(!go) return;
    let f:number; const s=performance.now();
    const run=(now:number)=>{
      const t=Math.min((now-s)/1600,1), ease=1-Math.pow(1-t,4);
      setN(Math.round(ease*to));
      if(t<1) f=requestAnimationFrame(run);
    };
    f=requestAnimationFrame(run);
    return ()=>cancelAnimationFrame(f);
  },[go,to]);
  return <span ref={ref}>{n}{sfx}</span>;
}

// ─── Diagonal SVG divider with floating 3D element ───────────────────────────
// ─── Diagonal SVG divider with floating 3D element ───────────────────────────
function DiagDivider({
  flip = false,
  floatEl,
  fromColor = '#060608',
  toColor = '#060608',
}: {
  flip?: boolean;
  floatEl?: React.ReactNode;
  fromColor?: string;
  toColor?: string;
}) {
  // Calculate the start and end points of the diagonal line
  const leftY = flip ? 0 : 80;
  const rightY = flip ? 80 : 0;

  return (
    <div style={{ 
      position: 'relative', 
      height: 120, 
      width: '100%', 
      overflow: 'visible', 
      zIndex: 20, 
      pointerEvents: 'none',
      marginTop: -30, // Negative margins pull the sections together
      marginBottom: -30 
    }}>
      
      {/* 1. The SVG Cut with Drop Shadow */}
      <svg 
        viewBox="0 0 1440 120" 
        preserveAspectRatio="none"
        style={{ 
          position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block',
          filter: 'drop-shadow(0px 20px 30px rgba(0,0,0,0.8))' // Casts shadow on section below
        }}
      >
        <defs>
          <linearGradient id={`neon-${flip ? 'f' : 'n'}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="rgba(91,79,233,0.9)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
          <linearGradient id={`shadow-${flip ? 'f' : 'n'}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.9)" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>

        {/* The deep background of the cut */}
        <path d={`M0,${leftY} L1440,${rightY} L1440,120 L0,120 Z`} fill="#030305" />
        
        {/* Inner shadow to create the "trench" depth */}
        <path d={`M0,${leftY} L1440,${rightY} L1440,120 L0,120 Z`} fill={`url(#shadow-${flip ? 'f' : 'n'})`} />

        {/* Sharp top highlight */}
        <line x1="0" y1={leftY} x2="1440" y2={rightY} stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        
        {/* Glowing laser edge */}
        <line x1="0" y1={leftY} x2="1440" y2={rightY} stroke={`url(#neon-${flip ? 'f' : 'n'})`} strokeWidth="4" style={{ filter: 'blur(3px)' }} />
      </svg>

      {/* 2. The Hanging Pendulum */}
      {floatEl && (
        <div style={{ 
          position: 'absolute', 
          top: '33.3%', // Exact vertical midpoint of the SVG diagonal line
          left: '50%', 
          transform: 'translateX(-50%)', 
          pointerEvents: 'auto', 
          zIndex: 30 
        }}>
          <motion.div 
            style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              transformOrigin: 'top center' // Makes it swing from the top instead of spinning
            }}
            animate={{ rotateZ: [-3, 3, -3] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* The physical metallic wire */}
            <div style={{
              width: 2,
              height: 40,
              background: 'linear-gradient(to bottom, rgba(255,255,255,0.8), rgba(255,255,255,0.1))',
              boxShadow: '0 0 10px rgba(255,255,255,0.5)',
              borderRadius: 2
            }} />
            
            {/* The Chip */}
            {floatEl}
          </motion.div>
        </div>
      )}
    </div>
  );
}

// ─── Floating 3D chip component ───────────────────────────────────────────────
function Chip({ icon, line1, line2, accent='#a5b4fc' }:
  { icon:string; line1:string; line2?:string; accent?:string }) {
  return (
    <div style={{
      background:'rgba(12,12,20,0.92)', backdropFilter:'blur(20px)',
      border:`1px solid ${accent}30`,
      borderRadius:16, padding:'10px 18px',
      boxShadow:`0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`,
      display:'flex', alignItems:'center', gap:10, whiteSpace:'nowrap',
    }}>
      <span style={{ fontSize:20 }}>{icon}</span>
      <div>
        <div style={{ fontSize:11, fontWeight:600, color:accent, letterSpacing:'0.04em', fontFamily:"'DM Sans',sans-serif" }}>{line1}</div>
        {line2 && <div style={{ fontSize:12, color:'rgba(242,240,235,0.65)', fontFamily:"'DM Sans',sans-serif" }}>{line2}</div>}
      </div>
    </div>
  );
}

// ─── Particle field ───────────────────────────────────────────────────────────
const DOTS = Array.from({length:20},(_,i)=>({
  id:i, x:Math.random()*100, y:Math.random()*100,
  sz:Math.random()*2+0.5, dur:Math.random()*8+5, d:Math.random()*4,
}));
function Particles() {
  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
      {DOTS.map(d=>(
        <motion.div key={d.id} style={{ position:'absolute', left:`${d.x}%`, top:`${d.y}%`,
          width:d.sz, height:d.sz, borderRadius:'50%', background:'rgba(91,79,233,0.5)' }}
          animate={{ y:[-8,8,-8], opacity:[0.15,0.55,0.15] }}
          transition={{ duration:d.dur, delay:d.d, repeat:Infinity, ease:'easeInOut' }}/>
      ))}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function Page() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroSP } = useScroll({ target: heroRef, offset:['start start','end start'] });
  const heroY = useTransform(heroSP,[0,1],[0,100]);
  const heroO = useTransform(heroSP,[0,0.6],[1,0]);
  const heroSc = useTransform(heroSP,[0,1],[1,0.95]);

  // Parallax orbs on different scroll rates
  const { scrollY } = useScroll();
  const orb1Y = useTransform(scrollY,[0,2000],[0,-160]);
  const orb2Y = useTransform(scrollY,[0,2000],[0,-80]);
  const orb3Y = useTransform(scrollY,[500,2500],[0,-200]);

  const [persona, setPersona] = useState(0);
  const PERSONAS = [
    { name:'Zara', trait:'Sarcastic 😏', reply:"groundbreaking. you must be a blast at funerals." },
    { name:'Emma', trait:'Shy 🌸', reply:"haha yeah i guess... 😅 what do you like?" },
    { name:'Sofia', trait:'Interested 💜', reply:"omg SAME!! okay what artists?? 👀" },
    { name:'Riley', trait:'Bored 😑', reply:"k" },
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        body { overflow-x:hidden; }
        ::selection { background:rgba(91,79,233,0.3); }
        ::-webkit-scrollbar { width:3px; }
        ::-webkit-scrollbar-thumb { background:rgba(91,79,233,0.35); border-radius:2px; }

        @keyframes floatA {
          0%,100% { transform:translateY(0) rotate(0deg); }
          33% { transform:translateY(-14px) rotate(0.8deg); }
          66% { transform:translateY(-7px) rotate(-0.5deg); }
        }
        @keyframes floatB {
          0%,100% { transform:translateY(0) rotate(0deg); }
          50% { transform:translateY(-10px) rotate(-1deg); }
        }
        @keyframes shimmer {
          0% { background-position:-200% 0; }
          100% { background-position:200% 0; }
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .fa { animation:floatA 7s ease-in-out infinite; }
        .fb { animation:floatB 5.5s ease-in-out infinite 0.8s; }

        /* Phone shell */
        .phone-shell {
          width:280px; height:580px; background:#07070f;
          border-radius:40px; border:7px solid #12121e;
          box-shadow:0 0 0 1px rgba(255,255,255,0.05),0 40px 100px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.04);
          overflow:hidden; position:relative; display:flex; flex-direction:column;
          flex-shrink:0;
        }
        .phone-notch {
          position:absolute; top:0; left:50%; transform:translateX(-50%);
          width:90px; height:22px; background:#07070f;
          border-bottom-left-radius:14px; border-bottom-right-radius:14px; z-index:20;
        }
        .phone-sheen {
          position:absolute; top:0; right:0; width:55%; height:45%;
          background:linear-gradient(135deg,rgba(255,255,255,0.025) 0%,transparent 60%);
          pointer-events:none; z-index:10;
        }
        .phone-inner { display:flex; flex-direction:column; flex:1; overflow:hidden; }

        /* Responsive grid helpers */
        .grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:32px; }
        .grid-3 { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; }
        .grid-4 { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        .grid-auto { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; }
        .hero-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }
        .practice-grid { display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:center; }

        /* ── MOBILE ────────────────────────────────────────────────────────── */
        @media (max-width:768px) {
          .grid-2 { grid-template-columns:1fr; gap:16px; }
          .grid-3 { grid-template-columns:1fr 1fr; gap:12px; }
          .grid-4 { grid-template-columns:1fr 1fr; gap:12px; }
          .hero-grid { grid-template-columns:1fr; gap:40px; }
          .hero-card-wrap { display:none !important; }
          .practice-grid { grid-template-columns:1fr; gap:40px; }
          .practice-phone-wrap { display:flex; justify-content:center; order:-1; }
          .phone-shell { width:240px; height:480px; }
          .demo-grid { grid-template-columns:1fr !important; }
          .pricing-grid { grid-template-columns:1fr !important; }
          .stat-row { gap:20px !important; }
          .hide-mobile { display:none !important; }
          .section-pad { padding:80px 20px !important; }
          .hero-pad { padding:100px 20px 60px !important; }
        }
        @media (max-width:480px) {
          .grid-3 { grid-template-columns:1fr; }
          .grid-4 { grid-template-columns:1fr 1fr; }
          .phone-shell { width:220px; height:440px; }
        }
      ` }} />

      <div style={{ background:'#060608', color:'#F2F0EB', fontFamily:"'DM Sans',sans-serif", overflowX:'hidden', minHeight:'100vh' }}>

        {/* ══════════════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════════════ */}
        <section ref={heroRef} style={{ minHeight:'100svh', position:'relative', display:'flex', alignItems:'center', overflow:'hidden' }}>

          {/* Parallax background orbs */}
          <motion.div style={{ y: orb1Y, position:'absolute', top:'-20%', left:'50%', transform:'translateX(-50%)', width:'min(900px,140vw)', height:'min(900px,140vw)', background:'radial-gradient(circle, rgba(91,79,233,0.13) 0%, transparent 65%)', pointerEvents:'none', zIndex:0 }} />
          <motion.div style={{ y: orb2Y, position:'absolute', bottom:'-10%', right:'-10%', width:500, height:500, background:'radial-gradient(circle, rgba(255,96,64,0.07) 0%, transparent 70%)', pointerEvents:'none', zIndex:0 }} />

          {/* Grid overlay */}
          <div style={{ position:'absolute', inset:0, zIndex:0,
            backgroundImage:'linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.02) 1px,transparent 1px)',
            backgroundSize:'48px 48px' }} />

          <Particles />

          <motion.div style={{ y:heroY, opacity:heroO, scale:heroSc, width:'100%', position:'relative', zIndex:10 }}>
            <div style={{ maxWidth:1300, margin:'0 auto' }} className="hero-pad">
              <div className="hero-grid">

                {/* ── Left copy ── */}
                <div>
                  <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={EO}
                    style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(91,79,233,0.1)', border:'1px solid rgba(91,79,233,0.22)', borderRadius:999, padding:'6px 16px', marginBottom:24 }}>
                    <motion.div style={{ width:6,height:6,borderRadius:'50%',background:'#5B4FE9' }}
                      animate={{ opacity:[1,0.3,1] }} transition={{ duration:2, repeat:Infinity }}/>
                    <span style={{ fontSize:11,fontWeight:500,color:'#a5b4fc',letterSpacing:'0.07em',textTransform:'uppercase' }}>AI Conversation Intelligence</span>
                  </motion.div>

                  <motion.h1 initial={{ opacity:0,y:24 }} animate={{ opacity:1,y:0 }} transition={{ ...EO,delay:0.08 }}
                    style={{ fontSize:'clamp(40px,6vw,74px)', fontWeight:500, lineHeight:1.0, letterSpacing:'-0.025em', marginBottom:24, color:'#F2F0EB' }}>
                    Stop Guessing<br /><I c="#a5b4fc">If They Like You.</I>
                  </motion.h1>

                  <motion.p initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} transition={{ ...EO,delay:0.15 }}
                    style={{ fontSize:'clamp(15px,1.6vw,18px)', lineHeight:1.7, color:'rgba(242,240,235,0.48)', maxWidth:480, marginBottom:36 }}>
                    Upload any chat screenshot. Our AI identifies hidden interest signals, energy mismatches, and the exact moments you lost her — in seconds.
                  </motion.p>

                  <motion.div initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ ...EO,delay:0.22 }}
                    style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:48 }}>
                    <Link href="/upload">
                      <motion.button whileHover={{ scale:1.03, boxShadow:'0 0 40px rgba(242,240,235,0.18)' }} whileTap={{ scale:0.97 }}
                        style={{ background:'#F2F0EB',color:'#060608',border:'none',borderRadius:14,padding:'14px 26px',fontSize:15,fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'flex',alignItems:'center',gap:8,boxShadow:'0 0 20px rgba(242,240,235,0.08)' }}>
                        Analyze My Chat — Free
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><path d="M2.5 7.5h10M8 3.5l4 4-4 4" stroke="#060608" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      </motion.button>
                    </Link>
                    <Link href="/practice">
                      <motion.button whileHover={{ scale:1.03, background:'rgba(255,255,255,0.07)' }} whileTap={{ scale:0.97 }}
                        style={{ background:'rgba(255,255,255,0.04)',color:'#F2F0EB',border:'1px solid rgba(255,255,255,0.1)',borderRadius:14,padding:'14px 26px',fontSize:15,fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
                        Practice Mode
                      </motion.button>
                    </Link>
                  </motion.div>

                  <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }}
                    className="stat-row" style={{ display:'flex', gap:36 }}>
                    {[{n:50,s:'k+',l:'Chats Analyzed'},{n:94,s:'%',l:'Accuracy'},{n:4,s:'.8★',l:'Rating'}].map((st,i)=>(
                      <div key={i}>
                        <div style={{ fontSize:22, fontWeight:700, color:'#F2F0EB', lineHeight:1, fontFamily:"'DM Sans',sans-serif" }}><Counter to={st.n} sfx={st.s}/></div>
                        <div style={{ fontSize:11, color:'rgba(242,240,235,0.3)', marginTop:4 }}>{st.l}</div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* ── Right: 3D Analysis card ── */}
                <motion.div initial={{ opacity:0,y:40 }} animate={{ opacity:1,y:0 }} transition={{ ...EO,delay:0.2 }}
                  className="hero-card-wrap" style={{ display:'block', position:'relative' }}>
                  <Tilt str={7}>
                    <div style={{ transformStyle:'preserve-3d', position:'relative' }}>
                      {/* Main card */}
                      <div style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:28, padding:28, backdropFilter:'blur(20px)', boxShadow:'0 32px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.06)' }}>
                        <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:20,paddingBottom:20,borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                          <div style={{ width:34,height:34,borderRadius:10,background:'rgba(91,79,233,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18 }}>🔍</div>
                          <div>
                            <div style={{ fontSize:13,fontWeight:600,color:'#F2F0EB' }}>Analysis Complete</div>
                            <div style={{ fontSize:11,color:'rgba(242,240,235,0.35)' }}>Sarah · Instagram · 2m ago</div>
                          </div>
                          <div style={{ marginLeft:'auto',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.2)',borderRadius:999,padding:'4px 10px',fontSize:11,color:'#6ee7b7',fontWeight:500 }}>● Live</div>
                        </div>
                        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:20 }}>
                          <Ring val={8.2} max={10} color="#a5b4fc" label="Score" size={76}/>
                          <Ring val={74} max={100} color="#f9a8d4" label="Interest" size={76}/>
                          <Ring val={68} max={100} color="#fcd34d" label="Attraction" size={76}/>
                        </div>
                        <div style={{ display:'flex',flexDirection:'column',gap:10,marginBottom:20 }}>
                          {[{l:'Humor',v:76,c:'#a5b4fc'},{l:'Confidence',v:62,c:'#86efac'},{l:'Curiosity',v:88,c:'#fcd34d'}].map((b,i)=>(
                            <div key={i}><div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'rgba(242,240,235,0.5)',marginBottom:5 }}><span>{b.l}</span><span>{b.v}%</span></div><Bar pct={b.v} color={b.c} delay={0.8+i*0.1}/></div>
                          ))}
                        </div>
                        {[{ok:true,t:'Strong opener. Her 3-line reply = genuine curiosity.'},{ok:false,t:'Energy mismatch. Your reply is 60% shorter than hers.'},{ok:null,t:'2 missed opportunities detected'}].map((ins,i)=>(
                          <div key={i} style={{ display:'flex',alignItems:'flex-start',gap:8,background:ins.ok===null?'rgba(255,196,0,0.06)':ins.ok?'rgba(16,185,129,0.07)':'rgba(255,96,64,0.07)',border:`1px solid ${ins.ok===null?'rgba(255,196,0,0.1)':ins.ok?'rgba(16,185,129,0.15)':'rgba(255,96,64,0.15)'}`,borderRadius:10,padding:'9px 12px',marginBottom:i<2?8:0 }}>
                            <span style={{ fontSize:13,color:ins.ok===null?'#fcd34d':ins.ok?'#6ee7b7':'#fca5a5',marginTop:1 }}>{ins.ok===null?'🔒':ins.ok?'✓':'!'}</span>
                            <span style={{ fontSize:12,color:ins.ok===null?'rgba(242,240,235,0.35)':'rgba(242,240,235,0.75)',lineHeight:1.5 }}>{ins.t}{ins.ok===null&&<span style={{ color:'#fcd34d',marginLeft:6 }}>Premium</span>}</span>
                          </div>
                        ))}
                      </div>

                      {/* 3D floating badges */}
                      <motion.div animate={{ y:[-5,5,-5] }} transition={{ duration:4,repeat:Infinity,ease:'easeInOut' }}
                        style={{ position:'absolute',top:-18,right:-20,background:'rgba(255,96,64,0.12)',border:'1px solid rgba(255,96,64,0.25)',borderRadius:14,padding:'9px 14px',backdropFilter:'blur(10px)',boxShadow:'0 8px 24px rgba(255,96,64,0.15)',zIndex:5 }}>
                        <div style={{ fontSize:11,color:'#fca5a5',fontWeight:600,letterSpacing:'0.04em' }}>🔥 ROAST MODE</div>
                        <div style={{ fontSize:12,color:'rgba(242,240,235,0.6)',marginTop:2 }}>"That reply was a crime."</div>
                      </motion.div>
                      <motion.div animate={{ y:[5,-5,5] }} transition={{ duration:3.5,repeat:Infinity,ease:'easeInOut',delay:0.5 }}
                        style={{ position:'absolute',bottom:-14,left:-22,background:'rgba(165,180,252,0.1)',border:'1px solid rgba(165,180,252,0.2)',borderRadius:14,padding:'9px 14px',backdropFilter:'blur(10px)',boxShadow:'0 8px 24px rgba(91,79,233,0.2)',zIndex:5 }}>
                        <div style={{ fontSize:11,color:'rgba(165,180,252,0.7)',fontWeight:500 }}>MOMENTUM</div>
                        <div style={{ fontSize:13,color:'#a5b4fc',fontWeight:600 }}>📉 Dying fast</div>
                      </motion.div>
                    </div>
                  </Tilt>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Scroll hint */}
          <motion.div animate={{ y:[0,8,0], opacity:[0.35,0.7,0.35] }} transition={{ duration:2.5,repeat:Infinity }}
            style={{ position:'absolute',bottom:28,left:'50%',transform:'translateX(-50%)',display:'flex',flexDirection:'column',alignItems:'center',gap:6 }}>
            <span style={{ fontSize:10,color:'rgba(242,240,235,0.25)',letterSpacing:'0.12em',textTransform:'uppercase' }}>Scroll</span>
            <div style={{ width:1,height:30,background:'linear-gradient(to bottom,rgba(91,79,233,0.6),transparent)' }}/>
          </motion.div>
        </section>

        {/* ── Diagonal divider 1 — with floating "Pain Points" chip ── */}
        <DiagDivider flip={false}
          floatEl={<Chip icon="😬" line1="Sound Familiar?" line2="We've all been here" accent="#fca5a5"/>}/>

        {/* ══════════════════════════════════════════════════════════════════
            PAIN POINTS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-pad" style={{ padding:'100px 32px', position:'relative' }}>
          <motion.div style={{ y: orb3Y, position:'absolute',top:0,right:0,width:400,height:400,background:'radial-gradient(circle,rgba(255,60,40,0.05) 0%,transparent 70%)',pointerEvents:'none' }}/>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <Reveal className="text-center" y={20}>
              <div style={{ textAlign:'center', marginBottom:56 }}>
                <p style={{ fontSize:11,color:'rgba(242,240,235,0.28)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14 }}>Sound Familiar</p>
                <h2 style={{ fontSize:'clamp(32px,5vw,58px)',fontWeight:500,letterSpacing:'-0.02em',lineHeight:1.05,color:'#F2F0EB' }}>
                  You texted fine.<br /><I c="rgba(242,240,235,0.28)">She just stopped replying.</I>
                </h2>
              </div>
            </Reveal>
            <div className="grid-auto">
              {[
                { s:'She asked a question. You answered.', p:'Answered. No question back. Conversation flatlined.', label:'Dead End', lc:'#fca5a5',
                  chat:[{t:'what kind of music do you like?'},{t:'mostly indie rock. you?',self:true,bad:true},{t:'same haha'}] },
                { s:'She was clearly testing you.', p:'You passed information. Failed the vibe check.', label:'Boring Reply', lc:'#fcd34d',
                  chat:[{t:'so what do you do for fun?'},{t:'gym, netflix, hanging with friends',self:true,bad:true},{t:'oh cool'}] },
                { s:'She opened with big energy.', p:'Your reply was 4 words. Her enthusiasm flatlined.', label:'Energy Drop', lc:'#86efac',
                  chat:[{t:'okay i have the funniest story 😭'},{t:'haha what happened',self:true,bad:true},{t:'...'}] },
              ].map((s,i)=>(
                <Reveal key={i} delay={i*0.1}>
                  <Tilt>
                    <div style={{ background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:22,padding:24,height:'100%',boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
                      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12,marginBottom:18 }}>
                        <p style={{ fontSize:13,color:'rgba(242,240,235,0.4)',lineHeight:1.5 }}>{s.s}</p>
                        <span style={{ flexShrink:0,background:`${s.lc}16`,border:`1px solid ${s.lc}35`,color:s.lc,fontSize:10,fontWeight:600,padding:'3px 9px',borderRadius:999,letterSpacing:'0.05em' }}>{s.label}</span>
                      </div>
                      <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:14 }}>
                        {s.chat.map((m,j)=><Bub key={j} text={m.t} self={(m as any).self} bad={(m as any).bad} delay={j*0.1+i*0.05}/>)}
                      </div>
                      <p style={{ fontSize:12,color:'rgba(242,240,235,0.3)',borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:12,lineHeight:1.55 }}>{s.p}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Diagonal divider 2 — flipped, with "How It Works" chip ── */}
        <DiagDivider flip={true}
          floatEl={<Chip icon="⚡" line1="3 Steps" line2="Zero sugarcoating" accent="#a5b4fc"/>}/>

        {/* ══════════════════════════════════════════════════════════════════
            HOW IT WORKS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-pad" style={{ padding:'100px 32px', background:'rgba(255,255,255,0.01)' }}>
          <div style={{ maxWidth:900, margin:'0 auto' }}>
            <Reveal>
              <div style={{ textAlign:'center', marginBottom:56 }}>
                <p style={{ fontSize:11,color:'rgba(242,240,235,0.28)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14 }}>How It Works</p>
                <h2 style={{ fontSize:'clamp(30px,4.5vw,50px)',fontWeight:500,letterSpacing:'-0.02em',color:'#F2F0EB' }}>
                  Three steps.<br /><I>Zero sugarcoating.</I>
                </h2>
              </div>
            </Reveal>
            {[
              {n:'01',icon:'📱',title:'Upload Screenshot',desc:"Any app — iMessage, WhatsApp, Hinge, Instagram. OCR extracts the text instantly. Screenshot deleted after 60 seconds.",tag:'Privacy First'},
              {n:'02',icon:'🧠',title:'AI Reads Subtext',desc:"Not just words — response timing, energy ratios, question deflection, emotional trajectory, and 11 hidden attraction signals.",tag:'11 Signal Points'},
              {n:'03',icon:'🎯',title:'Get Your Brief',desc:"Full breakdown: what you did right, what killed the vibe, suggested next messages, and the probability she's actually into you.",tag:'Actionable Output'},
            ].map((step,i)=>(
              <Reveal key={i} delay={i*0.12}>
                <div style={{ display:'flex',gap:20,marginBottom:20,alignItems:'flex-start' }}>
                  <div style={{ width:56,flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:8,paddingTop:2 }}>
                    <div style={{ width:50,height:50,borderRadius:14,background:'rgba(91,79,233,0.1)',border:'1px solid rgba(91,79,233,0.22)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22 }}>{step.icon}</div>
                    <span style={{ fontSize:10,fontWeight:700,color:'rgba(91,79,233,0.4)',letterSpacing:'0.1em' }}>{step.n}</span>
                    {i<2 && <div style={{ width:1,height:24,background:'rgba(91,79,233,0.2)' }}/>}
                  </div>
                  <div style={{ flex:1,background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:18,padding:'20px 24px' }}>
                    <div style={{ display:'flex',alignItems:'center',gap:10,marginBottom:8,flexWrap:'wrap' }}>
                      <h3 style={{ fontSize:18,fontWeight:600,color:'#F2F0EB' }}>{step.title}</h3>
                      <span style={{ fontSize:10,background:'rgba(91,79,233,0.1)',border:'1px solid rgba(91,79,233,0.2)',color:'#a5b4fc',padding:'3px 9px',borderRadius:999,fontWeight:500,letterSpacing:'0.05em' }}>{step.tag}</span>
                    </div>
                    <p style={{ fontSize:14,color:'rgba(242,240,235,0.44)',lineHeight:1.7 }}>{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Diagonal divider 3 — with "AI Demo" chip ── */}
        <DiagDivider flip={false}
          floatEl={<Chip icon="🖥️" line1="Live AI Demo" line2="Watch it think" accent="#86efac"/>}/>

        {/* ══════════════════════════════════════════════════════════════════
            LIVE DEMO TERMINAL
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-pad" style={{ padding:'100px 32px' }}>
          <div style={{ maxWidth:820, margin:'0 auto' }}>
            <Reveal>
              <div style={{ textAlign:'center', marginBottom:48 }}>
                <h2 style={{ fontSize:'clamp(30px,4.5vw,50px)',fontWeight:500,letterSpacing:'-0.02em',color:'#F2F0EB',marginBottom:12 }}>
                  Watch the AI<br /><I>Think in Real Time.</I>
                </h2>
                <p style={{ fontSize:15,color:'rgba(242,240,235,0.38)',maxWidth:440,margin:'0 auto' }}>
                  Every message scored across 8 dimensions simultaneously.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <Tilt str={5}>
                <div style={{ background:'rgba(7,7,14,0.95)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:24,overflow:'hidden',boxShadow:'0 40px 100px rgba(0,0,0,0.7)' }}>
                  {/* Terminal bar */}
                  <div style={{ display:'flex',alignItems:'center',gap:7,padding:'12px 18px',background:'rgba(255,255,255,0.03)',borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ width:9,height:9,borderRadius:'50%',background:'#ff5f57' }}/>
                    <div style={{ width:9,height:9,borderRadius:'50%',background:'#ffbd2e' }}/>
                    <div style={{ width:9,height:9,borderRadius:'50%',background:'#28ca41' }}/>
                    <span style={{ marginLeft:10,fontSize:11,color:'rgba(242,240,235,0.22)',fontFamily:'monospace' }}>convocoach — analysis engine v2.0</span>
                    <motion.div animate={{ opacity:[1,0.3,1],scale:[1,1.4,1] }} transition={{ duration:2,repeat:Infinity }}
                      style={{ marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#28ca41' }}/>
                  </div>
                  <div style={{ padding:'24px 28px 28px' }}>
                    {/* Input chat */}
                    <div style={{ marginBottom:20,paddingBottom:20,borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ fontSize:10,color:'rgba(242,240,235,0.22)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:14 }}>Input: Conversation Thread</div>
                      <div style={{ display:'flex',flexDirection:'column',gap:7 }}>
                        <Bub text="what are you doing tonight?" />
                        <Bub text="nothing much lol" self bad delay={0.3}/>
                        <Bub text="oh. wanna do something?" delay={0.5}/>
                        <Bub text="sure ig" self bad delay={0.8}/>
                      </div>
                    </div>
                    {/* Output grid */}
                    <div className="demo-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:20 }}>
                      <div>
                        <div style={{ fontSize:10,color:'rgba(242,240,235,0.22)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:14 }}>Scores</div>
                        <div style={{ display:'flex',gap:12,marginBottom:16,flexWrap:'wrap' }}>
                          <Ring val={3.1} max={10} color="#fca5a5" label="Score" size={68}/>
                          <Ring val={28} max={100} color="#fcd34d" label="Interest" size={68}/>
                          <Ring val={19} max={100} color="#f9a8d4" label="Attract" size={68}/>
                        </div>
                        {[{l:'Reply energy',v:12,c:'#fca5a5'},{l:'Curiosity shown',v:8,c:'#fca5a5'}].map((b,i)=>(
                          <div key={i} style={{ marginBottom:10 }}>
                            <div style={{ display:'flex',justifyContent:'space-between',fontSize:12,color:'rgba(242,240,235,0.32)',marginBottom:5 }}><span>{b.l}</span><span style={{ color:b.c }}>{b.v}%</span></div>
                            <Bar pct={b.v} color={b.c} delay={0.3+i*0.1}/>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ fontSize:10,color:'rgba(242,240,235,0.22)',letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:14 }}>Insights</div>
                        {[
                          {t:'She initiated twice. High interest.',bad:false,locked:false},
                          {t:'"ig" and "lol" = low effort.',bad:true,locked:false},
                          {t:'She carries 100% of weight.',bad:true,locked:false},
                          {t:'Missed date invitation.',bad:true,locked:true},
                        ].map((ins,i)=>(
                          <motion.div key={i} initial={{ opacity:0,x:8 }} whileInView={{ opacity:1,x:0 }} viewport={{ once:true }}
                            transition={{ delay:0.3+i*0.1,...SP }}
                            style={{ display:'flex',alignItems:'flex-start',gap:7,background:ins.locked?'rgba(255,255,255,0.02)':ins.bad?'rgba(255,96,64,0.07)':'rgba(16,185,129,0.07)',border:`1px solid ${ins.locked?'rgba(255,255,255,0.05)':ins.bad?'rgba(255,96,64,0.15)':'rgba(16,185,129,0.15)'}`,borderRadius:9,padding:'8px 11px',marginBottom:8,filter:ins.locked?'blur(2.5px)':'none' }}>
                            <span style={{ fontSize:12 }}>{ins.locked?'🔒':ins.bad?'✗':'✓'}</span>
                            <span style={{ fontSize:12,color:ins.locked?'rgba(242,240,235,0.2)':'rgba(242,240,235,0.72)',lineHeight:1.45 }}>{ins.t}{ins.locked&&<span style={{ color:'#fcd34d',marginLeft:6,fontSize:10 }}>Premium</span>}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          </div>
        </section>

        {/* ── Diagonal divider 4 — flipped, Roast Mode chip ── */}
        <DiagDivider flip={true}
          floatEl={<Chip icon="🔥" line1="ROAST MODE" line2="Brutal. Funny. Accurate." accent="#fca5a5"/>}/>

        {/* ══════════════════════════════════════════════════════════════════
            ROAST
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-pad" style={{ padding:'100px 32px', background:'rgba(255,40,20,0.02)', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 60% 70% at 50% 50%,rgba(255,96,64,0.08) 0%,transparent 70%)',pointerEvents:'none' }}/>
          <div style={{ maxWidth:800, margin:'0 auto', position:'relative', zIndex:1 }}>
            <Reveal>
              <div style={{ textAlign:'center', marginBottom:40 }}>
                <span style={{ display:'inline-block',background:'rgba(255,96,64,0.1)',border:'1px solid rgba(255,96,64,0.2)',color:'#fca5a5',fontSize:10,fontWeight:600,padding:'5px 14px',borderRadius:999,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:18 }}>🔥 Roast Mode</span>
                <h2 style={{ fontSize:'clamp(28px,4.5vw,50px)',fontWeight:500,letterSpacing:'-0.02em',color:'#F2F0EB',lineHeight:1.1 }}>
                  Brutal honesty.<br /><I c="rgba(255,150,120,0.85)">Delivered like a comedian.</I>
                </h2>
              </div>
            </Reveal>
            <Reveal delay={0.1}>
              <div style={{ background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:24,padding:'clamp(24px,4vw,40px)',position:'relative',overflow:'hidden' }}>
                <div style={{ position:'absolute',top:-16,left:20,fontSize:100,color:'rgba(255,96,64,0.07)',fontFamily:'serif',lineHeight:1,pointerEvents:'none' }}>"</div>
                <div style={{ display:'flex',flexDirection:'column',gap:7,marginBottom:24,padding:16,background:'rgba(255,255,255,0.02)',borderRadius:14 }}>
                  <Bub text="I think we'd really get along if you gave me a chance 🙏" self bad/>
                  <Bub text="aww haha thanks 🥰" delay={0.4}/>
                </div>
                <motion.div initial={{ opacity:0 }} whileInView={{ opacity:1 }} viewport={{ once:true }} transition={{ delay:0.6, duration:0.8 }}>
                  <p style={{ fontSize:'clamp(16px,2.2vw,24px)',fontFamily:"'Instrument Serif',serif",fontStyle:'italic',color:'#F2F0EB',lineHeight:1.55,marginBottom:10 }}>
                    "She said 'aww haha thanks'. That is not flirting. That is customer service. You are being handled, not pursued. The 🥰 is her way of returning your emotion without matching it — like tipping 10% on a good meal."
                  </p>
                  <p style={{ fontSize:12,color:'rgba(242,240,235,0.28)',letterSpacing:'0.06em',textTransform:'uppercase',fontWeight:500 }}>— ConvoCoach Roast Mode™</p>
                </motion.div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Diagonal divider 5 — Before/After chip ── */}
        <DiagDivider flip={false}
          floatEl={<Chip icon="↔️" line1="Before vs After" line2="One reply. Different outcome." accent="#6ee7b7"/>}/>

        {/* ══════════════════════════════════════════════════════════════════
            BEFORE / AFTER
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-pad" style={{ padding:'100px 32px' }}>
          <div style={{ maxWidth:960, margin:'0 auto' }}>
            <Reveal>
              <div style={{ textAlign:'center', marginBottom:48 }}>
                <h2 style={{ fontSize:'clamp(28px,4.5vw,50px)',fontWeight:500,letterSpacing:'-0.02em',color:'#F2F0EB',marginBottom:10 }}>
                  Small shifts.<br /><I>Completely different outcomes.</I>
                </h2>
                <p style={{ fontSize:15,color:'rgba(242,240,235,0.33)' }}>One reply change can flip the entire trajectory.</p>
              </div>
            </Reveal>
            <div className="grid-2">
              {[
                { title:'The Mistake', tc:'#fca5a5', bc:'rgba(255,96,64,0.04)', brd:'rgba(255,96,64,0.12)',
                  msgs:[{t:'worked all day, went to gym. you?'},{t:'nice. just chilled.',self:true,bad:true}],
                  note:'Zero acknowledgment. No follow-up. She has to carry it.' },
                { title:'The Fix', tc:'#6ee7b7', bc:'rgba(16,185,129,0.04)', brd:'rgba(16,185,129,0.12)',
                  msgs:[{t:'worked all day, went to gym. you?'},{t:"survived my inbox. gym people honestly intimidate me — what do you lift?",self:true}],
                  note:'Playful self-deprecation + genuine follow-up. She has something to work with.' },
              ].map((s,i)=>(
                <Reveal key={i} delay={i*0.1}>
                  <Tilt>
                    <div style={{ background:s.bc,border:`1px solid ${s.brd}`,borderRadius:22,padding:'clamp(20px,3vw,28px)',height:'100%' }}>
                      <div style={{ display:'flex',alignItems:'center',gap:8,marginBottom:20 }}>
                        <div style={{ width:7,height:7,borderRadius:'50%',background:s.tc }}/>
                        <span style={{ fontSize:11,color:s.tc,fontWeight:700,letterSpacing:'0.08em',textTransform:'uppercase' }}>{s.title}</span>
                      </div>
                      <div style={{ display:'flex',flexDirection:'column',gap:7,marginBottom:16 }}>
                        {s.msgs.map((m,j)=><Bub key={j} text={m.t} self={(m as any).self} bad={(m as any).bad} delay={j*0.15}/>)}
                      </div>
                      <p style={{ fontSize:12,color:'rgba(242,240,235,0.33)',borderTop:`1px solid ${s.brd}`,paddingTop:14,lineHeight:1.6 }}>{s.note}</p>
                    </div>
                  </Tilt>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Diagonal divider 6 — flipped, Practice chip ── */}
        <DiagDivider flip={true}
          floatEl={<Chip icon="🎭" line1="Practice Mode" line2="6 AI Personalities" accent="#a5b4fc"/>}/>

        {/* ══════════════════════════════════════════════════════════════════
            PRACTICE MODE
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-pad" style={{ padding:'100px 32px', background:'rgba(91,79,233,0.02)' }}>
          <div style={{ maxWidth:1060, margin:'0 auto' }}>
            <div className="practice-grid">
              <Reveal>
                <div>
                  <p style={{ fontSize:11,color:'rgba(242,240,235,0.28)',letterSpacing:'0.12em',textTransform:'uppercase',marginBottom:14 }}>Practice Mode</p>
                  <h2 style={{ fontSize:'clamp(28px,4vw,46px)',fontWeight:500,letterSpacing:'-0.02em',lineHeight:1.05,color:'#F2F0EB',marginBottom:18 }}>
                    Train against<br /><I>every personality type.</I>
                  </h2>
                  <p style={{ fontSize:15,color:'rgba(242,240,235,0.43)',lineHeight:1.75,marginBottom:32 }}>
                    Six distinct AI characters responding realistically. Three difficulty levels. Real-time coaching in beginner mode.
                  </p>
                  <div style={{ display:'flex',flexDirection:'column',gap:6,marginBottom:24 }}>
                    {PERSONAS.map((p,i)=>(
                      <motion.button key={i} onClick={()=>setPersona(i)} whileHover={{ x:4 }}
                        style={{ display:'flex',alignItems:'center',gap:12,padding:'12px 16px',borderRadius:14,cursor:'pointer',background:persona===i?'rgba(91,79,233,0.12)':'transparent',border:persona===i?'1px solid rgba(91,79,233,0.25)':'1px solid transparent',transition:'all 0.2s',textAlign:'left' }}>
                        <span style={{ fontSize:20 }}>{p.name.includes('Zara')?'😏':p.name.includes('Emma')?'🌸':p.name.includes('Sofia')?'💜':'😑'}</span>
                        <div>
                          <div style={{ fontSize:14,fontWeight:500,color:persona===i?'#F2F0EB':'rgba(242,240,235,0.45)',fontFamily:"'DM Sans',sans-serif" }}>{p.name}</div>
                          <div style={{ fontSize:11,color:'rgba(242,240,235,0.22)',fontFamily:"'DM Sans',sans-serif" }}>{p.trait}</div>
                        </div>
                        {persona===i && <motion.div layoutId="pp" style={{ marginLeft:'auto',width:6,height:6,borderRadius:'50%',background:'#a5b4fc' }}/>}
                      </motion.button>
                    ))}
                  </div>
                  <Link href="/practice">
                    <motion.button whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                      style={{ background:'rgba(91,79,233,0.14)',border:'1px solid rgba(91,79,233,0.25)',color:'#a5b4fc',borderRadius:12,padding:'11px 22px',fontSize:14,fontWeight:500,cursor:'pointer',fontFamily:"'DM Sans',sans-serif" }}>
                      Start Practicing →
                    </motion.button>
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={0.15} className="practice-phone-wrap">
                <div className="fa" style={{ perspective:1000 }}>
                  <motion.div style={{ rotateY:8, rotateX:-4, transformStyle:'preserve-3d', filter:'drop-shadow(0 40px 80px rgba(0,0,0,0.7))' }}>
                    <Phone>
                      <div style={{ paddingTop:32,padding:'32px 16px 12px',borderBottom:'1px solid rgba(255,255,255,0.05)',display:'flex',alignItems:'center',gap:9 }}>
                        <div style={{ width:30,height:30,borderRadius:9,background:'rgba(255,255,255,0.06)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:15 }}>
                          {persona===0?'😏':persona===1?'🌸':persona===2?'💜':'😑'}
                        </div>
                        <div>
                          <div style={{ fontSize:12,fontWeight:600,color:'#F2F0EB',fontFamily:"'DM Sans',sans-serif" }}>{PERSONAS[persona].name}</div>
                          <div style={{ fontSize:10,color:'rgba(242,240,235,0.28)',fontFamily:"'DM Sans',sans-serif" }}>typing...</div>
                        </div>
                      </div>
                      <div style={{ flex:1,padding:'14px 12px',display:'flex',flexDirection:'column',justifyContent:'flex-end',gap:7 }}>
                        <Bub text="hey what kind of music do you like?" self/>
                        <AnimatePresence mode="wait">
                          <motion.div key={persona} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-4 }} transition={SP}>
                            <Bub text={PERSONAS[persona].reply}/>
                          </motion.div>
                        </AnimatePresence>
                        <div style={{ display:'flex',gap:4,padding:'9px 12px',background:'rgba(255,255,255,0.04)',borderRadius:'14px 14px 14px 3px',width:'fit-content' }}>
                          {[0,0.2,0.4].map((d,i)=>(<motion.div key={i} style={{ width:5,height:5,borderRadius:'50%',background:'rgba(242,240,235,0.28)' }} animate={{ y:[0,-4,0] }} transition={{ duration:0.8,delay:d,repeat:Infinity }}/>))}
                        </div>
                      </div>
                      <div style={{ padding:'10px 12px',borderTop:'1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ background:'rgba(255,255,255,0.05)',borderRadius:18,padding:'9px 14px' }}>
                          <span style={{ fontSize:12,color:'rgba(242,240,235,0.18)',fontFamily:"'DM Sans',sans-serif" }}>Your message...</span>
                        </div>
                      </div>
                    </Phone>
                  </motion.div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ── Diagonal divider 7 — Skill system chip ── */}
        <DiagDivider flip={false}
          floatEl={<Chip icon="👑" line1="Skill System" line2="Rank up as you improve" accent="#fcd34d"/>}/>

        {/* ══════════════════════════════════════════════════════════════════
            SKILL LEVELS
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-pad" style={{ padding:'100px 32px' }}>
          <div style={{ maxWidth:860, margin:'0 auto', textAlign:'center' }}>
            <Reveal>
              <h2 style={{ fontSize:'clamp(28px,4.5vw,50px)',fontWeight:500,letterSpacing:'-0.02em',color:'#F2F0EB',marginBottom:48,lineHeight:1.1 }}>
                Your rank reflects<br /><I>what you've actually learned.</I>
              </h2>
            </Reveal>
            <div className="grid-4">
              {[
                {e:'💤',n:'Dry Texter',pts:'0',d:'One-word replies. K energy.',dim:true},
                {e:'😏',n:'Average Talker',pts:'50',d:'Can hold a convo. Barely.',dim:false},
                {e:'✨',n:'Smooth Talker',pts:'150',d:'Witty. Makes them lean in.',dim:false},
                {e:'👑',n:'Elite Charmer',pts:'300',d:'They text first. Always.',gold:true,dim:false},
              ].map((l,i)=>(
                <Reveal key={i} delay={i*0.1}>
                  <div style={{ background:l.gold?'rgba(252,211,77,0.04)':'rgba(255,255,255,0.02)',border:l.gold?'1px solid rgba(252,211,77,0.15)':'1px solid rgba(255,255,255,0.07)',borderRadius:18,padding:20,textAlign:'center',opacity:l.dim?0.45:1 }}>
                    <div style={{ fontSize:28,marginBottom:10 }}>{l.e}</div>
                    <div style={{ fontSize:13,fontWeight:600,color:(l as any).gold?'#fcd34d':'#F2F0EB',marginBottom:4,fontFamily:"'DM Sans',sans-serif" }}>{l.n}</div>
                    <div style={{ fontSize:11,color:'rgba(242,240,235,0.22)',marginBottom:8,fontFamily:"'DM Sans',sans-serif" }}>{l.pts}+ pts</div>
                    <div style={{ fontSize:11,color:'rgba(242,240,235,0.35)',lineHeight:1.5,fontFamily:"'DM Sans',sans-serif" }}>{l.d}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ── Diagonal divider 8 — flipped, Premium chip ── */}
        <DiagDivider flip={true}
          floatEl={<Chip icon="💎" line1="Premium · ₹100" line2="Lifetime access" accent="#fcd34d"/>}/>

        {/* ══════════════════════════════════════════════════════════════════
            PREMIUM
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-pad" style={{ padding:'100px 32px', background:'rgba(255,255,255,0.01)' }}>
          <div style={{ maxWidth:940, margin:'0 auto' }}>
            <Reveal>
              <div style={{ textAlign:'center',marginBottom:48 }}>
                <span style={{ display:'inline-block',background:'rgba(252,211,77,0.08)',border:'1px solid rgba(252,211,77,0.15)',color:'#fcd34d',fontSize:10,fontWeight:600,padding:'5px 14px',borderRadius:999,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:18 }}>👑 Premium</span>
                <h2 style={{ fontSize:'clamp(28px,4.5vw,50px)',fontWeight:500,letterSpacing:'-0.02em',color:'#F2F0EB',lineHeight:1.1 }}>
                  See the full picture.<br /><I c="rgba(252,211,77,0.65)">One payment. Lifetime.</I>
                </h2>
              </div>
            </Reveal>

            <div className="grid-auto" style={{ marginBottom:36 }}>
              {[
                {e:'💘',t:'Attraction Probability',d:'Exact % based on 11 behavioral signals.'},
                {e:'🎯',t:'Missed Opportunity Detector',d:'Every moment you could have escalated.'},
                {e:'⚡',t:'Conversation Momentum',d:'Heating up or dying? Real-time graph.'},
                {e:'🧠',t:'Deep Psychology Report',d:'Attachment style, intent signals, trajectory.'},
                {e:'∞',t:'Unlimited Analyses',d:'No daily limits. Analyze everything.'},
                {e:'🎭',t:'Expert Practice Mode',d:'All 6 AI personalities at max difficulty.'},
              ].map((f,i)=>(
                <Reveal key={i} delay={i*0.06}>
                  <div style={{ background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:18,padding:22,position:'relative',overflow:'hidden' }}>
                    <motion.div whileHover={{ opacity:0 }} transition={{ duration:0.25 }}
                      style={{ position:'absolute',inset:0,background:'rgba(6,6,8,0.6)',backdropFilter:'blur(3px)',borderRadius:18,zIndex:2,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:5 }}>
                      <span style={{ fontSize:16 }}>🔒</span>
                      <span style={{ fontSize:10,color:'#fcd34d',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase' }}>Premium</span>
                    </motion.div>
                    <span style={{ fontSize:26,display:'block',marginBottom:10 }}>{f.e}</span>
                    <div style={{ fontSize:14,fontWeight:600,color:'#F2F0EB',marginBottom:6,fontFamily:"'DM Sans',sans-serif" }}>{f.t}</div>
                    <div style={{ fontSize:12,color:'rgba(242,240,235,0.38)',lineHeight:1.6,fontFamily:"'DM Sans',sans-serif" }}>{f.d}</div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal>
              <div className="pricing-grid" style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,maxWidth:560,margin:'0 auto' }}>
                <div style={{ background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:18,padding:24,textAlign:'center' }}>
                  <div style={{ fontSize:11,color:'rgba(242,240,235,0.28)',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10 }}>Free</div>
                  {['1 anonymous try','3 after login','Basic scores only'].map((t,i)=>(
                    <div key={i} style={{ fontSize:12,color:'rgba(242,240,235,0.32)',padding:'6px 0',borderTop:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:8 }}><span style={{ color:'rgba(242,240,235,0.18)' }}>—</span>{t}</div>
                  ))}
                </div>
                <div style={{ background:'rgba(252,211,77,0.04)',border:'1px solid rgba(252,211,77,0.15)',borderRadius:18,padding:24,textAlign:'center' }}>
                  <div style={{ fontSize:11,color:'#fcd34d',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:10 }}>Premium · ₹100</div>
                  {['Unlimited analyses','All 8 deep scores','Missed opportunities','Attraction signals'].map((t,i)=>(
                    <div key={i} style={{ fontSize:12,color:'rgba(242,240,235,0.65)',padding:'6px 0',borderTop:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:8 }}><span style={{ color:'#6ee7b7' }}>✓</span>{t}</div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Final diagonal transition ── */}
        <DiagDivider flip={false}
          floatEl={<Chip icon="🚀" line1="Ready?" line2="First one's free" accent="#a5b4fc"/>}/>

        {/* ══════════════════════════════════════════════════════════════════
            CTA
        ══════════════════════════════════════════════════════════════════ */}
        <section className="section-pad" style={{ padding:'120px 32px', position:'relative', overflow:'hidden', textAlign:'center' }}>
          <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse 55% 55% at 50% 50%,rgba(91,79,233,0.1) 0%,transparent 70%)',pointerEvents:'none' }}/>
          <Particles/>
          <div style={{ position:'relative',zIndex:1,maxWidth:660,margin:'0 auto' }}>
            <Reveal>
              <h2 style={{ fontSize:'clamp(44px,7vw,84px)',fontWeight:500,letterSpacing:'-0.03em',lineHeight:0.95,color:'#F2F0EB',marginBottom:22 }}>
                Stop Sending<br /><I c="#a5b4fc">Cringe Texts.</I>
              </h2>
              <p style={{ fontSize:'clamp(15px,1.6vw,18px)',color:'rgba(242,240,235,0.38)',marginBottom:44,lineHeight:1.65 }}>
                First analysis is 100% free. No account required.<br />Find out what's actually going wrong.
              </p>
              <Link href="/upload">
                <motion.button whileHover={{ scale:1.04, boxShadow:'0 0 60px rgba(242,240,235,0.2)' }} whileTap={{ scale:0.96 }}
                  style={{ background:'#F2F0EB',color:'#060608',border:'none',borderRadius:16,padding:'16px 36px',fontSize:'clamp(14px,1.4vw,16px)',fontWeight:600,cursor:'pointer',fontFamily:"'DM Sans',sans-serif",display:'inline-flex',alignItems:'center',gap:10,boxShadow:'0 0 30px rgba(242,240,235,0.1)' }}>
                  Analyze My Chat Now
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2.5 8h11M9 3.5l4.5 4.5-4.5 4.5" stroke="#060608" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </motion.button>
              </Link>
              <p style={{ marginTop:18,fontSize:11,color:'rgba(242,240,235,0.18)',letterSpacing:'0.1em',textTransform:'uppercase' }}>Free forever · Screenshot deleted instantly · No card</p>
            </Reveal>
          </div>
        </section>

       

      </div>
    </>
  );
}