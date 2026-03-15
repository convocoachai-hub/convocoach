'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { signIn } from 'next-auth/react';

// ─── DESIGN (reuses the palette from upload/dashboard pages) ───────────────
const C = {
  cream: '#F3EDE2', ink: '#0F0C09', red: '#D13920',
  warm1: '#E8E0D2', warm2: '#D4CBBA', muted: '#8A8074',
  amber: '#B87A10', gold: '#F5C842', goldLo: 'rgba(245,200,66,0.08)',
  goldHi: 'rgba(245,200,66,0.2)',
};

interface PremiumGateProps {
  /** Headline shown on the overlay */
  title?: string;
  /** Description text */
  description?: string;
  /** 'signup' shows "Create Free Account" + "Sign In", 'upgrade' shows "Upgrade to Premium" */
  type?: 'signup' | 'upgrade';
  /** For compact inline locks vs full-card locks */
  compact?: boolean;
  /** Use dark theme (for ink-background pages like dashboard) */
  dark?: boolean;
  /** React children rendered behind the blur */
  children?: React.ReactNode;
}

export default function PremiumGate({
  title = 'Unlock Full Conversation Intelligence',
  description = 'Upgrade to Premium for unlimited analysis, practice, and deep AI insights.',
  type = 'upgrade',
  compact = false,
  dark = false,
  children,
}: PremiumGateProps) {
  const bg = dark ? '#08080F' : C.cream;
  const textColor = dark ? '#F0EDE8' : C.ink;
  const mutedColor = dark ? 'rgba(240,237,232,0.3)' : C.muted;
  const surfaceBg = dark ? 'rgba(255,255,255,0.03)' : C.warm1;
  const borderColor = dark ? 'rgba(255,255,255,0.07)' : C.warm2;
  const overlayBg = dark ? 'rgba(8,8,15,0.7)' : 'rgba(243,237,226,0.75)';
  const btnBg = dark ? C.gold : C.red;
  const btnColor = dark ? '#1A0E00' : '#fff';

  return (
    <div style={{
      position: 'relative', borderRadius: compact ? 14 : 18,
      overflow: 'hidden', background: surfaceBg,
      border: `1px solid ${borderColor}`,
    }}>
      {/* Blurred mock content */}
      {children ? (
        <div style={{
          filter: 'blur(7px)', opacity: 0.3, pointerEvents: 'none',
          padding: compact ? '14px 16px' : '24px', userSelect: 'none',
        }}>
          {children}
        </div>
      ) : (
        <div style={{
          filter: 'blur(7px)', opacity: 0.25, pointerEvents: 'none',
          padding: compact ? '16px 18px' : '24px', userSelect: 'none',
        }}>
          <div style={{ height: 10, background: borderColor, borderRadius: 4, marginBottom: 10, width: '60%' }} />
          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            {[55, 75, 40, 65, 80].map((h, i) => (
              <div key={i} style={{ flex: 1, height: h, background: C.red, borderRadius: 3, opacity: 0.5 }} />
            ))}
          </div>
          <div style={{ height: 8, background: borderColor, borderRadius: 4, width: '80%' }} />
        </div>
      )}

      {/* Lock overlay */}
      <div style={{
        position: 'absolute', inset: 0, background: overlayBg,
        backdropFilter: 'blur(2px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: compact ? 8 : 12, padding: compact ? 16 : 24,
      }}>
        {/* Lock icon */}
        <div style={{
          width: compact ? 32 : 40, height: compact ? 32 : 40,
          borderRadius: '50%',
          background: dark ? C.goldLo : `${C.red}10`,
          border: `1px solid ${dark ? C.goldHi : `${C.red}30`}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: compact ? 14 : 18,
        }}>
          🔒
        </div>

        {/* Text */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: compact ? 13 : 15, fontWeight: 800, color: textColor,
            marginBottom: 4, fontFamily: "'Bricolage Grotesque', sans-serif",
            letterSpacing: '-0.01em',
          }}>
            {title}
          </div>
          <div style={{
            fontSize: compact ? 11 : 12.5, color: mutedColor,
            lineHeight: 1.55, maxWidth: 280,
          }}>
            {description}
          </div>
        </div>

        {/* Buttons */}
        {type === 'upgrade' ? (
          <Link href="/upgrade" style={{ textDecoration: 'none' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{
                background: btnBg, color: btnColor, border: 'none',
                borderRadius: compact ? 9 : 11,
                padding: compact ? '8px 18px' : '10px 24px',
                fontSize: compact ? 12 : 13, fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Bricolage Grotesque', sans-serif",
                boxShadow: `0 4px 16px ${btnBg}35`,
              }}
            >
              Upgrade to Premium
            </motion.button>
          </Link>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => signIn('google')}
              style={{
                background: btnBg, color: btnColor, border: 'none',
                borderRadius: 11, padding: '10px 22px',
                fontSize: 13, fontWeight: 800, cursor: 'pointer',
                fontFamily: "'Bricolage Grotesque', sans-serif",
                boxShadow: `0 4px 16px ${btnBg}35`,
              }}
            >
              Create Free Account
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => signIn('google')}
              style={{
                background: 'transparent',
                color: dark ? 'rgba(240,237,232,0.5)' : C.muted,
                border: `1px solid ${borderColor}`,
                borderRadius: 11, padding: '10px 18px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Sign In
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
