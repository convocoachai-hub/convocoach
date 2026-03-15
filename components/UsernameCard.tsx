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

const C = {
  bg: '#08080F', surface: 'rgba(255,255,255,0.03)', surfaceHi: 'rgba(255,255,255,0.055)',
  border: 'rgba(255,255,255,0.07)', borderHi: 'rgba(255,255,255,0.14)',
  text: '#F0EDE8', muted: 'rgba(240,237,232,0.3)', muted2: 'rgba(240,237,232,0.55)',
  coral: '#FF5B3A', coralLo: 'rgba(255,91,58,0.1)',
  violet: '#7B6CF6', violetLo: 'rgba(123,108,246,0.1)',
  green: '#4DEBA1', greenLo: 'rgba(77,235,161,0.08)',
  gold: '#F5C842',
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
        setMessage(`Your Rizz Link: convocoach.ai/u/${data.username}`);
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
      background: currentUsername ? C.surface : `linear-gradient(135deg, ${C.coralLo}, ${C.violetLo})`,
      border: `1px solid ${currentUsername ? C.border : C.borderHi}`,
      borderRadius: 18, padding: '20px 22px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, fontFamily: "'DM Sans',sans-serif" }}>
            {currentUsername ? '🔗 Your Rizz Link' : '🔗 Claim Your Rizz Link'}
          </div>
        </div>
        {currentUsername && canChange && !isEditing && (
          <button onClick={() => setIsEditing(true)} style={{
            background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 8,
            padding: '4px 12px', fontSize: 10, fontWeight: 700, color: C.muted2, cursor: 'pointer',
          }}>
            {isPremium ? 'Change' : ''}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {currentUsername && !isEditing ? (
          <motion.div key="display" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Link href={`/u/${currentUsername}`} style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 12,
                padding: '12px 16px', cursor: 'pointer',
              }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: C.coral, fontFamily: "'Bricolage Grotesque',sans-serif" }}>
                  @{currentUsername}
                </span>
                <span style={{ fontSize: 11, color: C.muted, marginLeft: 'auto', fontFamily: 'monospace' }}>
                  /u/{currentUsername} →
                </span>
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!canChange ? (
              <div style={{ fontSize: 12, color: C.muted2, lineHeight: 1.5 }}>
                Free users can only set their username once.{' '}
                <Link href="/upgrade" style={{ color: C.coral, textDecoration: 'none', fontWeight: 700 }}>Upgrade to change it</Link>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <span style={{
                      position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
                      fontSize: 14, color: C.muted, fontWeight: 600, pointerEvents: 'none',
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
                        width: '100%', background: C.surfaceHi, border: `1px solid ${available === true ? C.green + '40' : available === false ? C.coral + '40' : C.border}`,
                        borderRadius: 12, padding: '12px 14px 12px 30px', fontSize: 14, fontWeight: 600,
                        color: C.text, outline: 'none', fontFamily: "'DM Sans', sans-serif",
                        transition: 'border-color 0.2s',
                      }}
                    />
                    {status === 'checking' && (
                      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: C.muted }}>...</span>
                    )}
                    {available === true && input.length >= 3 && (
                      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.green }}>✓</span>
                    )}
                    {available === false && (
                      <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: C.coral }}>✗</span>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                    onClick={handleSave}
                    disabled={status === 'saving' || available === false || input.length < 3}
                    style={{
                      background: C.coral, color: '#fff', border: 'none', borderRadius: 12,
                      padding: '12px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                      fontFamily: "'Bricolage Grotesque',sans-serif",
                      opacity: (status === 'saving' || available === false || input.length < 3) ? 0.5 : 1,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {status === 'saving' ? '...' : currentUsername ? 'Update' : 'Claim'}
                  </motion.button>
                </div>
                {message && (
                  <div style={{
                    fontSize: 11, color: status === 'done' ? C.green : status === 'error' ? C.coral : C.muted2,
                    marginTop: 8, fontFamily: 'monospace',
                  }}>
                    {message}
                  </div>
                )}
                <div style={{ fontSize: 10, color: C.muted, marginTop: 6 }}>
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
