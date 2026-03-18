'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── DESIGN TOKENS — Neo-Brutalism ───────────────────────────────────────────
const C = {
  cream:     '#FFF7E6',
  ink:       '#0D0D0D',
  red:       '#FF4D4D',
  yellow:    '#FFD84D',
  blue:      '#4F46E5',
  green:     '#22C55E',
  pink:      '#FF6FD8',
  white:     '#FFFFFF',
  shadow:    '4px 4px 0px #0D0D0D',
  shadowSm:  '2px 2px 0px #0D0D0D',
  border:    '3px solid #0D0D0D',
  borderThin:'2px solid #0D0D0D',
};

interface ShareCardProps {
  score: number;
  interestLevel: number;
  attractionProbability: number;
  momentum: string;
  verdict: string;
  personalityType?: string;
  personalityEmoji?: string;
  tags?: string[];
  roastText?: string;
  isRoast?: boolean;
}

function getScoreColor(score: number) {
  if (score >= 7) return C.green;
  if (score >= 5) return C.yellow;
  return C.red;
}

function getScoreLabel(score: number) {
  if (score >= 9) return 'God-tier Rizz 🔥';
  if (score >= 8) return 'Smooth Operator 😎';
  if (score >= 7) return 'Pretty Solid 👍';
  if (score >= 5) return 'Room to Grow 🌱';
  if (score >= 3) return 'Needs Work 😬';
  return 'Critical Alert 🚨';
}

export default function ShareCard({
  score, interestLevel, attractionProbability,
  momentum, verdict, personalityType, personalityEmoji,
  tags = [], roastText, isRoast = false,
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const scColor = getScoreColor(score);

  const handleDownload = async () => {
    if (!cardRef.current || downloading) return;
    setDownloading(true);
    try {
      // Dynamic import html2canvas
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: C.cream, // Match the card's background to avoid weird edges
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `convocoach-${isRoast ? 'roast' : 'score'}-${(score || 0).toFixed(1)}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch {
      // Fallback: copy score as text
      handleCopyText();
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyText = () => {
    const safeScore = score || 0;
    const text = isRoast && roastText
      ? `🔥 My ConvoCoach Roast: "${roastText}" — Score: ${safeScore.toFixed(1)}/10\n\nGet roasted at convocoach.xyz`
      : `💬 My ConvoCoach Score: ${safeScore.toFixed(1)}/10 — ${getScoreLabel(safeScore)}\n🎯 Interest: ${interestLevel}% | Attraction: ${attractionProbability}%\n${personalityType ? `👤 Style: ${personalityEmoji} ${personalityType}` : ''}\n\nAnalyze your texts at convocoach.xyz`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const safeScore = score || 0;
    const shareData = {
      title: isRoast ? `🔥 My ConvoCoach Roast` : `💬 My ConvoCoach Score: ${safeScore.toFixed(1)}/10`,
      text: isRoast && roastText
        ? `🔥 "${roastText}" — Score: ${safeScore.toFixed(1)}/10`
        : `My conversation score: ${safeScore.toFixed(1)}/10 — ${getScoreLabel(safeScore)}`,
      url: 'https://convocoach.xyz',
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      handleCopyText();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* ─── The Card (for screenshot) ─── */}
      <div
        ref={cardRef}
        style={{
          background: C.cream,
          border: C.border,
          borderRadius: 24,
          padding: 'clamp(24px, 5vw, 40px)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: C.shadowLg,
        }}
      >
        {/* Brand Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, paddingBottom: 16, borderBottom: `3px dashed ${C.ink}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', background: C.red, border: '2px solid #000' }} />
            <span style={{
              fontSize: 14, fontWeight: 900, color: C.ink,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>ConvoCoach</span>
          </div>
          <span style={{
            fontSize: 12, fontWeight: 800, color: C.ink,
            fontFamily: "'DM Sans', sans-serif",
          }}>convocoach.xyz</span>
        </div>

        {/* Score Section */}
        <div style={{ marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{
            fontSize: 12, fontWeight: 900, color: C.ink,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            fontFamily: "'DM Sans', sans-serif", marginBottom: 12,
            background: isRoast ? C.red : C.yellow,
            padding: '4px 12px', borderRadius: 8, border: C.borderThin,
            boxShadow: C.shadowSm,
          }}>
            {isRoast ? '🔥 Roast Mode' : 'Conversation Score'}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(64px, 14vw, 88px)', fontWeight: 900,
              color: C.ink, lineHeight: 0.9, letterSpacing: '-0.04em',
            }}>{(score || 0).toFixed(1)}</span>
            <span style={{
              fontSize: 28, fontWeight: 800, color: '#555',
              fontFamily: "'DM Sans', sans-serif",
            }}>/10</span>
          </div>
          
          <div style={{
            fontSize: 18, fontWeight: 900, color: C.ink,
            fontFamily: "'DM Sans', sans-serif",
            background: scColor, padding: '6px 16px', borderRadius: 10,
            border: C.borderThin, display: 'inline-block',
          }}>{getScoreLabel(score || 0)}</div>
        </div>

        {/* Roast text (if roast mode) */}
        {isRoast && roastText && (
          <div style={{
            background: C.pink, border: C.borderThin,
            borderRadius: 16, padding: '20px', marginBottom: 24,
            boxShadow: C.shadowSm,
          }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>AI Verdict</div>
            <p style={{
              fontSize: 16, color: C.ink, lineHeight: 1.6,
              fontStyle: 'italic', margin: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            }}>"{roastText}"</p>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24,
        }}>
          {[
            { label: 'Interest', val: `${interestLevel}%`, color: C.blue },
            { label: 'Attract', val: `${attractionProbability}%`, color: C.pink },
            { label: 'Momentum', val: momentum === 'escalating' ? 'Rising' : momentum === 'dying' ? 'Fading' : 'Flat', color: momentum === 'escalating' ? C.green : momentum === 'dying' ? C.red : C.yellow },
          ].map((stat, i) => (
            <div key={i} style={{
              background: C.white,
              border: C.borderThin,
              borderRadius: 14, padding: '16px 12px', textAlign: 'center',
              boxShadow: C.shadowSm, display: 'flex', flexDirection: 'column', justifyContent: 'center'
            }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: C.ink, fontFamily: "'DM Sans', sans-serif", lineHeight: 1, marginBottom: 6 }}>{stat.val}</div>
              <div style={{ fontSize: 10, color: C.ink, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'DM Sans', sans-serif" }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Personality & Tags */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {personalityType && (
            <span style={{
              fontSize: 11, fontWeight: 900, padding: '6px 12px',
              borderRadius: 8, background: C.white,
              color: C.ink, border: C.borderThin, fontFamily: "'DM Sans', sans-serif", textTransform: 'uppercase'
            }}>{personalityEmoji} {personalityType}</span>
          )}
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} style={{
              fontSize: 11, fontWeight: 900, padding: '6px 12px',
              borderRadius: 8, background: C.ink,
              color: C.white, border: C.borderThin,
              textTransform: 'uppercase', fontFamily: "'DM Sans', sans-serif"
            }}>{tag.replace(/-/g, ' ')}</span>
          ))}
        </div>

        {/* Verdict (If not roast mode) */}
        {verdict && !isRoast && (
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: C.borderThin }}>
            <div style={{ fontSize: 11, fontWeight: 900, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Diagnosis</div>
            <p style={{
              fontSize: 14, color: '#333', lineHeight: 1.6,
              margin: 0, fontFamily: "'DM Sans', sans-serif", fontWeight: 600,
            }}>{verdict}</p>
          </div>
        )}
      </div>

      {/* ─── Action Buttons ─── */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <motion.button
          onClick={handleDownload}
          whileHover={{ y: -2, boxShadow: C.shadowSm }}
          whileTap={{ y: 0, boxShadow: 'none' }}
          disabled={downloading}
          style={{
            flex: '1 1 140px', padding: '14px 16px', borderRadius: 14,
            background: C.ink, color: C.white, border: C.borderThin,
            fontSize: 14, fontWeight: 900, cursor: downloading ? 'not-allowed' : 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: C.shadowSm, opacity: downloading ? 0.7 : 1,
          }}
        >
          {downloading ? '⏳ Saving...' : '📥 Save Image'}
        </motion.button>

        <motion.button
          onClick={handleShare}
          whileHover={{ y: -2, boxShadow: C.shadowSm }}
          whileTap={{ y: 0, boxShadow: 'none' }}
          style={{
            flex: '1 1 140px', padding: '14px 16px', borderRadius: 14,
            background: scColor, color: C.ink, border: C.borderThin,
            fontSize: 14, fontWeight: 900, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            boxShadow: C.shadowSm,
          }}
        >
          📤 Share
        </motion.button>

        <motion.button
          onClick={handleCopyText}
          whileHover={{ y: -2, boxShadow: C.shadowSm }}
          whileTap={{ y: 0, boxShadow: 'none' }}
          style={{
            flexShrink: 0, padding: '14px 20px', borderRadius: 14,
            background: C.white, color: C.ink, border: C.borderThin,
            fontSize: 14, fontWeight: 900, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif", boxShadow: C.shadowSm,
          }}
        >
          {copied ? '✓ Copied' : '📋 Copy Text'}
        </motion.button>
      </div>
    </div>
  );
}