'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { C, EO, WRAP, LABEL, LABEL_DIM } from '@/lib/design';

function Reveal({ children, delay = 0, y = 28 }: { children: React.ReactNode; delay?: number; y?: number }) {
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }} transition={{ ...EO, delay }}>
      {children}
    </motion.div>
  );
}

function I({ children, c = C.muted }: { children: React.ReactNode; c?: string }) {
  return <em style={{ fontStyle: 'italic', color: c, fontFamily: 'Georgia, serif' }}>{children}</em>;
}

const HR = () => <div style={{ height: 1, background: C.warm2, margin: 0 }} />;

const VALUES = [
  {
    emoji: '🔬', title: 'Signal-first analysis',
    desc: 'We don\'t tell you what to say. We decode the behavioral signals in conversations so you can make smarter decisions on your own — with data, not guesswork.',
  },
  {
    emoji: '🛡️', title: 'Privacy by design',
    desc: 'Screenshots are processed and deleted within 60 seconds. We never store conversation data. Your private texts stay private — period.',
  },
  {
    emoji: '🧠', title: 'Behavioral science, not vibes',
    desc: 'Every analysis layer is grounded in real communication psychology — attachment theory, mirroring behavior, response latency patterns, and conversational momentum.',
  },
  {
    emoji: '⚡', title: 'Speed over bloat',
    desc: 'ConvoCoach gives you answers in under 30 seconds. No lengthy personality quizzes, no "complete your profile" funnels. Upload, analyze, improve.',
  },
];

const TEAM_PRINCIPLES = [
  { n: '01', title: 'Build tools, not dependencies', desc: 'We want users to get better at reading conversations on their own. The ideal outcome is that you stop needing us.' },
  { n: '02', title: 'Brutal honesty over flattery', desc: 'Telling someone their texts are "great!" when they\'re not helps nobody. We give direct, specific, sometimes uncomfortable feedback.' },
  { n: '03', title: 'Respect the intelligence of users', desc: 'No dumbing down. No gamification for the sake of engagement. Clean UI, real analysis, zero manipulation.' },
  { n: '04', title: 'Small team, high standards', desc: 'We ship fewer features, but every one is polished. No feature creep. No half-built experiments in production.' },
];

export default function AboutPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ═══ Hero ═══ */}
      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>About us</span>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(44px, 6vw, 72px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20,
            }}>
              We build tools for people<br /><I c={C.red}>who refuse to be ignored.</I>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 560 }}>
              ConvoCoach started with a simple observation: most people don't know why their conversations fail. 
              They get ghosted, left on read, or stuck in shallow small talk — and they have no idea what went wrong. 
              We built an AI that reads the behavioral signals humans miss.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ═══ Origin Story — ink bg ═══ */}
      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL_DIM}>The origin</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900, color: C.cream,
              letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 28,
            }}>
              A screenshot<br /><I c={`${C.cream}35`}>changed everything.</I>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div style={{ maxWidth: 600 }}>
              <p style={{ fontSize: 15, color: `${C.cream}55`, lineHeight: 1.85, marginBottom: 20 }}>
                It started when a friend sent us a screenshot of a conversation and asked "is she interested or not?" 
                We spent 15 minutes analyzing response timing, message length patterns, question-asking behavior, 
                and mirroring cues. The answer was obvious once you knew what to look for.
              </p>
              <p style={{ fontSize: 15, color: `${C.cream}55`, lineHeight: 1.85, marginBottom: 20 }}>
                That's when we realized: the information is all there in the text. Most people just don't know 
                how to read it. Response delay patterns, emotional investment asymmetry, curiosity signals — 
                they're all hiding in plain sight.
              </p>
              <p style={{ fontSize: 15, color: `${C.cream}55`, lineHeight: 1.85 }}>
                So we taught an AI to see what humans miss. ConvoCoach analyzes 10 behavioral signal layers 
                simultaneously and gives you a complete picture of what's actually happening in any conversation — 
                in under 30 seconds.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ═══ Values ═══ */}
      <section>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL}>What we believe</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 48,
            }}>
              Signal over noise.
            </h2>
          </Reveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.06}>
                <div style={{
                  background: C.cream, border: `1.5px solid ${C.warm2}`,
                  borderRadius: 20, padding: '24px 22px', height: '100%',
                  boxShadow: '0 2px 8px rgba(15,12,9,0.04)',
                }}>
                  <span style={{ fontSize: 26, display: 'block', marginBottom: 14 }}>{v.emoji}</span>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 800, color: C.ink, margin: 0, marginBottom: 8 }}>{v.title}</h3>
                  <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, margin: 0 }}>{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ═══ Team Principles — ink bg ═══ */}
      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL_DIM}>How we work</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900, color: C.cream,
              letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 48,
            }}>
              Ship less,<br /><I c={`${C.cream}35`}>ship better.</I>
            </h2>
          </Reveal>

          <div style={{ maxWidth: 640 }}>
            {TEAM_PRINCIPLES.map(({ n, title, desc }, i) => (
              <motion.div key={n} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                style={{ display: 'flex', gap: 28, padding: '28px 0', borderBottom: '1px solid rgba(243,237,226,0.07)' }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 48, fontWeight: 900, color: `${C.cream}18`, lineHeight: 1, flexShrink: 0, width: 56 }}>{n}</div>
                <div style={{ paddingTop: 4 }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 18, fontWeight: 800, color: C.cream, marginBottom: 7 }}>{title}</div>
                  <div style={{ fontSize: 14, color: `${C.cream}45`, lineHeight: 1.75 }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ═══ CTA ═══ */}
      <section>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 'clamp(36px, 5vw, 60px)',
                  fontWeight: 900, color: C.ink,
                  letterSpacing: '-0.04em', lineHeight: 1.0, margin: 0,
                }}>
                  Try it yourself.<br /><I c={C.red}>First one's free.</I>
                </h2>
                <p style={{ fontSize: 15, color: C.muted, marginTop: 16, lineHeight: 1.7, maxWidth: 380 }}>
                  Upload a conversation screenshot and see what our AI finds. No account required.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link href="/upload">
                  <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 48px ${C.red}30` }} whileTap={{ scale: 0.96 }}
                    style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 16, padding: '18px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'block' }}>
                    Analyze My Chat →
                  </motion.button>
                </Link>
                <p style={{ fontSize: 11, color: C.mutedLt, marginTop: 10, textAlign: 'center' }}>Free · No account required</p>
              </div>
            </div>
            <div style={{ height: 3, background: C.red, marginTop: 72, borderRadius: 2 }} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
