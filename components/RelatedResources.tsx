'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { C, EO } from '@/lib/design';

interface ResourceLink {
  href: string;
  emoji: string;
  title: string;
  desc: string;
}

const ALL_RESOURCES: ResourceLink[] = [
  { href: '/resources/texting-guides',        emoji: '✍️', title: 'Texting Guides',        desc: 'Master timing, tone, and conversation flow' },
  { href: '/resources/dating-psychology',      emoji: '🧠', title: 'Dating Psychology',     desc: 'Understand attraction and attachment styles' },
  { href: '/resources/attraction-signals',     emoji: '🔥', title: 'Attraction Signals',    desc: 'Read interest indicators in real conversations' },
  { href: '/resources/flirting-over-text',     emoji: '💬', title: 'Flirting Over Text',    desc: 'Proven techniques for text-based flirting' },
  { href: '/resources/stop-dry-texting',       emoji: '🏜️', title: 'Stop Dry Texting',     desc: 'Fix boring conversations with better hooks' },
  { href: '/resources/conversation-examples',  emoji: '📚', title: 'Conversation Examples', desc: 'Study real analyzed conversations' },
];

const CTA_LINKS: ResourceLink[] = [
  { href: '/upload',   emoji: '📊', title: 'Analyze Your Chat',    desc: 'Upload a screenshot for instant AI analysis' },
  { href: '/practice',  emoji: '🎭', title: 'Practice Mode',       desc: 'Practice texting with AI characters' },
  { href: '/upgrade',   emoji: '⚡', title: 'Go Premium',          desc: 'Unlimited analysis & full coaching' },
];

interface RelatedResourcesProps {
  /** Current page path to exclude from the list */
  current: string;
  /** Dark mode background */
  isDark?: boolean;
}

export default function RelatedResources({ current, isDark = false }: RelatedResourcesProps) {
  const related = ALL_RESOURCES.filter(r => r.href !== current);
  const bg = isDark ? C.ink : C.cream;
  const textColor = isDark ? C.cream : C.ink;
  const mutedColor = isDark ? `${C.cream}50` : C.muted;
  const cardBg = isDark ? 'rgba(255,255,255,0.04)' : C.warm1;
  const cardBorder = isDark ? 'rgba(255,255,255,0.07)' : C.warm2;

  return (
    <section style={{ background: bg, paddingTop: 60, paddingBottom: 60 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px' }}>
        {/* Related Resources */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={EO}>
          <h3 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 28, fontWeight: 900,
            color: textColor, letterSpacing: '-0.03em', marginBottom: 24,
          }}>
            Related Resources
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            {related.slice(0, 4).map(r => (
              <Link href={r.href} key={r.href} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ scale: 1.02, y: -2 }} style={{
                  background: cardBg, border: `1px solid ${cardBorder}`, borderRadius: 16,
                  padding: '18px 16px', cursor: 'pointer', transition: 'border-color 0.2s',
                }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{r.emoji}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: textColor, fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: 4 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: mutedColor, lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>{r.desc}</div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Product CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ ...EO, delay: 0.1 }}
          style={{ marginTop: 40 }}>
          <h3 style={{
            fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 20, fontWeight: 800,
            color: mutedColor, letterSpacing: '-0.02em', marginBottom: 16,
          }}>
            Try It Yourself
          </h3>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {CTA_LINKS.map(cta => (
              <Link href={cta.href} key={cta.href} style={{ textDecoration: 'none' }}>
                <motion.div whileHover={{ scale: 1.03 }} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: cta.href === '/upgrade' ? C.red : (isDark ? 'rgba(255,255,255,0.06)' : C.ink),
                  color: '#fff', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif", cursor: 'pointer',
                }}>
                  <span>{cta.emoji}</span> {cta.title}
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
