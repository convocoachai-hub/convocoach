'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RizzAvatarModule = dynamic(() => import('@/components/RizzAvatars').then(m => ({ default: m.RizzAvatar })), { ssr: false });

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
  shadowLg:  '8px 8px 0px #0F0C09',
  shadowSm:  '2px 2px 0px #0F0C09',
  border:    '3px solid #0F0C09',
  borderThin:'2px solid #0F0C09',
};

const AVATARS = ['cat', 'dog', 'fox', 'robot', 'panda'] as const;
const AVATAR_LABELS: Record<string, string> = { cat:'Cat', dog:'Dog', fox:'Fox', robot:'Robot', panda:'Panda' };

const TRAITS = [
  { id: 'flirting',   label: 'Flirting Ability', emoji: '💬' },
  { id: 'humor',      label: 'Humor',            emoji: '😄' },
  { id: 'confidence', label: 'Confidence',       emoji: '💪' },
  { id: 'dryText',    label: 'Dry Texting',      emoji: '🏜️' },
  { id: 'overall',    label: 'Overall Rizz',     emoji: '⭐' },
];

const THEMES = [
  {
    id: 'minimal', label: 'Minimal Dark', desc: 'Black · White · Red',
    preview: { bg: '#08080F', accent: '#FF3B1F', text: '#F0EDE8', font: 'sans-serif' },
  },
  {
    id: 'vintage', label: '90s Vintage Web', desc: 'Dark Purple · Neon Pink',
    preview: { bg: '#0A0018', accent: '#FF005C', text: '#F0E0FF', font: 'monospace' },
  },
  {
    id: 'gothic', label: 'Gothic', desc: 'Black · Crimson · Serif',
    preview: { bg: '#060608', accent: '#C8001E', text: '#EDE8E0', font: 'Georgia, serif' },
  },
];

interface RizzPageConfig {
  avatar: string;
  theme: 'minimal' | 'vintage' | 'gothic';
  enabledTraits: string[];
  allowMessage: boolean;
  customQuestion: string;
  showFinalCTA: boolean;
}

const DEFAULT_CONFIG: RizzPageConfig = {
  avatar: 'cat', theme: 'minimal',
  enabledTraits: ['flirting', 'humor', 'confidence', 'dryText', 'overall'],
  allowMessage: true, customQuestion: '', showFinalCTA: true,
};

// ─── Brutalist Toggle ─────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!on)}
      animate={{ background: on ? C.green : C.warm2 }}
      transition={{ duration: 0.2 }}
      style={{
        width: 48, height: 26, borderRadius: 13, border: C.borderThin, cursor: 'pointer',
        position: 'relative', flexShrink: 0, boxShadow: C.shadowSm, padding: 0
      }}
    >
      <motion.div
        animate={{ x: on ? 22 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        style={{ width: 18, height: 18, borderRadius: '50%', background: C.white, border: C.borderThin, position: 'absolute', top: 2 }}
      />
    </motion.button>
  );
}

export default function RizzLinkBuilder({ username }: { username?: string | null }) {
  const [config, setConfig] = useState<RizzPageConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/rizz-config')
      .then(r => r.json())
      .then(d => { if (d.success && d.config) setConfig({ ...DEFAULT_CONFIG, ...d.config }); })
      .finally(() => setLoading(false));
  }, []);

  const set = useCallback(<K extends keyof RizzPageConfig>(key: K, val: RizzPageConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: val }));
    setSaved(false);
  }, []);

  const toggleTrait = (id: string) => {
    setConfig(prev => ({
      ...prev,
      enabledTraits: prev.enabledTraits.includes(id)
        ? prev.enabledTraits.filter(t => t !== id)
        : [...prev.enabledTraits, id],
    }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/rizz-config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(config) });
      const d = await res.json();
      if (d.success) setSaved(true);
    } finally { setSaving(false); }
  };

  if (loading) {
    return <div style={{ padding: '24px', color: C.ink, fontSize: 15, fontWeight: 800, background: C.warm1, border: C.border, borderRadius: 20, boxShadow: C.shadow }}>Loading builder...</div>;
  }

  const rizzLink = username ? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${username}` : null;

  return (
    <div style={{ background: C.white, border: C.border, borderRadius: 24, overflow: 'hidden', boxShadow: C.shadow }}>
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: C.borderThin, background: C.bgCream, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, background: C.yellow, borderRadius: '50%', border: '1px solid #000' }} />
            Page Builder
          </div>
          {username ? (
            <Link href={`/u/${username}`} target="_blank" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 15, fontWeight: 900, color: C.blue, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 6 }}>
                /u/{username} <span style={{ fontSize: 12 }}>↗</span>
              </span>
            </Link>
          ) : (
            <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>Set a username above to activate link</span>
          )}
        </div>
        <motion.button
          whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
          onClick={save} disabled={saving || !username}
          style={{
            background: saved ? C.green : C.ink, color: C.white,
            border: C.borderThin, borderRadius: 12, padding: '10px 24px', 
            fontSize: 14, fontWeight: 900, cursor: (!username || saving) ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif", opacity: !username ? 0.5 : 1,
            boxShadow: C.shadowSm,
          }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Changes'}
        </motion.button>
      </div>

      <div style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', gap: 40 }}>

        {/* ── Theme Picker ─────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Theme</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {THEMES.map(t => {
              const active = config.theme === t.id;
              return (
                <motion.button key={t.id}
                  whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
                  onClick={() => set('theme', t.id as RizzPageConfig['theme'])}
                  style={{
                    background: active ? C.yellow : C.white, border: C.borderThin,
                    borderRadius: 16, padding: '16px', cursor: 'pointer', textAlign: 'center',
                    transition: 'background 0.2s', boxShadow: active ? C.shadowSm : 'none',
                  }}
                >
                  {/* Mini preview bar simulating the page */}
                  <div style={{ background: t.preview.bg, border: C.borderThin, borderRadius: 8, padding: '12px 8px', marginBottom: 12 }}>
                    <div style={{ width: 32, height: 6, background: t.preview.accent, borderRadius: 3, margin: '0 auto 8px' }} />
                    <div style={{ fontSize: 12, fontWeight: 900, color: t.preview.text, fontFamily: t.preview.font, lineHeight: 1 }}>{t.label}</div>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.ink, fontFamily: "'DM Sans', sans-serif" }}>{t.label}</div>
                  <div style={{ fontSize: 10, color: '#555', fontWeight: 600, marginTop: 4 }}>{t.desc}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Avatar Picker ─────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 900, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>Your Avatar</div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {AVATARS.map(av => {
              const active = config.avatar === av;
              return (
                <motion.button key={av}
                  whileHover={{ y: -2 }} whileTap={{ y: 1 }}
                  onClick={() => set('avatar', av)}
                  title={AVATAR_LABELS[av]}
                  style={{
                    background: active ? C.blue : C.warm1,
                    border: C.borderThin, borderRadius: 16, padding: '12px', cursor: 'pointer',
                    boxShadow: active ? C.shadowSm : 'none', transition: 'background 0.2s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center'
                  }}
                >
                  <div style={{ background: C.white, borderRadius: 10, padding: 8, border: C.borderThin }}>
                    <RizzAvatarModule type={av} size={48} />
                  </div>
                  <div style={{ fontSize: 11, color: active ? C.white : C.ink, fontWeight: 900, marginTop: 8, fontFamily: "'DM Sans', sans-serif" }}>
                    {AVATAR_LABELS[av]}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          {/* ── Trait Toggles ─────────────────────────────────────────────── */}
          <div style={{ background: C.bgCream, border: C.borderThin, padding: '24px', borderRadius: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Public Traits</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {TRAITS.map(t => {
                const on = config.enabledTraits.includes(t.id);
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, border: C.borderThin, padding: '12px 16px', borderRadius: 12, boxShadow: C.shadowSm }}>
                    <span style={{ fontSize: 14, color: C.ink, fontWeight: 800, fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ marginRight: 8 }}>{t.emoji}</span> {t.label}
                    </span>
                    <Toggle on={on} onChange={() => toggleTrait(t.id)} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Page Options ──────────────────────────────────────────────── */}
          <div style={{ background: C.bgCream, border: C.borderThin, padding: '24px', borderRadius: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 900, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 20 }}>Interactions</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, border: C.borderThin, padding: '12px 16px', borderRadius: 12, boxShadow: C.shadowSm }}>
                <span style={{ fontSize: 14, color: C.ink, fontWeight: 800 }}>💬 Allow anonymous messages</span>
                <Toggle on={config.allowMessage} onChange={v => set('allowMessage', v)} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: C.white, border: C.borderThin, padding: '12px 16px', borderRadius: 12, boxShadow: C.shadowSm }}>
                <span style={{ fontSize: 14, color: C.ink, fontWeight: 800 }}>🔗 Show referral CTA link</span>
                <Toggle on={config.showFinalCTA} onChange={v => set('showFinalCTA', v)} />
              </div>
            </div>

            {/* Custom Question */}
            <AnimatePresence>
              {config.allowMessage && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 900, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Message Box Prompt</div>
                  <input
                    type="text"
                    value={config.customQuestion}
                    onChange={e => set('customQuestion', e.target.value.slice(0, 100))}
                    placeholder="e.g. Rate my rizz out of 10..."
                    style={{
                      width: '100%', background: C.white, border: C.borderThin,
                      borderRadius: 12, padding: '14px', fontSize: 14, fontWeight: 700,
                      color: C.ink, outline: 'none', fontFamily: "'DM Sans', sans-serif",
                      boxShadow: 'inset 2px 2px 0px rgba(0,0,0,0.05)',
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#666', marginTop: 8, textAlign: 'right', fontWeight: 700 }}>{config.customQuestion.length}/100</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}