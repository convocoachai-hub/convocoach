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

function Bub({ text, self, accent }: { text: string; self?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: self ? 'flex-end' : 'flex-start', width: '100%' }}>
      <div style={{
        maxWidth: '78%', padding: '9px 14px', borderRadius: 14,
        borderBottomRightRadius: self ? 3 : 14, borderBottomLeftRadius: self ? 14 : 3,
        fontSize: 13, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif",
        background: self ? C.ink : C.warm1,
        border: self ? 'none' : `1px solid ${C.warm2}`,
        color: self ? C.cream : C.ink,
      }}>{text}{accent && <span style={{ color: '#5A8A5A', marginLeft: 6, fontSize: 10 }}>âœ“ good</span>}</div>
    </div>
  );
}

const EXAMPLES = [
  {
    title: 'High-Chemistry Conversation',
    tag: 'Score: 8.7/10',
    tagColor: '#5A8A5A',
    messages: [
      { text: 'okay random question â€” what\'s the most impulsive thing you\'ve ever done', self: true },
      { text: 'omg. okay so one time I booked a flight to tokyo at 2am because I couldn\'t sleep', self: false },
      { text: 'wait WHAT that\'s actually insane. was it worth it??', self: true, accent: true },
      { text: 'best decision of my life. I ate ramen at 6am in shinjuku and cried a little', self: false },
      { text: 'okay I need this origin story in full. what were you thinking at 2am that led to this', self: true, accent: true },
    ],
    analysis: ['Curiosity questions driving depth (+2.1)', 'Emotional mirroring ("wait WHAT") (+1.4)', 'Follow-up specificity ("origin story in full") (+1.8)', 'Momentum: Escalating â†’ both sides increasingly invested'],
    verdict: 'Strong. Both participants are sharing, reacting, and building. The conversation deepens with each message.',
  },
  {
    title: 'Dry / Dying Conversation',
    tag: 'Score: 2.3/10',
    tagColor: C.red,
    messages: [
      { text: 'hey what\'s up', self: true },
      { text: 'nm u', self: false },
      { text: 'same just chilling', self: true },
      { text: 'cool', self: false },
      { text: 'yeah', self: true },
    ],
    analysis: ['Zero curiosity â€” no questions asked after opener (-2.1)', 'One-word replies from both sides (-1.8)', 'No emotional investment or personal sharing (-2.0)', 'Momentum: Dying â†’ conversation lost energy after the first message'],
    verdict: 'Critical. Neither person is contributing. This conversation was dead after "nm u" and nobody revived it.',
  },
  {
    title: 'One-Sided Interest',
    tag: 'Score: 4.1/10',
    tagColor: C.amber,
    messages: [
      { text: 'hey! how was your weekend? I went hiking and it was incredible â€” the sunset from the top was unreal', self: true },
      { text: 'nice', self: false },
      { text: 'have you ever been hiking? there\'s this trail near the lake that\'s perfect for beginners', self: true },
      { text: 'not really', self: false },
      { text: 'you should try it! or we could do something else, what are you into?', self: true },
    ],
    analysis: ['Severe message balance asymmetry â€” one side writing paragraphs (-1.6)', 'Other side providing minimum viable responses (-1.8)', 'Curiosity is entirely one-directional (-1.2)', 'Energy match: Low â€” one person is overinvesting relative to return'],
    verdict: 'Imbalanced. The initiator is doing all the work. The other person isn\'t reciprocating investment. Time to pull back.',
  },
];

export default function ConversationExamplesPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <Link href="/resources" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, cursor: 'pointer' }}>â† Back to Resources</span>
            </Link>
            <span style={LABEL}>ðŸ“– Examples</span>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20 }}>
              Conversation<br /><I c={C.red}>breakdowns.</I>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              Real conversation examples analyzed line by line. See exactly what makes a conversation work, what makes it fail, and why.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {EXAMPLES.map((ex, i) => {
        const isDark = i % 2 !== 0;
        return (
          <div key={ex.title}>
            <section style={{ background: isDark ? C.ink : C.cream }}>
              <div style={WRAP} className="section-pad">
                <Reveal>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(24px, 3.5vw, 36px)', fontWeight: 900, color: isDark ? C.cream : C.ink, letterSpacing: '-0.03em', lineHeight: 1.08, margin: 0 }}>
                      {ex.title}
                    </h2>
                    <span style={{ fontSize: 10, fontWeight: 800, color: ex.tagColor, background: `${ex.tagColor}12`, border: `1px solid ${ex.tagColor}25`, borderRadius: 999, padding: '4px 10px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{ex.tag}</span>
                  </div>
                </Reveal>

                <Reveal delay={0.06}>
                  <div style={{ maxWidth: 440 }}>
                    <div style={{
                      background: isDark ? `${C.cream}04` : C.warm1,
                      border: `1px solid ${isDark ? 'rgba(243,237,226,0.08)' : C.warm2}`,
                      borderRadius: 18, padding: '20px 16px',
                      display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20,
                    }}>
                      {ex.messages.map((m, j) => (
                        <Bub key={j} text={m.text} self={m.self} accent={m.accent} />
                      ))}
                    </div>
                  </div>
                </Reveal>

                <Reveal delay={0.1}>
                  <div style={{ maxWidth: 600 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: isDark ? `${C.cream}35` : C.muted, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 12 }}>Signal Breakdown</span>
                    <ul style={{ paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                      {ex.analysis.map((a, j) => (
                        <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ width: 5, height: 5, borderRadius: '50%', background: ex.tagColor, display: 'block', flexShrink: 0, marginTop: 7 }} />
                          <span style={{ fontSize: 13, color: isDark ? `${C.cream}50` : C.muted, lineHeight: 1.6 }}>{a}</span>
                        </li>
                      ))}
                    </ul>
                    <div style={{ background: isDark ? `${C.cream}04` : C.warm1, border: `1px solid ${isDark ? 'rgba(243,237,226,0.08)' : C.warm2}`, borderRadius: 12, padding: '14px 16px' }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: ex.tagColor, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 6 }}>Verdict</span>
                      <p style={{ fontSize: 13.5, color: isDark ? `${C.cream}70` : C.ink, lineHeight: 1.6, fontWeight: 600, margin: 0 }}>{ex.verdict}</p>
                    </div>
                  </div>
                </Reveal>
              </div>
            </section>
            <HR />
          </div>
        );
      })}

      <section>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 60px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, margin: 0 }}>
                  Get your own<br /><I c={C.red}>conversation analyzed.</I>
                </h2>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link href="/upload">
                  <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 48px ${C.red}30` }} whileTap={{ scale: 0.96 }}
                    style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 16, padding: '18px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'block' }}>
                    Analyze My Chat â†’
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
