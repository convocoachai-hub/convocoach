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

const TECHNIQUES = [
  {
    emoji: 'ðŸ˜', title: 'Playful Assumptions',
    desc: 'Instead of asking boring questions, make a playful guess about them. It shows confidence and gives them something to react to.',
    bad: 'what kind of food do you like?',
    good: 'you give off "orders the weirdest thing on the menu" energy',
    why: 'Assumptions are more fun than interrogations. They feel personalized.',
  },
  {
    emoji: 'ðŸŽ¯', title: 'Specific Compliments',
    desc: 'Generic compliments ("you\'re pretty") are forgettable. Specific ones ("the way you described that trip makes me want to go") feel real.',
    bad: 'you\'re really cool',
    good: 'okay the fact that you actually taught yourself guitar just to play that one song is kind of absurdly impressive',
    why: 'Specificity = attention = attraction. It shows you\'re actually listening.',
  },
  {
    emoji: 'ðŸŒŠ', title: 'Push-Pull',
    desc: 'The art of giving a compliment and a tease in the same message. It creates tension and keeps them engaged.',
    bad: 'I really like talking to you',
    good: 'I can\'t decide if you\'re genuinely this interesting or if I\'m just sleep-deprived enough to fall for it',
    why: 'Pure positivity gets boring. A little friction makes things electric.',
  },
  {
    emoji: 'ðŸ«£', title: 'Vulnerable Humor',
    desc: 'Being slightly self-deprecating in a funny way is disarming. It shows you don\'t take yourself too seriously.',
    bad: 'I\'m really funny actually',
    good: 'heads up, my humor is an acquired taste. like, you might need approximately 3 conversations before you start laughing WITH me instead of AT me',
    why: 'Confidence isn\'t about being perfect. It\'s about being comfortable with imperfection.',
  },
  {
    emoji: 'âœ¨', title: 'Future Projecting',
    desc: 'Casually referencing future scenarios together creates a sense of inevitability. It\'s bold without being pushy.',
    bad: 'maybe we should hang out sometime',
    good: 'okay when we eventually go to that ramen place you mentioned, I\'m ordering for you. you clearly can\'t be trusted with a menu',
    why: '"When" is more powerful than "if." It assumes the connection will continue.',
  },
];

export default function FlirtingOverTextPage() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 640px) { .example-grid { grid-template-columns: 1fr !important; } }
      `}} />

      <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

        <section>
          <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
            <Reveal>
              <Link href="/resources" style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: 12, color: C.muted, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 20, cursor: 'pointer' }}>â† Back to Resources</span>
              </Link>
              <span style={LABEL}>ðŸ˜ Flirting Guide</span>
              <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20 }}>
                Flirting<br /><I c={C.red}>over text.</I>
              </h1>
              <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
                Flirting isn't about pickup lines. It's about tone, timing, and the ability to make someone smile at their phone. Here are the techniques that actually work.
              </p>
            </Reveal>
          </div>
        </section>

        <HR />

        {TECHNIQUES.map((t, i) => {
          const isDark = i % 2 !== 0;
          return (
            <div key={t.title}>
              <section style={{ background: isDark ? C.ink : C.cream }}>
                <div style={WRAP} className="section-pad">
                  <Reveal>
                    <span style={isDark ? LABEL_DIM : LABEL}>{t.emoji} Technique {String(i + 1).padStart(2, '0')}</span>
                    <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 900, color: isDark ? C.cream : C.ink, letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 20 }}>
                      {t.title}
                    </h2>
                  </Reveal>
                  <Reveal delay={0.06}>
                    <div style={{ maxWidth: 680 }}>
                      <p style={{ fontSize: 15, color: isDark ? `${C.cream}55` : C.muted, lineHeight: 1.85, marginBottom: 20 }}>{t.desc}</p>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }} className="example-grid">
                        <div style={{ background: isDark ? `${C.red}06` : `${C.red}08`, border: `1px solid ${isDark ? `${C.red}15` : `${C.red}18`}`, borderRadius: 14, padding: '14px 16px' }}>
                          <span style={{ fontSize: 9.5, fontWeight: 800, color: C.red, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 8 }}>Don't</span>
                          <p style={{ fontSize: 13, color: isDark ? '#fca5a5' : C.red, lineHeight: 1.5, margin: 0 }}>{t.bad}</p>
                        </div>
                        <div style={{ background: isDark ? 'rgba(90,138,90,0.06)' : 'rgba(90,138,90,0.08)', border: '1px solid rgba(90,138,90,0.18)', borderRadius: 14, padding: '14px 16px' }}>
                          <span style={{ fontSize: 9.5, fontWeight: 800, color: '#5A8A5A', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 8 }}>Do</span>
                          <p style={{ fontSize: 13, color: isDark ? 'rgba(90,138,90,0.9)' : '#3d6e3d', lineHeight: 1.5, margin: 0 }}>{t.good}</p>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: isDark ? `${C.cream}35` : C.muted, marginTop: 4 }}>â†’ {t.why}</p>
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
                    See if your flirting<br /><I c={C.red}>is actually landing.</I>
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
      <RelatedResources current="/resources/flirting-over-text" />
    </>
  );
}
