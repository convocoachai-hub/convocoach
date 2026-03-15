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

// â”€â”€â”€ Chat rewrite example â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Rewrite({ before, after, why, isDark = false }: { before: string; after: string; why: string; isDark?: boolean }) {
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
      marginTop: 16, marginBottom: 8,
    }} className="rewrite-grid">
      <div style={{
        background: isDark ? `${C.red}06` : `${C.red}08`,
        border: `1px solid ${isDark ? `${C.red}15` : `${C.red}18`}`,
        borderRadius: 14, padding: '14px 16px',
      }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, color: C.red, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 8 }}>Before</span>
        <p style={{ fontSize: 13, color: isDark ? '#fca5a5' : C.red, lineHeight: 1.5, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{before}</p>
      </div>
      <div style={{
        background: isDark ? 'rgba(90,138,90,0.06)' : 'rgba(90,138,90,0.08)',
        border: '1px solid rgba(90,138,90,0.18)',
        borderRadius: 14, padding: '14px 16px',
      }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, color: '#5A8A5A', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 8 }}>After</span>
        <p style={{ fontSize: 13, color: isDark ? 'rgba(90,138,90,0.9)' : '#3d6e3d', lineHeight: 1.5, margin: 0, fontFamily: "'DM Sans', sans-serif" }}>{after}</p>
      </div>
      <p style={{ gridColumn: '1 / -1', fontSize: 12, color: isDark ? `${C.cream}35` : C.muted, lineHeight: 1.6, marginTop: 4 }}>â†’ {why}</p>
    </div>
  );
}

const GUIDES = [
  {
    emoji: 'ðŸœï¸', title: 'How to Avoid Dry Texting',
    body: 'Dry texting happens when your messages provide nothing for the other person to respond to. One-word replies. Echo answers. No curiosity. The fix is simple: always leave a hook. Every message should either ask a question, share something personal, or introduce a new thread.',
    before: 'yeah it was good',
    after: 'it was solid â€” we ended up trying this random ramen place and it was honestly lifechanging. you into ramen?',
    why: 'Specificity creates engagement. Vague answers kill threads.',
  },
  {
    emoji: 'â“', title: 'How to Ask Engaging Questions',
    body: 'Generic questions get generic answers. "What do you do?" invites a two-word reply. The best questions feel personal, slightly unexpected, and easy to answer with energy. They hint that you actually want to know â€” not just filling silence.',
    before: 'what do you do for fun?',
    after: 'okay real question â€” what\'s the most chaotic thing you\'ve done recently?',
    why: '"For fun" is a job interview. "Chaotic" invites a story.',
  },
  {
    emoji: 'ðŸ“ˆ', title: 'How to Escalate Conversations Naturally',
    body: 'Escalation means transitioning from surface-level small talk to personal, emotional, or suggestive territory without it feeling forced. The key: follow emotional momentum. When someone shares something funny, go deeper into humor. When they share something raw, acknowledge it and match the tone.',
    before: 'haha that\'s crazy. so what else do you do?',
    after: 'wait okay that\'s actually hilarious â€” you\'re the kind of person things just happen to huh',
    why: 'Instead of pivoting, acknowledge and characterize them. It creates intimacy.',
  },
  {
    emoji: 'ðŸŒŠ', title: 'How to Keep Conversation Momentum',
    body: 'Momentum dies when someone takes the conversation backward. If you were discussing childhood memories and someone asks "so how\'s work?" â€” that\'s a momentum killer. The rule: go sideways or forward, never backward. Build on the current thread by adding your own perspective, a related story, or a deeper question.',
    before: 'haha nice. anyway how was your week?',
    after: 'okay but I need to know â€” did you actually end up going back? because that sounds unfinished',
    why: 'Referencing their story shows you\'re listening. Backward pivots show you\'re not.',
  },
  {
    emoji: 'ðŸ”¥', title: 'How to Be Playfully Direct',
    body: 'Being direct doesn\'t mean being aggressive. Playful directness is confidence wrapped in humor. It cuts through ambiguity while still being fun. The key is saying what you mean while making it enjoyable to read. Add personality to your honesty.',
    before: 'I think we should probably hang out sometime if you want to',
    after: 'okay I\'m just gonna say it â€” we clearly need to get food together. name the place, I\'ll be judgmental about the menu',
    why: '"Probably" and "if you want to" signal insecurity. Confidence with humor is attractive.',
  },
];

export default function TextingGuidesPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) {
          .rewrite-grid { grid-template-columns: 1fr !important; }
          .section-pad { padding: 60px 20px !important; }
        }
      `}} />

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
              <span style={LABEL}>âœï¸ Texting Guides</span>
              <h1 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 'clamp(44px, 6vw, 72px)',
                fontWeight: 900, color: C.ink,
                letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20,
              }}>
                Text better.<br /><I c={C.red}>Get better responses.</I>
              </h1>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
                Practical advice for writing messages that keep conversations alive. Each guide includes real before/after examples so you can see the difference immediately.
              </p>
            </Reveal>
          </div>
        </section>

        <HR />

        {/* â•â•â• Guides â•â•â• */}
        {GUIDES.map((guide, i) => {
          const isDark = i % 2 !== 0;
          return (
            <div key={guide.title}>
              <section style={{ background: isDark ? C.ink : C.cream }}>
                <div style={WRAP} className="section-pad">
                  <Reveal>
                    <span style={isDark ? LABEL_DIM : LABEL}>{guide.emoji} Guide {String(i + 1).padStart(2, '0')}</span>
                    <h2 style={{
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      fontSize: 'clamp(28px, 4vw, 44px)',
                      fontWeight: 900, color: isDark ? C.cream : C.ink,
                      letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 24,
                    }}>
                      {guide.title}
                    </h2>
                  </Reveal>

                  <Reveal delay={0.08}>
                    <div style={{ maxWidth: 680 }}>
                      <p style={{
                        fontSize: 15, color: isDark ? `${C.cream}55` : C.muted,
                        lineHeight: 1.85, marginBottom: 20,
                      }}>
                        {guide.body}
                      </p>

                      <Rewrite before={guide.before} after={guide.after} why={guide.why} isDark={isDark} />
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
                    Stop guessing.<br /><I c={C.red}>Get AI feedback.</I>
                  </h2>
                  <p style={{ fontSize: 15, color: C.muted, marginTop: 16, lineHeight: 1.7, maxWidth: 380 }}>
                    Upload a real conversation and see exactly where your messaging breaks down â€” with specific rewrites.
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
      <RelatedResources current="/resources/texting-guides" />
    </>
  );
}
