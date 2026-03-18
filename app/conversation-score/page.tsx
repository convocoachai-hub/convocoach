'use client';

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

function Badge({ text, color = C.yellow, textColor = C.black, rotate = -2 }: { text: string; color?: string; textColor?: string; rotate?: number }) {
  return (
    <span style={{
      display: 'inline-block', background: color, color: textColor,
      border: C.borderThin, borderRadius: 8, padding: '4px 10px',
      fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', textTransform: 'uppercase',
      fontFamily: "'DM Sans', sans-serif", transform: `rotate(${rotate}deg)`,
      boxShadow: C.shadowSm, flexShrink: 0,
    }}>{text}</span>
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
const METRICS = [
  { emoji: '💬', title: 'Engagement', desc: 'How actively both sides participate. Measures question frequency, response variety, and conversational depth.', weight: '25%', color: C.blue, bg: C.bgBlue },
  { emoji: '❓', title: 'Curiosity', desc: 'How much genuine interest is being shown. Tracks follow-up questions, topic exploration, and personal disclosure requests.', weight: '20%', color: C.yellow, bg: C.bgYellow },
  { emoji: '⚡', title: 'Emotional Energy', desc: 'The intensity and warmth of the conversation. Evaluates exclamation usage, emoji density, laughter patterns, and vulnerability.', weight: '20%', color: C.green, bg: C.bgGreen },
  { emoji: '⚖️', title: 'Message Balance', desc: 'The ratio of effort between both participants. Analyzes message length parity, question reciprocity, and initiation patterns.', weight: '15%', color: C.pink, bg: C.bgPink },
  { emoji: '📈', title: 'Momentum', desc: 'Whether the conversation is building or dying. Tracks response time trends, topic depth progression, and emotional escalation.', weight: '10%', color: C.red, bg: '#FFF0F0' },
  { emoji: '🪞', title: 'Mirror Score', desc: 'Behavioral mirroring between participants. Compares communication styles, emoji usage, and language patterns for alignment.', weight: '10%', color: C.blue, bg: C.bgBlue },
];

const SCORE_RANGES = [
  { range: '9-10', label: 'Elite', desc: 'Deep engagement, mutual curiosity, strong emotional resonance.', color: C.green },
  { range: '7-8', label: 'Strong', desc: 'Good chemistry, some depth, clear mutual interest.', color: C.yellow },
  { range: '5-6', label: 'Average', desc: 'Surface-level. Functional but not exciting.', color: C.white },
  { range: '3-4', label: 'Weak', desc: 'Low energy, one-sided, or stalling.', color: C.pink },
  { range: '1-2', label: 'Critical', desc: 'Dying conversation. Needs a full reset.', color: C.red },
];

// ═════════════════════════════════════════════════════════════════════════════
// PAGE
// ═════════════════════════════════════════════════════════════════════════════
export default function ConversationScorePage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;0,9..40,900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; overflow-x: hidden; }
        body { overflow-x: hidden; width: 100%; background: ${C.bgCream}; }
        
        .metric-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; }
        
        @media (max-width: 640px) {
          .section-pad { padding: 56px 20px !important; }
          .metric-grid { grid-template-columns: 1fr; }
        }
      `}} />

      <div style={{ background: C.bgCream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

        {/* ════════════════════════════════════════════════════════════════
            HERO — pink background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ position: 'relative', background: C.pink, borderBottom: C.border, overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Star size={32} color={C.white} style={{ position: 'absolute', top: '15%', right: '10%' }} />
            <Triangle size={24} color={C.blue} style={{ position: 'absolute', bottom: '20%', left: '5%' }} />
            <Squiggle color={C.yellow} style={{ position: 'absolute', bottom: '10%', right: '20%' }} />
          </div>

          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="AI Analytics" color={C.black} />
              <h1 style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(42px, 9vw, 84px)',
                fontWeight: 900, color: C.black, letterSpacing: '-0.04em',
                lineHeight: 1.15, marginBottom: 24, wordBreak: 'break-word',
              }}>
                The Conversation<br />
                <span style={{ background: C.black, color: C.white, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
                  Score.
                </span>
              </h1>
              <p style={{ fontSize: 17, color: '#333', lineHeight: 1.7, maxWidth: 560, fontWeight: 600 }}>
                Every conversation you upload gets an objective score from 1 to 10. It's calculated from six behavioral metrics that measure exactly how healthy, engaging, and promising the interaction actually is.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            METRICS GRID — cream background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.bgCream, borderBottom: C.border }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="The Algorithm" color={C.red} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 6vw, 48px)', fontWeight: 900, color: C.black, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 48 }}>
                Six metrics. One number.
              </h2>
            </Reveal>

            <div className="metric-grid">
              {METRICS.map((m, i) => (
                <Reveal key={m.title} delay={i * 0.06}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: C.shadowLg }}
                    transition={SNAP}
                    style={{
                      background: m.bg, border: C.border,
                      borderRadius: 20, padding: '24px 22px', height: '100%',
                      boxShadow: C.shadow, borderTop: `6px solid ${m.color}`,
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 26, background: C.white, borderRadius: 10, border: C.borderThin, width: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: C.shadowSm }}>
                          {m.emoji}
                        </span>
                        <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 16, fontWeight: 900, color: C.black, margin: 0, letterSpacing: '-0.01em' }}>{m.title}</h3>
                      </div>
                      <Badge text={`Weight: ${m.weight}`} color={C.white} textColor={C.black} rotate={0} />
                    </div>
                    <p style={{ fontSize: 14, color: '#444', lineHeight: 1.65, margin: 0, fontWeight: 500 }}>{m.desc}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            SCORE RANGES — black background
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.black, borderBottom: C.border, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Star size={32} color={C.yellow} style={{ position: 'absolute', top: '10%', right: '5%' }} />
            <Dot size={16} color={C.blue} style={{ position: 'absolute', bottom: '15%', left: '5%' }} />
          </div>

          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <Label text="The Baseline" color={C.yellow} />
              <h2 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 900, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: 32, wordBreak: 'break-word' }}>
                What your score<br/>
                <span style={{ background: C.yellow, color: C.black, borderRadius: 10, padding: '2px 10px', border: C.border, display: 'inline-block', marginTop: 4 }}>
                  actually means.
                </span>
              </h2>
            </Reveal>
            
            <Reveal delay={0.08}>
              <div style={{ maxWidth: 640, background: C.white, border: C.border, borderRadius: 20, padding: 'clamp(20px, 4vw, 40px)', boxShadow: C.shadowLg }}>
                {SCORE_RANGES.map(({ range, label, desc, color }, i) => (
                  <motion.div key={range} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.4 }}
                    style={{ display: 'flex', gap: 'clamp(16px, 3vw, 28px)', padding: '24px 0', borderBottom: i === SCORE_RANGES.length - 1 ? 'none' : C.borderThin, alignItems: 'center' }}>
                    <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 5vw, 42px)', fontWeight: 900, color: C.black, lineHeight: 1, flexShrink: 0, width: 80, textAlign: 'center', background: color, border: C.border, padding: '10px 0', borderRadius: 12, boxShadow: C.shadowSm }}>
                      {range}
                    </div>
                    <div>
                      <h3 style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 900, color: C.black, marginBottom: 6, letterSpacing: '-0.01em' }}>{label}</h3>
                      <p style={{ fontSize: 14.5, color: '#555', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>{desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════
            FINAL CTA
        ════════════════════════════════════════════════════════════════ */}
        <section style={{ background: C.white, position: 'relative', overflow: 'hidden' }}>
          <div className="section-pad" style={{ maxWidth: 1120, margin: '0 auto', padding: '80px 28px' }}>
            <Reveal>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap', background: C.blue, border: C.border, borderRadius: 20, padding: 'clamp(24px, 5vw, 48px)', boxShadow: C.shadowLg }}>
                <div style={{ flex: '1 1 300px' }}>
                  <h2 style={{
                    fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(32px, 6vw, 48px)',
                    fontWeight: 900, color: C.white, letterSpacing: '-0.03em', lineHeight: 1.1, margin: 0,
                  }}>
                    Find your score.<br />
                    <span style={{ color: C.yellow }}>Upload a conversation.</span>
                  </h2>
                  <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', marginTop: 16, lineHeight: 1.6, fontWeight: 600 }}>
                    Upload a screenshot right now and let the AI grade your game. No account required.
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