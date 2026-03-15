'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const C = {
  cream: '#F3EDE2', ink: '#0F0C09', red: '#D13920',
  warm1: '#E8E0D2', warm2: '#D4CBBA', muted: '#8A8074', mutedLt: '#BFB8AC',
  green: '#2D8A4E', amber: '#B87A10',
};

interface RewardAdModalProps {
  open: boolean;
  onClose: () => void;
  onRewardGranted: () => void;
}

export default function RewardAdModal({ open, onClose, onRewardGranted }: RewardAdModalProps) {
  const [phase, setPhase] = useState<'ready' | 'loading' | 'watching' | 'done' | 'cooldown' | 'error'>('ready');
  const [countdown, setCountdown] = useState(15);
  const [cooldownLeft, setCooldownLeft] = useState(0);

  // Check eligibility when modal opens
  useEffect(() => {
    if (!open) { setPhase('ready'); setCountdown(15); return; }
    fetch('/api/ad-reward')
      .then(r => r.json())
      .then(data => {
        if (!data.canWatch && data.reason === 'cooldown') {
          setCooldownLeft(data.cooldownRemaining || 15);
          setPhase('cooldown');
        } else if (!data.canWatch) {
          setPhase('error');
        }
      })
      .catch(() => {});
  }, [open]);

  // Cooldown countdown
  useEffect(() => {
    if (phase !== 'cooldown') return;
    if (cooldownLeft <= 0) { setPhase('ready'); return; }
    const t = setTimeout(() => setCooldownLeft(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, cooldownLeft]);

  // Ad watching countdown (simulated — replace with real ad SDK callback)
  useEffect(() => {
    if (phase !== 'watching') return;
    if (countdown <= 0) {
      // Ad finished — grant reward
      fetch('/api/ad-reward', { method: 'POST' })
        .then(r => r.json())
        .then(data => {
          if (data.rewardGranted) {
            setPhase('done');
            setTimeout(() => {
              onRewardGranted();
              onClose();
            }, 1500);
          } else if (data.cooldownRemaining) {
            setCooldownLeft(data.cooldownRemaining);
            setPhase('cooldown');
          } else {
            setPhase('error');
          }
        })
        .catch(() => setPhase('error'));
      return;
    }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [phase, countdown, onRewardGranted, onClose]);

  const startWatching = useCallback(() => {
    setCountdown(15);
    setPhase('loading');
    // Simulate ad loading (replace with real ad SDK load)
    setTimeout(() => setPhase('watching'), 800);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={phase !== 'watching' && phase !== 'loading' ? onClose : undefined}
            style={{ position: 'fixed', inset: 0, zIndex: 9998, background: 'rgba(15,12,9,0.6)', backdropFilter: 'blur(8px)' }}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 28 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, pointerEvents: 'none' }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: C.cream, borderRadius: 24, padding: 'clamp(28px, 5vw, 40px)',
                maxWidth: 400, width: '100%', boxShadow: '0 24px 80px rgba(15,12,9,0.3)',
                border: `1.5px solid ${C.warm2}`, pointerEvents: 'auto', position: 'relative',
                textAlign: 'center',
              }}
            >
              {/* Close (disabled during ad) */}
              {phase !== 'watching' && phase !== 'loading' && (
                <button onClick={onClose} style={{
                  position: 'absolute', top: 16, right: 16, width: 32, height: 32, borderRadius: 8,
                  background: C.warm1, border: `1px solid ${C.warm2}`, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', cursor: 'pointer', color: C.muted, fontSize: 16,
                }}>✕</button>
              )}

              {/* Ready State */}
              {phase === 'ready' && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🎬</div>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 900, color: C.ink, marginBottom: 8 }}>
                    Watch Ad for 1 More Analysis
                  </h3>
                  <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 24, fontFamily: "'DM Sans', sans-serif" }}>
                    Watch a short video to unlock 1 additional conversation analysis. You can watch ads as many times as you want!
                  </p>
                  <motion.button
                    onClick={startWatching}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      width: '100%', padding: '16px 24px', borderRadius: 14, border: 'none',
                      background: C.ink, color: C.cream, fontSize: 15, fontWeight: 800,
                      cursor: 'pointer', fontFamily: "'Bricolage Grotesque', sans-serif",
                    }}
                  >
                    ▶ Watch Ad (15s)
                  </motion.button>
                </>
              )}

              {/* Loading State */}
              {phase === 'loading' && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} style={{ display: 'inline-block' }}>⏳</motion.div>
                  </div>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 900, color: C.ink, marginBottom: 8 }}>
                    Loading Ad...
                  </h3>
                  <p style={{ fontSize: 13, color: C.mutedLt, fontFamily: "'DM Sans', sans-serif" }}>Please wait a moment</p>
                </>
              )}

              {/* Watching State */}
              {phase === 'watching' && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>📺</div>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 900, color: C.ink, marginBottom: 8 }}>
                    Ad Playing...
                  </h3>
                  {/* Google AdSense container — replace this div ID with real ad unit */}
                  <div id="rewarded-ad-container" style={{
                    width: '100%', height: 180, background: C.warm1, borderRadius: 14,
                    border: `1.5px dashed ${C.warm2}`, marginBottom: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: C.mutedLt, fontFamily: 'monospace',
                  }}>
                    {/* Replace with: <ins class="adsbygoogle" data-ad-slot="YOUR_SLOT" /> */}
                    Ad Content Area
                  </div>
                  {/* Progress Bar */}
                  <div style={{ height: 6, background: C.warm2, borderRadius: 99, overflow: 'hidden', marginBottom: 12 }}>
                    <motion.div
                      initial={{ width: '0%' }}
                      animate={{ width: `${((15 - countdown) / 15) * 100}%` }}
                      transition={{ duration: 0.8 }}
                      style={{ height: '100%', background: C.red, borderRadius: 99 }}
                    />
                  </div>
                  <p style={{ fontSize: 32, fontWeight: 900, color: C.red, fontFamily: "'Bricolage Grotesque', sans-serif", marginBottom: 4 }}>
                    {countdown}s
                  </p>
                  <p style={{ fontSize: 13, color: C.mutedLt, fontFamily: "'DM Sans', sans-serif" }}>
                    Please wait for the ad to finish
                  </p>
                </>
              )}

              {/* Cooldown State */}
              {phase === 'cooldown' && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>⏱️</div>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 900, color: C.amber, marginBottom: 8 }}>
                    Cooldown Active
                  </h3>
                  <p style={{ fontSize: 14, color: C.muted, marginBottom: 16, fontFamily: "'DM Sans', sans-serif" }}>
                    Please wait <strong style={{ color: C.ink }}>{cooldownLeft}s</strong> before watching another ad.
                  </p>
                  <div style={{ height: 6, background: C.warm2, borderRadius: 99, overflow: 'hidden' }}>
                    <motion.div
                      animate={{ width: `${((15 - cooldownLeft) / 15) * 100}%` }}
                      style={{ height: '100%', background: C.amber, borderRadius: 99 }}
                    />
                  </div>
                </>
              )}

              {/* Done State */}
              {phase === 'done' && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>✅</motion.div>
                  </div>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 900, color: C.green, marginBottom: 8 }}>
                    Analysis Unlocked!
                  </h3>
                  <p style={{ fontSize: 14, color: C.muted, fontFamily: "'DM Sans', sans-serif" }}>
                    You can now analyze one more conversation.
                  </p>
                </>
              )}

              {/* Error State */}
              {phase === 'error' && (
                <>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>😔</div>
                  <h3 style={{ fontFamily: "'Bricolage Grotesque', sans-serif", fontSize: 22, fontWeight: 900, color: C.red, marginBottom: 8 }}>
                    Something went wrong
                  </h3>
                  <p style={{ fontSize: 14, color: C.muted, marginBottom: 20, fontFamily: "'DM Sans', sans-serif" }}>
                    The ad reward could not be processed. Please try again later.
                  </p>
                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    style={{ padding: '12px 24px', borderRadius: 12, border: `1.5px solid ${C.warm2}`, background: 'none', color: C.muted, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    Close
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
