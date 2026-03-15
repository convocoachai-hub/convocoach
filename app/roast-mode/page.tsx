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

const ROASTS = [
  {
    msg: 'hey',
    roast: '"Hey." That\'s it? That\'s the message? You typed three letters and expected magic? A vending machine gives more effort when you put a coin in.',
    fix: 'hey, I just saw something that reminded me of our conversation yesterday — you still think pineapple on pizza is acceptable?',
  },
  {
    msg: 'wyd',
    roast: '"Wyd" is not a conversation starter. It\'s a loading screen. You\'re basically saying "I want to talk but I refuse to contribute anything."',
    fix: 'okay real question — if you could teleport anywhere right now, where would you go?',
  },
  {
    msg: 'lol yeah',
    roast: '"Lol yeah" — the official text message of someone who has completely given up. This reply has the emotional depth of a puddle on a hot sidewalk.',
    fix: 'haha wait actually that reminds me of this thing that happened last week — you\'re not gonna believe it',
  },
  {
    msg: 'cool',
    roast: '"Cool." One word. Four letters. Zero personality. If your texts were a spice, they\'d be flour. You are the human equivalent of unseasoned chicken.',
    fix: 'that\'s actually pretty cool — how long have you been into that? I feel like there\'s a story here',
  },
  {
    msg: 'nice',
    roast: '"Nice." Thank you for this deeply thoughtful, emotionally resonant contribution. Shakespeare is shaking. Hemingway wept. The conversation has officially flatlined.',
    fix: 'no way, that\'s actually kind of impressive — I tried something similar once and completely failed lol',
  },
];

export default function RoastModePage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>🔥 Feature</span>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20 }}>
              Roast Mode.
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              Same AI analysis. Same signal detection. But delivered with the brutal, comedic honesty of a friend who's tired of watching you send "hey wyd" at 11pm. Roast Mode doesn't just tell you what went wrong — it makes sure you feel it.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL_DIM}>Hall of shame</span>
            <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: 900, color: C.cream, letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 48 }}>
              Bad texts,<br /><I c={`${C.cream}35`}>brutally roasted.</I>
            </h2>
          </Reveal>

          <div style={{ maxWidth: 640 }}>
            {ROASTS.map(({ msg, roast, fix }, i) => (
              <Reveal key={i} delay={i * 0.06}>
                <div style={{ marginBottom: 28, padding: '24px 0', borderBottom: '1px solid rgba(243,237,226,0.07)' }}>
                  {/* Original message */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
                    <div style={{ background: `${C.red}12`, border: `1px solid ${C.red}25`, borderRadius: '14px 14px 4px 14px', padding: '10px 14px', maxWidth: '60%' }}>
                      <span style={{ fontSize: 13, color: `${C.cream}80` }}>{msg}</span>
                    </div>
                  </div>
                  {/* Roast */}
                  <div style={{ background: `${C.cream}04`, border: `1px solid rgba(243,237,226,0.08)`, borderRadius: 14, padding: '16px 18px', marginBottom: 14 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: C.red, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 8 }}>🔥 Roast</span>
                    <p style={{ fontSize: 13.5, color: `${C.cream}65`, lineHeight: 1.7, margin: 0 }}>{roast}</p>
                  </div>
                  {/* Fix */}
                  <div style={{ background: 'rgba(90,138,90,0.06)', border: '1px solid rgba(90,138,90,0.15)', borderRadius: 14, padding: '14px 18px' }}>
                    <span style={{ fontSize: 9.5, fontWeight: 800, color: '#5A8A5A', textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 8 }}>✅ What to send instead</span>
                    <p style={{ fontSize: 13, color: 'rgba(90,138,90,0.85)', lineHeight: 1.6, margin: 0 }}>{fix}</p>
                  </div>
                </div>
              </Reveal>
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
                  Ready to get<br /><I c={C.red}>humbled?</I>
                </h2>
                <p style={{ fontSize: 15, color: C.muted, marginTop: 16, lineHeight: 1.7, maxWidth: 380 }}>
                  Toggle Roast Mode on during your analysis. Same insights, more pain.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link href="/upload">
                  <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 48px ${C.red}30` }} whileTap={{ scale: 0.96 }}
                    style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 16, padding: '18px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'block' }}>
                    Roast My Texts 🔥
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
