'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// ─── DESIGN TOKENS — Neo-Brutalism × Memphis ─────────────────────────────────
const C = {
  yellow:    '#FFD84D',
  red:       '#FF4D4D',
  blue:      '#4F46E5',
  green:     '#22C55E',
  pink:      '#FF6FD8',
  black:     '#0D0D0D',
  white:     '#FFFFFF',
  bgCream:   '#FFF7E6',
  bgBlue:    '#EAF0FF',
  bgYellow:  '#FFFBEA',
  bgPink:    '#FFF0FA',
  bgGreen:   '#EDFFF5',
  shadow:    '6px 6px 0px #0D0D0D',
  shadowLg:  '8px 8px 0px #0D0D0D',
  shadowSm:  '4px 4px 0px #0D0D0D',
  border:    '3px solid #0D0D0D',
  borderThin:'2px solid #0D0D0D',
};

const SNAP = { duration: 0.18, ease: [0.2, 0, 0.2, 1] } as const;

// ─── GEOMETRIC DECORATORS ─────────────────────────────────────────────────────
const Dot = ({ size = 10, color = C.yellow, style = {} }) => (
  <div style={{ width: size, height: size, borderRadius: '50%', background: color, border: `2px solid ${C.black}`, flexShrink: 0, ...style }} />
);
const Squiggle = ({ color = C.yellow, style = {} }) => (
  <svg width="48" height="16" viewBox="0 0 48 16" fill="none" style={style}>
    <path d="M2 8 C8 2, 14 14, 20 8 S32 2, 38 8 S44 14, 46 8" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
  </svg>
);
const Star = ({ size = 20, color = C.yellow, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" style={style}>
    <polygon points="10,1 12.2,7.4 19,7.4 13.6,11.6 15.8,18 10,14 4.2,18 6.4,11.6 1,7.4 7.8,7.4" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);
const Triangle = ({ size = 18, color = C.red, style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" style={style}>
    <polygon points="9,2 17,16 1,16" fill={color} stroke={C.black} strokeWidth="1.5"/>
  </svg>
);

// ─── REVEAL & UI COMPONENTS ───────────────────────────────────────────────────
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.22, delay, ease: [0.2, 0, 0.2, 1] }} className={className}>
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

function Btn({ children, bg = C.yellow, href, size = 'md', textColor = C.black }: { children: React.ReactNode; bg?: string; href: string; size?: 'lg'; textColor?: string; }) {
  const pad = size === 'lg' ? '16px 36px' : '12px 26px';
  const fs  = size === 'lg' ? 17 : 14;
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <motion.button
        whileHover={{ y: -3, boxShadow: C.shadowLg }} whileTap={{ y: 1, boxShadow: '2px 2px 0px #0D0D0D' }}
        transition={SNAP}
        style={{
          background: bg, color: textColor, border: C.border, borderRadius: 12,
          padding: pad, fontSize: fs, fontWeight: 900, cursor: 'pointer',
          fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadow,
          display: 'inline-flex', alignItems: 'center', gap: 8, letterSpacing: '-0.01em', width: '100%', justifyContent: 'center'
        }}>
        {children}
      </motion.button>
    </Link>
  );
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const VALUES = [
  { emoji: '🔬', title: 'Signal-First Analysis', color: C.red, bg: '#FFF0F0',
    desc: 'We don\'t tell you what to say. We decode the behavioral signals in conversations so you can make smarter decisions on your own — with data, not guesswork.' },
  { emoji: '🛡️', title: 'Absolute Privacy', color: C.blue, bg: C.bgBlue,
    desc: 'Screenshots are processed in memory and deleted within 60 seconds. We never store your conversation data. Your private texts stay private — period.' },
  { emoji: '🧠', title: 'Behavioral Science', color: C.green, bg: C.bgGreen,
    desc: 'Every analysis layer is grounded in real communication psychology: attachment theory, mirroring behavior, response latency patterns, and power dynamics.' },
  { emoji: '⚡', title: 'Speed Over Bloat', color: C.yellow, bg: C.bgYellow,
    desc: 'ConvoCoach gives you answers in under 30 seconds. No lengthy personality quizzes, no "complete your profile" funnels. Just upload, analyze, and improve.' },
];

const TEAM_PRINCIPLES = [
  { n: '01', title: 'Build tools, not dependencies.', desc: 'We want users to get better at reading conversations on their own. The ideal outcome is that you eventually stop needing our software.' },
  { n: '02', title: 'Brutal honesty over flattery.', desc: 'Telling someone their texts are "great!" when they\'re not helps nobody. We give direct, specific, and sometimes uncomfortable feedback.' },
  { n: '03', title: 'Respect the user\'s intelligence.', desc: 'No dumbing down. No addictive gamification loops for the sake of engagement. Clean UI, real analysis, zero psychological manipulation.' },
  { n: '04', title: 'Small team, high standards.', desc: 'We ship fewer features, but every single one is polished. No feature creep. No half-built experiments pushed to production.' },
];

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function AboutPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden; width: 100%; background: ${C.bgCream}; }
        
        .value-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        
        @media (max-width: 640px) {
          .section-pad { padding: 56px 20px !important; }
          .value-grid { grid-template-columns: 1fr; }
        }
      `}} />

      <div style={{ background: C.bgCream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

        {/* ════════════════════════════════════════════════════════════════
            HERO — yellow background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ position: 'relative', background: C.yellow, borderBottom: C.border, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Star size={32} color={C.white} style={{ position: 'absolute', top: '15%', right: '10%' }} />
            <Triangle size={24} color={C.blue} style={{ position: 'absolute', bottom: '20%', left: '5%' }} />
            <Squiggle color={C.red} style={{ position: 'absolute', bottom: '10%', right: '20%' }} />
          </div>

          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="About ConvoCoach" color={C.red} />
              <h1 style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(42px, 9vw, 84px)',
                fontWeight: 900, color: C.black, letterSpacing: '-0.04em',
                lineHeight: 1.15, marginBottom: 24, wordBreak: 'break-word',
              }}>
                We build tools for people<br />
                <span style={{ background: C.black, color: C.yellow, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
                  who refuse to be ignored.
                </span>
              </h1>
              <p style={{ fontSize: 17, color: '#333', lineHeight: 1.7, maxWidth: 640, fontWeight: 600 }}>
                ConvoCoach started with a simple observation: most people don't know why their conversations fail. 
                They get ghosted, left on read, or stuck in shallow small talk — and they have no idea what went wrong. 
                We built an AI that reads the behavioral signals humans miss.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            ORIGIN STORY — black background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.black, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Star size={32} color={C.yellow} style={{ position: 'absolute', top: '10%', right: '5%' }} />
            <Dot size={16} color={C.red} style={{ position: 'absolute', bottom: '15%', left: '5%' }} />
          </div>

          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="The Origin Story" color={C.yellow} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 32, wordBreak: 'break-word' }}>
                A single screenshot<br/>
                <span style={{ background: C.yellow, color: C.black, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
                  changed everything.
                </span>
              </h2>
            </Reveal>
            
            <Reveal delay={0.08}>
              <div style={{ maxWidth: 680 }}>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: 24, fontWeight: 500 }}>
                  It started when a friend sent us a screenshot of a dating app conversation and asked, <em style={{ color: C.yellow }}>"Is she interested or not?"</em>
                  <br/><br/>
                  We spent 15 minutes analyzing the response timing, message length patterns, question-asking behavior, and mirroring cues. The answer was painfully obvious once you knew exactly what data points to look for.
                </p>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, marginBottom: 24, fontWeight: 500 }}>
                  That's when we realized: the information is all there in the text. Most people just don't know how to read it. Response delay patterns, emotional investment asymmetry, curiosity signals — they're all hiding in plain sight.
                </p>
                <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.75, fontWeight: 500 }}>
                  So we taught an AI to see what humans miss. Today, ConvoCoach analyzes 10 behavioral signal layers simultaneously and gives you a complete, brutally honest picture of what's actually happening in any conversation — in under 30 seconds.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            CORE VALUES
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.bgCream, borderBottom: C.border }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="What We Believe" color={C.green} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 48 }}>
                Signal over noise.
              </h2>
            </Reveal>

            <div className="value-grid">
              {VALUES.map((v, i) => (
                <Reveal key={v.title} delay={i * 0.06}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: C.shadowLg }}
                    transition={SNAP}
                    style={{
                      background: v.bg, border: C.border,
                      borderRadius: 20, padding: '28px 24px', height: '100%',
                      boxShadow: C.shadow, borderTop: `6px solid ${v.color}`,
                    }}>
                    <span style={{ fontSize: 32, display: 'block', marginBottom: 16 }}>{v.emoji}</span>
                    <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 900, color: C.black, margin: 0, marginBottom: 10, letterSpacing: '-0.01em' }}>{v.title}</h3>
                    <p style={{ fontSize: 14.5, color: '#444', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{v.desc}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            TEAM PRINCIPLES
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.bgBlue, borderBottom: C.border }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="Engineering Principles" color={C.blue} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 48 }}>
                Ship less.<br/>
                <span style={{ background: C.blue, color: C.white, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
                  Ship better.
                </span>
              </h2>
            </Reveal>

            <div style={{ maxWidth: 720, background: C.white, border: C.border, borderRadius: 20, padding: 'clamp(20px, 4vw, 40px)', boxShadow: C.shadowLg }}>
              {TEAM_PRINCIPLES.map(({ n, title, desc }, i) => (
                <motion.div key={n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                  style={{ display: 'flex', gap: 'clamp(16px, 3vw, 28px)', padding: '24px 0', borderBottom: i === TEAM_PRINCIPLES.length - 1 ? 'none' : C.borderThin }}>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(36px, 5vw, 48px)', fontWeight: 900, color: C.blue, lineHeight: 1, flexShrink: 0 }}>{n}</div>
                  <div>
                    <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 900, color: C.black, marginBottom: 8, letterSpacing: '-0.01em' }}>{title}</h3>
                    <p style={{ fontSize: 14.5, color: '#555', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            FINAL CTA
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.white, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', background: C.red, border: C.border, borderRadius: 20, padding: 'clamp(24px, 5vw, 48px)', boxShadow: C.shadowLg }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h2 style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 6vw, 48px)',
                    fontWeight: 900, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0,
                  }}>
                    Try it yourself.<br />
                    <span style={{ color: C.yellow }}>First three are free.</span>
                  </h2>
                  <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 16, lineHeight: 1.6, fontWeight: 600 }}>
                    Upload a screenshot right now and see exactly what our AI finds. No account required.
                  </p>
                </div>
                <div style={{ flexShrink: 0, width: '100%', maxWidth: 300 }}>
                  <Btn href="/upload" bg={C.yellow} textColor={C.black} size="lg">
                    Analyze My Chat →
                  </Btn>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 12, textAlign: 'center', fontWeight: 700 }}>
                    Free · No account required
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

      </div>
    </>
  );
}