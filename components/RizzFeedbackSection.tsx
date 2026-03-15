'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Recharts radar chart for trait visualization
const RadarChart = dynamic(() => import('recharts').then(m => m.RadarChart), { ssr: false });
const PolarGrid = dynamic(() => import('recharts').then(m => m.PolarGrid), { ssr: false });
const PolarAngleAxis = dynamic(() => import('recharts').then(m => m.PolarAngleAxis), { ssr: false });
const Radar = dynamic(() => import('recharts').then(m => m.Radar), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(m => m.ResponsiveContainer), { ssr: false });

// ─── Design ──────────────────────────────────────────────────────────────────
const C = {
  bg: '#08080F', surface: 'rgba(255,255,255,0.03)', surfaceHi: 'rgba(255,255,255,0.055)',
  border: 'rgba(255,255,255,0.07)', borderHi: 'rgba(255,255,255,0.14)',
  text: '#F0EDE8', muted: 'rgba(240,237,232,0.3)', muted2: 'rgba(240,237,232,0.55)',
  coral: '#FF5B3A', coralLo: 'rgba(255,91,58,0.1)', coralHi: 'rgba(255,91,58,0.18)',
  violet: '#7B6CF6', violetLo: 'rgba(123,108,246,0.1)',
  green: '#4DEBA1', greenLo: 'rgba(77,235,161,0.08)',
  gold: '#F5C842', goldLo: 'rgba(245,200,66,0.08)',
};

interface FeedbackData {
  total: number;
  rizzScore: number;
  averages: {
    flirting: number; humor: number; confidence: number; dryText: number; overall: number;
  };
  messages: Array<{ message: string; createdAt: string }>;
}

interface AISummary {
  hasEnoughData: boolean;
  summary: { strength: string; weakness: string; tip: string } | null;
}

function ScoreRing({ score, size = 100 }: { score: number; size?: number }) {
  const r = size / 2 - 8;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 70 ? C.green : score >= 45 ? C.gold : C.coral;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${pct * circ} ${circ}` }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size > 80 ? 22 : 16, fontWeight: 900, color, fontFamily: "'Bricolage Grotesque',sans-serif", lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 9, color: C.muted, marginTop: 2 }}>/ 100</span>
      </div>
    </div>
  );
}

function TraitBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = (value / 10) * 100;
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 12, color: C.muted2, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color, fontFamily: 'monospace' }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ height: '100%', background: color, borderRadius: 3 }}
        />
      </div>
    </div>
  );
}

export default function RizzFeedbackSection() {
  const [data, setData] = useState<FeedbackData | null>(null);
  const [ai, setAI] = useState<AISummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAILoading] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    fetch('/api/rizz-feedback')
      .then(r => r.json())
      .then(d => {
        if (d.success && d.total > 0) setData(d);
      })
      .finally(() => setLoading(false));
  }, []);

  const loadAI = async () => {
    if (ai) { setShowAI(true); return; }
    setAILoading(true);
    try {
      const res = await fetch('/api/rizz-feedback/summary');
      const d = await res.json();
      if (d.success) setAI(d);
      setShowAI(true);
    } finally {
      setAILoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '24px', marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: 16 }}>Rizz Feedback</div>
        <div style={{ fontSize: 13, color: C.muted }}>Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '24px 22px', marginBottom: 10 }}>
        <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: 14 }}>Rizz Feedback</div>
        <div style={{ fontSize: 13, color: C.muted2, lineHeight: 1.6 }}>
          No feedback yet. Share your Rizz Link to collect anonymous trait ratings from others.
        </div>
      </div>
    );
  }

  const { averages } = data;

  // Radar chart data (normalize scores to 0-100 for display)
  const radarData = [
    { trait: 'Flirting', score: averages.flirting * 10 },
    { trait: 'Humor', score: averages.humor * 10 },
    { trait: 'Confidence', score: averages.confidence * 10 },
    { trait: 'Overall', score: averages.overall * 10 },
    { trait: 'Not Dry', score: (10 - averages.dryText) * 10 },
  ];

  const traitColor = (val: number) => val >= 7 ? C.green : val >= 4.5 ? C.gold : C.coral;
  const dryRisk = averages.dryText >= 7 ? 'High' : averages.dryText >= 5 ? 'Medium' : 'Low';
  const dryColor = averages.dryText >= 7 ? C.coral : averages.dryText >= 5 ? C.gold : C.green;

  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px', overflow: 'hidden' }}>
        <div style={{ fontSize: 9, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 800, marginBottom: 18, fontFamily: "'DM Sans',sans-serif" }}>
          Rizz Feedback · {data.total} response{data.total !== 1 ? 's' : ''}
        </div>

        {/* Score + Traits */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>
          {/* Ring */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <ScoreRing score={data.rizzScore} size={96} />
            <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Rizz Score</span>
          </div>

          {/* Trait bars */}
          <div style={{ flex: 1, minWidth: 180, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <TraitBar label="Humor" value={averages.humor} color={traitColor(averages.humor)} />
            <TraitBar label="Flirting" value={averages.flirting} color={traitColor(averages.flirting)} />
            <TraitBar label="Confidence" value={averages.confidence} color={traitColor(averages.confidence)} />
            <TraitBar label="Overall Rizz" value={averages.overall} color={traitColor(averages.overall)} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: C.muted2, fontWeight: 500 }}>Dry Texting Risk</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: dryColor, background: dryColor + '18', padding: '2px 10px', borderRadius: 6 }}>{dryRisk}</span>
            </div>
          </div>
        </div>

        {/* Radar Chart */}
        {data.total >= 3 && (
          <div style={{ height: 180, marginBottom: 16 }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis dataKey="trait" tick={{ fill: 'rgba(240,237,232,0.35)', fontSize: 10, fontWeight: 600 }} />
                <Radar dataKey="score" stroke={C.violet} fill={C.violet} fillOpacity={0.15} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Summary */}
        <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginBottom: 16 }}>
          <button
            onClick={loadAI}
            style={{
              width: '100%', background: showAI ? C.surfaceHi : C.violetLo,
              border: `1px solid ${showAI ? C.border : C.violet + '30'}`,
              borderRadius: 12, padding: '11px 18px',
              fontSize: 12, fontWeight: 700, color: showAI ? C.muted2 : C.violet,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <span>✦ AI Social Perception Summary</span>
            <span style={{ fontSize: 11, color: C.muted }}>
              {aiLoading ? 'Analyzing...' : showAI ? '▲ Hide' : '▼ Show'}
            </span>
          </button>

          <AnimatePresence>
            {showAI && ai && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {!ai.hasEnoughData ? (
                    <p style={{ fontSize: 12, color: C.muted2 }}>Need at least 3 responses for an AI summary.</p>
                  ) : ai.summary ? (
                    [
                      { icon: '↑', label: 'Strength', text: ai.summary.strength, color: C.green },
                      { icon: '↓', label: 'Weakness', text: ai.summary.weakness, color: C.coral },
                      { icon: '→', label: 'Improve', text: ai.summary.tip, color: C.gold },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <div style={{ width: 22, height: 22, borderRadius: 7, background: item.color + '15', border: `1px solid ${item.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: item.color, flexShrink: 0 }}>
                          {item.icon}
                        </div>
                        <div>
                          <div style={{ fontSize: 9, fontWeight: 800, color: item.color, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{item.label}</div>
                          <p style={{ fontSize: 12, color: C.muted2, lineHeight: 1.6, margin: 0 }}>{item.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p style={{ fontSize: 12, color: C.muted2 }}>Unable to generate summary at this time.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Anonymous Messages */}
        {data.messages.length > 0 && (
          <div>
            <button
              onClick={() => setShowMessages(v => !v)}
              style={{
                background: 'none', border: 'none', padding: 0, fontSize: 11, fontWeight: 700,
                color: C.muted2, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
              }}
            >
              {showMessages ? '▲ Hide' : '▼ Show'} {data.messages.length} anonymous message{data.messages.length !== 1 ? 's' : ''}
            </button>

            <AnimatePresence>
              {showMessages && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.messages.slice(0, 15).map((m, i) => (
                      <div key={i} style={{
                        background: C.surfaceHi, border: `1px solid ${C.border}`, borderRadius: 10,
                        padding: '10px 14px', fontSize: 12, color: C.muted2, lineHeight: 1.5,
                        borderLeft: `2px solid ${C.violet}30`,
                      }}>
                        "{m.message}"
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
