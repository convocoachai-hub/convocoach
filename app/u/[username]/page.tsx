'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import of avatars (prevents SSR issues with framer-motion)
const RizzAvatarModule = dynamic(() => import('@/components/RizzAvatars').then(m => ({ default: m.RizzAvatar })), { ssr: false });

// ─── Theme CSS Variables ──────────────────────────────────────────────────────
const THEME_CSS: Record<string, string> = {
  minimal: `
    :root {
      --bg: #08080F;
      --surface: rgba(255,255,255,0.04);
      --surface-hi: rgba(255,255,255,0.07);
      --border: rgba(255,255,255,0.09);
      --text: #F0EDE8;
      --muted: rgba(240,237,232,0.35);
      --muted2: rgba(240,237,232,0.6);
      --accent: #FF3B1F;
      --accent-lo: rgba(255,59,31,0.12);
      --accent-glow: rgba(255,59,31,0.0);
      --secondary: #7B6CF6;
      --secondary-lo: rgba(123,108,246,0.12);
      --progress: #FF3B1F;
      --slider: #FF3B1F;
      --radius: 16px;
      --heading-font: 'Bricolage Grotesque', sans-serif;
      --body-font: 'DM Sans', sans-serif;
      --font-import: url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
      --scanline: none;
      --grain: none;
    }
  `,
  vintage: `
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=VT323&display=swap');
    :root {
      --bg: #0A0018;
      --surface: rgba(180,0,255,0.06);
      --surface-hi: rgba(180,0,255,0.12);
      --border: rgba(255,0,200,0.2);
      --text: #F0E0FF;
      --muted: rgba(240,224,255,0.4);
      --muted2: rgba(240,224,255,0.65);
      --accent: #FF005C;
      --accent-lo: rgba(255,0,92,0.12);
      --accent-glow: 0 0 18px rgba(255,0,92,0.5), 0 0 4px rgba(255,0,92,0.9);
      --secondary: #A800FF;
      --secondary-lo: rgba(168,0,255,0.12);
      --progress: #FF005C;
      --slider: #FF005C;
      --radius: 2px;
      --heading-font: 'Orbitron', sans-serif;
      --body-font: 'VT323', monospace;
      --scanline: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.08) 2px,rgba(0,0,0,0.08) 4px);
      --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    }
  `,
  gothic: `
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap');
    :root {
      --bg: #060608;
      --surface: rgba(139,0,20,0.06);
      --surface-hi: rgba(139,0,20,0.12);
      --border: rgba(139,0,20,0.3);
      --text: #EDE8E0;
      --muted: rgba(237,232,224,0.35);
      --muted2: rgba(237,232,224,0.6);
      --accent: #C8001E;
      --accent-lo: rgba(200,0,30,0.12);
      --accent-glow: rgba(200,0,30,0.0);
      --secondary: #8B0014;
      --secondary-lo: rgba(139,0,20,0.15);
      --progress: #C8001E;
      --slider: #C8001E;
      --radius: 0px;
      --heading-font: 'Cinzel', serif;
      --body-font: 'Crimson Text', serif;
      --scanline: none;
      --grain: none;
    }
  `,
};

// ─── Types ────────────────────────────────────────────────────────────────────
type Theme = 'minimal' | 'vintage' | 'gothic';

interface RizzConfig {
  avatar: string;
  theme: Theme;
  enabledTraits: string[];
  allowMessage: boolean;
  customQuestion?: string;
  showFinalCTA: boolean;
}

interface TraitScores {
  flirting: number;
  humor: number;
  confidence: number;
  dryText: number;
  overall: number;
}

const TRAIT_META: Record<string, { label: string; emoji: string }> = {
  flirting:   { label: 'Flirting Ability', emoji: '💬' },
  humor:      { label: 'Humor',            emoji: '😄' },
  confidence: { label: 'Confidence',       emoji: '💪' },
  dryText:    { label: 'Dry Texting',      emoji: '🏜️' },
  overall:    { label: 'Overall Rizz',     emoji: '⭐' },
};

const EMOJIS = ['😐', '🙂', '😏', '😎', '🔥'];
const FADE = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -14 } };
const TRANS = { duration: 0.4, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] };

// ─── TraitSlider ──────────────────────────────────────────────────────────────
function TraitSlider({ label, emoji, value, onChange }: { label: string; emoji: string; value: number; onChange: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--body-font)' }}>{emoji} {label}</span>
        <span style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)', fontFamily: 'monospace' }}>{value}/10</span>
      </div>
      <input type="range" min={1} max={10} value={value} onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', height: 6, cursor: 'pointer', accentColor: 'var(--slider)', borderRadius: 3 }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
        {EMOJIS.map((e, i) => (
          <span key={i} style={{ fontSize: 16, opacity: value >= (i * 2 + 1) ? 1 : 0.2, transition: 'opacity 0.15s', cursor: 'pointer' }} onClick={() => onChange(i * 2.5 + 1 > 10 ? 10 : Math.round(i * 2.5 + 1))}>
            {e}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── StepDots ─────────────────────────────────────────────────────────────────
function StepDots({ total, current }: { total: number; current: number }) {
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <motion.div key={i}
          animate={{ width: i === current ? 20 : 6, background: i === current ? 'var(--accent)' : 'var(--border)' }}
          transition={{ duration: 0.3 }}
          style={{ height: 6, borderRadius: 3, background: i < current ? 'var(--accent)' : 'var(--border)' }}
        />
      ))}
    </div>
  );
}

// ─── Btn ──────────────────────────────────────────────────────────────────────
function Btn({ children, onClick, secondary = false, disabled = false }: { children: React.ReactNode; onClick?: () => void; secondary?: boolean; disabled?: boolean }) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03, boxShadow: secondary ? undefined : 'var(--accent-glow)' }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%', border: secondary ? '1px solid var(--border)' : 'none',
        background: secondary ? 'var(--surface)' : 'var(--accent)',
        color: secondary ? 'var(--muted2)' : '#fff',
        borderRadius: 'var(--radius)', padding: '15px',
        fontSize: 15, fontWeight: 800, cursor: disabled ? 'wait' : 'pointer',
        fontFamily: 'var(--heading-font)', letterSpacing: secondary ? 0 : '0.01em',
        opacity: disabled ? 0.6 : 1, transition: 'opacity 0.2s',
        boxShadow: !secondary ? 'var(--accent-glow)' : undefined,
        marginBottom: 10,
      }}>
      {children}
    </motion.button>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RizzLinkPage() {
  const params = useParams();
  const username = params.username as string;

  const [config, setConfig] = useState<RizzConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // Multi-step state
  const [step, setStep] = useState(0); // 0=intro, 1=traits, 2=message, 3=done
  const [scores, setScores] = useState<TraitScores>({ flirting: 5, humor: 5, confidence: 5, dryText: 5, overall: 5 });
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const setTrait = useCallback((trait: keyof TraitScores) => (v: number) => {
    setScores(prev => ({ ...prev, [trait]: v }));
  }, []);

  useEffect(() => {
    if (!username) return;
    fetch(`/api/profile/${username}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setPageError(d.error);
        else setConfig(d.rizzPageConfig);
      })
      .catch(() => setPageError('Failed to load'))
      .finally(() => setLoading(false));
  }, [username]);

  const submit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const enabledTraits = config?.enabledTraits ?? ['flirting', 'humor', 'confidence', 'dryText', 'overall'];
      const payload: Record<string, unknown> = {
        targetUsername: username,
        flirtingScore: enabledTraits.includes('flirting') ? scores.flirting : null,
        humorScore: enabledTraits.includes('humor') ? scores.humor : null,
        confidenceScore: enabledTraits.includes('confidence') ? scores.confidence : null,
        dryTextScore: enabledTraits.includes('dryText') ? scores.dryText : null,
        overallScore: enabledTraits.includes('overall') ? scores.overall : null,
      };
      if (config?.allowMessage && message.trim()) payload.message = message.trim();
      if (config?.customQuestion) payload.customAnswer = message.trim();

      const res = await fetch('/api/rizz-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await res.json();
      if (d.success) setStep(3);
      else setSubmitError(d.error || 'Submission failed.');
    } catch { setSubmitError('Network error. Please try again.'); }
    finally { setSubmitting(false); }
  };

  // ── Compute steps based on config
  const steps = config ? [
    'intro',
    'traits',
    ...(config.allowMessage ? ['message'] : []),
    'submit',
  ] : ['intro', 'traits', 'message', 'submit'];

  const totalSteps = steps.length;
  const theme: Theme = config?.theme ?? 'minimal';

  // ── Gather fonts / styles based on theme
  const fontImport = (() => {
    if (theme === 'minimal') return "url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@600;700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap')";
    if (theme === 'vintage') return "url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=VT323&display=swap')";
    return "url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700;900&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap')";
  })();

  const css = `
    @import ${fontImport};
    ${THEME_CSS[theme]}
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: var(--bg); }
    html { background: var(--bg); }
    .vintage-scan::after {
      content: '';
      position: fixed;
      inset: 0;
      background: var(--scanline);
      pointer-events: none;
      z-index: 999;
    }
    .vintage-grain::before {
      content: '';
      position: fixed;
      inset: 0;
      background-image: var(--grain);
      pointer-events: none;
      z-index: 998;
      opacity: 0.6;
    }
    input[type=range] { -webkit-appearance: none; appearance: none; background: var(--border); border-radius: 4px; }
    input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 20px; height: 20px; border-radius: 50%; background: var(--accent); cursor: pointer; border: 2px solid var(--bg); box-shadow: var(--accent-glow); }
    textarea { resize: none; }
    .page-content { max-width: 440px; margin: 0 auto; padding: 48px 20px 60px; }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 28px 24px;
    }
    ${theme === 'gothic' ? '.card { border-left: 3px solid var(--accent); }' : ''}
    ${theme === 'vintage' ? '.card { box-shadow: 0 0 30px rgba(168,0,255,0.08); }' : ''}
  `;

  // ── Loading
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#08080F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`body{background:#08080F}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width: 28, height: 28, border: '2px solid rgba(255,59,31,0.2)', borderTopColor: '#FF3B1F', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  );

  // ── 404
  if (pageError || !config) return (
    <div style={{ minHeight: '100vh', background: '#08080F', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24, fontFamily: 'sans-serif' }}>
      <style>{css}</style>
      <div style={{ fontSize: 40 }}>💀</div>
      <h1 style={{ fontFamily: 'var(--heading-font)', fontSize: 24, fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em' }}>@{username} not found</h1>
      <p style={{ fontSize: 13, color: 'var(--muted2)', textAlign: 'center', lineHeight: 1.6 }}>This Rizz Link doesn&apos;t exist.</p>
      <Link href="/upload">
        <motion.button whileHover={{ scale: 1.04 }} style={{ background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--radius)', padding: '13px 28px', fontSize: 14, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--heading-font)', boxShadow: 'var(--accent-glow)' }}>
          Get Your Rizz Link →
        </motion.button>
      </Link>
    </div>
  );

  const enabledTraits = config.enabledTraits.filter(t => TRAIT_META[t]);

  return (
    <>
      <style>{css}</style>
      <div className={theme === 'vintage' ? 'vintage-scan vintage-grain' : ''} style={{ minHeight: '100vh', background: 'var(--bg)' }}>
        <div className="page-content">

          {/* ── Step: Intro (0) ─────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="intro" {...FADE} transition={TRANS}>
                <div style={{ textAlign: 'center', paddingTop: 16 }}>
                  {/* Avatar */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <RizzAvatarModule type={config.avatar} size={100} />
                  </div>

                  {/* Username */}
                  <div style={{
                    fontSize: theme === 'vintage' ? 22 : 28,
                    fontWeight: 900, color: 'var(--accent)',
                    fontFamily: 'var(--heading-font)', letterSpacing: '-0.02em',
                    marginBottom: 6,
                    textShadow: theme === 'vintage' ? 'var(--accent-glow)' : undefined,
                  }}>
                    @{username}
                  </div>

                  <h1 style={{
                    fontSize: theme === 'gothic' ? 20 : 24, fontWeight: 800,
                    color: 'var(--text)', fontFamily: 'var(--heading-font)',
                    letterSpacing: theme === 'gothic' ? '0.04em' : '-0.02em',
                    lineHeight: 1.25, marginBottom: 12,
                  }}>
                    Rate @{username}&apos;s texting personality
                  </h1>

                  <p style={{ fontSize: theme === 'vintage' ? 16 : 14, color: 'var(--muted2)', lineHeight: 1.65, marginBottom: 32, fontFamily: 'var(--body-font)' }}>
                    Anonymous feedback that helps them improve their conversation game.
                  </p>

                  <Btn onClick={() => setStep(1)}>Start →</Btn>

                  <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 10, fontFamily: 'var(--body-font)' }}>
                    Your identity is never revealed
                  </p>
                </div>
              </motion.div>
            )}

            {/* ── Step: Trait Rating (1) ─────────────────────────────── */}
            {step === 1 && (
              <motion.div key="traits" {...FADE} transition={TRANS}>
                <StepDots total={totalSteps} current={1} />
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, fontFamily: 'var(--body-font)' }}>
                    Trait Rating
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--heading-font)', letterSpacing: '-0.01em', marginBottom: 24, lineHeight: 1.2 }}>
                    How does @{username} text?
                  </h2>

                  {enabledTraits.map(trait => (
                    <TraitSlider
                      key={trait}
                      label={TRAIT_META[trait].label}
                      emoji={TRAIT_META[trait].emoji}
                      value={scores[trait as keyof TraitScores] ?? 5}
                      onChange={setTrait(trait as keyof TraitScores)}
                    />
                  ))}
                </div>

                <div style={{ marginTop: 16 }}>
                  <Btn onClick={() => setStep(config.allowMessage ? 2 : 100)}>
                    {config.allowMessage ? 'Next →' : 'Submit Anonymously →'}
                  </Btn>
                  <Btn onClick={() => setStep(0)} secondary>← Back</Btn>
                </div>
              </motion.div>
            )}

            {/* ── Step: Message (2) ─────────────────────────────────── */}
            {step === 2 && config.allowMessage && (
              <motion.div key="message" {...FADE} transition={TRANS}>
                <StepDots total={totalSteps} current={2} />
                <div className="card">
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: 6, fontFamily: 'var(--body-font)' }}>
                    Optional
                  </div>
                  <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--heading-font)', letterSpacing: '-0.01em', marginBottom: 8, lineHeight: 1.2 }}>
                    {config.customQuestion || 'Leave anonymous texting feedback'}
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 18, fontFamily: 'var(--body-font)' }}>You can skip this.</p>

                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value.slice(0, 400))}
                    placeholder={'"Your flirting is actually smooth."'}
                    rows={4}
                    style={{
                      width: '100%', background: 'var(--surface-hi)',
                      border: '1px solid var(--border)', borderRadius: 'var(--radius)',
                      padding: '14px', fontSize: theme === 'vintage' ? 16 : 14,
                      color: 'var(--text)', outline: 'none',
                      fontFamily: 'var(--body-font)', lineHeight: 1.6,
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                  <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'right', marginTop: 4 }}>{message.length}/400</div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <Btn onClick={submit} disabled={submitting}>
                    {submitting ? 'Sending...' : 'Submit Anonymously →'}
                  </Btn>
                  {submitError && <p style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 10, fontFamily: 'var(--body-font)', textAlign: 'center' }}>{submitError}</p>}
                  <Btn onClick={() => setStep(1)} secondary>← Back</Btn>
                </div>
              </motion.div>
            )}

            {/* ── If no message step, step 100 = submit directly ────── */}
            {step === 100 && (
              <motion.div key="directsubmit" {...FADE} transition={TRANS}>
                <StepDots total={totalSteps} current={totalSteps - 1} />
                <div className="card" style={{ textAlign: 'center' }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--heading-font)', marginBottom: 24 }}>Confirm submission</h2>
                  {submitError && <p style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 12 }}>{submitError}</p>}
                  <Btn onClick={submit} disabled={submitting}>{submitting ? 'Sending...' : 'Submit Anonymously →'}</Btn>
                  <Btn onClick={() => setStep(1)} secondary>← Back</Btn>
                </div>
              </motion.div>
            )}

            {/* ── Step: Done (3) ────────────────────────────────────── */}
            {step === 3 && (
              <motion.div key="done" {...FADE} transition={TRANS}>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  {/* Avatar celebrating */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                    <RizzAvatarModule type={config.avatar} size={90} />
                  </div>

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'var(--accent-lo)', border: '2px solid var(--accent)',
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 24, marginBottom: 20,
                      boxShadow: 'var(--accent-glow)',
                    }}
                  >✓</motion.div>

                  <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', fontFamily: 'var(--heading-font)', letterSpacing: '-0.02em', marginBottom: 10 }}>
                    Thanks — your feedback was sent anonymously.
                  </h2>
                  <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.65, marginBottom: 40, fontFamily: 'var(--body-font)' }}>
                    Your ratings will appear in {username}&apos;s dashboard report.
                  </p>

                  {/* Viral CTA */}
                  {config.showFinalCTA && (
                    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '24px 20px' }}>
                      <h3 style={{
                        fontSize: 17, fontWeight: 800, color: 'var(--text)',
                        fontFamily: 'var(--heading-font)', letterSpacing: '-0.01em', marginBottom: 8,
                        textShadow: theme === 'vintage' ? 'var(--accent-glow)' : undefined,
                      }}>
                        Want feedback on your own texting style?
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--muted2)', lineHeight: 1.6, marginBottom: 20, fontFamily: 'var(--body-font)' }}>
                        Get your Rizz Link and collect anonymous trait ratings.
                      </p>
                      <Link href="/upload" style={{ display: 'block', marginBottom: 10 }}>
                        <Btn>Analyze Your Chat →</Btn>
                      </Link>
                      <Link href="/dashboard" style={{ display: 'block' }}>
                        <Btn secondary>Grab Your Username</Btn>
                      </Link>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Footer ──────────────────────────────────────────────── */}
          {step !== 3 && (
            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--body-font)' }}>
                  Powered by <span style={{ color: 'var(--accent)', fontWeight: 700 }}>ConvoCoach</span>
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
