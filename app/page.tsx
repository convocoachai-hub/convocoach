'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

// ─── DESIGN TOKENS ─────────────────────────────────────────────────────────
const C = {
  yellow:    '#FFD84D',
  red:       '#FF3D3D',
  blue:      '#4338CA',
  green:     '#16A34A',
  pink:      '#EC4899',
  black:     '#0A0A0A',
  white:     '#FFFFFF',
  bgCream:   '#FAF6EE',
  bgBlue:    '#EEF2FF',
  bgYellow:  '#FFFBEA',
  bgPink:    '#FFF0F7',
  bgGreen:   '#ECFDF5',
  shadow:    '5px 5px 0px #0A0A0A',
  shadowLg:  '8px 8px 0px #0A0A0A',
  shadowSm:  '3px 3px 0px #0A0A0A',
  border:    '2.5px solid #0A0A0A',
  borderThin:'1.5px solid #0A0A0A',
};

const SNAP = { duration: 0.16, ease: [0.23, 1, 0.32, 1] } as const;

// ─── NOISE TEXTURE OVERLAY ─────────────────────────────────────────────────
function Noise({ opacity = 0.035 }: { opacity?: number }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
      backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      backgroundSize: '180px',
      opacity,
      mixBlendMode: 'multiply',
    }} />
  );
}

// ─── 3D TILT CARD ──────────────────────────────────────────────────────────
function TiltCard({ children, style = {}, bg = C.white, intensity = 12 }: {
  children: React.ReactNode; style?: React.CSSProperties; bg?: string; intensity?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-1, 1], [intensity, -intensity]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(x, [-1, 1], [-intensity, intensity]), { stiffness: 300, damping: 30 });
  const scale = useSpring(1, { stiffness: 300, damping: 30 });
  const shadowX = useTransform(rotateY, [-intensity, intensity], [8, -8]);
  const shadowY = useTransform(rotateX, [-intensity, intensity], [-8, 8]);

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
    scale.set(1.02);
  }, [x, y, scale]);

  const handleLeave = useCallback(() => {
    x.set(0); y.set(0); scale.set(1);
  }, [x, y, scale]);

  return (
    <motion.div ref={ref}
      onMouseMove={handleMouse} onMouseLeave={handleLeave}
      style={{
        perspective: 1000,
        ...style,
      }}>
      <motion.div style={{
        rotateX, rotateY, scale,
        transformStyle: 'preserve-3d',
        background: bg,
        border: C.border,
        borderRadius: 18,
        padding: 22,
        boxShadow: useTransform([shadowX, shadowY], ([sx, sy]) => `${sx}px ${sy}px 0px #0A0A0A`),
      }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ─── GEOMETRIC DECORATORS ──────────────────────────────────────────────────
const Dot = ({ size = 10, color = C.yellow, style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: color, border: `2px solid ${C.black}`, flexShrink: 0, ...style }} />
);

function FloatShape({ children, delay = 0, amplitude = 6, style = {} }: {
  children: React.ReactNode; delay?: number; amplitude?: number; style?: React.CSSProperties;
}) {
  return (
    <motion.div
      animate={{ y: [-amplitude, amplitude, -amplitude] }}
      transition={{ type: 'tween', duration: 3 + delay * 0.5, repeat: Infinity, ease: 'easeInOut', delay }}
      style={style}>
      {children}
    </motion.div>
  );
}

const Star = ({ size = 20, color = C.yellow, style = {}, spin = false }: { size?: number; color?: string; style?: React.CSSProperties; spin?: boolean }) => (
  <motion.svg width={size} height={size} viewBox="0 0 20 20" style={style}
    animate={spin ? { rotate: 360 } : undefined}
    transition={spin ? { type: 'tween', duration: 8, repeat: Infinity, ease: 'linear' } : undefined}>
    <polygon points="10,1 12.2,7.4 19,7.4 13.6,11.6 15.8,18 10,14 4.2,18 6.4,11.6 1,7.4 7.8,7.4" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </motion.svg>
);

const Triangle = ({ size = 18, color = C.red, style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" style={style}>
    <polygon points="9,2 17,16 1,16" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);

const Diamond = ({ size = 18, color = C.blue, style = {} }: { size?: number; color?: string; style?: React.CSSProperties }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" style={style}>
    <polygon points="9,1 17,9 9,17 1,9" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);

// ─── BADGE ─────────────────────────────────────────────────────────────────
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
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
      <div style={{ width: 10, height: 10, background: color, border: C.border, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif", color: C.black }}>
        {text}
      </span>
    </div>
  );
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.28, delay, ease: [0.23, 1, 0.32, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

// ─── BUTTON ───────────────────────────────────────────────────────────────
function Btn({ children, bg = C.yellow, onClick, href, size = 'md', textColor = C.black }: {
  children: React.ReactNode; bg?: string; onClick?: () => void; href?: string; size?: 'sm' | 'md' | 'lg'; textColor?: string;
}) {
  const pad = size === 'lg' ? '15px 32px' : size === 'sm' ? '7px 14px' : '11px 22px';
  const fs  = size === 'lg' ? 16 : size === 'sm' ? 11 : 13;
  const el = (
    <motion.button onClick={onClick}
      whileHover={{ y: -3, boxShadow: C.shadowLg }}
      whileTap={{ y: 1, boxShadow: '2px 2px 0px #0A0A0A', scale: 0.98 }}
      transition={SNAP}
      style={{
        background: bg, color: textColor, border: C.border, borderRadius: 10,
        padding: pad, fontSize: fs, fontWeight: 900, cursor: 'pointer',
        fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadow,
        display: 'inline-flex', alignItems: 'center', gap: 7, letterSpacing: '-0.01em',
        whiteSpace: 'nowrap',
      }}>
      {children}
    </motion.button>
  );
  return href ? <Link href={href} style={{ textDecoration: 'none' }}>{el}</Link> : el;
}

// ─── ANIMATED COUNTER ─────────────────────────────────────────────────────
function Counter({ to, sfx = '' }: { to: number; sfx?: string }) {
  const [n, setN] = useState(0);
  const [go, setGo] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const ob = new IntersectionObserver(([e]) => { if (e.isIntersecting && !go) setGo(true); });
    if (ref.current) ob.observe(ref.current);
    return () => ob.disconnect();
  }, [go]);
  useEffect(() => {
    if (!go) return;
    let f: number;
    const s = performance.now();
    const run = (now: number) => {
      const t = Math.min((now - s) / 1600, 1);
      const ease = 1 - Math.pow(1 - t, 4);
      setN(Math.round(ease * to));
      if (t < 1) f = requestAnimationFrame(run);
    };
    f = requestAnimationFrame(run);
    return () => cancelAnimationFrame(f);
  }, [go, to]);
  return <span ref={ref}>{n.toLocaleString()}{sfx}</span>;
}

// ─── CHAT BUBBLE ──────────────────────────────────────────────────────────
function Bub({ text, self, bad, delay = 0 }: { text: string; self?: boolean; bad?: boolean; delay?: number }) {
  return (
    <motion.div initial={{ opacity: 0, x: self ? 8 : -8 }} whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.2, delay }}
      style={{ display: 'flex', justifyContent: self ? 'flex-end' : 'flex-start', width: '100%' }}>
      <div style={{
        maxWidth: '84%', padding: '8px 12px', borderRadius: 12,
        borderBottomRightRadius: self ? 3 : 12, borderBottomLeftRadius: self ? 12 : 3,
        fontSize: 12.5, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif",
        background: self ? (bad ? '#FFE4E4' : C.black) : '#EFEFEF',
        border: C.borderThin,
        color: self ? (bad ? C.red : C.white) : C.black,
        boxShadow: C.shadowSm,
        wordBreak: 'break-word',
      }}>{text}</div>
    </motion.div>
  );
}

// ─── MARQUEE ──────────────────────────────────────────────────────────────
const TICKER = [
  '💘 Dating · 78% attraction detected',
  '💼 Work · Tone too passive — fix before sending',
  '😵‍💫 Situationship · She wants more. You\'re missing it.',
  '🫂 Friendship · Passive aggression in reply 3',
  '🤝 Networking · Cold message — warming it up',
  '💘 Dating · 3 missed escalation moments',
  '👋 Reconnecting · High interest. Low follow-through.',
  '🏠 Family · Emotional undercurrent — proceed carefully',
];

function Marquee() {
  const items = [...TICKER, ...TICKER];
  return (
    <div style={{ overflow: 'hidden', background: C.black, borderTop: C.border, borderBottom: C.border, padding: '11px 0' }}>
      <motion.div style={{ display: 'flex', width: 'max-content' }}
        animate={{ x: [0, `-${100 / items.length * TICKER.length}%`] }}
        transition={{ type: 'tween', duration: 30, repeat: Infinity, ease: 'linear', repeatType: 'loop' }}>
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 28px', whiteSpace: 'nowrap' }}>
            <span style={{ fontSize: 12, color: C.yellow, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{item}</span>
            <Star size={12} color={C.red} />
          </div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── PHONE SHELL ──────────────────────────────────────────────────────────
function Phone({ children }: { children: React.ReactNode }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-1, 1], [8, -8]), { stiffness: 250, damping: 25 });
  const rotateY = useSpring(useTransform(x, [-1, 1], [-8, 8]), { stiffness: 250, damping: 25 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  }, [x, y]);

  return (
    <motion.div
      onMouseMove={handleMouse} onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ perspective: 1200 }}>
      <motion.div style={{
        rotateX, rotateY,
        width: 255, height: 520, background: C.black, borderRadius: 36,
        border: '4px solid #111', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: '12px 16px 40px rgba(0,0,0,0.4), 5px 5px 0px #0A0A0A',
        transformStyle: 'preserve-3d',
      }}>
        {/* Notch */}
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 76, height: 18, background: '#111', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, zIndex: 20 }} />
        {/* Screen shine */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, transparent 100%)',
          borderRadius: '36px 36px 0 0', zIndex: 10, pointerEvents: 'none',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>{children}</div>
      </motion.div>
    </motion.div>
  );
}

// ─── 3D ANALYSIS CARD ─────────────────────────────────────────────────────
function AnalysisCard() {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useSpring(useTransform(y, [-1, 1], [14, -14]), { stiffness: 280, damping: 28 });
  const rotateY = useSpring(useTransform(x, [-1, 1], [-14, 14]), { stiffness: 280, damping: 28 });

  const handleMouse = useCallback((e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * 2);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * 2);
  }, [x, y]);

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: 0.22 }}
      style={{ width: 320, flexShrink: 0, perspective: 1200 }}>

      <motion.div style={{
        rotateX, rotateY,
        transformStyle: 'preserve-3d',
        position: 'relative',
      }}>
        {/* Floating badges — 3D lifted */}
        <FloatShape delay={0} amplitude={5} style={{ position: 'absolute', top: -22, right: -14, zIndex: 5, transform: 'translateZ(30px)' }}>
          <div style={{ background: C.yellow, border: C.border, borderRadius: 14, padding: '9px 12px', boxShadow: C.shadowLg, textAlign: 'center' }}>
            <div style={{ fontSize: 10, fontWeight: 900, color: C.black, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif" }}>🔥 Roast Mode</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 1, fontFamily: "'DM Sans', sans-serif" }}>"That reply was a crime."</div>
          </div>
        </FloatShape>

        <FloatShape delay={1.2} amplitude={6} style={{ position: 'absolute', bottom: -18, left: -18, zIndex: 5, transform: 'translateZ(24px)' }}>
          <div style={{ background: C.red, border: C.border, borderRadius: 14, padding: '9px 12px', boxShadow: C.shadowLg }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.white, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase', letterSpacing: '0.08em' }}>Momentum</div>
            <div style={{ fontSize: 12, color: C.white, fontWeight: 900 }}>📉 Dying fast</div>
          </div>
        </FloatShape>

        {/* Main card */}
        <div style={{
          background: C.white, borderRadius: 20, padding: 22, border: C.border,
          boxShadow: '10px 14px 32px rgba(0,0,0,0.18), 5px 5px 0px #0A0A0A',
          transformStyle: 'preserve-3d',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 16, paddingBottom: 14, borderBottom: C.borderThin }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.bgBlue, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🔍</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: C.black, fontFamily: "'DM Sans', sans-serif" }}>Analysis Complete</div>
              <div style={{ fontSize: 10.5, color: '#777' }}>💘 Dating · 2 min ago</div>
            </div>
            <div style={{ marginLeft: 'auto', flexShrink: 0 }}>
              <Badge text="Live" color={C.green} textColor={C.white} rotate={0} />
            </div>
          </div>

          {/* Score circles */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Score', val: 74, color: C.red },
              { label: 'Interest', val: 81, color: C.blue },
              { label: 'Attract', val: 68, color: C.green },
            ].map(({ label, val, color }) => {
              const r = 24; const circ = 2 * Math.PI * r;
              return (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ position: 'relative', width: 60, height: 60, border: C.border, borderRadius: '50%', background: '#F6F6F6', boxShadow: C.shadowSm }}>
                    <svg width={60} height={60} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
                      <circle cx={30} cy={30} r={r} fill="none" stroke="#E5E5E5" strokeWidth={5} />
                      <motion.circle cx={30} cy={30} r={r} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round"
                        initial={{ strokeDasharray: `0 ${circ}` }}
                        whileInView={{ strokeDasharray: `${(val / 100) * circ} ${circ}` }}
                        viewport={{ once: true }} transition={{ duration: 0.9, delay: 0.3, ease: [0.23, 1, 0.32, 1] }} />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 900, color, fontFamily: "'DM Sans', sans-serif" }}>{val}%</span>
                    </div>
                  </div>
                  <span style={{ fontSize: 9, color: '#777', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>{label}</span>
                </div>
              );
            })}
          </div>

          {/* Bars */}
          {[{ l: 'Humor', v: 76, c: C.red }, { l: 'Confidence', v: 62, c: C.blue }, { l: 'Curiosity', v: 88, c: C.green }].map((b, i) => (
            <div key={b.l} style={{ marginBottom: 9 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: '#555', marginBottom: 3, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                <span>{b.l}</span><span>{b.v}%</span>
              </div>
              <div style={{ height: 9, background: '#EEE', borderRadius: 5, border: C.borderThin, overflow: 'hidden' }}>
                <motion.div style={{ height: '100%', background: b.c, borderRadius: 4 }}
                  initial={{ width: 0 }} whileInView={{ width: `${b.v}%` }} viewport={{ once: true }}
                  transition={{ duration: 0.75, delay: 0.4 + i * 0.1, ease: [0.23, 1, 0.32, 1] }} />
              </div>
            </div>
          ))}

          {/* Insights */}
          <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              { ok: true,  t: 'Strong opener — 3-line reply = genuine interest.' },
              { ok: false, t: 'Energy mismatch. Your reply is 60% shorter.' },
              { ok: null,  t: '2 missed opportunities detected' },
            ].map((ins, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'flex-start', gap: 7,
                background: ins.ok === null ? C.bgYellow : ins.ok ? C.bgGreen : '#FFF0F0',
                border: C.borderThin, borderRadius: 9, padding: '7px 10px',
                filter: ins.ok === null ? 'blur(1.5px)' : 'none',
              }}>
                <span style={{ fontSize: 12, color: ins.ok === null ? C.blue : ins.ok ? C.green : C.red, marginTop: 1, fontWeight: 900, flexShrink: 0 }}>
                  {ins.ok === null ? '🔒' : ins.ok ? '✓' : '!'}
                </span>
                <span style={{ fontSize: 11, color: C.black, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                  {ins.t}{ins.ok === null && <> <Badge text="Premium" color={C.yellow} rotate={0} /></>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────
const SCENARIOS = [
  { emoji: '💘', label: 'Dating',        hot: true,  color: C.red,   preview: [{ t: 'so what are you looking for rn?', s: false }, { t: "idk just vibing lol", s: true, bad: true }], signal: 'Commitment avoidance detected', insight: 'She asked for intent. You deflected. She loses interest in 48h.' },
  { emoji: '😵‍💫', label: 'Situationship', hot: false, color: C.blue, preview: [{ t: 'i missed you though', s: false }, { t: 'same haha', s: true, bad: true }], signal: 'Emotional mismatch — underdoing it', insight: '"Same haha" kills intimacy. She opened; you closed.' },
  { emoji: '💼', label: 'Work',          hot: false, color: C.green, preview: [{ t: 'following up on the proposal', s: true }, { t: 'noted, will circle back', s: false }], signal: 'Soft stall — reopening needed', insight: 'This is a soft no. AI suggests a re-frame that reopens it.' },
  { emoji: '🫂', label: 'Friendship',    hot: false, color: C.pink,  preview: [{ t: 'you never text first anymore', s: false }, { t: 'been busy sorry 😭', s: true, bad: true }], signal: 'Passive aggression unaddressed', insight: 'This isn\'t about texting. Underlying tension — AI maps it.' },
  { emoji: '🤝', label: 'Networking',    hot: false, color: C.blue,  preview: [{ t: 'Hi, I admire your work!', s: true, bad: true }, { t: 'Thanks! 👍', s: false }], signal: 'Generic opener — polite rejection', insight: 'Reads as fan mail. AI rewrites it as peer-to-peer.' },
  { emoji: '👋', label: 'Reconnecting',  hot: false, color: C.green, preview: [{ t: "hey! it's been forever 😊", s: false }, { t: 'omg yeah so crazy', s: true, bad: true }], signal: 'Opportunity window — door was open', insight: 'She reached out for a reason. Your reply closed it.' },
  { emoji: '🏠', label: 'Family',        hot: false, color: C.pink,  preview: [{ t: 'are you okay? you seem off', s: false }, { t: 'im fine', s: true, bad: true }], signal: 'Emotional suppression — trust gap', insight: '"I\'m fine" is our most-analyzed phrase. It never works.' },
];

const PAINS = [
  { s: 'She asked a question. You answered.', label: 'Dead End', lc: C.red,
    chat: [{ t: 'what kind of music do you like?' }, { t: 'mostly indie rock. you?', s: true, bad: true }, { t: 'same haha' }] },
  { s: 'She was clearly testing you.', label: 'Boring Reply', lc: C.blue,
    chat: [{ t: 'so what do you do for fun?' }, { t: 'gym, netflix, hanging out', s: true, bad: true }, { t: 'oh cool' }] },
  { s: 'She opened with big energy.', label: 'Energy Drop', lc: C.green,
    chat: [{ t: 'okay i have the funniest story 😭' }, { t: 'haha what happened', s: true, bad: true }, { t: '...' }] },
];

const PERSONAS = [
  { name: 'Zara',  trait: 'Sarcastic 😏', reply: "groundbreaking. you must be a blast at funerals." },
  { name: 'Emma',  trait: 'Shy 🌸',        reply: "haha yeah i guess... 😅 what do you like?" },
  { name: 'Sofia', trait: 'Interested 💜', reply: "omg SAME!! okay what artists?? 👀" },
  { name: 'Riley', trait: 'Bored 😑',      reply: "k" },
];

// ═══════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════
export default function Page() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 50]);
  const heroO = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  const [persona, setPersona] = useState(0);
  const [activeScenario, setActiveScenario] = useState(0);
  const [expandPills, setExpandPills] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setActiveScenario(p => (p + 1) % SCENARIOS.length), 2800);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,800;0,9..40,900;1,9..40,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        ::selection { background: ${C.yellow}; color: ${C.black}; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-thumb { background: ${C.black}; border-radius: 3px; }
        ::-webkit-scrollbar-track { background: ${C.yellow}; }

        .wrap { max-width: 1100px; margin: 0 auto; padding: 72px 28px; }
        @media (max-width: 768px) { .wrap { padding: 52px 18px; } }
        @media (max-width: 480px) { .wrap { padding: 40px 14px; } }

        /* HERO */
        .hero-layout { display: grid; grid-template-columns: 1fr 360px; gap: 48px; align-items: flex-start; }
        @media (max-width: 1024px) { .hero-layout { grid-template-columns: 1fr; } .hero-card { display: none !important; } }

        /* SCENARIO PILLS */
        .scenario-pills { display: flex; flex-wrap: wrap; gap: 7px; }

        /* HERO STATS */
        .hero-stats { display: flex; border-top: ${C.border}; overflow: hidden; }
        @media (max-width: 480px) { .hero-stats { flex-direction: column; } .hero-stat-item { border-left: ${C.border} !important; border-top: none !important; } }

        /* CTA ROW */
        .cta-row { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 44px; }

        /* SECTIONS */
        .scenario-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(268px, 1fr)); gap: 14px; }
        .pain-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; }
        .signals-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
        .practice-grid { display: grid; grid-template-columns: 1fr auto; gap: 56px; align-items: center; }
        .rank-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
        .before-after { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        @media (max-width: 900px) {
          .practice-grid { grid-template-columns: 1fr; gap: 36px; }
          .phone-wrap { display: flex; justify-content: center; order: -1; }
          .rank-grid { grid-template-columns: 1fr 1fr; }
          .before-after { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .scenario-grid { grid-template-columns: 1fr; }
          .signals-grid { grid-template-columns: 1fr 1fr; }
          .rank-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 420px) {
  .signals-grid { grid-template-columns: 1fr; }
  .rank-grid { grid-template-columns: 1fr; }
  .pain-grid { grid-template-columns: 1fr; }
}
  @media (max-width: 768px) {
          .desktop-only-pill { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-only-pill { display: none !important; }
        }

        /* 3D depth helper */
        .depth-layer { transform: translateZ(20px); }
      `}} />

      <div style={{ background: C.bgCream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

        {/* ═══ HERO ══════════════════════════════════════════════════════ */}
        <section ref={heroRef} style={{ position: 'relative', background: C.bgYellow, borderBottom: C.border, overflow: 'hidden' }}>
          <Noise opacity={0.03} />

          {/* BG decorators — properly contained */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <FloatShape delay={0} style={{ position: 'absolute', top: '8%', left: '4%' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: C.yellow, border: C.border }} />
            </FloatShape>
            <FloatShape delay={0.8} style={{ position: 'absolute', top: '22%', right: '6%' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.red, border: C.border }} />
            </FloatShape>
            <FloatShape delay={1.5} style={{ position: 'absolute', bottom: '18%', left: '2%' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: C.blue, border: C.border }} />
            </FloatShape>
            <FloatShape delay={0.4} style={{ position: 'absolute', top: '6%', right: '18%' }}>
              <Star size={26} color={C.yellow} spin />
            </FloatShape>
            <FloatShape delay={1.8} style={{ position: 'absolute', bottom: '22%', left: '8%' }}>
              <Triangle size={20} color={C.red} />
            </FloatShape>
            <FloatShape delay={0.9} style={{ position: 'absolute', bottom: '12%', right: '12%' }}>
              <Diamond size={18} color={C.blue} />
            </FloatShape>
          </div>

          <motion.div style={{ y: heroY, opacity: heroO }}>
            <div className="wrap" style={{ paddingTop: 52 }}>
              <div className="hero-layout">

                {/* LEFT COLUMN */}
                <div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
                    <Label text="AI Conversation Intelligence" color={C.red} />
                  </motion.div>

                  <motion.h1
  initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.28, delay: 0.06 }}
  style={{
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 'clamp(35px, 8vw, 60px)',
    fontWeight: 900, lineHeight: 1.15, color: C.black,
    letterSpacing: '-0.04em', marginBottom: 26,
    wordBreak: 'break-word',
  }}>
  AI Texting Coach.<br />
  <span style={{ background: C.yellow, borderRadius: 8, padding: '2px 8px', display: 'inline-block', border: C.border, marginTop: '8px' }}>
    Analyze chats. Improve instantly.
  </span>
</motion.h1>

                  {/* Scenario pills */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.18 }}
                    className="scenario-pills" style={{ marginBottom: 22 }}>
                    {SCENARIOS.map((s, i) => (
                      <motion.button key={i} onClick={() => setActiveScenario(i)}
                        className={!expandPills && i >= 3 ? 'desktop-only-pill' : ''}
                        whileHover={{ y: -2 }} whileTap={{ y: 0, scale: 0.97 }} transition={SNAP}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                          background: activeScenario === i ? C.black : C.white,
                          border: C.border, borderRadius: 999, padding: '5px 12px',
                          fontSize: 11.5, color: activeScenario === i ? C.white : C.black,
                          fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                          boxShadow: activeScenario === i ? C.shadow : C.shadowSm,
                          transition: 'background 0.15s, color 0.15s',
                          whiteSpace: 'nowrap',
                        }}>
                        <span>{s.emoji}</span> {s.label}
                        {s.hot && <Badge text="HOT" color={C.red} textColor={C.white} rotate={0} />}
                      </motion.button>
                    ))}

                    {/* Show "+ 4 More" ONLY on Mobile when not expanded */}
                    {!expandPills && (
                      <motion.button
                        className="mobile-only-pill"
                        onClick={() => setExpandPills(true)}
                        whileHover={{ y: -2 }} whileTap={{ y: 0, scale: 0.97 }} transition={SNAP}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer',
                          background: C.bgCream, border: C.borderThin, borderRadius: 999, padding: '5px 12px',
                          fontSize: 11.5, color: C.black, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
                          whiteSpace: 'nowrap',
                        }}>
                        + {SCENARIOS.length - 3} More
                      </motion.button>
                    )}
                  </motion.div>

                  <motion.p
                    initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.14 }}
                    style={{ fontSize: 15, color: '#555', maxWidth: 420, lineHeight: 1.78, marginBottom: 28, fontWeight: 500 }}>
                    ConvoCoach is an AI texting coach that analyzes your conversations, detects attraction signals, suggests smarter replies, and helps you practice messaging skills. Upload a screenshot — get a full breakdown in 30 seconds.
                  </motion.p>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                    className="cta-row">
                    <Btn href="/upload" bg={C.red} textColor={C.white} size="lg">
                      Analyze My Chat Now — Free →
                    </Btn>
                    <Btn href="/practice" bg={C.white} size="lg">
                      Practice Mode
                    </Btn>
                  </motion.div>

                  {/* Stats */}
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.36 }}
                    className="hero-stats">
                    {[
                      { n: 50000, s: '+', l: 'Chats analyzed', bg: C.yellow },
                      { n: 94,    s: '%', l: 'Accuracy rate',   bg: C.white  },
                      { n: 7,     s: '',  l: 'Scenario types',  bg: C.bgBlue },
                    ].map(({ n, s, l, bg }, i) => (
                      <div key={l} className="hero-stat-item" style={{
                        background: bg, border: C.border, borderLeft: i === 0 ? C.border : 'none',
                        borderTop: C.border, padding: '18px 24px', flex: 1, minWidth: 0,
                      }}>
                        <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1 }}>
                          <Counter to={n} sfx={s} />
                        </div>
                        <div style={{ fontSize: 11, color: '#666', marginTop: 4, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l}</div>
                      </div>
                    ))}
                  </motion.div>
                </div>

                {/* RIGHT: Analysis card */}
                <div className="hero-card" style={{ paddingTop: 12 }}>
                  <AnalysisCard />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        <Marquee />
{/* ═══ WHAT IS AN AI TEXTING COACH — AEO SECTION ═══════════════════ */}
<section style={{ background: C.bgYellow, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    <Star size={28} color={C.blue} style={{ position: 'absolute', top: '10%', right: '4%' }} />
    <Triangle size={22} color={C.red} style={{ position: 'absolute', bottom: '14%', left: '3%' }} />
    <Dot size={16} color={C.blue} style={{ position: 'absolute', top: '55%', right: '8%' }} />
  </div>

  <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 48, alignItems: 'center' }}>

      {/* Left — text */}
      <Reveal>
        <Label text="What is this?" color={C.blue} />
        <h2 style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 'clamp(32px, 8vw, 52px)',
          fontWeight: 900, color: C.black,
          letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 24,
          wordBreak: 'break-word',
        }}>
          What is an<br/>
          <span style={{ background: C.blue, color: C.white, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
            AI Texting Coach?
          </span>
        </h2>
        <p style={{ fontSize: 16, color: '#222', lineHeight: 1.7, marginBottom: 16, fontWeight: 700 }}>
          It’s a translator for mixed signals. Instead of reading generic dating advice, you upload a screenshot of your actual chat. We tell you exactly what went wrong and how to fix it.
        </p>
        <p style={{ fontSize: 15, color: '#555', lineHeight: 1.65, marginBottom: 32, fontWeight: 500 }}>
          ConvoCoach scans the psychological subtext of your messages. It detects hidden attraction signals, calculates who holds the power, calls out your dry texting, and generates the exact witty, confident, or playful reply you need to send next.
        </p>

        {/* Stat strip - Updated to wrap cleanly on mobile */}
        <div style={{ display: 'flex', flexWrap: 'wrap', border: C.border, borderRadius: 14, overflow: 'hidden', boxShadow: C.shadow }}>
          {[
            { val: '10',    label: 'Signal layers',  bg: C.yellow  },
            { val: '30s',   label: 'Analysis time',  bg: C.white   },
            { val: '100%',  label: 'Personalized',   bg: C.bgBlue  },
          ].map(({ val, label, bg }, i) => (
            <div key={i} style={{ flex: '1 1 100px', background: bg, borderLeft: i > 0 ? C.border : 'none', padding: '16px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: 900, color: C.black, lineHeight: 1, letterSpacing: '-0.03em', fontFamily: "'DM Sans', sans-serif" }}>{val}</div>
              <div style={{ fontSize: 11, color: '#555', marginTop: 6, fontWeight: 800, lineHeight: 1.2 }}>{label}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* Right — 3D feature cards stack */}
      <Reveal delay={0.1}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { icon: '🔍', title: 'Subtext Decoder', desc: 'Stop guessing. We read the tone, energy, and hidden intent behind their messages.', color: C.red, bg: '#FFF0F0' },
            { icon: '💘', title: 'Attraction Radar', desc: 'Spots the 8 psychological signs that prove they are actually interested in you.', color: C.blue, bg: C.bgBlue },
            { icon: '✍️', title: 'The Perfect Reply', desc: 'No more staring at a blank screen. Get 3 situational, ready-to-send messages.', color: C.green, bg: C.bgGreen },
            { icon: '🤖', title: 'Sparring Simulator', desc: 'Practice your rizz against 10 brutal AI personas before you text real people.', color: C.pink, bg: C.bgPink },
          ].map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -3, boxShadow: C.shadowLg, x: 4 }}
              style={{
                background: f.bg, border: C.border, borderRadius: 14,
                padding: '16px 18px', boxShadow: C.shadow,
                display: 'flex', alignItems: 'flex-start', gap: 14,
                borderLeft: `6px solid ${f.color}`, cursor: 'default',
              }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: C.white, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, boxShadow: C.shadowSm }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 900, color: C.black, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>{f.title}</div>
                <div style={{ fontSize: 13, color: '#444', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </Reveal>

    </div>
  </div>
</section>

{/* ═══ PROBLEM — SOLUTION BLOCKS ═══════════════════════════════════ */}
<section style={{ background: C.black, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    <Star size={32} color={C.yellow} style={{ position: 'absolute', top: '8%', right: '5%' }} />
    <Dot size={16} color={C.red} style={{ position: 'absolute', bottom: '12%', left: '4%' }} />
  </div>
  <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
    <Reveal>
      <Label text="Common Problems" color={C.yellow} />
      <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 8vw, 56px)', fontWeight: 900, color: C.white, letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 40, wordBreak: 'break-word' }}>
        Questions people{' '}
        <span style={{ background: C.yellow, color: C.black, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
          actually Google.
        </span>
      </h2>
    </Reveal>

    {/* Fixed mobile grid overlapping */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
      {[
        {
          q: 'What is dry texting?',
          a: 'Dry texting is sending low-effort, conversation-killing replies like "lol", "yeah", or "cool". It forces the other person to carry the weight of the interaction and usually signals disinterest.',
          extra: 'We scan your chat history to spot dry texting habits, show you exactly where the energy died, and teach you how to write hooks that demand a response.',
          color: C.red, bg: '#FFF0F0', icon: '💀',
        },
        {
          q: 'How do you improve texting skills?',
          a: 'Stop reading generic dating advice and start analyzing your own mistakes. The fastest way to improve is identifying your specific blind spots in real-time.',
          extra: 'ConvoCoach handles the heavy lifting: it reads your screenshot, roasts your bad habits, and gives you an interactive simulator to practice until you stop getting left on read.',
          color: C.blue, bg: C.bgBlue, icon: '📈',
        },
      ].map((block, i) => (
        <Reveal key={i} delay={i * 0.1}>
          <motion.div
            whileHover={{ y: -4, boxShadow: C.shadowLg }} transition={SNAP}
            style={{
              background: block.bg, border: C.border, borderRadius: 18,
              padding: 'clamp(20px, 4vw, 28px)', boxShadow: C.shadow, height: '100%',
            }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: C.white, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: C.shadowSm, flexShrink: 0 }}>
                {block.icon}
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 900, color: block.color, margin: 0, letterSpacing: '-0.02em', paddingTop: 2 }}>
                {block.q}
              </h3>
            </div>
            <p style={{ fontSize: 15, color: C.black, lineHeight: 1.6, marginBottom: 16, fontWeight: 700 }}>
              {block.a}
            </p>
            <div style={{ borderTop: C.borderThin, paddingTop: 14 }}>
              <p style={{ fontSize: 13.5, color: '#444', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                {block.extra}
              </p>
            </div>
          </motion.div>
        </Reveal>
      ))}
    </div>
  </div>
</section>

{/* ═══ FAQ — AEO / RICH SNIPPET SECTION ═══════════════════════════ */}
<section style={{ background: C.bgCream, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
    <Star size={20} color={C.yellow} style={{ position: 'absolute', top: '6%', right: '3%' }} />
    <Triangle size={18} color={C.red} style={{ position: 'absolute', bottom: '20%', left: '2%' }} />
  </div>

  <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
    <Reveal>
      <Label text="FAQ" color={C.red} />
      <h2 style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 'clamp(32px, 8vw, 56px)',
        fontWeight: 900, color: C.black,
        letterSpacing: '-0.04em', lineHeight: 1.15, marginBottom: 16,
        wordBreak: 'break-word'
      }}>
        Every question,{' '}
        <span style={{ background: C.red, color: C.white, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
          answered straight.
        </span>
      </h2>
      <p style={{ fontSize: 16, color: '#555', marginBottom: 48, lineHeight: 1.6, fontWeight: 600, maxWidth: 500 }}>
        No fluff. No vague dating advice. Just exactly what this tool does and how it fixes your conversations.
      </p>
    </Reveal>

    {/* Fixed FAQ grid for mobile */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      {[
        {
          q: 'What is an AI texting coach?',
          a: 'An AI texting coach is a software tool that analyzes your chat screenshots, identifies behavioral mistakes like double-texting or dry replies, and generates situational responses to keep the conversation alive.',
          color: C.red, icon: '🤖',
        },
        {
          q: 'How does AI conversation analysis actually work?',
          a: 'You upload a screenshot. Our OCR reads the text. The AI maps the power dynamics, checks the emotional trajectory of the last 10 messages, and scores your "rizz" on a 0-100 scale.',
          color: C.blue, icon: '🔍',
        },
        {
          q: 'Can this help with flirting and dating?',
          a: 'Yes. It is specifically trained to detect attraction signals, point out when you are being too available, and provide playful, confident, or curious text formulas to escalate the interaction.',
          color: C.pink, icon: '💘',
        },
        {
          q: 'What is a Conversation Score?',
          a: 'It’s a brutal 0–100 rating based on your engagement, humor, confidence, and momentum. It tells you exactly how well you are doing, so you stop overestimating your text game.',
          color: C.blue, icon: '📊',
        },
        {
          q: 'Is my chat data kept private?',
          a: 'Absolutely. We do not store your screenshots. The image is processed in memory to extract the text and deleted immediately. We only care about the analysis, not your personal drama.',
          color: C.black, icon: '🔒',
        },
        {
          q: 'Is ConvoCoach free to use?',
          a: 'Your first three deep analysis is 100% free with no account required. Premium unlocks unlimited scans, our 10-layer psychological breakdown, and the full interactive practice simulator.',
          color: C.green, icon: '✅',
        },
      ].map((faq, i) => (
        <Reveal key={i} delay={i * 0.05}>
          <motion.div
            whileHover={{ y: -3, boxShadow: C.shadowLg }}
            transition={SNAP}
            style={{
              background: C.white, border: C.border, borderRadius: 16,
              padding: '20px', boxShadow: C.shadow, height: '100%',
              borderTop: `6px solid ${faq.color}`,
            }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: C.bgCream, border: C.border, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, boxShadow: C.shadowSm }}>
                {faq.icon}
              </div>
              <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 900, color: C.black, margin: 0, letterSpacing: '-0.01em', lineHeight: 1.3, paddingTop: 2 }}>
                {faq.q}
              </h3>
            </div>
            <p style={{ fontSize: 14, color: '#444', lineHeight: 1.6, margin: 0, fontWeight: 500, paddingLeft: 48 }}>
              {faq.a}
            </p>
          </motion.div>
        </Reveal>
      ))}
    </div>

    {/* Bottom CTA strip - Fixed Weird Bottom Spacing & Mobile Wrapping */}
    <Reveal delay={0.3}>
      <div className="cta-wrap" style={{ 
        marginTop: 56, background: C.black, border: C.border, borderRadius: 20, 
        padding: 'clamp(24px, 5vw, 40px)', boxShadow: C.shadowLg, 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
        flexWrap: 'wrap', gap: 24, position: 'relative', overflow: 'hidden' 
      }}>
        <Star size={40} color={C.yellow} style={{ position: 'absolute', right: -10, top: -10, opacity: 0.8 }} />
        <div style={{ flex: '1 1 300px' }}>
          <p style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 900, color: C.white, margin: '0 0 10px', fontFamily: "'DM Sans', sans-serif", letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Still unsure? Just try it.
          </p>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', margin: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}>
            First three analysis is free. No account. No card. See what the AI finds.
          </p>
        </div>
        <div style={{ flexShrink: 0, width: '100%', maxWidth: 300 }}>
          <Btn href="/upload" bg={C.yellow} textColor={C.black} size="lg">
            <span style={{ width: '100%', textAlign: 'center' }}>Analyze Chat — Free →</span>
          </Btn>
        </div>
      </div>
    </Reveal>
  </div>
</section>
        {/* ═══ SCENARIOS ══════════════════════════════════════════════ */}
        <section style={{ background: C.white, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          <Noise />
          <div className="wrap">
            <Reveal>
              <Label text="Every conversation type" color={C.blue} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 40 }}>
  Built for dating. Works for{' '}
  <span style={{ background: C.blue, color: C.white, borderRadius: 10, padding: '0 10px', border: C.border, display: 'inline-block', marginTop: '6px' }}>
                  every conversation.
                </span>
              </h2>
            </Reveal>

            <div className="scenario-grid">
              {SCENARIOS.map((sc, i) => {
                const active = activeScenario === i;
                return (
                  <Reveal key={i} delay={i * 0.04}>
                    <motion.div
                      onClick={() => setActiveScenario(i)}
                      whileHover={{ y: -4, boxShadow: C.shadowLg }}
                      transition={SNAP}
                      style={{
                        background: active ? C.black : C.bgCream,
                        border: C.border, borderRadius: 18, padding: '18px 18px 16px',
                        height: '100%', boxShadow: active ? C.shadowLg : C.shadow,
                        cursor: 'pointer',
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: 22 }}>{sc.emoji}</span>
                          <span style={{ fontSize: 13.5, fontWeight: 800, color: active ? C.white : C.black }}>{sc.label}</span>
                        </div>
                        {sc.hot && <Badge text="Most Used" color={C.yellow} rotate={-1} />}
                      </div>
                      <div style={{ background: active ? 'rgba(255,255,255,0.07)' : C.white, border: C.borderThin, borderRadius: 11, padding: '9px', marginBottom: 11, display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {sc.preview.map((m, j) => (
                          <Bub key={j} text={m.t} self={m.s} bad={m.bad} delay={i * 0.04 + j * 0.07} />
                        ))}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: sc.color, border: C.borderThin, borderRadius: 7, padding: '5px 9px', marginBottom: 8, boxShadow: C.shadowSm }}>
                        <Dot size={5} color={C.white} />
                        <span style={{ fontSize: 10.5, color: C.white, fontWeight: 800, letterSpacing: '0.02em', lineHeight: 1.4 }}>{sc.signal}</span>
                      </div>
                      <p style={{ fontSize: 11.5, color: active ? 'rgba(255,255,255,0.65)' : '#555', lineHeight: 1.65 }}>{sc.insight}</p>
                    </motion.div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ═══ PAIN POINTS ════════════════════════════════════════════ */}
        <section style={{ background: C.bgBlue, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          <Noise />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <FloatShape delay={0} style={{ position: 'absolute', top: 36, right: 56 }}>
              <Star size={34} color={C.yellow} spin />
            </FloatShape>
            <FloatShape delay={1} style={{ position: 'absolute', bottom: 44, left: 36 }}>
              <Dot size={20} color={C.red} />
            </FloatShape>
            <FloatShape delay={2} style={{ position: 'absolute', top: '40%', right: '4%' }}>
              <Triangle size={24} color={C.blue} style={{ opacity: 0.3 }} />
            </FloatShape>
          </div>
          <div className="wrap">
            <Reveal>
              <Label text="Sound familiar" color={C.red} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 40 }}>
  Most people text fine.{' '}
  <span style={{ background: C.black, color: C.yellow, borderRadius: 10, padding: '0 10px', border: C.border, display: 'inline-block', marginTop: '6px' }}>
                  She just stopped replying.
                </span>
              </h2>
            </Reveal>
            <div className="pain-grid">
              {PAINS.map((p, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <TiltCard bg={C.white} style={{ height: '100%' }} intensity={8}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 14 }}>
                      <p style={{ fontSize: 12.5, color: '#555', lineHeight: 1.6, fontWeight: 500 }}>{p.s}</p>
                      <Badge text={p.label} color={p.lc} textColor={p.lc === C.green ? C.black : C.white} rotate={-1} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 13, background: '#F8F8F8', borderRadius: 11, padding: '9px', border: C.borderThin }}>
                      {p.chat.map((m, j) => (
                        <motion.div key={j} initial={{ opacity: 0, x: (m as any).s ? 10 : -10 }} whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }} transition={{ duration: 0.2, delay: j * 0.08 }}
                          style={{ display: 'flex', justifyContent: (m as any).s ? 'flex-end' : 'flex-start' }}>
                          <div style={{
                            maxWidth: '82%', padding: '7px 11px', borderRadius: 11,
                            borderBottomRightRadius: (m as any).s ? 3 : 11, borderBottomLeftRadius: (m as any).s ? 11 : 3,
                            fontSize: 12, lineHeight: 1.45,
                            background: (m as any).s ? ((m as any).bad ? '#FFE4E4' : C.black) : '#E5E5E5',
                            border: C.borderThin,
                            color: (m as any).s ? ((m as any).bad ? C.red : C.white) : C.black,
                            boxShadow: C.shadowSm, wordBreak: 'break-word',
                          }}>{m.t}</div>
                        </motion.div>
                      ))}
                    </div>
                    <p style={{ fontSize: 11.5, color: '#666', borderTop: C.borderThin, paddingTop: 11, lineHeight: 1.65 }}>
                      → {i === 0 ? 'No follow-up question. She has to carry it all.' : i === 1 ? 'You gave facts. She wanted energy.' : 'Your reply was 4 words. Enthusiasm killed.'}
                    </p>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 10 SIGNALS ══════════════════════════════════════════════ */}
        <section style={{ background: C.bgCream, borderBottom: C.border, position: 'relative' }}>
          <Noise />
          <div className="wrap">
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                <Label text="Features" color={C.green} />
                <Dot size={9} color={C.yellow} />
                <Dot size={9} color={C.red} />
                <Dot size={9} color={C.blue} />
              </div>
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 40 }}>
  How ConvoCoach analyzes{' '}
  <span style={{ background: C.green, color: C.white, borderRadius: 10, padding: '0 10px', border: C.border, display: 'inline-block', marginTop: '6px' }}>
                  your conversations.
                </span>
              </h2>
            </Reveal>
            <div className="signals-grid">
              {[
                { icon: '💘', label: 'Attraction Probability', desc: '% score from 11 behavioral signals', color: C.red,    premium: true  },
                { icon: '⚡', label: 'Conversation Momentum',  desc: 'Heating up or dying? Per message.',  color: C.yellow, premium: true  },
                { icon: '🎯', label: 'Missed Opportunities',   desc: 'Exact moments you could escalate',    color: C.red,    premium: true  },
                { icon: '📊', label: 'Energy Ratio',           desc: 'Reply length imbalance = disinterest',color: C.blue,   premium: false },
                { icon: '🪞', label: 'Mirroring Detection',    desc: 'They copy your words = attraction',   color: C.green,  premium: false },
                { icon: '⏱', label: 'Response Time',           desc: 'What reply speed reveals right now',  color: C.blue,   premium: false },
                { icon: '🧠', label: 'Emotional Investment',   desc: 'How much they revealed themselves',   color: C.pink,   premium: false },
                { icon: '🔥', label: 'Roast Mode',             desc: 'Brutal. Honest. Comedy format.',      color: C.red,    premium: false },
                { icon: '✍️', label: 'AI Reply Suggestions',  desc: '3 options — witty, warm, direct',     color: C.green,  premium: true  },
                { icon: '🌊', label: 'Psychological Subtext',  desc: "What they're actually saying",        color: C.blue,   premium: true  },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.04}>
                  <TiltCard bg={C.white} style={{ height: '100%' }} intensity={10}>
                    <div style={{ borderTop: `5px solid ${s.color}`, margin: '-22px -22px 14px', borderRadius: '16px 16px 0 0' }} />
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 9 }}>
                      <span style={{ fontSize: 22 }}>{s.icon}</span>
                      {s.premium && <Badge text="Premium" color={C.yellow} rotate={1} />}
                    </div>
                    <div style={{ fontSize: 12.5, fontWeight: 800, color: C.black, marginBottom: 4, lineHeight: 1.35 }}>{s.label}</div>
                    <div style={{ fontSize: 11.5, color: '#555', lineHeight: 1.6 }}>{s.desc}</div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ════════════════════════════════════════════ */}
        <section style={{ background: C.black, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          {/* Large decorative number */}
          <div style={{ position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)', fontSize: 300, fontWeight: 900, color: 'rgba(255,255,255,0.03)', fontFamily: "'DM Sans', sans-serif", lineHeight: 1, pointerEvents: 'none', userSelect: 'none' }}>3</div>
          <div className="wrap">
            <Reveal>
              <Label text="The process" color={C.yellow} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 900, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 44 }}>
                How it works — 3 steps to better texting.
              </h2>
            </Reveal>
            <div style={{ maxWidth: 660, display: 'flex', flexDirection: 'column', gap: 0 }}>
              {[
                { n: '01', title: 'Upload your chat',  desc: 'Any app — iMessage, WhatsApp, Instagram, Hinge, Slack. OCR extracts text instantly. Screenshot deleted after 60s.', bg: C.yellow },
                { n: '02', title: 'AI analyzes your conversation', desc: 'Not just words — response timing, energy ratios, question deflection, mirroring, emotional trajectory. 10 signal layers.', bg: C.red },
                { n: '03', title: 'Practice and improve',       desc: "Exact mistakes. What they felt. 3 suggested replies. Probability they're into you. Nothing withheld.", bg: C.blue },
              ].map(({ n, title, desc, bg }, i) => (
                <motion.div key={n} initial={{ opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
                  style={{ display: 'flex', gap: 0, border: C.border, borderBottom: i < 2 ? 'none' : C.border, background: C.white, overflow: 'hidden' }}>
                  <div style={{ width: 72, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: C.black, fontFamily: "'DM Sans', sans-serif", flexShrink: 0, borderRight: C.border }}>
                    {n}
                  </div>
                  <div style={{ padding: '20px 22px' }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: C.black, marginBottom: 6 }}>{title}</div>
                    <div style={{ fontSize: 13.5, color: '#555', lineHeight: 1.75 }}>{desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ ROAST MODE ══════════════════════════════════════════════ */}
        <section style={{ background: C.yellow, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          <Noise opacity={0.04} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <FloatShape delay={0.3} style={{ position: 'absolute', top: 28, right: 72, transform: 'rotate(10deg)' }}>
              <Star size={30} color={C.red} spin />
            </FloatShape>
            <FloatShape delay={1.4} style={{ position: 'absolute', bottom: 36, left: 44 }}>
              <Triangle size={26} color={C.black} />
            </FloatShape>
            <FloatShape delay={0.7} style={{ position: 'absolute', top: '50%', right: '5%' }}>
              <Dot size={14} color={C.black} />
            </FloatShape>
          </div>
          <div className="wrap">
            <Reveal>
              <Label text="🔥 Roast Mode" color={C.red} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 32 }}>
  Brutal honesty.{' '}
  <span style={{ background: C.black, color: C.yellow, borderRadius: 10, padding: '0 10px', border: C.border, display: 'inline-block', marginTop: '6px' }}>
    Delivered like a comedian.
  </span>
</h2>
            </Reveal>
            <Reveal delay={0.08}>
              <TiltCard bg={C.white} style={{ maxWidth: 660 }} intensity={6}>
                <div style={{ position: 'absolute', top: -10, left: 18, fontSize: 72, color: '#E8E8E8', fontFamily: 'Georgia, serif', lineHeight: 1, pointerEvents: 'none', fontWeight: 900 }}>"</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 22, background: '#F8F8F8', borderRadius: 12, padding: '11px', border: C.borderThin }}>
                  <Bub text="I think we'd really get along if you gave me a chance 🙏" self bad />
                  <Bub text="aww haha thanks 🥰" delay={0.3} />
                </div>
                <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }}>
                  <p style={{ fontSize: 'clamp(13px, 1.6vw, 17px)', fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: C.black, lineHeight: 1.7, marginBottom: 14 }}>
                    "She said 'aww haha thanks'. That is not flirting. That is customer service. You are being handled, not pursued. The 🥰 is her way of returning your emotion without matching it — like tipping 10% on a good meal."
                  </p>
                  <Badge text="ConvoCoach Roast Mode™" color={C.black} textColor={C.yellow} rotate={0} />
                </motion.div>
              </TiltCard>
            </Reveal>
          </div>
        </section>

        {/* ═══ BEFORE / AFTER ══════════════════════════════════════════ */}
        <section style={{ background: C.white, borderBottom: C.border, position: 'relative' }}>
          <Noise />
          <div className="wrap">
            <Reveal>
              <Label text="Before vs. after" color={C.red} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 10 }}>
  Small shifts.
</h2>
              <p style={{ fontSize: 14.5, color: '#666', marginBottom: 40, lineHeight: 1.75, fontWeight: 500 }}>One reply change can flip the entire trajectory.</p>
            </Reveal>
            <div className="before-after">
              {[
                { title: 'The Mistake', tc: C.red, bg: '#FFF5F5',
                  msgs: [{ t: 'worked all day, went to gym. you?' }, { t: 'nice. just chilled.', s: true, bad: true }],
                  note: 'Zero acknowledgment. No follow-up. She has to carry it.' },
                { title: 'The Fix', tc: C.green, bg: '#F0FFF6',
                  msgs: [{ t: 'worked all day, went to gym. you?' }, { t: "survived my inbox. gym people honestly intimidate me — what do you even lift?", s: true }],
                  note: 'Playful self-deprecation + real follow-up. She has something to work with.' },
              ].map((s, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <TiltCard bg={s.bg} style={{ height: '100%' }} intensity={8}>
                    <div style={{
                      border: `2.5px solid ${s.tc}`, borderRadius: 18, padding: 20, height: '100%',
                      background: s.bg,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
                        <Dot size={7} color={s.tc} />
                        <span style={{ fontSize: 11, color: s.tc, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{s.title}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14, background: C.white, borderRadius: 11, padding: '9px', border: C.borderThin }}>
                        {s.msgs.map((m, j) => (
                          <motion.div key={j} initial={{ opacity: 0, x: (m as any).s ? 10 : -10 }} whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }} transition={{ duration: 0.2, delay: j * 0.1 }}
                            style={{ display: 'flex', justifyContent: (m as any).s ? 'flex-end' : 'flex-start' }}>
                            <div style={{
                              maxWidth: '85%', padding: '7px 11px', borderRadius: 11,
                              borderBottomRightRadius: (m as any).s ? 3 : 11, borderBottomLeftRadius: (m as any).s ? 11 : 3,
                              fontSize: 12, lineHeight: 1.45,
                              background: (m as any).s ? ((m as any).bad ? '#FFE4E4' : C.black) : '#E5E5E5',
                              border: C.borderThin,
                              color: (m as any).s ? ((m as any).bad ? C.red : C.white) : C.black,
                              boxShadow: C.shadowSm, wordBreak: 'break-word',
                            }}>{m.t}</div>
                          </motion.div>
                        ))}
                      </div>
                      <p style={{ fontSize: 12, color: '#555', borderTop: `2px solid ${s.tc}40`, paddingTop: 11, lineHeight: 1.65 }}>{s.note}</p>
                    </div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ PRACTICE MODE ═══════════════════════════════════════════ */}
        <section style={{ background: C.bgPink, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          <Noise opacity={0.03} />
          <div className="wrap">
            <div className="practice-grid">
              <Reveal>
                <div>
                  <Label text="Practice Mode" color={C.pink} />
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(28px, 4vw, 46px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 14 }}>
  Train against{' '}
  <span style={{ background: C.pink, color: C.white, borderRadius: 10, padding: '0 8px', border: C.border, display: 'inline-block', marginTop: '6px' }}>
    every personality.
  </span>
</h2>
                  <p style={{ fontSize: 14.5, color: '#555', lineHeight: 1.78, marginBottom: 22, maxWidth: 380, fontWeight: 500 }}>
                    10 distinct AI characters across 3 scenario categories. Three difficulty levels. Real-time coaching on beginner.
                  </p>
                  <div style={{ display: 'flex', gap: 7, marginBottom: 20, flexWrap: 'wrap' }}>
                    {['💘 Dating', '💼 Professional', '🫂 Social'].map((cat) => (
                      <span key={cat} style={{ fontSize: 11.5, fontWeight: 700, color: C.black, background: C.white, border: C.border, borderRadius: 999, padding: '5px 12px', boxShadow: C.shadowSm, whiteSpace: 'nowrap' }}>{cat}</span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 24 }}>
                    {PERSONAS.map((p, i) => (
                      <motion.button key={i} onClick={() => setPersona(i)}
                        whileHover={{ x: 4 }} whileTap={{ x: 0 }} transition={SNAP}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 11, padding: '11px 14px',
                          borderRadius: 11, cursor: 'pointer',
                          background: persona === i ? C.black : C.white,
                          border: C.border, textAlign: 'left',
                          boxShadow: persona === i ? C.shadow : C.shadowSm,
                          transition: 'background 0.15s',
                        }}>
                        <span style={{ fontSize: 19 }}>{['😏', '🌸', '💜', '😑'][i]}</span>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: persona === i ? C.white : C.black }}>{p.name}</div>
                          <div style={{ fontSize: 10.5, color: persona === i ? 'rgba(255,255,255,0.45)' : '#888' }}>{p.trait}</div>
                        </div>
                        {persona === i && <Dot size={7} color={C.yellow} style={{ marginLeft: 'auto', flexShrink: 0 }} />}
                      </motion.button>
                    ))}
                  </div>
                  <Btn href="/practice" bg={C.black} textColor={C.yellow} size="md">
                    Start Practicing →
                  </Btn>
                </div>
              </Reveal>

              {/* Phone mockup with 3D tilt */}
              <Reveal delay={0.1} className="phone-wrap">
                <Phone>
                  <div style={{ padding: '28px 13px 11px', borderBottom: '1.5px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.09)', border: '1.5px solid rgba(255,255,255,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
                      {['😏', '🌸', '💜', '😑'][persona]}
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 800, color: C.white }}>{PERSONAS[persona].name}</div>
                      <motion.div key={persona} animate={{ opacity: [0, 1] }} transition={{ type: 'tween', duration: 0.3 }}
                        style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.35)' }}>typing...</motion.div>
                    </div>
                  </div>
                  <div style={{ flex: 1, padding: '13px 11px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <div style={{ background: C.yellow, border: '1.5px solid rgba(0,0,0,0.25)', borderRadius: '11px 11px 3px 11px', padding: '7px 11px', maxWidth: '82%', fontSize: 12, color: C.black, fontWeight: 600, wordBreak: 'break-word' }}>
                        hey what kind of music do you like?
                      </div>
                    </div>
                    <AnimatePresence mode="wait">
                      <motion.div key={persona} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                          <div style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.14)', borderRadius: '11px 11px 11px 3px', padding: '7px 11px', maxWidth: '82%', fontSize: 12, color: 'rgba(255,255,255,0.88)', wordBreak: 'break-word' }}>
                            {PERSONAS[persona].reply}
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    {/* Typing dots */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 10px', background: 'rgba(255,255,255,0.07)', borderRadius: '11px 11px 11px 3px', width: 'fit-content' }}>
                      {[0, 0.18, 0.36].map((d, i) => (
                        <motion.span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,0.4)', display: 'block' }}
                          animate={{ y: [0, -4, 0] }} transition={{ type: 'tween', duration: 0.75, delay: d, repeat: Infinity, ease: 'easeInOut' }} />
                      ))}
                    </div>
                  </div>
                  <div style={{ padding: '9px 11px', borderTop: '1.5px solid rgba(255,255,255,0.07)' }}>
                    <div style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 16, border: '1.5px solid rgba(255,255,255,0.11)', padding: '7px 13px' }}>
                      <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.22)' }}>Your message...</span>
                    </div>
                  </div>
                </Phone>
              </Reveal>
            </div>
          </div>
        </section>

        {/* ═══ RANK SYSTEM ══════════════════════════════════════════════ */}
        <section style={{ background: C.bgGreen, borderBottom: C.border, position: 'relative' }}>
          <Noise />
          <div className="wrap">
            <Reveal>
              <Label text="Skill system" color={C.green} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 4.5vw, 52px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.25, marginBottom: 40 }}>
  Your rank reflects{' '}
  <span style={{ background: C.black, color: C.green, borderRadius: 10, padding: '0 10px', border: C.border, display: 'inline-block', marginTop: '6px' }}>
    what you've learned.
  </span>
</h2>
            </Reveal>
            <div className="rank-grid">
              {[
                { e: '💤', n: 'Dry Texter',   pts: '0',   d: 'One-word replies. K energy.',  dim: true,  bg: '#F0F0F0', accent: '#999'  },
                { e: '😏', n: 'Average',       pts: '50',  d: 'Can hold a convo. Barely.',    dim: false, bg: C.white,   accent: C.blue  },
                { e: '✨', n: 'Smooth Talker', pts: '150', d: 'Witty. Makes them lean in.',   dim: false, bg: C.bgBlue,  accent: C.blue  },
                { e: '👑', n: 'Elite Charmer', pts: '300', d: 'They text first. Always.',     dim: false, bg: C.yellow,  accent: C.black },
              ].map((l, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <TiltCard bg={l.bg} style={{ opacity: l.dim ? 0.42 : 1 }} intensity={l.dim ? 0 : 12}>
                    <div style={{ borderTop: `5px solid ${l.accent}`, margin: '-22px -22px 16px', borderRadius: '16px 16px 0 0' }} />
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{l.e}</div>
                    <div style={{ fontSize: 13.5, fontWeight: 900, color: l.accent, marginBottom: 3 }}>{l.n}</div>
                    <div style={{ fontSize: 10.5, color: '#777', marginBottom: 7, fontFamily: 'monospace', fontWeight: 700 }}>{l.pts}+ pts</div>
                    <div style={{ fontSize: 11.5, color: '#555', lineHeight: 1.6 }}>{l.d}</div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ════════════════════════════════════════════════ */}
        <section style={{ background: C.red, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          <Noise opacity={0.04} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <FloatShape delay={0} style={{ position: 'absolute', top: 24, right: 72 }}>
              <Star size={46} color={C.yellow} spin />
            </FloatShape>
            <FloatShape delay={1.2} style={{ position: 'absolute', bottom: 36, left: 52 }}>
              <Dot size={22} color={C.black} />
            </FloatShape>
            <FloatShape delay={0.6} style={{ position: 'absolute', bottom: 28, right: 180 }}>
              <Diamond size={28} color={C.yellow} />
            </FloatShape>
            <FloatShape delay={1.8} style={{ position: 'absolute', top: '30%', left: '2%' }}>
              <Triangle size={28} color={C.yellow} />
            </FloatShape>
          </div>
          <div className="wrap">
            <motion.div initial={{ opacity: 0, y: 26 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.28 }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 36, flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(36px, 7vw, 72px)', fontWeight: 900, color: C.white, margin: 0, letterSpacing: '-0.04em', lineHeight: 1.2 }}>
  Stop sending{' '}
  <span style={{ background: C.yellow, color: C.black, borderRadius: 12, padding: '0 10px', border: `2.5px solid ${C.black}`, display: 'inline-block', marginTop: '8px' }}>
                      cringe texts.
                    </span>
                  </h2>
                  <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 18, lineHeight: 1.75, maxWidth: 360, fontWeight: 500 }}>
                    First analysis is 100% free. No account required. Find out what's actually going wrong.
                  </p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <Btn href="/upload" bg={C.yellow} textColor={C.black} size="lg">
                    Analyze My Chat Now →
                  </Btn>
                  <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.6)', marginTop: 10, textAlign: 'center', fontWeight: 600 }}>Free analysis · Screenshot deleted after 60 seconds</p>
                </div>
              </div>
              <div style={{ height: 5, background: C.yellow, border: C.border, marginTop: 56, borderRadius: 3 }} />
            </motion.div>
          </div>
        </section>

      </div>
    </>
  );
}