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

const SNAP = { duration: 0.18, ease: [0.2, 0, 0.2, 1] } as const;

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

function ScoreRing({ score, size = 110 }: { score: number; size?: number }) {
  const r = size / 2 - 10;
  const circ = 2 * Math.PI * r;
  const pct = score / 100;
  const color = score >= 70 ? C.green : score >= 45 ? C.yellow : C.red;

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0, background: C.white, borderRadius: '50%', border: C.borderThin, boxShadow: C.shadowSm }}>
      <svg width={size} height={size} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.warm1} strokeWidth={8} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={8}
          strokeLinecap="round"
          initial={{ strokeDasharray: `0 ${circ}` }}
          animate={{ strokeDasharray: `${pct * circ} ${circ}` }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: size > 80 ? 28 : 18, fontWeight: 900, color: C.ink, fontFamily: "'DM Sans',sans-serif", lineHeight: 1, letterSpacing: '-0.04em' }}>{score}</span>
        <span style={{ fontSize: 10, color: C.muted, marginTop: 2, fontWeight: 800 }}>/ 100</span>
      </div>
    </div>
  );
}

function TraitBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = (value / 10) * 100;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: C.ink, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: "'DM Sans',sans-serif" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 900, color: C.ink, fontFamily: "'DM Sans',sans-serif" }}>{value.toFixed(1)}</span>
      </div>
      <div style={{ height: 12, background: C.warm1, border: C.borderThin, borderRadius: 6, overflow: 'hidden' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          style={{ height: '100%', background: color, borderRight: C.borderThin }}
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
      <div style={{ background: C.white, border: C.border, borderRadius: 20, padding: '24px', boxShadow: C.shadow }}>
        <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, marginBottom: 16 }}>Community Feedback</div>
        <div style={{ fontSize: 14, color: C.ink, fontWeight: 600 }}>Loading incoming data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ background: C.white, border: C.border, borderRadius: 20, padding: '32px 24px', boxShadow: C.shadow, textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>📭</div>
        <h3 style={{ fontSize: 20, color: C.ink, fontWeight: 900, marginBottom: 8, fontFamily: "'DM Sans',sans-serif" }}>No Feedback Yet</h3>
        <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, fontWeight: 500, maxWidth: 400, margin: '0 auto' }}>
          Share your Rizz Link to collect anonymous trait ratings and messages from others.
        </p>
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

  const traitColor = (val: number) => val >= 7 ? C.green : val >= 4.5 ? C.yellow : C.red;
  const dryRisk = averages.dryText >= 7 ? 'High' : averages.dryText >= 5 ? 'Medium' : 'Low';
  const dryColor = averages.dryText >= 7 ? C.red : averages.dryText >= 5 ? C.yellow : C.green;

  return (
    <div style={{ background: C.white, border: C.border, borderRadius: 24, overflow: 'hidden', boxShadow: C.shadow }}>
      
      {/* Header */}
      <div style={{ padding: '24px', borderBottom: C.borderThin, background: C.bgCream, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 11, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 900, fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.blue, border: '1px solid #000' }} />
          Anonymous Feedback
        </div>
        <div style={{ background: C.white, border: C.borderThin, padding: '4px 12px', borderRadius: 10, fontSize: 11, fontWeight: 900, color: C.ink, boxShadow: C.shadowSm }}>
          {data.total} Response{data.total !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={{ padding: '32px 24px' }}>
        {/* Score + Traits Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32, marginBottom: 32, alignItems: 'center' }}>
          
          {/* Left: Overall Ring & Dry Risk */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
              <ScoreRing score={data.rizzScore} size={120} />
              <span style={{ fontSize: 12, color: C.ink, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Aggregate Rizz Score</span>
            </div>
            
            <div style={{ background: C.bgCream, border: C.borderThin, borderRadius: 12, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: 220, boxShadow: C.shadowSm }}>
              <span style={{ fontSize: 12, color: C.ink, fontWeight: 900, textTransform: 'uppercase' }}>Dry Risk</span>
              <span style={{ fontSize: 12, fontWeight: 900, color: C.ink, background: dryColor, padding: '4px 12px', borderRadius: 8, border: C.borderThin }}>{dryRisk}</span>
            </div>
          </div>

          {/* Right: Trait Bars */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <TraitBar label="Humor" value={averages.humor} color={traitColor(averages.humor)} />
            <TraitBar label="Flirting" value={averages.flirting} color={traitColor(averages.flirting)} />
            <TraitBar label="Confidence" value={averages.confidence} color={traitColor(averages.confidence)} />
            <TraitBar label="Overall Impression" value={averages.overall} color={traitColor(averages.overall)} />
          </div>
        </div>

        {/* Radar Chart */}
        {data.total >= 3 && (
          <div style={{ height: 240, marginBottom: 32, background: C.bgCream, border: C.borderThin, borderRadius: 16, padding: '16px', boxShadow: C.shadowSm }}>
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke={C.ink} strokeOpacity={0.2} />
                <PolarAngleAxis dataKey="trait" tick={{ fill: C.ink, fontSize: 11, fontWeight: 900, fontFamily: "'DM Sans', sans-serif" }} />
                <Radar dataKey="score" stroke={C.ink} strokeWidth={3} fill={C.yellow} fillOpacity={0.8} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* AI Summary Button */}
        <div style={{ marginBottom: 24 }}>
          <motion.button
            whileHover={{ y: -2, boxShadow: C.shadowSm }} whileTap={{ y: 0, boxShadow: 'none' }}
            onClick={loadAI}
            style={{
              width: '100%', background: showAI ? C.white : C.blue,
              border: C.borderThin, borderRadius: 14, padding: '16px 20px',
              fontSize: 14, fontWeight: 900, color: showAI ? C.ink : C.white,
              cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: showAI ? 'none' : C.shadowSm, transition: 'background 0.2s',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>🤖</span> AI Perception Analysis
            </span>
            <span style={{ fontSize: 12, fontWeight: 800 }}>
              {aiLoading ? 'Analyzing...' : showAI ? '▲ Close' : '▼ Reveal'}
            </span>
          </motion.button>

          <AnimatePresence>
            {showAI && ai && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {!ai.hasEnoughData ? (
                    <div style={{ background: C.bgCream, padding: 16, borderRadius: 12, border: C.borderThin, fontWeight: 600, color: C.ink, fontSize: 13 }}>
                      Need at least 3 responses to generate an AI summary. Keep sharing your link.
                    </div>
                  ) : ai.summary ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      {[
                        { icon: '↑', label: 'Perceived Strength', text: ai.summary.strength, bg: C.green },
                        { icon: '↓', label: 'Perceived Weakness', text: ai.summary.weakness, bg: C.red },
                        { icon: '→', label: 'How to Improve', text: ai.summary.tip, bg: C.yellow },
                      ].map((item, i) => (
                        <div key={item.label} style={{ background: C.white, border: C.borderThin, borderRadius: 14, padding: '16px', boxShadow: C.shadowSm }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 8, background: item.bg, border: C.borderThin, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: C.ink, fontWeight: 900 }}>
                              {item.icon}
                            </div>
                            <div style={{ fontSize: 11, fontWeight: 900, color: C.ink, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
                          </div>
                          <h3 style={{ fontSize: 14, color: C.ink, lineHeight: 1.5, margin: 0, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{item.text}</h3>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: C.warm1, padding: 16, borderRadius: 12, border: C.borderThin, fontWeight: 600, color: C.ink, fontSize: 13 }}>
                      Unable to generate summary at this time.
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Anonymous Messages */}
        {data.messages.length > 0 && (
          <div style={{ borderTop: C.borderThin, paddingTop: 24 }}>
            <button
              onClick={() => setShowMessages(v => !v)}
              style={{
                width: '100%', background: 'none', border: 'none', padding: 0, 
                fontSize: 13, fontWeight: 900, color: C.ink, cursor: 'pointer', 
                fontFamily: "'DM Sans',sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}
            >
              <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>Anonymous Messages ({data.messages.length})</span>
              <span>{showMessages ? '▲' : '▼'}</span>
            </button>

            <AnimatePresence>
              {showMessages && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
                    {data.messages.slice(0, 15).map((m, i) => (
                      <div key={i} style={{
                        background: C.bgCream, border: C.borderThin, borderRadius: 12,
                        padding: '16px', fontSize: 14, color: C.ink, lineHeight: 1.5,
                        fontWeight: 600, boxShadow: C.shadowSm,
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