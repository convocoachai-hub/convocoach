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

const CONCEPTS = [
  {
    emoji: 'ðŸ’˜', title: 'Attraction Dynamics',
    summary: 'Why interest decays and how to maintain it.',
    body: 'Attraction is not a binary state â€” it exists on a spectrum and shifts with every message. Initial interest is a loan, not a gift. You earn it by demonstrating curiosity, unpredictability, and emotional intelligence. Most people exhaust goodwill within 5 messages by being predictable.',
    takeaway: 'Every message either builds or reduces attraction. Neutrality doesn\'t exist.',
    color: C.red,
  },
  {
    emoji: 'ðŸ§ ', title: 'Emotional Investment',
    summary: 'Why people who share more feel more attached.',
    body: 'The person who reveals more emotionally becomes more invested in the interaction. This is called the "vulnerability loop" â€” sharing creates attachment. If you\'re the only one opening up, the other person stays emotionally disengaged. The fix: ask questions that invite depth, then match their level gradually.',
    takeaway: 'Imbalanced vulnerability creates power asymmetry. Balanced sharing builds real connection.',
    color: C.amber,
  },
  {
    emoji: 'âš¡', title: 'Conversational Tension',
    summary: 'The chemistry that makes texting feel alive.',
    body: 'Tension is the gap between expectation and delivery. Playful disagreement, subtle teasing, and unexpected perspectives create micro-tensions that make people lean in. Conversations without tension are comfortable but forgettable. The best texters create tiny moments of "wait, what?" that keep the other person thinking about them.',
    takeaway: 'Comfortable â‰  interesting. A small amount of friction makes conversations magnetic.',
    color: '#5A8A5A',
  },
  {
    emoji: 'ðŸ”„', title: 'Curiosity Loops',
    summary: 'The psychological mechanism behind wanting to reply.',
    body: 'A curiosity loop is an open question in someone\'s mind. When you start a thought and don\'t finish it, or hint at a story without telling it, you create a cognitive itch that demands resolution. This is why cliffhangers work in TV and why the best messages leave something unsaid.',
    takeaway: 'Don\'t resolve everything in one message. Leave breadcrumbs that pull people forward.',
    color: C.red,
  },
  {
    emoji: 'ðŸ“ˆ', title: 'Momentum in Conversations',
    summary: 'Why some chats accelerate and others flatline.',
    body: 'Momentum measures the rate of emotional escalation. Conversations that go deeper, funnier, or more personal with each exchange have high momentum. Those that circle the same shallow topics have zero. Momentum collapses when someone switches to a safer topic after real depth â€” a common fear response.',
    takeaway: 'Track how each message changes the emotional depth. Flat depth = dying conversation.',
    color: C.amber,
  },
  {
    emoji: 'ðŸªž', title: 'The Mirror Effect',
    summary: 'How behavior matching reveals unconscious attraction.',
    body: 'People unconsciously mirror the communication style of people they like. This includes emoji usage, message length, vocabulary, and even grammar quality. When someone starts typing like you, they\'re signaling comfort and affiliation. When their style suddenly shifts, it often means their feelings shifted too.',
    takeaway: 'Style convergence = interest. Style divergence = pulling away.',
    color: '#5A8A5A',
  },
];

export default function DatingPsychologyPage() {
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
            <span style={LABEL}>ðŸ’˜ Dating Psychology</span>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(44px, 6vw, 72px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20,
            }}>
              Why people text<br /><I c={C.red}>the way they do.</I>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              The behavioral science behind attraction, emotional investment, and conversational dynamics. Understand the psychology â€” then use ConvoCoach to apply it.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* â•â•â• Concepts â•â•â• */}
      {CONCEPTS.map((concept, i) => {
        const isDark = i % 2 !== 0;
        return (
          <div key={concept.title}>
            <section style={{ background: isDark ? C.ink : C.cream }}>
              <div style={WRAP} className="section-pad">
                <Reveal>
                  <span style={isDark ? LABEL_DIM : LABEL}>{concept.emoji} {concept.title}</span>
                  <h2 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontSize: 'clamp(28px, 4vw, 44px)',
                    fontWeight: 900, color: isDark ? C.cream : C.ink,
                    letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 28,
                  }}>
                    {concept.summary}
                  </h2>
                </Reveal>

                <Reveal delay={0.08}>
                  <div style={{ maxWidth: 640 }}>
                    <p style={{
                      fontSize: 15, color: isDark ? `${C.cream}55` : C.muted,
                      lineHeight: 1.85, marginBottom: 24,
                    }}>
                      {concept.body}
                    </p>

                    <div style={{
                      background: isDark ? `${C.cream}04` : C.warm1,
                      border: `1px solid ${isDark ? 'rgba(243,237,226,0.08)' : C.warm2}`,
                      borderRadius: 14, padding: '16px 20px',
                      display: 'flex', alignItems: 'flex-start', gap: 10,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: concept.color, display: 'block',
                        flexShrink: 0, marginTop: 6,
                      }} />
                      <div>
                        <span style={{
                          fontSize: 10, fontWeight: 800, color: concept.color,
                          textTransform: 'uppercase' as const, letterSpacing: '0.1em',
                          fontFamily: 'monospace', display: 'block', marginBottom: 4,
                        }}>Key Takeaway</span>
                        <p style={{
                          fontSize: 13.5, color: isDark ? `${C.cream}70` : C.ink,
                          lineHeight: 1.6, fontWeight: 600, margin: 0,
                        }}>{concept.takeaway}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>
            <HR />
          </div>
        );
      })}

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
                  Theory only works<br /><I c={C.red}>when applied.</I>
                </h2>
                <p style={{ fontSize: 15, color: C.muted, marginTop: 16, lineHeight: 1.7, maxWidth: 380 }}>
                  Upload a real conversation and see these dynamics in action â€” with specific, line-by-line feedback.
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
