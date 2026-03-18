'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

// ─── DESIGN TOKENS — Neo-Brutalism (ZERO TRANSPARENCY) ───────────────────────
const C = {
  cream:     '#F3EDE2',
  ink:       '#0F0C09',
  red:       '#D13920',
  yellow:    '#FFD84D',
  blue:      '#4F46E5',
  green:     '#22C55E',
  pink:      '#FF6FD8',
  white:     '#FFFFFF',
  shadow:    '4px 4px 0px #0F0C09',
  shadowLg:  '8px 8px 0px #0F0C09',
  shadowSm:  '2px 2px 0px #0F0C09',
  border:    '3px solid #0F0C09',
  borderThin:'2px solid #0F0C09',
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
          {/* SOLID BACKDROP - No transparency, no blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 9998,
              background: C.ink,
            }}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 9999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20, pointerEvents: 'none',
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                background: C.white, borderRadius: 24,
                padding: 'clamp(28px, 5vw, 40px)',
                maxWidth: 460, width: '100%',
                border: C.border,
                boxShadow: `12px 12px 0px ${C.yellow}`, // Hard offset shadow
                pointerEvents: 'auto', position: 'relative',
                maxHeight: '90vh', overflowY: 'auto',
              }}
            >
              {/* Brutalist Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={onClose}
                style={{
                  position: 'absolute', top: 20, right: 20,
                  width: 36, height: 36, borderRadius: 10,
                  background: C.cream, border: C.borderThin,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', color: C.ink, fontSize: 18, fontWeight: 900,
                  boxShadow: C.shadowSm,
                }}
              >
                ✕
              </motion.button>

              {/* Icon Block */}
              <div style={{
                width: 56, height: 56, borderRadius: 16,
                background: type === 'signup' ? C.yellow : C.blue, 
                border: C.borderThin,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, marginBottom: 24, boxShadow: C.shadowSm,
              }}>
                {type === 'signup' ? '✨' : '🔓'}
              </div>

              {/* Heading */}
              <h2 style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 'clamp(28px, 6vw, 36px)', fontWeight: 900,
                color: C.ink, letterSpacing: '-0.03em', lineHeight: 1.1,
                margin: '0 0 12px',
              }}>
                {heading}
              </h2>
              <p style={{
                fontSize: 15, color: '#444', lineHeight: 1.6,
                margin: '0 0 28px', fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
              }}>
                {sub}
              </p>

              {/* Benefits List */}
              {type === 'upgrade' && (
                <div style={{
                  background: C.cream, border: C.borderThin, borderRadius: 16,
                  padding: '20px', display: 'flex', flexDirection: 'column', gap: 14,
                  marginBottom: 28, boxShadow: 'inset 3px 3px 0px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Premium Includes</div>
                  {PREMIUM_BENEFITS.map(({ emoji, text }) => (
                    <div key={text} style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      fontSize: 14, color: C.ink, fontFamily: "'DM Sans', sans-serif", fontWeight: 800
                    }}>
                      <div style={{ width: 28, height: 28, background: C.white, border: C.borderThin, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, boxShadow: C.shadowSm }}>
                        {emoji}
                      </div>
                      {text}
                    </div>
                  ))}
                </div>
              )}

              {/* ─── Action Options ─── */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                
                {/* Option 1: Upgrade to Premium */}
                {type === 'upgrade' && (
                  <Link href="/upgrade" style={{ textDecoration: 'none' }}>
                    <motion.button
                      whileHover={{ y: -2, boxShadow: C.shadowSm }}
                      whileTap={{ y: 0, boxShadow: 'none' }}
                      style={{
                        width: '100%', padding: '16px 24px',
                        borderRadius: 14, border: C.borderThin,
                        background: C.red, color: C.white,
                        fontSize: 16, fontWeight: 900, cursor: 'pointer',
                        fontFamily: "'DM Sans', sans-serif",
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: 10,
                        boxShadow: C.shadowSm,
                      }}
                    >
                      🚀 Upgrade to Premium
                    </motion.button>
                  </Link>
                )}

                {/* Option 2: Watch Ad for free unlock */}
                {onWatchAd && (
                  <motion.button
                    onClick={() => { onClose(); onWatchAd(); }}
                    whileHover={{ y: -2, boxShadow: C.shadowSm }}
                    whileTap={{ y: 0, boxShadow: 'none' }}
                    style={{
                      width: '100%', padding: '16px 24px',
                      borderRadius: 14, border: C.borderThin,
                      background: C.yellow, color: C.ink,
                      fontSize: 15, fontWeight: 900, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                      boxShadow: C.shadowSm,
                    }}
                  >
                    🎬 Watch Ad → Unlock 1 More
                  </motion.button>
                )}

                {/* Option 3: Create Account (for anonymous users) */}
                {type === 'signup' && (
                  <motion.button
                    onClick={() => signIn('google')}
                    whileHover={{ y: -2, boxShadow: C.shadowSm }}
                    whileTap={{ y: 0, boxShadow: 'none' }}
                    style={{
                      width: '100%', padding: '16px 24px',
                      borderRadius: 14, border: C.borderThin,
                      background: C.ink, color: C.white,
                      fontSize: 16, fontWeight: 900, cursor: 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: 10,
                      boxShadow: C.shadowSm,
                    }}
                  >
                    ✨ Create Free Account
                  </motion.button>
                )}
              </div>

              {/* Fine print */}
              <p style={{
                textAlign: 'center', marginTop: 24,
                fontSize: 11, color: '#555', fontWeight: 800,
                fontFamily: "'DM Sans', sans-serif",
                textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                Cancel anytime · No screenshots stored
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}