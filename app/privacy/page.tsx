'use client';

import { motion } from 'framer-motion';
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

const LAST_UPDATED = 'March 15, 2026';

export default function PrivacyPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      {/* ═══ Hero ═══ */}
      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 48 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>Legal</span>
            <h1 style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(44px, 6vw, 72px)',
              fontWeight: 900, color: C.ink,
              letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 16,
            }}>
              Privacy Policy
            </h1>
            <p style={{ fontSize: 13, color: C.muted, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              Last updated: {LAST_UPDATED}
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ═══ Summary callout ═══ */}
      <section>
        <div style={WRAP} className="section-pad">
          <Reveal>
            <div style={{
              background: `${C.red}06`, border: `1px solid ${C.red}18`,
              borderRadius: 18, padding: '24px 28px', maxWidth: 640,
            }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: C.red, textTransform: 'uppercase' as const, letterSpacing: '0.1em', fontFamily: 'monospace', display: 'block', marginBottom: 10 }}>TL;DR</span>
              <p style={{ fontSize: 14, color: C.ink, lineHeight: 1.7, margin: 0, fontWeight: 500 }}>
                We process your screenshots to generate analysis results. Screenshots are deleted within 60 seconds. 
                We never store conversation content. We never sell your data. We use minimal analytics to improve the product.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <HR />

      {/* ═══ Policy Sections ═══ */}
      {[
        {
          title: '1. Information We Collect',
          content: [
            '**Account Data.** If you create an account, we collect your name, email address, and profile picture from your Google account via OAuth. We do not have access to your Google password.',
            '**Uploaded Screenshots.** When you upload a conversation screenshot for analysis, our system processes the image using OCR (optical character recognition) to extract text. The original image is deleted from our servers within 60 seconds of processing. We do not retain copies.',
            '**Analysis Results.** If you are a logged-in user, your analysis results (the text output, not the original screenshot) may be saved to your account history. You can delete these at any time from your dashboard.',
            '**Usage Data.** We collect basic, anonymized usage data including pages visited, features used, and session duration. This is used exclusively for improving the product. We use privacy-focused analytics with no third-party ad trackers.',
          ],
        },
        {
          title: '2. How We Use Your Information',
          content: [
            'To provide the core service: processing conversation screenshots and generating AI-powered analysis results.',
            'To save your analysis history if you are logged in (opt-in).',
            'To improve our AI models and analysis accuracy using aggregated, anonymized data patterns — never individual conversations.',
            'To communicate with you about product updates, only if you opt in to email communications.',
          ],
        },
        {
          title: '3. Data Retention & Deletion',
          content: [
            '**Screenshots:** Deleted within 60 seconds of upload. Not recoverable.',
            '**Analysis results:** Stored as long as your account exists. Deletable at any time from your dashboard. When you delete your account, all associated data is permanently removed within 30 days.',
            '**Anonymous analytics:** Retained for up to 12 months in aggregate form.',
          ],
        },
        {
          title: '4. Data Sharing',
          content: [
            'We do not sell, trade, or rent your personal data to any third parties.',
            'We do not share conversation content or analysis results with anyone.',
            'We may share anonymized, aggregated statistics (e.g., "X analyses were performed this month") for business purposes, but these never contain identifiable information.',
            'We use Stripe for payment processing. Stripe handles all payment data directly and we never see or store your credit card number.',
          ],
        },
        {
          title: '5. Security',
          content: [
            'All data is transmitted over HTTPS with TLS 1.3 encryption.',
            'Screenshots are processed in isolated, ephemeral server environments.',
            'Account passwords are never stored — we use OAuth exclusively (Google sign-in).',
            'We conduct regular security reviews and follow industry-standard practices for data protection.',
          ],
        },
        {
          title: '6. Your Rights',
          content: [
            'You can request a copy of all data associated with your account at any time.',
            'You can delete your account and all associated data from your settings page.',
            'You can opt out of all non-essential communications.',
            'For GDPR/CCPA requests, contact privacy@convocoach.ai and we will respond within 30 days.',
          ],
        },
        {
          title: '7. Contact',
          content: [
            'For any privacy-related questions or concerns, contact us at privacy@convocoach.ai. We respond to all privacy inquiries within 48 hours.',
          ],
        },
      ].map(({ title, content }, i) => {
        const isDark = i % 2 !== 0;
        return (
          <div key={title}>
            <section style={{ background: isDark ? C.ink : C.cream }}>
              <div style={WRAP} className="section-pad">
                <Reveal>
                  <h2 style={{
                    fontFamily: "'Bricolage Grotesque', sans-serif",
                    fontSize: 'clamp(22px, 3vw, 32px)',
                    fontWeight: 900, color: isDark ? C.cream : C.ink,
                    letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 24,
                  }}>
                    {title}
                  </h2>
                </Reveal>
                <Reveal delay={0.06}>
                  <ul style={{ maxWidth: 640, paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {content.map((item, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: isDark ? `${C.cream}20` : C.warm2, display: 'block', flexShrink: 0, marginTop: 8 }} />
                        <p style={{
                          fontSize: 14, color: isDark ? `${C.cream}55` : C.muted,
                          lineHeight: 1.75, margin: 0,
                        }} dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, `<strong style="color: ${isDark ? C.cream : C.ink}; font-weight: 700">$1</strong>`) }} />
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </section>
            {i < 6 && <HR />}
          </div>
        );
      })}
    </div>
  );
}
