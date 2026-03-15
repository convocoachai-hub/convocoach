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

const FIXES = [
  {
    title: 'The One-Word Killer',
    boring: ['hey', 'nice', 'cool', 'lol', 'yeah'],
    fixed: ['hey, I just thought of something random â€” what\'s your go-to comfort food?', 'wait that\'s actually impressive, how long did that take you?', 'okay that made me laugh way harder than it should have â€” you can\'t just drop that casually'],
    why: 'One-word replies give the other person nothing to work with. Every message should either ask, share, or react with specificity.',
  },
  {
    title: 'The Interview Mode',
    boring: ['what do you do?', 'where are you from?', 'do you have siblings?'],
    fixed: ['you seem like someone who does something creative â€” am I right?', 'okay where did you grow up? I\'m trying to figure out if that explains your personality', 'tell me something about your family that would surprise me'],
    why: 'Questions that feel like a job interview produce job-interview answers. Make questions feel personal.',
  },
  {
    title: 'The Dead-End Topic Switch',
    boring: ['anyway how was your week?', 'so what else do you do?', 'anything else new?'],
    fixed: ['wait I need to go back to what you said about the hiking trip â€” you can\'t just leave me hanging', 'okay but you never finished that story, what happened after?', 'I feel like there\'s more to that â€” what made you start doing that?'],
    why: 'Topic switches when things get interesting signal that you\'re not paying attention. Go deeper, not wider.',
  },
  {
    title: 'The Approval Seeker',
    boring: ['haha you\'re so funny', 'wow that\'s amazing', 'you\'re really interesting', 'I love talking to you'],
    fixed: ['okay that was actually clever, I\'ll give you that one', 'not gonna lie, that\'s kind of impressive â€” and I don\'t impress easy', 'you might actually be the most chaotic person I\'ve talked to this week and I mean that as a compliment'],
    why: 'Constant validation without substance feels hollow. Add personality to your appreciation.',
  },
];

export default function StopDryTextingPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <Link href="/resources" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, cursor: 'pointer' }}>â† Back to Resources</span>
            </Link>
            <span style={LABEL}>ðŸœï¸ Guide</span>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20 }}>
              Stop dry texting.<br /><I c={C.red}>Permanently.</I>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              Dry texting is the #1 killer of online conversations. Here are the four most common dry texting patterns, why they kill attraction, and exactly how to fix them â€” with real message examples.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {FIXES.map((f, i) => {
        const isDark = i % 2 !== 0;
        return (
          <div key={f.title}>
            <section style={{ background: isDark ? C.ink : C.cream }}>
              <div style={WRAP} className="section-pad">
                <Reveal>
                  <span style={isDark ? LABEL_DIM : LABEL}>Pattern {String(i + 1).padStart(2, '0')}</span>
                  <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: isDark ? C.cream : C.ink, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 24 }}>
                    {f.title}
                  </h2>
                </Reveal>
                <Reveal delay={0.06}>
                  <div style={{ maxWidth: 640 }}>
                    {/* Boring examples */}
                    <div style={{ background: isDark ? `${C.red}06` : `${C.red}08`, border: `1px solid ${isDark ? `${C.red}15` : `${C.red}18`}`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: C.red, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 10 }}>ðŸš« Dry messages</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {f.boring.map((b) => (
                          <span key={b} style={{ background: isDark ? `${C.red}10` : `${C.red}12`, border: `1px solid ${C.red}20`, borderRadius: 10, padding: '6px 12px', fontSize: 12.5, color: isDark ? '#fca5a5' : C.red, fontFamily: "'DM Sans', sans-serif" }}>"{b}"</span>
                        ))}
                      </div>
                    </div>
                    {/* Fixed examples */}
                    <div style={{ background: isDark ? 'rgba(90,138,90,0.06)' : 'rgba(90,138,90,0.08)', border: '1px solid rgba(90,138,90,0.15)', borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
                      <span style={{ fontSize: 9.5, fontWeight: 800, color: '#5A8A5A', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 10 }}>âœ… Better alternatives</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {f.fixed.map((g) => (
                          <div key={g} style={{ background: isDark ? 'rgba(90,138,90,0.06)' : 'rgba(90,138,90,0.08)', border: '1px solid rgba(90,138,90,0.12)', borderRadius: 10, padding: '8px 14px', fontSize: 12.5, color: isDark ? 'rgba(90,138,90,0.9)' : '#3d6e3d', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                            "{g}"
                          </div>
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: isDark ? `${C.cream}40` : C.muted, lineHeight: 1.65 }}>â†’ {f.why}</p>
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
                  Are your texts dry?<br /><I c={C.red}>Let the AI check.</I>
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
