'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import RelatedResources from '@/components/RelatedResources';
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

const SIGNALS = [
  {
    emoji: 'ðŸªž', title: 'Mirroring',
    desc: 'When someone starts copying your communication style â€” emoji usage, message length, slang, even punctuation â€” it signals comfort and unconscious affiliation.',
    example: '"hahaha wait no that\'s actually crazy" â†’ She matched your exclamation style. She\'s syncing with you.',
    indicator: 'positive',
    strength: 'Strong signal â€” especially if they weren\'t doing it earlier.',
  },
  {
    emoji: 'ðŸ˜', title: 'Playful Teasing',
    desc: 'Light, flirty provocation is a form of testing interest. When someone makes fun of you gently, they\'re signaling that they feel comfortable enough to push boundaries â€” and they want to see how you respond.',
    example: '"oh so you\'re one of THOSE people huh ðŸ˜‚" â†’ She\'s engaging with your personality, not just your information.',
    indicator: 'positive',
    strength: 'Moderate to strong â€” teasing requires emotional investment.',
  },
  {
    emoji: 'â“', title: 'Curiosity Questions',
    desc: 'People ask follow-ups about topics they care about. The depth and specificity of questions reveal genuine interest. "Cool" vs. "wait what did they say after that??" are worlds apart.',
    example: '"okay but what happened next?? i need to know" â†’ Double punctuation + demand for continuation = real curiosity.',
    indicator: 'positive',
    strength: 'Strong â€” voluntary curiosity is hard to fake.',
  },
  {
    emoji: 'âš¡', title: 'Fast Replies',
    desc: 'Consistent quick response times â€” especially when they break their usual pattern to reply faster â€” signal that you\'re a priority. Context matters: fast replies during work hours mean more than fast replies at midnight.',
    example: 'She usually replies in 2 hours. Today she\'s replying in minutes â†’ You\'re on her mind.',
    indicator: 'positive',
    strength: 'Moderate â€” context-dependent. Pattern changes matter more than absolute speed.',
  },
  {
    emoji: 'ðŸ“', title: 'Message Investment',
    desc: 'The length, detail, and thoughtfulness of messages reveal effort. When someone writes paragraphs, references earlier conversations, or brings up inside jokes â€” they\'re investing time and attention.',
    example: '"omg that reminds me of what you said about the ramen place" â†’ She\'s remembering and connecting. High investment.',
    indicator: 'positive',
    strength: 'Very strong â€” memory + effort = genuine interest.',
  },
  {
    emoji: 'â±ï¸', title: 'Delayed Responses',
    desc: 'Gradually increasing reply times â€” especially paired with shorter messages â€” often signals declining interest. This isn\'t about a single delay; it\'s about the trend.',
    example: 'Day 1: replies in 5 min. Day 3: replies in 3 hours. Day 5: "haha" 8 hours later â†’ Interest is eroding.',
    indicator: 'negative',
    strength: 'Moderate to strong â€” consistent delay increase is reliable.',
  },
];

export default function AttractionSignalsPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* â•â•â• Hero â•â•â• */}
      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <Link href="/resources" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, cursor: 'pointer' }}>
                â† Back to Resources
              </span>
            </Link>
            <span style={LABEL}>ðŸªž Attraction Signals</span>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(44px, 6vw, 72px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20,
            }}>
              Read between<br /><I c={C.red}>every line.</I>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              The behavioral cues hidden in everyday texts that reveal genuine interest, polite deflection, or growing disinterest â€” explained with real examples.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* â•â•â• Signal Cards â•â•â• */}
      <section>
        <div style={WRAP} className="section-pad">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 16,
          }} className="signal-cards-grid">
            {SIGNALS.map((signal, i) => {
              const isPositive = signal.indicator === 'positive';
              const accent = isPositive ? '#5A8A5A' : C.red;
              return (
                <Reveal key={signal.title} delay={i * 0.06}>
                  <div style={{
                    background: C.cream,
                    border: `1.5px solid ${C.warm2}`,
                    borderRadius: 20, padding: '24px 22px',
                    height: '100%', position: 'relative',
                    boxShadow: '0 2px 8px rgba(15,12,9,0.04)',
                  }}>
                    {/* Top accent */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right, transparent, ${accent}50, transparent)`, borderRadius: '20px 20px 0 0' }} />

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: 24 }}>{signal.emoji}</span>
                        <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 800, color: C.ink, margin: 0 }}>{signal.title}</h3>
                      </div>
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: accent,
                        background: `${accent}12`, border: `1px solid ${accent}25`,
                        borderRadius: 999, padding: '3px 8px',
                        textTransform: 'uppercase' as const, letterSpacing: '0.08em',
                        fontFamily: 'monospace',
                      }}>{isPositive ? 'Interest' : 'Caution'}</span>
                    </div>

                    <p style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.7, marginBottom: 14 }}>
                      {signal.desc}
                    </p>

                    {/* Example */}
                    <div style={{
                      background: C.warm1, border: `1px solid ${C.warm2}`,
                      borderRadius: 12, padding: '12px 14px', marginBottom: 12,
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 800, color: C.amber, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 6 }}>Example</span>
                      <p style={{ fontSize: 12.5, color: C.ink, lineHeight: 1.55, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>
                        {signal.example}
                      </p>
                    </div>

                    {/* Strength */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, display: 'block', flexShrink: 0, marginTop: 5 }} />
                      <p style={{ fontSize: 11.5, color: C.muted, lineHeight: 1.5, margin: 0 }}>
                        {signal.strength}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <HR />

      {/* â•â•â• Summary â€” ink â•â•â• */}
      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL_DIM}>The bottom line</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900, color: C.cream,
              letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 28,
            }}>
              No single signal tells<br /><I c={`${C.cream}35`}>the whole story.</I>
            </h2>
          </Reveal>
          <Reveal delay={0.08}>
            <div style={{ maxWidth: 580 }}>
              <p style={{ fontSize: 15, color: `${C.cream}55`, lineHeight: 1.85, marginBottom: 20 }}>
                Signals are patterns, not predictions. One fast reply doesn't mean they're in love. One slow reply doesn't mean they've lost interest. ConvoCoach analyzes all 10 signal layers simultaneously to build a complete picture.
              </p>
              <p style={{ fontSize: 15, color: `${C.cream}55`, lineHeight: 1.85 }}>
                The real power is in combining signals: fast replies + long messages + curiosity questions = high interest. Slow replies + short messages + no questions = declining.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* â•â•â• CTA â•â•â• */}
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
                  See the signals<br /><I c={C.red}>in your own chats.</I>
                </h2>
                <p style={{ fontSize: 15, color: C.muted, marginTop: 16, lineHeight: 1.7, maxWidth: 380 }}>
                  Upload a conversation and get all 10 signal layers analyzed automatically â€” with specific insights per message.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link href="/upload">
                  <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 48px ${C.red}30` }} whileTap={{ scale: 0.96 }}
                    style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 16, padding: '18px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'block' }}>
                    Analyze My Chat â†’
                  </motion.button>
                </Link>
                <p style={{ fontSize: 11, color: C.mutedLt, marginTop: 10, textAlign: 'center' }}>Free Â· No account required</p>
              </div>
            </div>
            <div style={{ height: 3, background: C.red, marginTop: 72, borderRadius: 2 }} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
