'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

const C = {
  cream: '#F3EDE2', ink: '#0F0C09', red: '#D13920',
  warm1: '#E8E0D2', warm2: '#D4CBBA', muted: '#8A8074', mutedLt: '#BFB8AC',
  green: '#2D8A4E', amber: '#B87A10',
};

const PREMIUM_BENEFITS = [
  { emoji: '📊', text: 'Unlimited chat analysis' },
  { emoji: '🧠', text: 'Deep psychological signals' },
  { emoji: '🎭', text: 'Full practice mode — all characters' },
  { emoji: '✍️', text: 'Advanced AI coaching' },
  { emoji: '📈', text: 'Score history & improvement tracking' },
  { emoji: '🔥', text: 'Red flag detection & strategy layer' },
];

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  /** 'signup' for anonymous users, 'upgrade' for free users */
  type?: 'signup' | 'upgrade';
  /** Custom title */
  title?: string;
  /** Custom subtitle */
  subtitle?: string;
  /** Called when user clicks "Watch Ad" option */
  onWatchAd?: () => void;
}

export default function PremiumModal({
  open,
  onClose,
  type = 'upgrade',
  title,
  subtitle,
  onWatchAd,
}: PremiumModalProps) {
  const heading = title ?? (
    type === 'signup'
      ? 'Create a Free Account'
      : 'Unlock Full Conversation Intelligence'
  );
  const sub = subtitle ?? (
    type === 'signup'
      ? 'Sign up to analyze more chats and unlock deeper insights.'
      : 'Premium gives you unlimited analysis, full coaching, and every feature.'
  );

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: 'rgba(15,12,9,0.55)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20, pointerEvents: 'none',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: C.cream, borderRadius: 24,
                padding: 'clamp(28px, 5vw, 40px)',
                maxWidth: 440, width: '100%',
                boxShadow: '0 24px 80px rgba(15,12,9,0.3), 0 2px 8px rgba(15,12,9,0.1)',
                border: `1.5px solid ${C.warm2}`,
                pointerEvents: 'auto', position: 'relative',
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              {/* Close button */}
              <button
                onClick={onClose}
                style={{
                  position: 'absolute', top: 16, right: 16,
                  width: 32, height: 32, borderRadius: 8,
                  background: C.warm1, border: `1px solid ${C.warm2}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.muted, fontSize: 16,
                }}
              >
                ✕
              </button>

              {/* Lock icon */}
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: `${C.red}10`, border: `1.5px solid ${C.red}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, marginBottom: 20,
              }}>
                {type === 'signup' ? '✨' : '🔓'}
              </div>

              {/* Heading */}
              <h2 style={{
                fontFamily: "'Bricolage Grotesque', sans-serif",
                fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 900,
                color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.1,
                margin: '0 0 8px',
              }}>
                {heading}
              </h2>
              <p style={{
                fontSize: 14, color: C.muted, lineHeight: 1.65,
                margin: '0 0 24px', fontFamily: "'DM Sans', sans-serif",
              }}>
                {sub}
              </p>

              {/* Benefits list */}
              {type === 'upgrade' && (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: 10,
                  marginBottom: 24, paddingTop: 16,
                  borderTop: `1px solid ${C.warm2}`,
                }}>
                  {PREMIUM_BENEFITS.map(({ emoji, text }) => (
                    <div key={text} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      fontSize: 13.5, color: C.ink, fontFamily: "'DM Sans', sans-serif",
                    }}>
                      <span style={{ fontSize: 15, flexShrink: 0 }}>{emoji}</span>
                      {text}
                    </div>
                  ))}
                </div>
              )}

              {/* ─── 3 Action Options ─── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Option 1: Upgrade to Premium */}
                <Link href="/upgrade" style={{ textDecoration: 'none' }}>
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(209,57,32,0.3)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', padding: '15px 24px',
                      borderRadius: 14, border: 'none',
                      background: C.red, color: '#fff',
                      fontSize: 15, fontWeight: 800, cursor: 'pointer',
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                      boxShadow: '0 4px 20px rgba(209,57,32,0.25)',
                    }}
                  >
                    🚀 Upgrade to Premium
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M2 8h12M8.5 3.5l4.5 4.5-4.5 4.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </motion.button>
                </Link>

                {/* Option 2: Watch Ad for free unlock */}
                {onWatchAd && (
                  <motion.button
                    onClick={() => { onClose(); onWatchAd(); }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', padding: '15px 24px',
                      borderRadius: 14, border: `1.5px solid ${C.warm2}`,
                      background: C.warm1, color: C.ink,
                      fontSize: 14, fontWeight: 700, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                    }}
                  >
                    🎬 Watch Ad → Unlock 1 More Analysis
                  </motion.button>
                )}

                {/* Option 3: Create Account (for anonymous users) */}
                {type === 'signup' && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => signIn('google')}
                    style={{
                      width: '100%', padding: '15px 24px',
                      borderRadius: 14, border: 'none',
                      background: C.ink, color: C.cream,
                      fontSize: 15, fontWeight: 800, cursor: 'pointer',
                      fontFamily: "'Bricolage Grotesque', sans-serif",
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                    }}
                  >
                    ✨ Create Free Account
                  </motion.button>
                )}
              </div>

              {/* Fine print */}
              <p style={{
                textAlign: 'center', marginTop: 14,
                fontSize: 11, color: C.mutedLt,
                fontFamily: "'DM Sans', sans-serif",
              }}>
                Cancel anytime · No screenshots stored · Your chats are never saved
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
