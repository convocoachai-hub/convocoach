// app/results/page.tsx — REPLACE your entire existing file

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface AnalysisResult {
  conversationScore: number;
  interestLevel: number;
  attractionProbability: number;
  humorScore: number;
  confidenceScore: number;
  engagementScore: number;
  curiosityScore: number;
  emotionalTone: string;
  conversationMomentum: 'escalating' | 'neutral' | 'dying';
  replyEnergyMatch: 'matched' | 'low' | 'high';
  strengths: string[];
  mistakes: string[];
  suggestions: string[];
  possibleNextMoves: string[];
  missedOpportunities: { moment: string; suggestion: string }[];
  attractionSignals: string[];
  roastMode: boolean;
  roastText?: string;
}

const MOMENTUM_CONFIG = {
  escalating: { label: '🔥 Escalating', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' },
  neutral: { label: '😐 Neutral', color: '#64748b', bg: 'rgba(100,116,139,0.1)', border: 'rgba(100,116,139,0.3)' },
  dying: { label: '📉 Dying', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
};

const ENERGY_CONFIG = {
  matched: { label: '⚡ Energy Matched', color: '#10b981' },
  low: { label: '🔋 Low Energy Reply', color: '#ef4444' },
  high: { label: '✨ High Energy Reply', color: '#8b5cf6' },
};

function CircleScore({ value, max, label, color }: { value: number; max: number; label: string; color: string }) {
  const pct = value / max;
  const r = 38;
  const circ = 2 * Math.PI * r;
  const dash = pct * circ;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" />
          <motion.circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke={color}
            strokeWidth="7"
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-xl font-black"
            style={{ color, fontFamily: 'Syne, sans-serif' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {max === 10 ? value.toFixed(1) : `${Math.round(value)}%`}
          </motion.span>
        </div>
      </div>
      <span className="text-[var(--text-muted)] text-xs text-center mt-2 leading-tight">{label}</span>
    </div>
  );
}

function BarScore({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-[var(--text-secondary)] text-sm">{label}</span>
        <span className="text-white text-sm font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>{value.toFixed(1)}</span>
      </div>
      <div className="progress-track h-2">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${(value / 10) * 100}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const router = useRouter();
  const [results, setResults] = useState<AnalysisResult | null>(null);
  const [tab, setTab] = useState<'scores' | 'feedback' | 'moves'>('scores');

  useEffect(() => {
    const saved = localStorage.getItem('cc_results');
    if (!saved) { router.push('/upload'); return; }
    setResults(JSON.parse(saved));
  }, [router]);

  if (!results) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-[var(--violet)] border-t-transparent animate-spin" />
    </div>
  );

  const momentum = MOMENTUM_CONFIG[results.conversationMomentum] || MOMENTUM_CONFIG.neutral;
  const energy = ENERGY_CONFIG[results.replyEnergyMatch] || ENERGY_CONFIG.matched;
  const isPaid = false; // Replace with real session check

  return (
    <div className="min-h-screen bg-[var(--bg-void)] px-4 py-16 pb-28 md:pb-16">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
            Your Analysis
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">Here&apos;s what the AI found in your conversation</p>
        </motion.div>

        {/* Primary Scores Row */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass glow-violet rounded-3xl p-6 mb-5"
        >
          <div className="flex justify-around">
            <CircleScore value={results.conversationScore} max={10} label="Conversation Score" color="var(--violet-bright)" />
            <CircleScore value={results.interestLevel} max={100} label="Interest Level" color="var(--pink)" />
            <CircleScore value={results.attractionProbability} max={100} label="Attraction %" color="var(--gold)" />
          </div>
        </motion.div>

        {/* Status Pills Row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-3 mb-5"
        >
          <div
            className="flex-1 rounded-2xl px-4 py-3 text-center text-sm font-semibold border"
            style={{ background: momentum.bg, borderColor: momentum.border, color: momentum.color }}
          >
            {momentum.label}
          </div>
          <div
            className="flex-1 rounded-2xl px-4 py-3 text-center text-sm font-semibold border border-[var(--border-subtle)]"
            style={{ color: energy.color }}
          >
            {energy.label}
          </div>
        </motion.div>

        {/* Roast */}
        <AnimatePresence>
          {results.roastMode && results.roastText && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 rounded-3xl p-6 border border-orange-500/20"
              style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.06), rgba(245,158,11,0.06))' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">🔥</span>
                <span className="text-orange-300 font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>The Roast</span>
              </div>
              <p className="text-orange-100 leading-relaxed italic text-sm">&ldquo;{results.roastText}&rdquo;</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex gap-2 mb-5 p-1 glass rounded-2xl border border-[var(--border-subtle)]"
        >
          {(['scores', 'feedback', 'moves'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all capitalize ${
                tab === t ? 'bg-[var(--electric)] text-white' : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              {t === 'scores' ? '📊 Scores' : t === 'feedback' ? '💡 Feedback' : '🎯 Next Moves'}
            </button>
          ))}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* SCORES TAB */}
          {tab === 'scores' && (
            <motion.div key="scores" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="glass rounded-3xl p-6 border border-[var(--border-subtle)] space-y-5">
                <BarScore label="😂 Humor" value={results.humorScore} color="linear-gradient(90deg, #f59e0b, #fcd34d)" />
                <BarScore label="💪 Confidence" value={results.confidenceScore} color="linear-gradient(90deg, #8b5cf6, #a78bfa)" />
                <BarScore label="⚡ Engagement" value={results.engagementScore} color="linear-gradient(90deg, #ec4899, #f9a8d4)" />
                <BarScore label="🔍 Curiosity" value={results.curiosityScore} color="linear-gradient(90deg, #06b6d4, #67e8f9)" />
              </div>

              {/* Attraction Signals */}
              {results.attractionSignals?.length > 0 && (
                <div className="mt-4 glass rounded-3xl p-5 border border-pink-500/20">
                  <h3 className="text-pink-300 font-semibold mb-3 text-sm flex items-center gap-2">
                    💘 Attraction Signals Detected
                  </h3>
                  <ul className="space-y-2">
                    {results.attractionSignals.map((s, i) => (
                      <li key={i} className="text-[var(--text-secondary)] text-sm flex items-start gap-2">
                        <span className="text-pink-400 mt-0.5">→</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Missed Opportunities - premium locked */}
              <div className="mt-4 glass rounded-3xl p-5 border border-[var(--border-subtle)] relative overflow-hidden">
                <h3 className="text-[var(--gold)] font-semibold mb-3 text-sm flex items-center gap-2">
                  🎯 Missed Opportunities ({results.missedOpportunities?.length || 0} detected)
                </h3>
                {results.missedOpportunities?.slice(0, 1).map((m, i) => (
                  <div key={i} className="text-[var(--text-secondary)] text-sm mb-3">
                    <span className="text-[var(--red)]">What happened: </span>{m.moment}
                    <br />
                    <span className="text-[var(--green)]">Better move: </span>{m.suggestion}
                  </div>
                ))}
                {!isPaid && results.missedOpportunities?.length > 1 && (
                  <div className="locked-overlay absolute inset-0 flex items-center justify-center rounded-3xl">
                    <div className="text-center">
                      <div className="lock-badge px-4 py-2 rounded-xl text-sm font-semibold mb-2 inline-block">
                        🔒 {results.missedOpportunities.length - 1} more locked
                      </div>
                      <p className="text-[var(--text-muted)] text-xs">Upgrade to see all</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* FEEDBACK TAB */}
          {tab === 'feedback' && (
            <motion.div key="feedback" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              {results.strengths.length > 0 && (
                <div className="glass rounded-3xl p-5 border border-green-500/20">
                  <h3 className="text-[var(--green)] font-semibold mb-3 text-sm">✅ What You Did Well</h3>
                  <ul className="space-y-2">
                    {results.strengths.map((s, i) => (
                      <li key={i} className="text-[var(--text-secondary)] text-sm flex items-start gap-2">
                        <span className="text-[var(--green)] mt-0.5">•</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.mistakes.length > 0 && (
                <div className="glass rounded-3xl p-5 border border-red-500/20">
                  <h3 className="text-[var(--red)] font-semibold mb-3 text-sm">❌ What Hurt You</h3>
                  <ul className="space-y-2">
                    {results.mistakes.map((m, i) => (
                      <li key={i} className="text-[var(--text-secondary)] text-sm flex items-start gap-2">
                        <span className="text-[var(--red)] mt-0.5">•</span> {m}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {results.suggestions.length > 0 && (
                <div className="glass rounded-3xl p-5 border border-blue-500/20">
                  <h3 className="text-blue-300 font-semibold mb-3 text-sm">💡 How to Improve</h3>
                  <ul className="space-y-3">
                    {results.suggestions.map((s, i) => (
                      <li key={i} className="text-[var(--text-secondary)] text-sm flex items-start gap-2">
                        <span className="text-blue-400 font-bold mt-0.5 flex-shrink-0">{i + 1}.</span> {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* NEXT MOVES TAB */}
          {tab === 'moves' && (
            <motion.div key="moves" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-3">
              <p className="text-[var(--text-secondary)] text-sm mb-4">Suggested messages you could send next:</p>
              {results.possibleNextMoves.map((move, i) => (
                <div key={i} className="glass glass-hover rounded-2xl p-5 border border-[var(--border-subtle)]">
                  <div className="flex items-start gap-3">
                    <span className="bg-[var(--bg-elevated)] text-[var(--violet-bright)] rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold flex-shrink-0">
                      {i + 1}
                    </span>
                    <p className="text-[var(--text-primary)] text-sm leading-relaxed">{move}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex gap-3 mt-8"
        >
          <Link href="/upload" className="flex-1">
            <div className="btn-ghost text-white text-center py-4 rounded-2xl text-sm font-semibold w-full">
              📱 Analyze Another
            </div>
          </Link>
          <Link href="/practice" className="flex-1">
            <div className="btn-primary text-white text-center py-4 rounded-2xl text-sm font-semibold w-full">
              🎭 Practice Now
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}