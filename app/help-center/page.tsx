'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// ─── FAQ Accordion ───────────────────────────────────────────────────────────
function FAQ({ question, answer, isDark = false }: { question: string; answer: string; isDark?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      style={{
        borderBottom: `1px solid ${isDark ? 'rgba(243,237,226,0.07)' : C.warm2}`,
        cursor: 'pointer',
      }}
      onClick={() => setOpen(p => !p)}
    >
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '22px 0', gap: 16,
      }}>
        <h3 style={{
          fontFamily: "'Bricolage Grotesque', sans-serif",
          fontSize: 16, fontWeight: 700,
          color: isDark ? C.cream : C.ink,
          margin: 0, lineHeight: 1.3,
        }}>{question}</h3>
        <motion.span
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            fontSize: 22, fontWeight: 300, color: isDark ? `${C.cream}40` : C.muted,
            flexShrink: 0, lineHeight: 1,
          }}
        >+</motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <p style={{
              fontSize: 14, color: isDark ? `${C.cream}50` : C.muted,
              lineHeight: 1.75, paddingBottom: 22, maxWidth: 600,
            }}>{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

const FAQS = [
  {
    q: 'What is ConvoCoach?',
    a: 'ConvoCoach is an AI-powered conversation intelligence tool. Upload a screenshot of any text conversation and our AI analyzes 10 behavioral layers — attraction signals, energy ratios, momentum, response timing, and more — to tell you exactly what\'s happening beneath the surface.',
  },
  {
    q: 'How does the analysis work?',
    a: 'Upload a screenshot from any messaging app (iMessage, WhatsApp, Instagram, Hinge, Slack). Our OCR extracts the text, then our AI processes it through 10 signal layers. You get a complete breakdown including attraction probability, missed cues, momentum analysis, and suggested replies — usually within 30 seconds.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. Screenshots are processed and then deleted from our servers within 60 seconds. We do not store conversation data. Your analysis results are tied to your session only and are not linked to any personal account unless you explicitly save them.',
  },
  {
    q: 'What is Practice Mode?',
    a: 'Practice Mode lets you text with 10 distinct AI personalities across dating, professional, and social scenarios. Each character has unique traits and communication styles. Three difficulty levels are available, with real-time coaching on-screen for the beginner level.',
  },
  {
    q: 'Is the first analysis really free?',
    a: 'Yes. Your first chat analysis is completely free with no account required. No credit card information is collected. You can upgrade to Premium for unlimited analyses, all 10 signal layers, AI reply suggestions, and full Roast Mode access.',
  },
  {
    q: 'What apps are supported?',
    a: 'ConvoCoach supports screenshots from any messaging app including iMessage, WhatsApp, Instagram DMs, Hinge, Bumble, Tinder, Facebook Messenger, Slack, Teams, Telegram, Signal, and more. If text is visible in the screenshot, our OCR can extract it.',
  },
  {
    q: 'What is Roast Mode?',
    a: 'Roast Mode gives you the same analytical depth as a regular analysis, but delivers the feedback with brutal comedic honesty. Think: a very honest friend who happens to be a standup comedian reading your texts. It\'s the same intelligence, different packaging.',
  },
  {
    q: 'How accurate is the attraction score?',
    a: 'Our attraction probability algorithm analyzes 11 behavioral signals including message investment, response timing patterns, mirroring behavior, and emotional disclosure. Based on our testing, the aggregate score achieves approximately 94% correlation with self-reported interest levels.',
  },
];

const TROUBLESHOOTING = [
  {
    title: 'Screenshot not being recognized',
    steps: 'Make sure your screenshot is clear and the text is readable. Avoid screenshots with heavy filters, very small text, or significant overlap from notifications. Crop tightly to the conversation area for best results.',
  },
  {
    title: 'Analysis seems inaccurate',
    steps: 'AI analysis works best with at least 4-5 message exchanges. Very short conversations (1-2 messages) don\'t provide enough behavioral data for reliable analysis. Try uploading a longer section of the conversation.',
  },
  {
    title: 'Page is loading slowly',
    steps: 'Try clearing your browser cache and refreshing the page. ConvoCoach is optimized for modern browsers (Chrome, Safari, Firefox, Edge). If issues persist, try disabling browser extensions that may interfere.',
  },
  {
    title: 'Practice Mode characters not responding',
    steps: 'Ensure you have a stable internet connection! If a character stops responding, try refreshing the page or selecting a different character. Each character has a distinct personality and may take a moment to generate contextual replies.',
  },
];

export default function HelpCenterPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ═══ Hero ═══ */}
      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>Help Center</span>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(44px, 6vw, 72px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20,
            }}>
              How can we<br /><I c={C.red}>help you?</I>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              Everything you need to know about using ConvoCoach — from uploading your first screenshot to understanding your analysis results.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ═══ How It Works ═══ */}
      <section>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL}>Getting started</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 40,
            }}>
              How ConvoCoach works
            </h2>
          </Reveal>

          <div style={{ maxWidth: 640 }}>
            {[
              { n: '01', title: 'Take a screenshot of any conversation', desc: 'Any messaging app works. Make sure the text is clear and readable. Crop to the conversation area for best results.' },
              { n: '02', title: 'Upload it to ConvoCoach', desc: 'Drag and drop or tap to upload. Our OCR will extract all text from the image automatically. Your screenshot is deleted within 60 seconds.' },
              { n: '03', title: 'Read your analysis', desc: 'Our AI processes the conversation through 10 signal layers and delivers a complete breakdown — signals detected, mistakes identified, and 3 suggested replies.' },
            ].map(({ n, title, desc }, i) => (
              <Reveal key={n} delay={i * 0.08}>
                <div style={{ display: 'flex', gap: 24, padding: '24px 0', borderBottom: `1px solid ${C.warm2}` }}>
                  <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 42, fontWeight: 900, color: `${C.red}20`, lineHeight: 1, flexShrink: 0, width: 50 }}>{n}</div>
                  <div style={{ paddingTop: 2 }}>
                    <div style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 17, fontWeight: 800, color: C.ink, marginBottom: 6 }}>{title}</div>
                    <div style={{ fontSize: 13.5, color: C.muted, lineHeight: 1.75 }}>{desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ═══ FAQ — ink bg ═══ */}
      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL_DIM}>FAQ</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(36px, 5vw, 56px)',
              fontWeight: 900, color: C.cream,
              letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 40,
            }}>
              Frequently asked<br /><I c={`${C.cream}35`}>questions.</I>
            </h2>
          </Reveal>

          <div style={{ maxWidth: 640 }}>
            {FAQS.map((faq, i) => (
              <Reveal key={i} delay={i * 0.04}>
                <FAQ question={faq.q} answer={faq.a} isDark />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ═══ Troubleshooting ═══ */}
      <section>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <span style={LABEL}>Troubleshooting</span>
            <h2 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.03em', lineHeight: 1.08, marginBottom: 36,
            }}>
              Common issues
            </h2>
          </Reveal>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {TROUBLESHOOTING.map((item, i) => (
              <Reveal key={item.title} delay={i * 0.06}>
                <div style={{
                  background: C.cream, border: `1.5px solid ${C.warm2}`,
                  borderRadius: 18, padding: '22px 20px', height: '100%',
                  boxShadow: '0 2px 8px rgba(15,12,9,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.amber, display: 'block', flexShrink: 0 }} />
                    <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 14, fontWeight: 700, color: C.ink, margin: 0 }}>{item.title}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0 }}>
                    {item.steps}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <HR />

      {/* ═══ Contact ═══ */}
      <section style={{ background: C.ink }}>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <span style={LABEL_DIM}>Still stuck?</span>
                <h2 style={{
                  fontFamily: "'Bricolage Grotesque', sans-serif",
                  fontSize: 'clamp(36px, 5vw, 56px)',
                  fontWeight: 900, color: C.cream,
                  letterSpacing: '-0.03em', lineHeight: 1.02, marginBottom: 16,
                }}>
                  Reach out<br /><I c={`${C.cream}35`}>directly.</I>
                </h2>
                <p style={{ fontSize: 15, color: `${C.cream}45`, lineHeight: 1.75, maxWidth: 360 }}>
                  Send us an email and we'll get back to you within 24 hours. We read every message.
                </p>
              </div>
              <div style={{ flexShrink: 0 }}>
                <a href="mailto:support@convocoach.ai" style={{ textDecoration: 'none' }}>
                  <motion.button whileHover={{ scale: 1.04, boxShadow: `0 12px 48px ${C.red}30` }} whileTap={{ scale: 0.96 }}
                    style={{ background: C.red, color: '#fff', border: 'none', borderRadius: 16, padding: '18px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'block' }}>
                    Email Support →
                  </motion.button>
                </a>
                <p style={{ fontSize: 11, color: `${C.cream}25`, marginTop: 10, textAlign: 'center', fontFamily: 'monospace' }}>support@convocoach.ai</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
