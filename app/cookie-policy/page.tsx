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

const HR = () => <div style={{ height: 1, background: C.warm2, margin: 0 }} />;

const LAST_UPDATED = 'March 15, 2026';

export default function CookiePolicyPage() {
  return (
    <div style={{ background: C.cream, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif" }}>

      <section>
        <div style={{ ...WRAP, paddingTop: 48, paddingBottom: 48 }} className="section-pad">
          <Reveal>
            <span style={LABEL}>Legal</span>
            <h1 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(44px, 6vw, 72px)', fontWeight: 900, color: C.ink, letterSpacing: '-0.04em', lineHeight: 1.0, marginBottom: 16 }}>
              Cookie Policy
            </h1>
            <p style={{ fontSize: 13, color: C.muted, fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              Last updated: {LAST_UPDATED}
            </p>
          </Reveal>
        </div>
      </section>

      <HR />

      {[
        {
          title: '1. What Are Cookies',
          content: [
            'Cookies are small text files placed on your device when you visit a website. They help us understand how you use our site and let us remember your preferences.',
            'We use cookies minimally and only for functionality that directly improves your experience.',
          ],
        },
        {
          title: '2. Essential Cookies',
          content: [
            '**Authentication cookies** remember your login session so you don\'t need to sign in every time you visit. These are required for the site to function properly.',
            '**Session cookies** maintain your browsing state (e.g., remembering which analysis you\'re viewing). These expire when you close your browser.',
            '**Security cookies** help prevent cross-site request forgery and protect your account.',
          ],
        },
        {
          title: '3. Analytics Cookies',
          content: [
            'We use privacy-focused analytics to understand which pages are visited most and how features are used. This helps us improve the product.',
            'We do NOT use Google Analytics, Facebook Pixel, or any third-party advertising trackers.',
            'Analytics data is aggregated and anonymized. We cannot identify individual users from analytics data.',
          ],
        },
        {
          title: '4. Third-Party Cookies',
          content: [
            '**Google OAuth:** When you sign in with Google, Google may set cookies on your device as part of the authentication process. These are governed by Google\'s privacy policy.',
            '**Razorpay:** If you make a payment, Razorpay may set cookies for fraud prevention and payment processing. These are governed by Razorpay\'s privacy policy.',
            'We do not allow any other third-party cookies on our site.',
          ],
        },
        {
          title: '5. Managing Cookies',
          content: [
            'You can control cookies through your browser settings. Most browsers allow you to block or delete cookies.',
            'Blocking essential cookies may prevent you from logging in or using certain features.',
            'Deleting cookies will log you out of your account and reset your preferences.',
          ],
        },
        {
          title: '6. Contact',
          content: [
            'If you have questions about our cookie usage, contact us at privacy@convocoach.ai.',
          ],
        },
      ].map(({ title, content }, i) => {
        const isDark = i % 2 !== 0;
        return (
          <div key={title}>
            <section style={{ background: isDark ? C.ink : C.cream }}>
              <div style={WRAP} className="section-pad">
                <Reveal>
                  <h2 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, color: isDark ? C.cream : C.ink, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 24 }}>
                    {title}
                  </h2>
                </Reveal>
                <Reveal delay={0.06}>
                  <ul style={{ maxWidth: 640, paddingLeft: 0, listStyle: 'none', margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {content.map((item, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                        <span style={{ width: 5, height: 5, borderRadius: '50%', background: isDark ? `${C.cream}20` : C.warm2, display: 'block', flexShrink: 0, marginTop: 8 }} />
                        <p style={{ fontSize: 14, color: isDark ? `${C.cream}55` : C.muted, lineHeight: 1.75, margin: 0 }}
                          dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, `<strong style="color: ${isDark ? C.cream : C.ink}; font-weight: 700">$1</strong>`) }} />
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </div>
            </section>
            {i < 5 && <HR />}
          </div>
        );
      })}
    </div>
  );
}
