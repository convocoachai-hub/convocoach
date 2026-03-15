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

function FAQ({ q, a, isDark = false }: { q: string; a: string; isDark?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div onClick={() => setOpen(p => !p)} style={{ borderBottom: `1px solid ${isDark ? 'rgba(243,237,226,0.07)' : C.warm2}`, cursor: 'pointer' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 0', gap: 16 }}>
        <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 16, fontWeight: 700, color: isDark ? C.cream : C.ink, margin: 0, lineHeight: 1.3 }}>{q}</h3>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={{ duration: 0.2 }}
          style={{ fontSize: 22, fontWeight: 300, color: isDark ? `${C.cream}40` : C.muted, flexShrink: 0, lineHeight: 1 }}>+</motion.span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} style={{ overflow: 'hidden' }}>
            <p style={{ fontSize: 14, color: isDark ? `${C.cream}50` : C.muted, lineHeight: 1.75, paddingBottom: 22, maxWidth: 600 }}>{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const CATEGORIES = [
  {
    title: 'General',
    faqs: [
      { q: 'What does ConvoCoach do?', a: 'ConvoCoach is an AI-powered conversation intelligence tool. Upload a screenshot of any text conversation and our AI analyzes 10 behavioral layers — attraction signals, energy ratios, momentum, curiosity patterns, and more — to tell you exactly what\'s happening beneath the surface.' },
      { q: 'Who is ConvoCoach for?', a: 'Anyone who texts. Dating, friendships, professional conversations, social media DMs — our analysis works across all contexts because the behavioral signals are universal.' },
      { q: 'How accurate is the AI analysis?', a: 'Our analysis combines principles from communication psychology with natural language processing. The attraction probability achieves approximately 94% correlation with self-reported interest levels. The AI improves continuously as it processes more conversations.' },
      { q: 'Is ConvoCoach a dating app?', a: 'No. ConvoCoach is a conversation analysis tool. We don\'t match you with people — we help you understand and improve the conversations you\'re already having.' },
    ],
  },
  {
    title: 'Privacy & Security',
    faqs: [
      { q: 'Is my data private?', a: 'Yes. Screenshots are processed and deleted from our servers within 60 seconds. We never store conversation content. Analysis results are tied to your session only.' },
      { q: 'Does the AI store my chats?', a: 'No. Your uploaded screenshots are processed in an isolated environment and deleted immediately after analysis. We never retain the original images or raw conversation text.' },
      { q: 'Can anyone else see my analysis?', a: 'No. Analysis results are private to your session. If you\'re logged in, they\'re saved to your personal dashboard. Nobody else — including our team — can access your results.' },
      { q: 'What data do you collect?', a: 'We collect basic, anonymized usage data (pages visited, features used) to improve the product. We use privacy-focused analytics with no third-party ad trackers. See our Privacy Policy for full details.' },
    ],
  },
  {
    title: 'Features & Usage',
    faqs: [
      { q: 'What is the free tier?', a: 'You get 3 free analyses without creating an account. Each analysis includes a conversation score, top 3 signals detected, and basic feedback. Premium unlocks unlimited analyses, all 10 signal layers, AI reply suggestions, and Roast Mode.' },
      { q: 'What is Practice Mode?', a: 'Practice Mode lets you text with 10 AI personalities across different scenarios (dating, professional, social). Each character has unique traits and communication styles. You get real-time coaching and feedback as you practice.' },
      { q: 'What is Roast Mode?', a: 'Roast Mode delivers the same analytical depth as regular analysis, but packages the feedback with brutal comedic honesty. It\'s designed to be funny and memorable — sometimes you need to laugh at yourself to actually change.' },
      { q: 'What apps are supported for analysis?', a: 'Any messaging app where you can take a screenshot. iMessage, WhatsApp, Instagram DMs, Hinge, Bumble, Tinder, Facebook Messenger, Slack, Telegram, Signal, and more. If text is visible, our OCR can extract it.' },
    ],
  },
  {
    title: 'Billing',
    faqs: [
      { q: 'How much does Premium cost?', a: 'Check our pricing page for current rates. We offer both monthly and annual plans. The annual plan includes a significant discount.' },
      { q: 'Can I cancel anytime?', a: 'Yes. Cancel from your account settings at any time. Your subscription continues until the end of the current billing period. No partial refunds for unused time.' },
      { q: 'Is there a refund policy?', a: 'We offer refunds within 7 days of purchase if you\'re not satisfied. Contact support@convocoach.ai with your payment details.' },
    ],
  },
];

export default function FAQPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 64 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>Support</span>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 20 }}>
              Frequently asked<br /><I c={C.red}>questions.</I>
            </h1>
            <p style={{ fontSize: 15, color: C.muted, lineHeight: 1.75, maxWidth: 520 }}>
              Everything you need to know about ConvoCoach — from privacy to pricing to how the AI actually works.
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {CATEGORIES.map((cat, i) => {
        const isDark = i % 2 !== 0;
        return (
          <div key={cat.title}>
            <section style={{ background: isDark ? C.ink : C.cream }}>
              <div style={WRAP} className="section-pad">
                <Reveal>
                  <span style={isDark ? LABEL_DIM : LABEL}>{cat.title}</span>
                </Reveal>
                <div style={{ maxWidth: 640 }}>
                  {cat.faqs.map((f, j) => (
                    <Reveal key={j} delay={j * 0.04}>
                      <FAQ q={f.q} a={f.a} isDark={isDark} />
                    </Reveal>
                  ))}
                </div>
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
                  Still have questions?<br /><I c={C.red}>Contact us.</I>
                </h2>
              </div>
              <div style={{ flexShrink: 0 }}>
                <Link href="/contact">
                  <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    style={{ background: C.ink, color: C.cream, border: 'none', borderRadius: 16, padding: '18px 40px', fontSize: 16, fontWeight: 900, cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif", display: 'block' }}>
                    Contact Support →
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
