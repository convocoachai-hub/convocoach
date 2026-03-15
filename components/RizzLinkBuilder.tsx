'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const RizzAvatarModule = dynamic(() => import('@/components/RizzAvatars').then(m => ({ default: m.RizzAvatar })), { ssr: false });

// ─── Design ──────────────────────────────────────────────────────────────────
const C = {
  surface: 'rgba(255,255,255,0.03)', surfaceHi: 'rgba(255,255,255,0.06)',
  border: 'rgba(255,255,255,0.07)', borderHi: 'rgba(255,255,255,0.13)',
  text: '#F0EDE8', muted: 'rgba(240,237,232,0.3)', muted2: 'rgba(240,237,232,0.55)',
  coral: '#FF5B3A', coralLo: 'rgba(255,91,58,0.1)',
  violet: '#7B6CF6', violetLo: 'rgba(123,108,246,0.1)',
  green: '#4DEBA1', greenLo: 'rgba(77,235,161,0.08)',
  gold: '#F5C842', goldLo: 'rgba(245,200,66,0.08)',
};

const AVATARS = ['cat', 'dog', 'fox', 'robot', 'panda'] as const;
const AVATAR_LABELS: Record<string, string> = { cat:'Cat', dog:'Dog', fox:'Fox', robot:'Robot', panda:'Panda' };

const TRAITS = [
  { id: 'flirting',   label: 'Flirting Ability', emoji: '💬' },
  { id: 'humor',      label: 'Humor',             emoji: '😄' },
  { id: 'confidence', label: 'Confidence',        emoji: '💪' },
  { id: 'dryText',    label: 'Dry Texting',       emoji: '🏜️' },
  { id: 'overall',    label: 'Overall Rizz',      emoji: '⭐' },
];

const THEMES = [
  {
    id: 'minimal',
    label: 'Minimal Dark',
    desc: 'Black · White · Red',
    preview: { bg: '#08080F', accent: '#FF3B1F', text: '#F0EDE8', font: 'sans-serif' },
  },
  {
    id: 'vintage',
    label: '90s Vintage Web',
    desc: 'Dark Purple · Neon Pink · Orbitron',
    preview: { bg: '#0A0018', accent: '#FF005C', text: '#F0E0FF', font: 'monospace' },
  },
  {
    id: 'gothic',
    label: 'Gothic',
    desc: 'Black · Crimson · Cinzel Serif',
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

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <motion.button
      onClick={() => onChange(!on)}
      animate={{ background: on ? C.coral : C.surfaceHi }}
      transition={{ duration: 0.2 }}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        position: 'relative', flexShrink: 0,
      }}
    >
      <motion.div
        animate={{ x: on ? 18 : 2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        style={{ width: 14, height: 14, borderRadius: '50%', background: 'white', position: 'absolute', top: 3 }}
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
    return <div style={{ padding: '24px', color: C.muted, fontSize: 13, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18 }}>Loading builder...</div>;
  }

  const rizzLink = username ? `${typeof window !== 'undefined' ? window.location.origin : ''}/u/${username}` : null;

  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.14em', fontWeight: 800, marginBottom: 3 }}>Rizz Link Builder</div>
          {username ? (
            <Link href={`/u/${username}`} target="_blank" style={{ textDecoration: 'none' }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.coral, fontFamily: 'monospace' }}>
                /u/{username} ↗
              </span>
            </Link>
          ) : (
            <span style={{ fontSize: 12, color: C.muted2 }}>Set a username to activate your link</span>
          )}
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
          onClick={save} disabled={saving || !username}
          style={{
            background: saved ? C.green + '20' : C.coral, color: saved ? C.green : '#fff',
            border: saved ? `1px solid ${C.green}30` : 'none',
            borderRadius: 10, padding: '8px 18px', fontSize: 12, fontWeight: 800,
            cursor: (!username || saving) ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            opacity: !username ? 0.5 : 1,
          }}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
        </motion.button>
      </div>

      <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Theme Picker ─────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Theme</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {THEMES.map(t => {
              const active = config.theme === t.id;
              return (
                <motion.button key={t.id}
                  whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => set('theme', t.id as RizzPageConfig['theme'])}
                  style={{
                    background: t.preview.bg, border: `2px solid ${active ? C.coral : 'rgba(255,255,255,0.08)'}`,
                    borderRadius: 12, padding: '12px 8px', cursor: 'pointer', textAlign: 'center',
                    transition: 'border-color 0.2s',
                  }}
                >
                  {/* Mini preview bar */}
                  <div style={{ width: 24, height: 4, background: t.preview.accent, borderRadius: 2, margin: '0 auto 6px', boxShadow: t.id === 'vintage' ? `0 0 6px ${t.preview.accent}` : undefined }} />
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.preview.text, fontFamily: t.preview.font, marginBottom: 2, lineHeight: 1.2 }}>{t.label}</div>
                  <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{t.desc}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Avatar Picker ─────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Avatar</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {AVATARS.map(av => {
              const active = config.avatar === av;
              return (
                <motion.button key={av}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
                  onClick={() => set('avatar', av)}
                  title={AVATAR_LABELS[av]}
                  style={{
                    background: active ? C.coralLo : C.surfaceHi,
                    border: `2px solid ${active ? C.coral : C.border}`,
                    borderRadius: 14, padding: '8px', cursor: 'pointer',
                    transition: 'border-color 0.2s',
                  }}
                >
                  <RizzAvatarModule type={av} size={44} />
                  <div style={{ fontSize: 9, color: active ? C.coral : C.muted, fontWeight: 700, marginTop: 4 }}>{AVATAR_LABELS[av]}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* ── Trait Toggles ─────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Enabled Traits</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {TRAITS.map(t => {
              const on = config.enabledTraits.includes(t.id);
              return (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, color: on ? C.text : C.muted, fontWeight: 500, transition: 'color 0.2s' }}>
                    {t.emoji} {t.label}
                  </span>
                  <Toggle on={on} onChange={() => toggleTrait(t.id)} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Page Options ──────────────────────────────────────────────── */}
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 12 }}>Page Options</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: C.muted2, fontWeight: 500 }}>💬 Allow anonymous message</span>
              <Toggle on={config.allowMessage} onChange={v => set('allowMessage', v)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: C.muted2, fontWeight: 500 }}>🔗 Show viral CTA after submit</span>
              <Toggle on={config.showFinalCTA} onChange={v => set('showFinalCTA', v)} />
            </div>
          </div>
        </div>

        {/* ── Custom Question ────────────────────────────────────────────── */}
        {config.allowMessage && (
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>Custom Message Prompt</div>
            <input
              type="text"
              value={config.customQuestion}
              onChange={e => set('customQuestion', e.target.value.slice(0, 200))}
              placeholder="e.g. What's one thing I could improve?"
              style={{
                width: '100%', background: C.surfaceHi, border: `1px solid ${C.border}`,
                borderRadius: 12, padding: '11px 14px', fontSize: 13, color: C.text,
                outline: 'none', fontFamily: "'DM Sans', sans-serif",
              }}
              onFocus={e => e.target.style.borderColor = C.borderHi}
              onBlur={e => e.target.style.borderColor = C.border}
            />
            <div style={{ fontSize: 10, color: C.muted, marginTop: 4, textAlign: 'right' }}>{config.customQuestion.length}/200</div>
          </div>
        )}
      </div>
    </div>
  );
}
