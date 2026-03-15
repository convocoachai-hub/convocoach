'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  cream: '#F3EDE2', ink: '#0F0C09', red: '#D13920',
  warm1: '#E8E0D2', warm2: '#D4CBBA', muted: '#8A8074',
  green: '#2D8A4E', amber: '#B87A10', teal: '#3A7A8A',
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
  if (score >= 5) return C.amber;
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
        backgroundColor: C.ink,
        scale: 2,
        useCORS: true,
      });
      const link = document.createElement('a');
      link.download = `convocoach-${isRoast ? 'roast' : 'score'}-${score.toFixed(1)}.png`;
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
    const text = isRoast && roastText
      ? `🔥 My ConvoCoach Roast: "${roastText}" — Score: ${score.toFixed(1)}/10\n\nGet roasted at convocoach.ai`
      : `💬 My ConvoCoach Score: ${score.toFixed(1)}/10 — ${getScoreLabel(score)}\n🎯 Interest: ${interestLevel}% | Attraction: ${attractionProbability}%\n${personalityType ? `👤 Style: ${personalityEmoji} ${personalityType}` : ''}\n\nAnalyze your texts at convocoach.ai`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    const shareData = {
      title: isRoast ? `🔥 My ConvoCoach Roast` : `💬 My ConvoCoach Score: ${score.toFixed(1)}/10`,
      text: isRoast && roastText
        ? `🔥 "${roastText}" — Score: ${score.toFixed(1)}/10`
        : `My conversation score: ${score.toFixed(1)}/10 — ${getScoreLabel(score)}`,
      url: 'https://convocoach.ai',
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      handleCopyText();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* ─── The Card (for screenshot) ─── */}
      <div
        ref={cardRef}
        style={{
          background: C.ink,
          borderRadius: 22,
          padding: 'clamp(24px, 5vw, 36px)',
          position: 'relative',
          overflow: 'hidden',
          border: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        {/* Radial glow */}
        <div style={{
          position: 'absolute', right: -60, top: -60,
          width: 300, height: 300, borderRadius: '50%',
          background: `radial-gradient(circle, ${scColor}15, transparent 65%)`,
          pointerEvents: 'none',
        }} />

        {/* Brand */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 24, position: 'relative', zIndex: 1,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.red }} />
            <span style={{
              fontSize: 12, fontWeight: 800, color: `${C.cream}50`,
              fontFamily: "'Bricolage Grotesque', sans-serif",
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>ConvoCoach</span>
          </div>
          <span style={{
            fontSize: 10, color: `${C.cream}30`,
            fontFamily: "'DM Sans', sans-serif",
          }}>convocoach.ai</span>
        </div>

        {/* Score */}
        <div style={{ position: 'relative', zIndex: 1, marginBottom: 20 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, color: `${C.cream}30`,
            textTransform: 'uppercase', letterSpacing: '0.14em',
            fontFamily: 'monospace', marginBottom: 10,
          }}>
            {isRoast ? '🔥 Roast Mode' : 'Conversation Score'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{
              fontFamily: "'Bricolage Grotesque', sans-serif",
              fontSize: 'clamp(56px, 12vw, 72px)', fontWeight: 900,
              color: scColor, lineHeight: 1, letterSpacing: '-0.05em',
            }}>{(score || 0).toFixed(1)}</span>
            <span style={{
              fontSize: 22, color: `${C.cream}20`,
              fontFamily: "'Bricolage Grotesque', sans-serif",
            }}>/10</span>
          </div>
          <div style={{
            fontSize: 15, fontWeight: 800, color: scColor,
            fontFamily: "'Bricolage Grotesque', sans-serif",
            marginBottom: 6,
          }}>{getScoreLabel(score)}</div>
        </div>

        {/* Roast text (if roast mode) */}
        {isRoast && roastText && (
          <div style={{
            background: `${C.red}10`, border: `1px solid ${C.red}25`,
            borderRadius: 14, padding: '14px 18px', marginBottom: 20,
            position: 'relative', zIndex: 1,
          }}>
            <p style={{
              fontSize: 14, color: `${C.cream}70`, lineHeight: 1.7,
              fontStyle: 'italic', margin: 0, fontFamily: 'Georgia, serif',
            }}>"{roastText}"</p>
          </div>
        )}

        {/* Stats Row */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 16,
          position: 'relative', zIndex: 1,
        }}>
          {[
            { label: 'Their Interest', val: `${interestLevel}%`, color: '#A0426E' },
            { label: 'Attraction', val: `${attractionProbability}%`, color: C.amber },
            { label: 'Momentum', val: momentum === 'escalating' ? '↑ Rising' : momentum === 'dying' ? '↓ Fading' : '→ Flat', color: momentum === 'escalating' ? C.green : momentum === 'dying' ? C.red : C.amber },
          ].map((stat, i) => (
            <div key={i} style={{
              flex: 1, background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12, padding: '10px 12px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 9, color: `${C.cream}30`, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 5, fontFamily: 'monospace' }}>{stat.label}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: stat.color, fontFamily: "'Bricolage Grotesque', sans-serif", lineHeight: 1 }}>{stat.val}</div>
            </div>
          ))}
        </div>

        {/* Personality & Tags */}
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap',
          position: 'relative', zIndex: 1,
        }}>
          {personalityType && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '4px 10px',
              borderRadius: 6, background: `${C.teal}15`,
              color: C.teal, border: `1px solid ${C.teal}30`,
            }}>{personalityEmoji} {personalityType}</span>
          )}
          {tags.slice(0, 3).map((tag, i) => (
            <span key={i} style={{
              fontSize: 10, fontWeight: 600, padding: '4px 10px',
              borderRadius: 6, background: 'rgba(255,255,255,0.04)',
              color: `${C.cream}40`, border: '1px solid rgba(255,255,255,0.07)',
              textTransform: 'capitalize',
            }}>{tag.replace(/-/g, ' ')}</span>
          ))}
        </div>

        {/* Verdict */}
        {verdict && (
          <p style={{
            fontSize: 13, color: `${C.cream}40`, lineHeight: 1.7,
            fontStyle: 'italic', marginTop: 16, fontFamily: 'Georgia, serif',
            position: 'relative', zIndex: 1,
          }}>"{verdict}"</p>
        )}
      </div>

      {/* ─── Action Buttons ─── */}
      <div style={{ display: 'flex', gap: 8 }}>
        <motion.button
          onClick={handleDownload}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={downloading}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 12,
            background: C.ink, color: C.cream, border: `1.5px solid ${C.warm2}30`,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {downloading ? '⏳ Saving...' : '📥 Save as Image'}
        </motion.button>

        <motion.button
          onClick={handleShare}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: 12,
            background: scColor, color: '#fff', border: 'none',
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          📤 Share
        </motion.button>

        <motion.button
          onClick={handleCopyText}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          style={{
            padding: '12px 16px', borderRadius: 12,
            background: 'transparent', color: C.muted,
            border: `1.5px solid ${C.warm2}`,
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          {copied ? '✓' : '📋'}
        </motion.button>
      </div>
    </div>
  );
}
