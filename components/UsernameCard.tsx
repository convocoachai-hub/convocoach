'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface UsernameCardProps {
  currentUsername: string | null;
  usernameSetAt: string | null;
  isPremium: boolean;
  onUsernameSet?: (username: string) => void;
}

// ─── DESIGN TOKENS — Neo-Brutalism ───────────────────────────────────────────
const C = {
  cream:     '#F3EDE2',
  ink:       '#0F0C09',
  red:       '#D13920',
  yellow:    '#FFD84D',
  blue:      '#4F46E5',
  green:     '#22C55E',
  pink:      '#FF6FD8',
  warm1:     '#E8E0D2',
  warm2:     '#D4CBBA',
  muted:     '#8A8074',
  shadow:    '4px 4px 0px #0F0C09',
  shadowSm:  '2px 2px 0px #0F0C09',
  border:    '3px solid #0F0C09',
  borderThin:'2px solid #0F0C09',
};

export default function UsernameCard({ currentUsername, usernameSetAt, isPremium, onUsernameSet }: UsernameCardProps) {
  const [input, setInput] = useState(currentUsername || '');
  const [status, setStatus] = useState<'idle' | 'checking' | 'saving' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isEditing, setIsEditing] = useState(!currentUsername);
  const [available, setAvailable] = useState<boolean | null>(null);

  const canChange = isPremium || !usernameSetAt;

  const checkAvailability = useCallback(async (val: string) => {
    if (val.length < 3) { setAvailable(null); return; }
    if (val === currentUsername) { setAvailable(true); return; }
    setStatus('checking');
    try {
      const res = await fetch(`/api/username?username=${encodeURIComponent(val)}`);
      const data = await res.json();
      setAvailable(data.available);
      if (!data.available && data.reason) setMessage(data.reason);
      else setMessage('');
    } catch { setAvailable(null); }
    finally { setStatus('idle'); }
  }, [currentUsername]);

  const handleSave = async () => {
    if (!input.trim() || input.length < 3) { setMessage('Minimum 3 characters'); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(input)) { setMessage('Only letters, numbers, underscores'); return; }

    setStatus('saving');
    try {
      const res = await fetch('/api/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: input }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus('done');
        setMessage(`Your Rizz Link: convocoach.xyz/u/${data.username}`);
        setIsEditing(false);
        onUsernameSet?.(data.username);
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to set username');
      }
    } catch {
      setStatus('error');
      setMessage('Network error');
    }
  };

  return (
    <div style={{
      background: currentUsername ? C.white : C.yellow,
      border: C.border, borderRadius: 20, padding: '24px',
      boxShadow: C.shadow,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: currentUsername ? C.blue : C.red, border: '1px solid #000' }} />
            {currentUsername ? 'Your Rizz Link' : 'Claim Your Rizz Link'}
          </div>
        </div>
        {currentUsername && canChange && !isEditing && (
          <button onClick={() => setIsEditing(true)} style={{
            background: C.warm1, border: C.borderThin, borderRadius: 10,
            padding: '6px 14px', fontSize: 11, fontWeight: 900, color: C.ink, 
            cursor: 'pointer', textTransform: 'uppercase', boxShadow: C.shadowSm,
          }}>
            {isPremium ? 'Change' : ''}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {currentUsername && !isEditing ? (
          <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Link href={`/u/${currentUsername}`} style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ x: 4, boxShadow: C.shadowSm }} transition={{ duration: 0.2 }}
                style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: C.bgCream, border: C.borderThin, borderRadius: 14,
                padding: '14px 20px', cursor: 'pointer', boxShadow: '2px 2px 0px #0F0C09',
              }}>
                <span style={{ fontSize: 18, fontWeight: 900, color: C.ink, fontFamily: "'DM Sans',sans-serif", letterSpacing: '-0.02em' }}>
                  @{currentUsername}
                </span>
                <span style={{ fontSize: 12, color: C.muted, marginLeft: 'auto', fontWeight: 700, fontFamily: "'DM Sans',sans-serif" }}>
                  /u/{currentUsername} →
                </span>
              </motion.div>
            </Link>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!canChange ? (
              <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, fontWeight: 600, background: C.warm1, padding: 16, borderRadius: 12, border: C.borderThin }}>
                Free users can only set their username once.{' '}
                <Link href="/upgrade" style={{ color: C.red, textDecoration: 'none', fontWeight: 900 }}>Upgrade to change it</Link>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <span style={{
                      position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 16, color: C.ink, fontWeight: 900, pointerEvents: 'none',
                    }}>@</span>
                    <input
                      value={input}
                      onChange={e => {
                        const v = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
                        setInput(v);
                        setStatus('idle');
                        setMessage('');
                        setAvailable(null);
                        if (v.length >= 3) {
                          const timer = setTimeout(() => checkAvailability(v), 400);
                          return () => clearTimeout(timer);
                        }
                      }}
                      placeholder="your_username"
                      style={{
                        width: '100%', background: C.white, 
                        border: `3px solid ${available === true ? C.green : available === false ? C.red : C.ink}`,
                        borderRadius: 14, padding: '14px 16px 14px 36px', fontSize: 16, fontWeight: 800,
                        color: C.ink, outline: 'none', fontFamily: "'DM Sans', sans-serif",
                        transition: 'border-color 0.2s', boxShadow: C.shadowSm,
                      }}
                    />
                    {status === 'checking' && (
                      <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 12, fontWeight: 800, color: C.muted }}>...</span>
                    )}
                    {available === true && input.length >= 3 && (
                      <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: C.green, fontWeight: 900 }}>✓</span>
                    )}
                    {available === false && (
                      <span style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: C.red, fontWeight: 900 }}>✗</span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
                    onClick={handleSave}
                    disabled={status === 'saving' || available === false || input.length < 3}
                    style={{
                      background: C.ink, color: C.white, border: C.borderThin, borderRadius: 14,
                      padding: '14px 24px', fontSize: 14, fontWeight: 900, cursor: 'pointer',
                      fontFamily: "'DM Sans',sans-serif", flexShrink: 0,
                      opacity: (status === 'saving' || available === false || input.length < 3) ? 0.5 : 1,
                      whiteSpace: 'nowrap', boxShadow: C.shadowSm,
                    }}
                  >
                    {status === 'saving' ? 'Saving...' : currentUsername ? 'Update' : 'Claim Link'}
                  </motion.button>
                </div>
                
                {message && (
                  <div style={{
                    fontSize: 12, color: status === 'done' ? C.green : status === 'error' ? C.red : C.ink,
                    marginTop: 12, fontWeight: 800, padding: '8px 12px', background: C.white, border: C.borderThin, borderRadius: 8, display: 'inline-block'
                  }}>
                    {message}
                  </div>
                )}
                
                <div style={{ fontSize: 11, color: '#555', marginTop: 12, fontWeight: 600 }}>
                  3–20 characters • Letters, numbers, underscores only
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}