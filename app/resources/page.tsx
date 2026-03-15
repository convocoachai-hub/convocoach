'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { C, EO, WRAP, LABEL, H2, BODY } from '@/lib/design';

// ─── Reusable Reveal (same as landing page) ──────────────────────────────────
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

// ─── Data ────────────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    emoji: '💘', title: 'Dating Psychology',
    desc: 'The behavioral science behind attraction, interest signals, and why people text the way they do.',
    href: '/resources/dating-psychology',
    color: C.red, articles: 6,
  },
  {
    emoji: '✍️', title: 'Texting Guides',
    desc: 'Practical frameworks for writing messages that keep conversations alive and moving forward.',
    href: '/resources/texting-guides',
    color: '#5A8A5A', articles: 5,
  },
  {
    emoji: '🪞', title: 'Attraction Signals',
    desc: 'How to read the hidden behavioral cues in messages that reveal real interest — or the lack of it.',
    href: '/resources/attraction-signals',
    color: C.amber, articles: 6,
  },
];

export default function ResourcesPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ═══ Hero ═══ */}
      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>Resources</span>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(44px, 6vw, 72px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.04em', lineHeight: 1.0,
              marginBottom: 20,
            }}>
              Learn to read<br /><I c={C.red}>any conversation.</I>
            </h1>
            <p style={{ ...BODY, maxWidth: 520, marginBottom: 0 }}>
              Deep dives into the psychology of texting, practical guides for writing better messages, and the behavioral signals that reveal what someone is actually thinking.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ═══ Category Grid ═══ */}
      <section>
        <div style={WRAP} className="section-pad">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: 18,
          }}>
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.title} delay={i * 0.08}>
                <Link href={cat.href} style={{ textDecoration: 'none' }}>
                  <motion.div
                    whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(15,12,9,0.1)' }}
                    style={{
                      background: C.cream,
                      border: `1.5px solid ${C.warm2}`,
                      borderRadius: 20,
                      padding: '28px 26px',
                      height: '100%',
                      cursor: 'pointer',
                      transition: 'border-color 0.3s',
                      boxShadow: '0 2px 8px rgba(15,12,9,0.04)',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Top accent line */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, transparent, ${cat.color}60, transparent)`, borderRadius: '20px 20px 0 0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                      <span style={{ fontSize: 28 }}>{cat.emoji}</span>
                      <div>
                        <h3 style={{
                          fontFamily: "'Bricolage Grotesque', sans-serif",
                          fontSize: 18, fontWeight: 800, color: C.ink,
                          margin: 0, lineHeight: 1.2,
                        }}>{cat.title}</h3>
                        <span style={{
                          fontSize: 10, fontWeight: 700, color: cat.color,
                          background: `${cat.color}12`, border: `1px solid ${cat.color}25`,
                          borderRadius: 999, padding: '2px 8px',
                          fontFamily: 'monospace', letterSpacing: '0.06em',
                          textTransform: 'uppercase' as const,
                          marginTop: 4, display: 'inline-block',
                        }}>{cat.articles} articles</span>
                      </div>
                    </div>

                    <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, marginBottom: 18 }}>
                      {cat.desc}
                    </p>

                    <span style={{
                      fontSize: 13, fontWeight: 700, color: C.ink,
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}>
                      Read articles <span style={{ color: C.red }}>→</span>
                    </span>
                  </motion.div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ═══ Quick Tips — ink bg ═══ */}
      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={{ ...LABEL, color: `${C.cream}35` }}>Quick tips</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900, color: C.cream,
              letterSpacing: '-0.03em', lineHeight: 1.02,
              marginBottom: 48,
            }}>
              Rules the best texters<br /><I c={`${C.cream}35`}>already know.</I>
            </h2>
          </Reveal>

          <div style={{ maxWidth: 640 }}>
            {[
              { n: '01', title: 'Never answer a question without asking one back', desc: 'Conversations die when one person stops contributing curiosity. Every reply should advance the thread.' },
              { n: '02', title: 'Match energy, slightly exceed it', desc: 'Mirror their length and tone, then add 10%. Enough to show interest without overwhelming.' },
              { n: '03', title: 'Avoid safe topics for too long', desc: '"What do you do?" is fine for minute one. By message five, you need something personal, specific, or surprising.' },
              { n: '04', title: 'Subtext matters more than text', desc: 'It\'s not what you say — it\'s how it feels. Reply timing, emoji usage, and question depth all carry emotional weight.' },
              { n: '05', title: 'Know when to stop texting', desc: 'The best conversationalists leave people wanting more. End on a high. Let anticipation do the work.' },
            ].map(({ n, title, desc }, i) => (
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
                  letterSpacing: '-0.04em', lineHeight: 1.0,
                  margin: 0,
                }}>
                  Reading about it<br /><I c={C.red}>won't fix your texts.</I>
                </h2>
                <p style={{ fontSize: 15, color: C.muted, marginTop: 16, lineHeight: 1.7, maxWidth: 360 }}>
                  Upload a real conversation and get specific, actionable feedback in seconds.
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
