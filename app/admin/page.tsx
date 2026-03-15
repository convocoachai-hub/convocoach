'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface AdminUser {
  _id: string;
  name: string;
  email: string;
  image: string | null;
  subscriptionStatus: 'free' | 'paid' | 'lifetime';
  freeTriesUsed: number;
  analysisCount: number;
  practiceCount: number;
  skillPoints: number;
  createdAt: string;
}
interface UserDetail {
  user: AdminUser & { subscriptionExpiry?: string; razorpayPaymentId?: string; practiceMessageCount: number };
  analyses: Array<{ _id: string; conversationScore: number; interestLevel: number; attractionProbability: number; conversationMomentum: string; context: string; inputMode: string; roastMode: boolean; createdAt: string }>;
  sessions: Array<{ _id: string; characterType: string; scenarioCategory: string; difficulty: string; messageCount: number; currentInterest: number; createdAt: string }>;
  stats: { totalAnalyses: number; totalSessions: number; avgScore: number };
}
interface Platform {
  totalUsers: number; totalFree: number; totalPaid: number;
  totalAnalyses: number; totalPractice: number; conversionRate: number;
  growth: { newUsers24h: number; newUsers7d: number; newUsers30d: number; analyses24h: number; analyses7d: number };
  activityData: { date: string; analyses: number; signups: number }[];
}
interface AdminData {
  platform: Platform;
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
  recentSignups: { name: string; email: string; createdAt: string; subscriptionStatus: string; skillPoints: number }[];
  topUsers: { name: string; email: string; skillPoints: number; subscriptionStatus: string }[];
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const G = `
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&family=Syne:wght@400;500;600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#080810;color:#E2E0DC;font-family:'Syne',sans-serif;-webkit-font-smoothing:antialiased;}
.mono{font-family:'Geist Mono',monospace;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.08);border-radius:99px;}
input,select,textarea,button{font-family:'Syne',sans-serif;}
button{cursor:pointer;-webkit-tap-highlight-color:transparent;}
::selection{background:rgba(99,102,241,0.3);}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.spin{animation:spin 0.75s linear infinite;}
.blink{animation:pulse 2.2s ease infinite;}
.skeleton{background:linear-gradient(90deg,rgba(255,255,255,0.04) 25%,rgba(255,255,255,0.08) 50%,rgba(255,255,255,0.04) 75%);background-size:200% 100%;animation:shimmer 1.6s infinite;}
@media(hover:hover){
  .r-hover:hover{background:rgba(255,255,255,0.022)!important;transition:background 0.12s;}
  .btn-ghost:hover{opacity:0.72;}
  .chip-btn:hover{border-color:rgba(255,255,255,0.2)!important;}
}
@media(max-width:860px){
  .sidebar{display:none!important;}
  .hide-md{display:none!important;}
  .stat-grid{grid-template-columns:1fr 1fr!important;}
}
@media(max-width:480px){
  .stat-grid{grid-template-columns:1fr!important;}
  .table-cols{grid-template-columns:1fr auto auto!important;}
  .col-analyses,.col-joined{display:none!important;}
}
`;

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const T = {
  bg: '#080810', surface: 'rgba(255,255,255,0.025)', surfaceHi: 'rgba(255,255,255,0.045)',
  border: 'rgba(255,255,255,0.07)', borderHi: 'rgba(255,255,255,0.14)',
  text: '#E2E0DC', muted: 'rgba(226,224,220,0.32)', muted2: 'rgba(226,224,220,0.55)',
  indigo: '#6366F1', indigoBr: '#818CF8', indigoLo: 'rgba(99,102,241,0.12)',
  green: '#4ADE80', greenLo: 'rgba(74,222,128,0.1)',
  gold: '#FBBF24', goldLo: 'rgba(251,191,36,0.1)',
  pink: '#F472B6', pinkLo: 'rgba(244,114,182,0.1)',
  red: '#F87171', redLo: 'rgba(248,113,113,0.1)',
  orange: '#FB923C', orangeLo: 'rgba(251,146,60,0.1)',
  cyan: '#22D3EE', cyanLo: 'rgba(34,211,238,0.1)',
};

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Spinner({ s = 22 }: { s?: number }) {
  return <div style={{ width: s, height: s, border: `2px solid ${T.indigoLo}`, borderTopColor: T.indigo, borderRadius: '50%' }} className="spin" />;
}

function Badge({ status }: { status: string }) {
  const m: Record<string, [string, string]> = {
    free: ['rgba(148,163,184,0.1)', '#94A3B8'],
    paid: [T.greenLo, T.green],
    lifetime: [T.goldLo, T.gold],
  };
  const [bg, c] = m[status] ?? m.free;
  return <span className="mono" style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: bg, color: c, textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>{status}</span>;
}

function Avatar({ name, image, size = 30 }: { name: string; image: string | null; size?: number }) {
  const i = (name || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  if (image) return <img src={image} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  return <div style={{ width: size, height: size, borderRadius: '50%', background: T.indigoLo, border: `1px solid rgba(99,102,241,0.22)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.35, fontWeight: 700, color: T.indigoBr, flexShrink: 0 }}>{i}</div>;
}

function StatCard({ label, value, sub, color = T.indigoBr, delta, icon }: { label: string; value: string | number; sub?: string; color?: string; delta?: number; icon?: string }) {
  return (
    <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: -12, right: -6, fontSize: 48, opacity: 0.05, fontWeight: 800, color, lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{icon}</div>
      <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8 }}>{label}</div>
      <div className="mono" style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1, marginBottom: 6 }}>{value}</div>
      {(sub || delta != null) && (
        <div style={{ fontSize: 11, color: delta != null ? (delta >= 0 ? T.green : T.red) : T.muted }}>
          {delta != null ? `${delta >= 0 ? '+' : ''}${delta} today` : sub}
        </div>
      )}
    </div>
  );
}

function MiniBar({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 32 }}>
      {data.map((v, i) => (
        <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.012, duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          style={{ flex: 1, height: `${Math.max(3, (v / max) * 32)}px`, background: color, borderRadius: '2px 2px 1px 1px', opacity: 0.4 + (i / data.length) * 0.6, transformOrigin: 'bottom' }} />
      ))}
    </div>
  );
}

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16 }}
      style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, maxWidth: 340,
        background: ok ? T.greenLo : T.redLo, border: `1px solid ${ok ? T.green + '40' : T.red + '40'}`, color: ok ? T.green : T.red, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
      {ok ? '✓ ' : '✗ '}{msg}
    </motion.div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.86)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.94, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        style={{ background: '#0F0F1A', border: `1px solid ${T.borderHi}`, borderRadius: 20, maxWidth: 420, width: '100%', padding: '26px 24px 22px' }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Confirm({ msg, sub, onYes, onNo, danger = true }: { msg: string; sub?: string; onYes: () => void; onNo: () => void; danger?: boolean }) {
  return (
    <Modal onClose={onNo}>
      <p style={{ fontSize: 15, fontWeight: 600, color: T.text, marginBottom: sub ? 8 : 20 }}>{msg}</p>
      {sub && <p style={{ fontSize: 13, color: T.muted2, marginBottom: 22, lineHeight: 1.6 }}>{sub}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onNo} style={{ flex: 1, padding: '10px', borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 13, fontWeight: 600 }}>Cancel</button>
        <button onClick={onYes} style={{ flex: 1, padding: '10px', borderRadius: 10, background: danger ? T.redLo : T.greenLo, border: `1px solid ${danger ? T.red + '40' : T.green + '40'}`, color: danger ? T.red : T.green, fontSize: 13, fontWeight: 700 }}>Confirm</button>
      </div>
    </Modal>
  );
}

function fmtDate(d: string, short = false) {
  return new Date(d).toLocaleDateString('en-US', short
    ? { month: 'short', day: 'numeric' }
    : { month: 'short', day: 'numeric', year: '2-digit' });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getLevel(pts: number): { name: string; color: string } {
  if (pts >= 300) return { name: 'Elite Charmer', color: T.gold };
  if (pts >= 150) return { name: 'Smooth', color: T.indigo };
  if (pts >= 50)  return { name: 'Beginner', color: T.cyan };
  return { name: 'Dry Texter', color: T.muted2 };
}

// ─── FEATURE 1: User Detail Slide-over ───────────────────────────────────────
function UserDetailPanel({ userId, onClose, onAction }: { userId: string; onClose: () => void; onAction: () => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actTab, setActTab] = useState<'overview' | 'analyses' | 'sessions'>('overview');
  const [actionLoading, setActionLoading] = useState(false);
  const [confirm, setConfirm] = useState<{ msg: string; sub?: string; fn: () => void; danger?: boolean } | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [ptsInput, setPtsInput] = useState('');
  const [ptsMode, setPtsMode] = useState<'set' | 'add'>('add');

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    fetch(`/api/admin?detail=${userId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setDetail(d); })
      .finally(() => setLoading(false));
  }, [userId]);

  const callAction = async (action: string, value?: any) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Done', true);
        // Reload detail
        const r2 = await fetch(`/api/admin?detail=${userId}`);
        const d2 = await r2.json();
        if (d2.success) setDetail(d2);
        onAction();
      } else throw new Error(json.error);
    } catch (e: any) { showToast(e.message || 'Failed', false); }
    finally { setActionLoading(false); }
  };

  const u = detail?.user;
  const level = u ? getLevel(u.skillPoints) : null;

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', stiffness: 280, damping: 32 }}
      style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'min(520px, 100vw)', background: '#0C0C18', borderLeft: `1px solid ${T.borderHi}`, zIndex: 700, display: 'flex', flexDirection: 'column', boxShadow: '-20px 0 60px rgba(0,0,0,0.6)' }}>

      <AnimatePresence>{toast && <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10 }}><Toast msg={toast.msg} ok={toast.ok} /></div>}</AnimatePresence>
      <AnimatePresence>{confirm && <Confirm msg={confirm.msg} sub={confirm.sub} danger={confirm.danger} onYes={() => { confirm.fn(); setConfirm(null); }} onNo={() => setConfirm(null)} />}</AnimatePresence>

      {/* Header */}
      <div style={{ padding: '18px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <button onClick={onClose} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted2, fontSize: 16, flexShrink: 0 }}>←</button>
        {loading ? <div style={{ width: 160, height: 18, borderRadius: 6 }} className="skeleton" /> : (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u?.name || 'Unknown'}</div>
            <div className="mono" style={{ fontSize: 10, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u?.email}</div>
          </div>
        )}
        {!loading && u && <Badge status={u.subscriptionStatus} />}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Spinner /></div>
      ) : !detail ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.muted }}>User not found</div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Stats strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, borderBottom: `1px solid ${T.border}`, background: T.border }}>
            {[
              { label: 'Score', value: detail.stats.avgScore.toFixed(1), color: T.indigoBr },
              { label: 'Analyses', value: detail.stats.totalAnalyses, color: T.pink },
              { label: 'Sessions', value: detail.stats.totalSessions, color: T.orange },
              { label: 'Pts', value: u!.skillPoints, color: level!.color },
            ].map(s => (
              <div key={s.label} style={{ background: '#0C0C18', padding: '14px 0', textAlign: 'center' }}>
                <div className="mono" style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.09em', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Level badge */}
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ fontSize: 11, color: T.muted }}>Level:</div>
              <span style={{ fontSize: 11, fontWeight: 700, color: level!.color, background: level!.color + '15', padding: '3px 10px', borderRadius: 6, letterSpacing: '0.04em' }}>{level!.name}</span>
            </div>
            <div className="mono" style={{ fontSize: 11, color: T.muted }}>
              joined {fmtDate(u!.createdAt)}
            </div>
          </div>

          {/* Tab nav */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, background: T.surface }}>
            {(['overview', 'analyses', 'sessions'] as const).map(t => (
              <button key={t} onClick={() => setActTab(t)}
                style={{ flex: 1, padding: '11px 8px', background: 'transparent', border: 'none', borderBottom: `2px solid ${actTab === t ? T.indigo : 'transparent'}`, color: actTab === t ? T.indigoBr : T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: '16px 18px' }}>
            {/* OVERVIEW TAB */}
            {actTab === 'overview' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Account info */}
                <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Account</div>
                  {[
                    { label: 'Free tries used', value: `${u!.freeTriesUsed} / 3` },
                    { label: 'Subscription', value: u!.subscriptionStatus },
                    { label: 'Expiry', value: u!.subscriptionExpiry ? fmtDate(u!.subscriptionExpiry) : '—' },
                    { label: 'Payment ID', value: u!.razorpayPaymentId ? u!.razorpayPaymentId.slice(0, 16) + '…' : '—' },
                    { label: 'Practice msgs', value: u!.practiceMessageCount ?? 0 },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: `1px solid ${T.border}` }}>
                      <span style={{ fontSize: 12, color: T.muted }}>{r.label}</span>
                      <span className="mono" style={{ fontSize: 12, color: T.text }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* FEATURE 2: Points management inline */}
                <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Points Management</div>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    {(['add', 'set'] as const).map(m => (
                      <button key={m} onClick={() => setPtsMode(m)}
                        style={{ flex: 1, padding: '7px', borderRadius: 8, background: ptsMode === m ? T.indigoLo : 'transparent', border: `1px solid ${ptsMode === m ? T.indigo + '50' : T.border}`, color: ptsMode === m ? T.indigoBr : T.muted, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', cursor: 'pointer', transition: 'all 0.15s' }}>
                        {m === 'add' ? '+ Add' : '= Set'}
                      </button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input type="number" value={ptsInput} onChange={e => setPtsInput(e.target.value)}
                      placeholder={ptsMode === 'add' ? 'Points to add…' : 'Set to…'}
                      style={{ flex: 1, background: T.surface, border: `1px solid ${T.border}`, borderRadius: 9, padding: '9px 12px', color: T.text, fontSize: 13, outline: 'none' }}
                      onFocus={e => e.target.style.borderColor = T.indigo + '60'}
                      onBlur={e => e.target.style.borderColor = T.border} />
                    <button disabled={!ptsInput || actionLoading}
                      onClick={() => callAction(ptsMode === 'add' ? 'addPoints' : 'setPoints', parseInt(ptsInput) || 0)}
                      style={{ padding: '9px 16px', borderRadius: 9, background: T.indigoLo, border: `1px solid ${T.indigo}50`, color: T.indigoBr, fontSize: 12, fontWeight: 700, cursor: 'pointer', opacity: !ptsInput ? 0.5 : 1 }}>
                      {actionLoading ? '…' : 'Apply'}
                    </button>
                  </div>
                </div>

                {/* FEATURE 3: Quick actions grid */}
                <div style={{ background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Quick Actions</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: u!.subscriptionStatus !== 'free' ? '↓ Remove Premium' : '★ Grant Premium', color: u!.subscriptionStatus !== 'free' ? T.muted2 : T.green, bg: u!.subscriptionStatus !== 'free' ? T.surface : T.greenLo, border: u!.subscriptionStatus !== 'free' ? T.border : T.green + '40', action: () => callAction('togglePremium') },
                      { label: '⊕ Lifetime', color: T.gold, bg: T.goldLo, border: T.gold + '40', action: () => setConfirm({ msg: 'Grant lifetime access?', sub: `${u!.email} will get unlimited access forever.`, danger: false, fn: () => callAction('setStatus', 'lifetime') }) },
                      { label: '↺ Reset Trials', color: T.cyan, bg: T.cyanLo, border: T.cyan + '40', action: () => callAction('resetTrials') },
                      { label: '↺ Reset Points', color: T.orange, bg: T.orangeLo, border: T.orange + '40', action: () => setConfirm({ msg: 'Reset skill points to 0?', danger: true, fn: () => callAction('resetPoints') }) },
                      { label: '🗑 Clear Analyses', color: T.red, bg: T.redLo, border: T.red + '40', action: () => setConfirm({ msg: 'Delete all analyses?', sub: 'This cannot be undone.', danger: true, fn: () => callAction('clearAnalyses') }) },
                      { label: '🗑 Clear Practice', color: T.red, bg: T.redLo, border: T.red + '40', action: () => setConfirm({ msg: 'Delete all practice sessions?', sub: 'This cannot be undone.', danger: true, fn: () => callAction('clearPractice') }) },
                    ].map(a => (
                      <button key={a.label} onClick={a.action} disabled={actionLoading} className="btn-ghost"
                        style={{ padding: '10px 12px', borderRadius: 10, background: a.bg, border: `1px solid ${a.border}`, color: a.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', textAlign: 'left', transition: 'opacity 0.14s', opacity: actionLoading ? 0.5 : 1 }}>
                        {a.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FEATURE 4: Danger zone */}
                <div style={{ background: 'rgba(248,113,113,0.04)', borderRadius: 12, border: `1px solid ${T.red}25`, padding: '14px 16px' }}>
                  <div style={{ fontSize: 10, color: T.red, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>⚠ Danger Zone</div>
                  <button onClick={() => setConfirm({ msg: `Permanently delete ${u!.email}?`, sub: 'Deletes the user + ALL their analyses and practice sessions. This cannot be undone.', danger: true, fn: () => callAction('deleteUser') })}
                    style={{ width: '100%', padding: '10px', borderRadius: 10, background: T.redLo, border: `1px solid ${T.red}40`, color: T.red, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                    Delete Account & All Data
                  </button>
                </div>
              </div>
            )}

            {/* ANALYSES TAB */}
            {actTab === 'analyses' && (
              <div>
                {detail.analyses.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted, fontSize: 13 }}>No analyses yet</div>
                ) : detail.analyses.map((a, i) => (
                  <div key={a._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < detail.analyses.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: T.indigoLo, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: a.conversationScore >= 7 ? T.green : a.conversationScore >= 5 ? T.gold : T.red }}>{a.conversationScore.toFixed(1)}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: T.surface, color: T.muted2, textTransform: 'capitalize' }}>{a.context}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: T.surface, color: T.muted2, textTransform: 'capitalize' }}>{a.inputMode}</span>
                        {a.roastMode && <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: T.redLo, color: T.red }}>roast</span>}
                      </div>
                      <div className="mono" style={{ fontSize: 10, color: T.muted }}>
                        Interest {a.interestLevel}% · Attraction {a.attractionProbability}% · {a.conversationMomentum}
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: T.muted, flexShrink: 0, textAlign: 'right' }}>
                      <div>{fmtDate(a.createdAt, true)}</div>
                      <div style={{ color: T.muted + '80' }}>{fmtTime(a.createdAt)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* SESSIONS TAB */}
            {actTab === 'sessions' && (
              <div>
                {detail.sessions.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted, fontSize: 13 }}>No practice sessions yet</div>
                ) : detail.sessions.map((s, i) => (
                  <div key={s._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 0', borderBottom: i < detail.sessions.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: T.orangeLo, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 18 }}>
                      {s.scenarioCategory === 'dating' ? '💘' : s.scenarioCategory === 'professional' ? '💼' : '🫂'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'capitalize', marginBottom: 2 }}>{s.characterType?.replace(/_/g, ' ') || '—'}</div>
                      <div className="mono" style={{ fontSize: 10, color: T.muted }}>
                        {s.messageCount} msgs · interest {s.currentInterest}% · {s.difficulty}
                      </div>
                    </div>
                    <div className="mono" style={{ fontSize: 10, color: T.muted, flexShrink: 0, textAlign: 'right' }}>
                      <div>{fmtDate(s.createdAt, true)}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── FEATURE 5: Bulk Actions bar ─────────────────────────────────────────────
function BulkBar({ selected, onClear, onBulkAction }: { selected: string[]; onClear: () => void; onBulkAction: (action: string) => void }) {
  return (
    <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{ position: 'fixed', bottom: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 600, display: 'flex', alignItems: 'center', gap: 10, background: '#14142A', border: `1px solid ${T.borderHi}`, borderRadius: 14, padding: '10px 16px', boxShadow: '0 8px 40px rgba(0,0,0,0.6)', flexWrap: 'wrap' }}>
      <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: T.indigoBr, whiteSpace: 'nowrap' }}>{selected.length} selected</div>
      <div style={{ width: 1, height: 20, background: T.border }} />
      {[
        { label: '★ Grant Premium', color: T.green, action: 'batchPremium' },
        { label: '↺ Reset Trials', color: T.cyan, action: 'batchReset' },
        { label: '🗑 Delete All', color: T.red, action: 'batchDelete' },
      ].map(a => (
        <button key={a.action} onClick={() => onBulkAction(a.action)} style={{ padding: '7px 14px', borderRadius: 9, background: 'transparent', border: `1px solid ${a.color}40`, color: a.color, fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {a.label}
        </button>
      ))}
      <button onClick={onClear} style={{ padding: '7px 12px', borderRadius: 9, background: T.surface, border: `1px solid ${T.border}`, color: T.muted, fontSize: 11, cursor: 'pointer' }}>✕</button>
    </motion.div>
  );
}

// ─── FEATURE 6: Export CSV ────────────────────────────────────────────────────
function exportCSV(users: AdminUser[]) {
  const header = 'Name,Email,Status,SkillPoints,Analyses,PracticeSessions,FreeTriesUsed,JoinedAt';
  const rows = users.map(u => [u.name, u.email, u.subscriptionStatus, u.skillPoints, u.analysisCount, u.practiceCount, u.freeTriesUsed, new Date(u.createdAt).toISOString()].map(v => `"${v}"`).join(','));
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `convocoach-users-${Date.now()}.csv`;
  a.click(); URL.revokeObjectURL(url);
}

// ─── SUBMISSIONS PANEL ────────────────────────────────────────────────────────
function SubmissionsPanel() {
  const [subTab, setSubTab] = useState<'contact' | 'bugs' | 'features'>('contact');
  const [items, setItems] = useState<any[]>([]);
  const [subLoading, setSubLoading] = useState(true);
  const [subPage, setSubPage] = useState(1);
  const [subTotal, setSubTotal] = useState(0);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  const loadSubs = async (type: string, page: number) => {
    setSubLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?type=${type}&page=${page}`);
      const json = await res.json();
      if (json.success) { setItems(json.items); setSubTotal(json.pagination.total); }
    } catch { showToast('Failed to load', false); }
    finally { setSubLoading(false); }
  };

  useEffect(() => { loadSubs(subTab, subPage); }, [subTab, subPage]);

  const handleAction = async (id: string, action: string) => {
    try {
      const res = await fetch('/api/admin/submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: subTab, action }),
      });
      const json = await res.json();
      if (json.success) { showToast(json.message, true); loadSubs(subTab, subPage); }
      else showToast(json.error || 'Failed', false);
    } catch { showToast('Network error', false); }
  };

  const getContent = (item: any) => {
    if (subTab === 'contact') return { primary: item.subject || 'No subject', secondary: item.message, meta: item.name };
    if (subTab === 'bugs') return { primary: `Bug on ${item.page}`, secondary: item.description, meta: item.screenshotUrl ? 'Has screenshot' : '' };
    return { primary: item.idea, secondary: item.description, meta: '' };
  };

  return (
    <motion.div key="subs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <AnimatePresence>{toast && <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999 }}><Toast msg={toast.msg} ok={toast.ok} /></div>}</AnimatePresence>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>Inbox</div>
        <h1 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, letterSpacing: '-0.025em' }}>Submissions</h1>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {([['contact', '✉ Contact', T.indigoBr], ['bugs', '🐛 Bugs', T.red], ['features', '💡 Features', T.gold]] as const).map(([id, label, color]) => (
          <button key={id} onClick={() => { setSubTab(id as any); setSubPage(1); }}
            style={{ padding: '8px 16px', borderRadius: 10, background: subTab === id ? `${color}15` : T.surface, border: `1px solid ${subTab === id ? `${color}40` : T.border}`, color: subTab === id ? color : T.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
            {label}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="mono" style={{ fontSize: 11, color: T.muted, marginBottom: 12 }}>{subTotal} total</div>

      {subLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><Spinner /></div>
      ) : items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: T.muted, fontSize: 13 }}>No submissions yet</div>
      ) : (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
          {items.map((item, i) => {
            const { primary, secondary, meta } = getContent(item);
            const statusColor = item.status === 'resolved' || item.status === 'completed' ? T.green : item.status === 'open' || item.status === 'new' ? T.indigoBr : T.muted;
            return (
              <div key={item._id} style={{ padding: '16px 20px', borderBottom: i < items.length - 1 ? `1px solid ${T.border}` : 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{primary}</div>
                    <div className="mono" style={{ fontSize: 11, color: T.muted }}>{item.email}{meta ? ` · ${meta}` : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span className="mono" style={{ fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 5, background: `${statusColor}15`, color: statusColor, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.status}</span>
                    <span className="mono" style={{ fontSize: 10, color: T.muted }}>
                      {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: T.muted2, lineHeight: 1.6, marginBottom: 12, maxHeight: 60, overflow: 'hidden' }}>{secondary}</p>
                <div style={{ display: 'flex', gap: 6 }}>
                  {item.status !== 'resolved' && item.status !== 'completed' && (
                    <button onClick={() => handleAction(item._id, 'resolve')}
                      style={{ padding: '5px 12px', borderRadius: 7, background: T.greenLo, border: `1px solid ${T.green}40`, color: T.green, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                      ✓ Resolve
                    </button>
                  )}
                  <button onClick={() => handleAction(item._id, 'delete')}
                    style={{ padding: '5px 12px', borderRadius: 7, background: T.redLo, border: `1px solid ${T.red}40`, color: T.red, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>
                    🗑 Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {subTotal > 20 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
          <button disabled={subPage <= 1} onClick={() => setSubPage(p => p - 1)}
            style={{ padding: '8px 16px', borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, cursor: 'pointer', opacity: subPage <= 1 ? 0.4 : 1 }}>
            ← Prev
          </button>
          <span className="mono" style={{ fontSize: 12, color: T.muted, padding: '8px 0' }}>Page {subPage}</span>
          <button disabled={subPage * 20 >= subTotal} onClick={() => setSubPage(p => p + 1)}
            style={{ padding: '8px 16px', borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, cursor: 'pointer', opacity: subPage * 20 >= subTotal ? 0.4 : 1 }}>
            Next →
          </button>
        </div>
      )}
    </motion.div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { data: session, status } = useSession();

  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'activity' | 'leaderboard' | 'submissions'>('overview');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; sub?: string; fn: () => void; danger?: boolean } | null>(null);
  const [detailUserId, setDetailUserId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const searchTimer = useRef<any>(null);

  // FEATURE 7: Advanced filters
  const [showFilters, setShowFilters] = useState(false);
  const [minPoints, setMinPoints] = useState('');
  const [minAnalyses, setMinAnalyses] = useState('');

  const showToast = (msg: string, ok: boolean) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3200); };

  const load = useCallback(async (p = 1, s = search, f = filter, so = sort) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(p), search: s, filter: f, sort: so, limit: '20' });
      const res = await fetch(`/api/admin?${params}`);
      if (res.status === 401 || res.status === 403 || res.status === 404) { setHasAccess(false); setAccessChecked(true); setLoading(false); return; }
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      if (json.success) { setData(json); setHasAccess(true); setAccessChecked(true); }
    } catch { showToast('Failed to load data', false); }
    finally { setLoading(false); }
  }, [search, filter, sort]);

  useEffect(() => {
    if (status === 'authenticated') load(1);
    else if (status === 'unauthenticated') { setAccessChecked(true); setHasAccess(false); setLoading(false); }
  }, [status]);

  useEffect(() => {
    if (!hasAccess) return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setPage(1); setSelected(new Set()); load(1, search, filter, sort); }, 380);
    return () => clearTimeout(searchTimer.current);
  }, [search, filter, sort]);

  // ── Single-user action ────────────────────────────────────────────────────
  const doAction = async (userId: string, action: string, value?: any, confirmMsg?: string, confirmSub?: string, danger = true) => {
    if (confirmMsg) {
      setConfirm({ msg: confirmMsg, sub: confirmSub, danger, fn: () => _runAction(userId, action, value) });
    } else {
      _runAction(userId, action, value);
    }
  };

  const _runAction = async (userId: string, action: string, value?: any) => {
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: action === 'delete' ? 'DELETE' : 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: action !== 'delete' ? JSON.stringify({ action, value }) : undefined,
      });
      const json = await res.json();
      if (json.success) { showToast(json.message || 'Done ✓', true); load(page, search, filter, sort); }
      else throw new Error(json.error);
    } catch (e: any) { showToast(e.message || 'Failed', false); }
    finally { setActionLoading(null); }
  };

  // FEATURE 8: Bulk actions
  const doBulkAction = async (action: string) => {
    const ids = Array.from(selected);
    if (action === 'batchDelete') {
      setConfirm({
        msg: `Delete ${ids.length} users and all their data?`, sub: 'This cannot be undone.',
        danger: true, fn: async () => {
          setConfirm(null);
          for (const id of ids) {
            await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
          }
          showToast(`Deleted ${ids.length} users`, true);
          setSelected(new Set());
          load(page, search, filter, sort);
        }
      });
      return;
    }
    if (action === 'batchPremium') {
      setConfirm({
        msg: `Grant premium to ${ids.length} users?`, danger: false,
        fn: async () => {
          setConfirm(null);
          for (const id of ids) {
            await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'setStatus', value: 'paid' }) });
          }
          showToast(`Upgraded ${ids.length} users`, true);
          setSelected(new Set()); load(page, search, filter, sort);
        }
      });
      return;
    }
    if (action === 'batchReset') {
      for (const id of ids) {
        await fetch(`/api/admin/users/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'resetTrials' }) });
      }
      showToast(`Reset trials for ${ids.length} users`, true);
      setSelected(new Set()); load(page, search, filter, sort);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const selectAll = () => {
    if (!data) return;
    const allIds = new Set(data.users.map(u => u._id));
    setSelected(prev => prev.size === allIds.size ? new Set() : allIds);
  };

  const p = data?.platform;
  const todayData = p?.activityData[p.activityData.length - 1];

  // ── Auth gates ────────────────────────────────────────────────────────────
  if (status === 'loading' || (status === 'authenticated' && !accessChecked)) {
    return <div style={{ minHeight: '100svh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><style>{G}</style><Spinner s={28} /></div>;
  }
  if (status === 'unauthenticated') {
    return (
      <div style={{ minHeight: '100svh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <style>{G}</style>
        <p style={{ color: T.muted, fontSize: 14 }}>Sign in to access admin</p>
        <button onClick={() => signIn('google')} style={{ background: T.indigo, border: 'none', color: '#fff', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 700 }}>Sign in with Google</button>
      </div>
    );
  }
  if (accessChecked && !hasAccess) {
    return (
      <div style={{ minHeight: '100svh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
        <style>{G}</style>
        <div style={{ fontSize: 36, marginBottom: 4 }}>🔒</div>
        <p style={{ fontSize: 16, fontWeight: 700 }}>Access Denied</p>
        <p className="mono" style={{ color: T.muted, fontSize: 11 }}>{session?.user?.email}</p>
        <p style={{ color: T.muted, fontSize: 13, textAlign: 'center', maxWidth: 300, lineHeight: 1.65, marginTop: 4 }}>
          Why u trying to open the admin panel, <code style={{ background: T.surface, padding: '2px 6px', borderRadius: 4, color: T.indigoBr }}>lil_bro</code>. Go back to improving your convo skills.
        </p>
      </div>
    );
  }

  // ── Main UI ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{G}</style>

      {/* Overlays */}
      <AnimatePresence>{toast && <Toast msg={toast.msg} ok={toast.ok} />}</AnimatePresence>
      <AnimatePresence>{confirm && <Confirm msg={confirm.msg} sub={confirm.sub} danger={confirm.danger} onYes={() => { confirm.fn(); setConfirm(null); }} onNo={() => setConfirm(null)} />}</AnimatePresence>
      <AnimatePresence>{selected.size > 0 && <BulkBar selected={Array.from(selected)} onClear={() => setSelected(new Set())} onBulkAction={doBulkAction} />}</AnimatePresence>

      {/* User detail slideover */}
      <AnimatePresence>
        {detailUserId && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDetailUserId(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 699 }} />
            <UserDetailPanel userId={detailUserId} onClose={() => setDetailUserId(null)} onAction={() => load(page, search, filter, sort)} />
          </>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', minHeight: '100svh', background: T.bg }}>

        {/* ── Sidebar ──────────────────────────────────────────────────────── */}
        <aside className="sidebar" style={{ width: 220, flexShrink: 0, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.008)', position: 'sticky', top: 0, height: '100svh' }}>
          <div style={{ padding: '22px 20px 16px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 4 }}>ConvoCoach</div>
            <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em' }}>Admin Panel</div>
            <div className="mono" style={{ fontSize: 10, color: T.muted, marginTop: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session?.user?.email}</div>
          </div>

          {/* FEATURE 9: Nav with counts */}
          <nav style={{ padding: '8px 0', flex: 1 }}>
            {[
              { id: 'overview', label: 'Overview', icon: '◼', count: null },
              { id: 'users', label: 'Users', icon: '◉', count: data?.pagination.total },
              { id: 'activity', label: 'Activity', icon: '▲', count: null },
              { id: 'leaderboard', label: 'Leaderboard', icon: '★', count: null },
              { id: 'submissions', label: 'Submissions', icon: '✉', count: null },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id as any)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '10px 20px', background: tab === t.id ? T.indigoLo : 'transparent', border: 'none', borderLeft: `2px solid ${tab === t.id ? T.indigo : 'transparent'}`, color: tab === t.id ? T.indigoBr : T.muted, fontSize: 13, fontWeight: tab === t.id ? 700 : 400, textAlign: 'left', cursor: 'pointer', transition: 'all 0.14s', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 9 }}>{t.icon}</span>{t.label}
                </div>
                {t.count != null && (
                  <span className="mono" style={{ fontSize: 10, background: tab === t.id ? T.indigoLo : T.surface, color: tab === t.id ? T.indigoBr : T.muted, padding: '2px 7px', borderRadius: 6 }}>{t.count}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Platform health */}
          <div style={{ padding: '14px 18px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div className="blink" style={{ width: 6, height: 6, borderRadius: '50%', background: T.green, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: T.muted }}>Platform online</span>
            </div>
            {p && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: 10, color: T.muted }}>Analyses today</span>
                  <span className="mono" style={{ fontSize: 10, color: T.pink }}>{todayData?.analyses ?? 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: 10, color: T.muted }}>Signups today</span>
                  <span className="mono" style={{ fontSize: 10, color: T.indigo }}>{todayData?.signups ?? 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="mono" style={{ fontSize: 10, color: T.muted }}>Conversion</span>
                  <span className="mono" style={{ fontSize: 10, color: T.green }}>{p.conversionRate}%</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {/* Mobile tab strip */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, overflowX: 'auto', flexShrink: 0 }}>
            {['overview', 'users', 'activity', 'leaderboard', 'submissions'].map(t => (
              <button key={t} onClick={() => setTab(t as any)}
                style={{ padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === t ? T.indigo : 'transparent'}`, color: tab === t ? T.indigoBr : T.muted, fontSize: 11, fontWeight: 700, textTransform: 'capitalize', letterSpacing: '0.06em', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: 'clamp(16px,2.5vw,28px)' }}>
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ────────────────────────────────────────────────── */}
              {tab === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>Dashboard</div>
                    <h1 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, letterSpacing: '-0.025em' }}>Platform Overview</h1>
                  </div>

                  {loading ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
                      {[...Array(6)].map((_, i) => <div key={i} style={{ height: 100, borderRadius: 14 }} className="skeleton" />)}
                    </div>
                  ) : (
                    <>
                      {/* FEATURE 10: Growth metrics */}
                      <div style={{ background: T.indigoLo, border: `1px solid ${T.indigo}30`, borderRadius: 14, padding: '14px 18px', marginBottom: 14, display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontSize: 10, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700, marginBottom: 4 }}>Growth window</div>
                        </div>
                        {[
                          { label: 'Users 24h', val: p?.growth.newUsers24h ?? 0, color: T.indigoBr },
                          { label: 'Users 7d', val: p?.growth.newUsers7d ?? 0, color: T.indigoBr },
                          { label: 'Users 30d', val: p?.growth.newUsers30d ?? 0, color: T.indigoBr },
                          { label: 'Analyses 24h', val: p?.growth.analyses24h ?? 0, color: T.pink },
                          { label: 'Analyses 7d', val: p?.growth.analyses7d ?? 0, color: T.pink },
                        ].map(m => (
                          <div key={m.label} style={{ textAlign: 'center' }}>
                            <div className="mono" style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.val}</div>
                            <div style={{ fontSize: 9, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: 3 }}>{m.label}</div>
                          </div>
                        ))}
                      </div>

                      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 14 }}>
                        <StatCard label="Total Users" value={p?.totalUsers ?? 0} color={T.indigoBr} delta={todayData?.signups ?? 0} icon="👥" />
                        <StatCard label="Paid" value={p?.totalPaid ?? 0} color={T.green} sub={`${p?.conversionRate ?? 0}% conversion`} icon="★" />
                        <StatCard label="Free" value={p?.totalFree ?? 0} color="#94A3B8" icon="◯" />
                        <StatCard label="Analyses" value={p?.totalAnalyses ?? 0} color={T.pink} delta={todayData?.analyses ?? 0} icon="📊" />
                        <StatCard label="Practice" value={p?.totalPractice ?? 0} color={T.orange} icon="🎭" />
                        <StatCard label="Conversion" value={`${p?.conversionRate ?? 0}%`} color={T.gold} sub="free → paid" icon="%" />
                      </div>

                      {/* Sparklines */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 10, marginBottom: 16 }}>
                        {[
                          { label: 'Daily Analyses · 14d', data: (p?.activityData ?? []).map(d => d.analyses), color: T.pink },
                          { label: 'Daily Signups · 14d', data: (p?.activityData ?? []).map(d => d.signups), color: T.indigoBr },
                        ].map(c => (
                          <div key={c.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '16px 18px' }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{c.label}</div>
                            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: c.color, marginBottom: 10 }}>
                              {c.data.reduce((a, b) => a + b, 0)}
                            </div>
                            <MiniBar data={c.data} color={c.color} />
                          </div>
                        ))}
                      </div>

                      {/* Recent signups */}
                      {(data?.recentSignups ?? []).length > 0 && (
                        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px' }}>
                          <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 14 }}>Recent Signups</div>
                          {data!.recentSignups.map((u, i) => {
                            const lvl = getLevel(u.skillPoints ?? 0);
                            return (
                              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < data!.recentSignups.length - 1 ? `1px solid ${T.border}` : 'none', flexWrap: 'wrap' }}>
                                <Avatar name={u.name} image={null} size={28} />
                                <div style={{ flex: 1, minWidth: 120 }}>
                                  <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name || u.email}</div>
                                  <div className="mono" style={{ fontSize: 10, color: T.muted }}>{u.email}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                  <Badge status={u.subscriptionStatus} />
                                  <span style={{ fontSize: 10, color: lvl.color, fontWeight: 700 }}>{lvl.name}</span>
                                  <span className="mono" style={{ fontSize: 10, color: T.muted }}>{fmtDate(u.createdAt, true)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {/* ── USERS ───────────────────────────────────────────────────── */}
              {tab === 'users' && (
                <motion.div key="us" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>Users</div>
                    <h1 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, letterSpacing: '-0.025em' }}>User Management</h1>
                  </div>

                  {/* Toolbar */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search name or email…"
                      style={{ padding: '9px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 13, outline: 'none', width: 200 }}
                      onFocus={e => e.target.style.borderColor = T.indigo + '60'}
                      onBlur={e => e.target.style.borderColor = T.border} />
                    <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
                      style={{ padding: '9px 12px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 13, outline: 'none' }}>
                      <option value="all">All users</option>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                    <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
                      style={{ padding: '9px 12px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text, fontSize: 13, outline: 'none' }}>
                      <option value="newest">Newest first</option>
                      <option value="oldest">Oldest first</option>
                      <option value="points">Most points</option>
                      <option value="analyses">Most analyses</option>
                    </select>

                    {/* Filter toggle */}
                    <button onClick={() => setShowFilters(s => !s)} className="chip-btn"
                      style={{ padding: '9px 13px', background: showFilters ? T.indigoLo : T.surface, border: `1px solid ${showFilters ? T.indigo + '50' : T.border}`, borderRadius: 10, color: showFilters ? T.indigoBr : T.muted, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s' }}>
                      ⚙ Filters
                    </button>

                    {/* Export CSV */}
                    <button onClick={() => data && exportCSV(data.users)} className="btn-ghost"
                      style={{ padding: '9px 13px', background: T.greenLo, border: `1px solid ${T.green}40`, borderRadius: 10, color: T.green, fontSize: 12, fontWeight: 700, cursor: 'pointer', marginLeft: 'auto', transition: 'opacity 0.14s' }}>
                      ↓ CSV
                    </button>

                    <span className="mono" style={{ fontSize: 11, color: T.muted }}>{data?.pagination.total ?? 0} users</span>
                  </div>

                  {/* Advanced filters */}
                  <AnimatePresence>
                    {showFilters && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        style={{ overflow: 'hidden', marginBottom: 10 }}>
                        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Thresholds:</span>
                          <input value={minPoints} onChange={e => setMinPoints(e.target.value)} placeholder="Min points"
                            type="number" style={{ width: 110, padding: '7px 10px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12, outline: 'none' }} />
                          <input value={minAnalyses} onChange={e => setMinAnalyses(e.target.value)} placeholder="Min analyses"
                            type="number" style={{ width: 120, padding: '7px 10px', background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text, fontSize: 12, outline: 'none' }} />
                          <span style={{ fontSize: 11, color: T.muted }}>(client-side filter on visible page)</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Table */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
                    {/* Header */}
                    <div className="table-cols" style={{ display: 'grid', gridTemplateColumns: '28px 2.2fr 1fr 0.9fr 1fr 1.2fr auto', padding: '9px 16px', borderBottom: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.02)', alignItems: 'center', gap: 8 }}>
                      <input type="checkbox" onChange={selectAll} checked={(data?.users?.length ?? 0) > 0 && selected.size === (data?.users?.length ?? 0)}
                        style={{ cursor: 'pointer', accentColor: T.indigo }} />
                      {['User', 'Status / Level', 'Analyses', 'Joined', 'Actions'].map((h, i) => (
                        <div key={h} className={i === 3 ? 'col-joined' : i === 2 ? 'col-analyses' : ''}
                          style={{ fontSize: 9, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                      ))}
                    </div>

                    {loading ? (
                      <div style={{ padding: '40px 0', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
                    ) : !data?.users.length ? (
                      <div style={{ textAlign: 'center', padding: '48px 20px', fontSize: 13, color: T.muted }}>No users found</div>
                    ) : data.users
                      .filter(u => {
                        if (minPoints && u.skillPoints < parseInt(minPoints)) return false;
                        if (minAnalyses && u.analysisCount < parseInt(minAnalyses)) return false;
                        return true;
                      })
                      .map((u, i, arr) => {
                        const isPaid = u.subscriptionStatus !== 'free';
                        const busy = actionLoading === u._id;
                        const sel = selected.has(u._id);
                        const lvl = getLevel(u.skillPoints);

                        return (
                          <motion.div key={u._id} className="r-hover"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.018 }}
                            style={{ display: 'grid', gridTemplateColumns: '28px 2.2fr 1fr 0.9fr 1fr 1.2fr auto', padding: '11px 16px', borderBottom: i < arr.length - 1 ? `1px solid ${T.border}` : 'none', alignItems: 'center', gap: 8, opacity: busy ? 0.55 : 1, background: sel ? T.indigoLo : 'transparent', transition: 'background 0.12s' }}>

                            <input type="checkbox" checked={sel} onChange={() => toggleSelect(u._id)} style={{ cursor: 'pointer', accentColor: T.indigo }} />

                            {/* User */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                              <button onClick={() => setDetailUserId(u._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                                <Avatar name={u.name} image={u.image} size={32} />
                              </button>
                              <div style={{ minWidth: 0 }}>
                                <button onClick={() => setDetailUserId(u._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
                                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{u.name || '—'}</div>
                                </button>
                                <div className="mono" style={{ fontSize: 9, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 130 }}>{u.email}</div>
                              </div>
                            </div>

                            {/* Status */}
                            <div>
                              <Badge status={u.subscriptionStatus} />
                              <div style={{ fontSize: 9, color: lvl.color, fontWeight: 700, marginTop: 3 }}>{lvl.name}</div>
                            </div>

                            {/* Analyses */}
                            <div className="col-analyses mono" style={{ fontSize: 13 }}>
                              <span style={{ color: T.pink }}>{u.analysisCount}</span>
                              <span style={{ color: T.muted, fontSize: 10 }}> / {u.freeTriesUsed} tried</span>
                            </div>

                            {/* Joined */}
                            <div className="col-joined mono" style={{ fontSize: 10, color: T.muted }}>{fmtDate(u.createdAt, true)}</div>

                            {/* Skill points */}
                            <div>
                              <div className="mono" style={{ fontSize: 12, fontWeight: 700, color: lvl.color }}>{u.skillPoints} pts</div>
                              <div style={{ marginTop: 4, height: 2, background: T.border, borderRadius: 1, maxWidth: 60 }}>
                                <div style={{ height: '100%', background: lvl.color, borderRadius: 1, width: `${Math.min(100, (u.skillPoints / 300) * 100)}%`, transition: 'width 0.5s ease' }} />
                              </div>
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: 5 }}>
                              <button onClick={() => doAction(u._id, 'togglePremium', undefined,
                                isPaid ? `Remove premium from ${u.name || u.email}?` : `Grant premium to ${u.name || u.email}?`,
                                isPaid ? 'They will lose paid access.' : 'They get full unlimited access.',
                                isPaid)}
                                disabled={busy} title={isPaid ? 'Remove premium' : 'Grant premium'}
                                style={{ padding: '5px 9px', borderRadius: 7, fontSize: 10, fontWeight: 700, border: 'none', background: isPaid ? T.greenLo : T.indigoLo, color: isPaid ? T.green : T.indigoBr, cursor: 'pointer', transition: 'opacity 0.14s', whiteSpace: 'nowrap' }}>
                                {busy ? '…' : isPaid ? '★ PRO' : '+ PRO'}
                              </button>
                              <button onClick={() => doAction(u._id, 'resetTrials', undefined)}
                                disabled={busy} title="Reset free trials to 0"
                                style={{ padding: '5px 8px', borderRadius: 7, fontSize: 12, background: T.goldLo, border: 'none', color: T.gold, cursor: 'pointer' }}>
                                ↺
                              </button>
                              <button onClick={() => setDetailUserId(u._id)}
                                style={{ padding: '5px 8px', borderRadius: 7, fontSize: 11, background: T.surface, border: `1px solid ${T.border}`, color: T.muted2, cursor: 'pointer' }}>
                                →
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                  </div>

                  {/* Pagination */}
                  {data && data.pagination.pages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
                      <button disabled={page === 1}
                        onClick={() => { const np = Math.max(1, page - 1); setPage(np); load(np, search, filter, sort); }}
                        style={{ padding: '7px 14px', borderRadius: 9, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                        ← Prev
                      </button>
                      <span className="mono" style={{ fontSize: 12, color: T.muted }}>
                        {page} / {data.pagination.pages}
                      </span>
                      <button disabled={page >= data.pagination.pages}
                        onClick={() => { const np = Math.min(data.pagination.pages, page + 1); setPage(np); load(np, search, filter, sort); }}
                        style={{ padding: '7px 14px', borderRadius: 9, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontSize: 12, cursor: page >= data.pagination.pages ? 'default' : 'pointer', opacity: page >= data.pagination.pages ? 0.4 : 1 }}>
                        Next →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── ACTIVITY ─────────────────────────────────────────────────── */}
              {tab === 'activity' && (
                <motion.div key="ac" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>Analytics</div>
                    <h1 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, letterSpacing: '-0.025em' }}>14-Day Activity</h1>
                  </div>

                  {/* Visual bar chart */}
                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '20px', marginBottom: 12 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Analyses per day</div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
                      {(p?.activityData ?? []).map((d, i) => {
                        const max = Math.max(...(p?.activityData ?? []).map(x => x.analyses), 1);
                        const h = Math.max(4, (d.analyses / max) * 80);
                        return (
                          <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <motion.div initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: i * 0.03, duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                              title={`${d.date}: ${d.analyses} analyses`}
                              style={{ width: '100%', height: h, background: i === (p?.activityData ?? []).length - 1 ? T.pink : `${T.pink}70`, borderRadius: '3px 3px 1px 1px', transformOrigin: 'bottom', cursor: 'default' }} />
                          </div>
                        );
                      })}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                      <span className="mono" style={{ fontSize: 9, color: T.muted }}>{fmtDate(p?.activityData[0]?.date + 'T12:00:00' || '', true)}</span>
                      <span className="mono" style={{ fontSize: 9, color: T.muted }}>Today</span>
                    </div>
                  </div>

                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', padding: '10px 20px', borderBottom: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.02)' }}>
                      {['Date', 'Analyses', 'Signups', 'Total', 'Trend'].map(h => (
                        <div key={h} style={{ fontSize: 9, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                      ))}
                    </div>
                    {[...(p?.activityData ?? [])].reverse().map((d, i, arr) => {
                      const prev = arr[i + 1];
                      const trend = prev ? d.analyses - prev.analyses : 0;
                      const isToday = i === 0;
                      return (
                        <div key={d.date} style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr 1fr 1fr 1fr', padding: '11px 20px', borderBottom: i < arr.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none', background: isToday ? T.indigoLo : 'transparent', alignItems: 'center' }}>
                          <div className="mono" style={{ fontSize: 12, color: isToday ? T.indigoBr : T.text, fontWeight: isToday ? 700 : 400 }}>
                            {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                            {isToday && <span style={{ marginLeft: 7, fontSize: 9, color: T.indigoBr, fontWeight: 800, textTransform: 'uppercase' }}>today</span>}
                          </div>
                          <div className="mono" style={{ fontSize: 13, color: d.analyses > 0 ? T.pink : T.muted }}>{d.analyses}</div>
                          <div className="mono" style={{ fontSize: 13, color: d.signups > 0 ? T.indigoBr : T.muted }}>{d.signups}</div>
                          <div className="mono" style={{ fontSize: 13, color: (d.analyses + d.signups) > 0 ? T.green : T.muted }}>{d.analyses + d.signups}</div>
                          <div className="mono" style={{ fontSize: 11, color: trend > 0 ? T.green : trend < 0 ? T.red : T.muted }}>
                            {trend > 0 ? `+${trend}` : trend < 0 ? `${trend}` : '—'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* ── LEADERBOARD ───────────────────────────────────────────────── */}
              {tab === 'leaderboard' && (
                <motion.div key="lb" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: T.muted, marginBottom: 5 }}>Rankings</div>
                    <h1 style={{ fontSize: 'clamp(22px,3.5vw,32px)', fontWeight: 800, letterSpacing: '-0.025em' }}>Top Users</h1>
                  </div>

                  {/* Level breakdown */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 8, marginBottom: 18 }}>
                    {[
                      { name: 'Elite Charmer', min: 300, color: T.gold },
                      { name: 'Smooth', min: 150, color: T.indigo },
                      { name: 'Beginner', min: 50, color: T.cyan },
                      { name: 'Dry Texter', min: 0, color: T.muted2 },
                    ].map(lvl => (
                      <div key={lvl.name} style={{ background: lvl.color + '10', border: `1px solid ${lvl.color}30`, borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: lvl.color }}>{lvl.name}</div>
                        <div className="mono" style={{ fontSize: 9, color: T.muted, marginTop: 4 }}>{lvl.min}+ pts</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr auto', padding: '10px 20px', borderBottom: `1px solid ${T.border}`, background: 'rgba(255,255,255,0.02)' }}>
                      {['#', 'User', 'Points', 'Level', 'Status'].map(h => (
                        <div key={h} style={{ fontSize: 9, fontWeight: 700, color: T.muted, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                      ))}
                    </div>

                    {(data?.topUsers ?? []).map((u, i) => {
                      const lvl = getLevel(u.skillPoints);
                      const medalColor = i === 0 ? T.gold : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : T.muted;
                      return (
                        <div key={u.email} style={{ display: 'grid', gridTemplateColumns: '40px 2fr 1fr 1fr auto', padding: '13px 20px', borderBottom: i < (data?.topUsers ?? []).length - 1 ? `1px solid ${T.border}` : 'none', alignItems: 'center' }}>
                          <div className="mono" style={{ fontSize: 16, fontWeight: 800, color: medalColor }}>
                            {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                            <div className="mono" style={{ fontSize: 10, color: T.muted }}>{u.email}</div>
                          </div>
                          <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: lvl.color }}>{u.skillPoints}</div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: lvl.color }}>{lvl.name}</div>
                          <Badge status={u.subscriptionStatus} />
                        </div>
                      );
                    })}

                    {(!data?.topUsers?.length) && (
                      <div style={{ textAlign: 'center', padding: '40px 20px', fontSize: 13, color: T.muted }}>No data yet</div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ── SUBMISSIONS ────────────────────────────────────────────── */}
              {tab === 'submissions' && <SubmissionsPanel />}

            </AnimatePresence>
          </div>
        </main>
      </div>
    </>
  );
}