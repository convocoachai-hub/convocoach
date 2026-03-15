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

const METRICS = [
  { emoji: '💬', title: 'Engagement', desc: 'How actively both sides participate. Measures question frequency, response variety, and conversational depth.', weight: '25%', color: C.red },
  { emoji: '❓', title: 'Curiosity', desc: 'How much genuine interest is being shown. Tracks follow-up questions, topic exploration, and personal disclosure requests.', weight: '20%', color: C.amber },
  { emoji: '⚡', title: 'Emotional Energy', desc: 'The intensity and warmth of the conversation. Evaluates exclamation usage, emoji density, laughter patterns, and vulnerability.', weight: '20%', color: '#5A8A5A' },
  { emoji: '⚖️', title: 'Message Balance', desc: 'The ratio of effort between both participants. Analyzes message length parity, question reciprocity, and initiation patterns.', weight: '15%', color: '#6366F1' },
  { emoji: '📈', title: 'Momentum', desc: 'Whether the conversation is building or dying. Tracks response time trends, topic depth progression, and emotional escalation.', weight: '10%', color: C.red },
  { emoji: '🪞', title: 'Mirror Score', desc: 'Behavioral mirroring between participants. Compares communication styles, emoji usage, and language patterns for alignment.', weight: '10%', color: C.amber },
];

const SCORE_RANGES = [
  { range: '9-10', label: 'Elite', desc: 'Deep engagement, mutual curiosity, strong emotional resonance.', color: '#5A8A5A' },
  { range: '7-8', label: 'Strong', desc: 'Good chemistry, some depth, clear mutual interest.', color: C.amber },
  { range: '5-6', label: 'Average', desc: 'Surface-level. Functional but not exciting.', color: C.muted },
  { range: '3-4', label: 'Weak', desc: 'Low energy, one-sided, or stalling.', color: C.red },
  { range: '1-2', label: 'Critical', desc: 'Dying conversation. Needs a full reset.', color: '#D13920' },
];

export default function ConversationScorePage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>Feature</span>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20 }}>
              Conversation<br /><I c={C.red}>Score.</I>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              Every conversation gets a score from 1 to 10. It's calculated from six behavioral metrics that measure how healthy, engaging, and promising the interaction is.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      <section>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL}>How it works</span>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 48 }}>
              Six metrics,<br /><I c={C.red}>one number.</I>
            </h2>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
            {METRICS.map((m, i) => (
              <Reveal key={m.title} delay={i * 0.06}>
                <div style={{ background: C.cream, border: `1.5px solid ${C.warm2}`, borderRadius: 20, padding: '24px 22px', height: '100%', boxShadow: '0 2px 8px rgba(15,12,9,0.04)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, transparent, ${m.color}50, transparent)`, borderRadius: '20px 20px 0 0' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 24 }}>{m.emoji}</span>
                      <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}>{m.title}</h3>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: m.color, background: `${m.color}12`, border: `1px solid ${m.color}20`, borderRadius: 999, padding: '3px 8px', fontFamily: 'monospace' }}>{m.weight}</span>
                  </div>
                  <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, margin: 0 }}>{m.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={{ ...LABEL, color: `${C.cream}35` }}>Score ranges</span>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.cream, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 48 }}>
              What your score<br /><I c={`${C.cream}35`}>actually means.</I>
            </h2>
          </Reveal>
          <div style={{ maxWidth: 560 }}>
            {SCORE_RANGES.map(({ range, label, desc, color }, i) => (
              <motion.div key={range} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.6 }}
                style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '22px 0', borderBottom: '1px solid rgba(243,237,226,0.07)' }}>
                <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 900, color, width: 70, textAlign: 'center', flexShrink: 0 }}>{range}</div>
                <div>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 800, color: C.cream, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, color: `${C.cream}45`, lineHeight: 1.6 }}>{desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <HR />

      <section>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, margin: 0 }}>
                  Find out your score.<br /><I c={C.red}>Upload a conversation.</I>
                </h2>
                <p style={{ fontSize: 15, color: C.muted, marginTop: 16, lineHeight: 1.7, maxWidth: 380 }}>First analysis is free. No account required.</p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link href="/upload">
                  <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 48px ${C.red}30` }} whileTap={{ scale: 0.96 }}
                    style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 16, padding: '18px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'block' }}>
                    Analyze My Chat →
                  </motion.button>
                </Link>
              </div>
            </div>
            <div style={{ height: 3, background: C.red, marginTop: 72, borderRadius: 2 }} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
