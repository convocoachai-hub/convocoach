'use client';

import { useState, useEffect, useCallback } from 'react';
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
interface Platform {
  totalUsers: number;
  totalFree: number;
  totalPaid: number;
  totalAnalyses: number;
  totalPractice: number;
  conversionRate: number;
  activityData: { date: string; analyses: number; signups: number }[];
}
interface AdminData {
  platform: Platform;
  users: AdminUser[];
  pagination: { page: number; limit: number; total: number; pages: number };
  recentSignups: { name: string; email: string; createdAt: string; subscriptionStatus: string }[];
}

const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{background:#0A0A0F;color:#E2E0DC;font-family:'Bricolage Grotesque',sans-serif;-webkit-font-smoothing:antialiased;}
.mono{font-family:'Geist Mono',monospace;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.1);border-radius:99px;}
input,select,button{font-family:'Bricolage Grotesque',sans-serif;}
button{cursor:pointer;}
::selection{background:rgba(99,102,241,0.3);}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
.spin{animation:spin 0.8s linear infinite;}
.blink{animation:pulse 2s ease infinite;}
@media(hover:hover){
  .row-hover:hover{background:rgba(255,255,255,0.025)!important;}
  .btn-act:hover{opacity:0.72;}
  .tab-btn:hover{color:rgba(226,224,220,0.85)!important;}
}
@media(max-width:900px){
  .sidebar{display:none!important;}
  .hide-sm{display:none!important;}
  .stat-grid{grid-template-columns:1fr 1fr!important;}
}
@media(max-width:520px){
  .stat-grid{grid-template-columns:1fr!important;}
}
`;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function Spinner({ size = 24 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, border: '2px solid rgba(99,102,241,0.2)', borderTopColor: '#6366F1', borderRadius: '50%' }} className="spin" />
  );
}

function Badge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    free: ['rgba(148,163,184,0.1)', '#94A3B8'],
    paid: ['rgba(74,222,128,0.12)', '#4ADE80'],
    lifetime: ['rgba(251,191,36,0.12)', '#FBBF24'],
  };
  const [bg, color] = map[status] ?? map.free;
  return (
    <span className="mono" style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: bg, color, textTransform: 'uppercase', letterSpacing: '0.07em', whiteSpace: 'nowrap' }}>
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, color = '#818CF8', delta }: {
  label: string; value: string | number; sub?: string; color?: string; delta?: number;
}) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(226,224,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>{label}</div>
      <div className="mono" style={{ fontSize: 28, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {(sub || delta != null) && (
        <div style={{ fontSize: 11, marginTop: 6, color: delta != null ? (delta >= 0 ? '#4ADE80' : '#F87171') : 'rgba(226,224,220,0.3)' }}>
          {delta != null ? `${delta >= 0 ? '+' : ''}${delta} today` : sub}
        </div>
      )}
    </div>
  );
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 36 }}>
      {data.map((v, i) => (
        <motion.div key={i}
          initial={{ scaleY: 0 }} animate={{ scaleY: 1 }}
          transition={{ delay: i * 0.015, duration: 0.28, ease: [0.23,1,0.32,1] }}
          style={{ flex: 1, height: `${Math.max(4, (v / max) * 36)}px`, background: color, borderRadius: '2px 2px 1px 1px', opacity: 0.5 + (i / data.length) * 0.5, transformOrigin: 'bottom' }} />
      ))}
    </div>
  );
}

function Avatar({ name, image, size = 30 }: { name: string; image: string | null; size?: number }) {
  const initials = (name || '?').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
  if (image) return <img src={image} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(99,102,241,0.16)', border: '1px solid rgba(99,102,241,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.36, fontWeight: 700, color: '#818CF8', flexShrink: 0 }}>
      {initials}
    </div>
  );
}

function ConfirmModal({ msg, onYes, onNo }: { msg: string; onYes: () => void; onNo: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.84)', zIndex: 9000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{ background: '#13131C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 18, padding: '26px 26px 20px', maxWidth: 380, width: '100%' }}>
        <p style={{ fontSize: 14, color: '#E2E0DC', lineHeight: 1.65, marginBottom: 22 }}>{msg}</p>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onNo} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2E0DC', fontSize: 13, fontWeight: 600 }}>Cancel</button>
          <button onClick={onYes} style={{ flex: 1, padding: '10px', borderRadius: 10, background: '#EF4444', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600 }}>Confirm</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { data: session, status } = useSession();

  // ✅ Access verified server-side by attempting to fetch /api/admin
  // If it returns 401/404 → not admin. This is more reliable than checking client session.
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'overview' | 'users' | 'activity'>('overview');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [toggling, setToggling] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ msg: string; fn: () => void } | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [searchTimer, setSearchTimer] = useState<any>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async (p = 1, s = '', f = 'all') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?page=${p}&search=${encodeURIComponent(s)}&filter=${f}`);
      if (res.status === 401 || res.status === 404) {
        setHasAccess(false);
        setAccessChecked(true);
        setLoading(false);
        return;
      }
      if (!res.ok) throw new Error('fetch failed');
      const json = await res.json();
      if (json.success) {
        setData(json);
        setHasAccess(true);
        setAccessChecked(true);
      }
    } catch {
      showToast('Failed to load data', false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Trigger load when session is ready
  useEffect(() => {
    if (status === 'authenticated') {
      load(1, '', 'all');
    } else if (status === 'unauthenticated') {
      setAccessChecked(true);
      setHasAccess(false);
      setLoading(false);
    }
  }, [status, load]);

  // Debounced search
  useEffect(() => {
    if (!hasAccess) return;
    if (searchTimer) clearTimeout(searchTimer);
    const t = setTimeout(() => { setPage(1); load(1, search, filter); }, 420);
    setSearchTimer(t);
    return () => clearTimeout(t);
  }, [search, filter]);

  const doTogglePremium = (u: AdminUser) => {
    const isPaid = u.subscriptionStatus !== 'free';
    setConfirm({
      msg: isPaid
        ? `Remove premium from ${u.name || u.email}? They'll lose paid access.`
        : `Grant premium to ${u.name || u.email}? They get full unlimited access.`,
      fn: async () => {
        setConfirm(null);
        setToggling(u._id);
        try {
          const res = await fetch(`/api/admin/users/${u._id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'togglePremium' }),
          });
          const json = await res.json();
          if (json.success) { showToast(json.message, true); load(page, search, filter); }
          else throw new Error(json.error);
        } catch { showToast('Update failed', false); }
        finally { setToggling(null); }
      },
    });
  };

  const doResetTrials = async (u: AdminUser) => {
    setToggling(u._id);
    try {
      const res = await fetch(`/api/admin/users/${u._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resetTrials' }),
      });
      const json = await res.json();
      if (json.success) { showToast(`Trials reset for ${u.email}`, true); load(page, search, filter); }
      else throw new Error(json.error);
    } catch { showToast('Reset failed', false); }
    finally { setToggling(null); }
  };

  const doDelete = (u: AdminUser) => {
    setConfirm({
      msg: `⚠️ Permanently delete ${u.email} and ALL their data? Cannot be undone.`,
      fn: async () => {
        setConfirm(null);
        setToggling(u._id);
        try {
          const res = await fetch(`/api/admin/users/${u._id}`, { method: 'DELETE' });
          const json = await res.json();
          if (json.success) { showToast(json.message, true); load(page, search, filter); }
          else throw new Error(json.error);
        } catch { showToast('Delete failed', false); }
        finally { setToggling(null); }
      },
    });
  };

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });

  const p = data?.platform;
  const todayAnalyses = p?.activityData[p.activityData.length - 1]?.analyses ?? 0;
  const todaySignups  = p?.activityData[p.activityData.length - 1]?.signups  ?? 0;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (status === 'loading' || (status === 'authenticated' && !accessChecked)) {
    return (
      <div style={{ minHeight: '100svh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <style>{GLOBAL_CSS}</style>
        <Spinner size={28} />
      </div>
    );
  }

  // ── Not signed in ─────────────────────────────────────────────────────────
  if (status === 'unauthenticated') {
    return (
      <div style={{ minHeight: '100svh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <style>{GLOBAL_CSS}</style>
        <p style={{ color: 'rgba(226,224,220,0.4)', fontSize: 14 }}>Sign in to access admin</p>
        <button onClick={() => signIn('google')}
          style={{ background: '#6366F1', border: 'none', color: '#fff', borderRadius: 10, padding: '10px 22px', fontSize: 13, fontWeight: 600 }}>
          Sign in with Google
        </button>
      </div>
    );
  }

  // ── No access ─────────────────────────────────────────────────────────────
  if (accessChecked && !hasAccess) {
    return (
      <div style={{ minHeight: '100svh', background: '#0A0A0F', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, padding: 24 }}>
        <style>{GLOBAL_CSS}</style>
        <div style={{ fontSize: 32, marginBottom: 4 }}>🔒</div>
        <p style={{ color: '#E2E0DC', fontSize: 16, fontWeight: 600 }}>Access denied</p>
        <p className="mono" style={{ color: 'rgba(226,224,220,0.38)', fontSize: 12 }}>{session?.user?.email}</p>
        <p style={{ color: 'rgba(226,224,220,0.35)', fontSize: 13, textAlign: 'center', maxWidth: 320, lineHeight: 1.6 }}>
          Why u trying to open admin panel<code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: 4 }}>Lil_Bro</code> go back to improving your convo skills.
        </p>
        <a href="/api/admin/debug" target="_blank"
          style={{ marginTop: 8, fontSize: 12, color: '#818CF8', textDecoration: 'underline' }}>
          Open debug info →
        </a>
      </div>
    );
  }

  // ── Main admin UI ─────────────────────────────────────────────────────────
  return (
    <>
      <style>{GLOBAL_CSS}</style>

      {confirm && <ConfirmModal msg={confirm.msg} onYes={confirm.fn} onNo={() => setConfirm(null)} />}

      <AnimatePresence>
        {toast && (
          <motion.div key="t"
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 14 }}
            style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, padding: '12px 18px', borderRadius: 12, fontSize: 13, fontWeight: 600, maxWidth: 320,
              background: toast.ok ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
              border: `1px solid ${toast.ok ? 'rgba(74,222,128,0.28)' : 'rgba(248,113,113,0.28)'}`,
              color: toast.ok ? '#4ADE80' : '#F87171',
            }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: 'flex', minHeight: '100svh', background: '#0A0A0F' }}>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <div className="sidebar" style={{ width: 210, flexShrink: 0, borderRight: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.01)' }}>
          <div style={{ padding: '24px 20px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(226,224,220,0.28)', marginBottom: 3 }}>ConvoCoach</div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Admin Console</div>
            <div style={{ fontSize: 11, color: 'rgba(226,224,220,0.3)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {session?.user?.email}
            </div>
          </div>

          <nav style={{ padding: '10px 0', flex: 1 }}>
            {[
              { id: 'overview', icon: '◼', label: 'Overview' },
              { id: 'users',    icon: '◉', label: 'Users' },
              { id: 'activity', icon: '▲', label: 'Activity' },
            ].map(t => (
              <button key={t.id} className="tab-btn"
                onClick={() => setTab(t.id as any)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', background: tab === t.id ? 'rgba(99,102,241,0.1)' : 'transparent', border: 'none', borderLeft: `2px solid ${tab === t.id ? '#6366F1' : 'transparent'}`, color: tab === t.id ? '#818CF8' : 'rgba(226,224,220,0.42)', fontSize: 13, fontWeight: tab === t.id ? 600 : 400, textAlign: 'left', cursor: 'pointer', transition: 'all 0.14s' }}>
                <span style={{ fontSize: 10 }}>{t.icon}</span>{t.label}
              </button>
            ))}
          </nav>

          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="blink" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'rgba(74,222,128,0.6)' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ADE80' }} />
              System online
            </div>
          </div>
        </div>

        {/* ── Main ────────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto' }}>
          {/* Mobile tab strip */}
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 4px', overflowX: 'auto' }}>
            {['overview', 'users', 'activity'].map(t => (
              <button key={t} onClick={() => setTab(t as any)}
                style={{ padding: '12px 16px', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === t ? '#6366F1' : 'transparent'}`, color: tab === t ? '#818CF8' : 'rgba(226,224,220,0.35)', fontSize: 12, fontWeight: 600, textTransform: 'capitalize', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                {t}
              </button>
            ))}
          </div>

          <div style={{ padding: 'clamp(16px,3vw,32px)' }}>
            <AnimatePresence mode="wait">

              {/* ── OVERVIEW ─────────────────────────────────────────────── */}
              {tab === 'overview' && (
                <motion.div key="ov" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(226,224,220,0.28)', marginBottom: 5 }}>Overview</div>
                    <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, letterSpacing: '-0.02em' }}>Platform Snapshot</h1>
                  </div>

                  {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}><Spinner size={28} /></div>
                  ) : (
                    <>
                      <div className="stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
                        <StatCard label="Total Users"       value={p?.totalUsers ?? 0}     color="#818CF8" delta={todaySignups} />
                        <StatCard label="Paid Users"        value={p?.totalPaid ?? 0}      color="#4ADE80" sub={`${p?.conversionRate ?? 0}% conversion`} />
                        <StatCard label="Free Users"        value={p?.totalFree ?? 0}      color="#94A3B8" />
                        <StatCard label="Analyses"          value={p?.totalAnalyses ?? 0}  color="#F472B6" delta={todayAnalyses} />
                        <StatCard label="Practice Sessions" value={p?.totalPractice ?? 0}  color="#FB923C" />
                        <StatCard label="Conversion %"      value={`${p?.conversionRate ?? 0}%`} color="#FBBF24" sub="free → paid" />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: 10, marginBottom: 16 }}>
                        {[
                          { label: 'Analyses · 14d', val: p?.totalAnalyses ?? 0, data: (p?.activityData ?? []).map(d => d.analyses), color: '#F472B6' },
                          { label: 'Signups · 14d', val: p?.totalUsers ?? 0, data: (p?.activityData ?? []).map(d => d.signups), color: '#818CF8' },
                        ].map(c => (
                          <div key={c.label} style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: 18 }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(226,224,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{c.label}</div>
                            <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: c.color, marginBottom: 12 }}>{c.val}</div>
                            <MiniChart data={c.data} color={c.color} />
                          </div>
                        ))}
                      </div>

                      {(data?.recentSignups ?? []).length > 0 && (
                        <div style={{ background: 'rgba(255,255,255,0.022)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 20px' }}>
                          <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(226,224,220,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 14 }}>Recent Signups</div>
                          {data!.recentSignups.map((u, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 0', borderBottom: i < data!.recentSignups.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: 10, flexWrap: 'wrap' }}>
                              <div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>{u.name || u.email}</div>
                                <div className="mono" style={{ fontSize: 10, color: 'rgba(226,224,220,0.35)' }}>{u.email}</div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <Badge status={u.subscriptionStatus} />
                                <span style={{ fontSize: 11, color: 'rgba(226,224,220,0.25)' }}>{fmtDate(u.createdAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </motion.div>
              )}

              {/* ── USERS ───────────────────────────────────────────────── */}
              {tab === 'users' && (
                <motion.div key="us" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(226,224,220,0.28)', marginBottom: 5 }}>Users</div>
                    <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, letterSpacing: '-0.02em' }}>User Management</h1>
                  </div>

                  <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input value={search} onChange={e => setSearch(e.target.value)}
                      placeholder="Search name or email…"
                      style={{ padding: '9px 14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: '#E2E0DC', fontSize: 13, outline: 'none', width: 220 }}
                      onFocus={e => (e.target.style.borderColor = 'rgba(99,102,241,0.5)')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.09)')} />
                    <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }}
                      style={{ padding: '9px 12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 10, color: '#E2E0DC', fontSize: 13, outline: 'none' }}>
                      <option value="all">All users</option>
                      <option value="free">Free</option>
                      <option value="paid">Paid</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                    <span className="mono" style={{ fontSize: 11, color: 'rgba(226,224,220,0.3)', marginLeft: 'auto' }}>
                      {data?.pagination.total ?? 0} total
                    </span>
                  </div>

                  <div style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '9px 18px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      {['User', 'Status', 'Analyses', 'Joined', 'Actions'].map(h => (
                        <div key={h} className={h === 'Joined' ? 'hide-sm' : ''} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(226,224,220,0.26)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                      ))}
                    </div>

                    {loading ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}><Spinner /></div>
                    ) : !data?.users.length ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', fontSize: 13, color: 'rgba(226,224,220,0.26)' }}>No users found</div>
                    ) : data.users.map((u, i) => {
                      const isPaid = u.subscriptionStatus !== 'free';
                      const busy = toggling === u._id;
                      return (
                        <motion.div key={u._id} className="row-hover"
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.022 }}
                          style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', padding: '11px 18px', borderBottom: i < data.users.length - 1 ? '1px solid rgba(255,255,255,0.045)' : 'none', alignItems: 'center', transition: 'background 0.14s', opacity: busy ? 0.55 : 1 }}>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <Avatar name={u.name} image={u.image} />
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || '—'}</div>
                              <div className="mono" style={{ fontSize: 10, color: 'rgba(226,224,220,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</div>
                            </div>
                          </div>

                          <div><Badge status={u.subscriptionStatus} /></div>
                          <div className="mono" style={{ fontSize: 13 }}>{u.analysisCount}</div>
                          <div className="mono hide-sm" style={{ fontSize: 11, color: 'rgba(226,224,220,0.35)' }}>{fmtDate(u.createdAt)}</div>

                          <div style={{ display: 'flex', gap: 5 }}>
                            <button className="btn-act" disabled={busy} onClick={() => doTogglePremium(u)}
                              title={isPaid ? 'Remove premium' : 'Grant premium'}
                              style={{ padding: '5px 10px', borderRadius: 7, fontSize: 11, fontWeight: 700, border: 'none', transition: 'opacity 0.14s', cursor: 'pointer', background: isPaid ? 'rgba(74,222,128,0.12)' : 'rgba(99,102,241,0.12)', color: isPaid ? '#4ADE80' : '#818CF8' }}>
                              {busy ? '…' : isPaid ? '★ PRO' : '+ PRO'}
                            </button>
                            <button className="btn-act" disabled={busy} onClick={() => doResetTrials(u)}
                              title="Reset free trials"
                              style={{ padding: '5px 8px', borderRadius: 7, fontSize: 13, background: 'rgba(251,191,36,0.1)', border: 'none', color: '#FBBF24', cursor: 'pointer', transition: 'opacity 0.14s' }}>
                              ↺
                            </button>
                            <button className="btn-act" disabled={busy} onClick={() => doDelete(u)}
                              title="Delete user"
                              style={{ padding: '5px 8px', borderRadius: 7, fontSize: 13, background: 'rgba(248,113,113,0.1)', border: 'none', color: '#F87171', cursor: 'pointer', transition: 'opacity 0.14s' }}>
                              ✕
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {data && data.pagination.pages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 14 }}>
                      <button disabled={page === 1}
                        onClick={() => { const np = Math.max(1, page - 1); setPage(np); load(np, search, filter); }}
                        style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#E2E0DC', fontSize: 12, cursor: page === 1 ? 'default' : 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                        ← Prev
                      </button>
                      <span className="mono" style={{ fontSize: 12, color: 'rgba(226,224,220,0.35)' }}>{page} / {data.pagination.pages}</span>
                      <button disabled={page >= data.pagination.pages}
                        onClick={() => { const np = Math.min(data.pagination.pages, page + 1); setPage(np); load(np, search, filter); }}
                        style={{ padding: '7px 14px', borderRadius: 9, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)', color: '#E2E0DC', fontSize: 12, cursor: page >= data.pagination.pages ? 'default' : 'pointer', opacity: page >= data.pagination.pages ? 0.4 : 1 }}>
                        Next →
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ── ACTIVITY ─────────────────────────────────────────────── */}
              {tab === 'activity' && (
                <motion.div key="ac" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div style={{ marginBottom: 22 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(226,224,220,0.28)', marginBottom: 5 }}>Activity</div>
                    <h1 style={{ fontSize: 'clamp(22px,4vw,30px)', fontWeight: 700, letterSpacing: '-0.02em' }}>14-Day Activity</h1>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.018)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', padding: '9px 20px', borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                      {['Date', 'Analyses', 'Signups', 'Total'].map(h => (
                        <div key={h} style={{ fontSize: 10, fontWeight: 700, color: 'rgba(226,224,220,0.26)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                      ))}
                    </div>
                    {[...(p?.activityData ?? [])].reverse().map((d, i, arr) => {
                      const total = d.analyses + d.signups;
                      const isToday = i === 0;
                      return (
                        <div key={d.date} style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr 1fr 1fr', padding: '11px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', background: isToday ? 'rgba(99,102,241,0.04)' : 'transparent' }}>
                          <div className="mono" style={{ fontSize: 13, color: isToday ? '#818CF8' : '#E2E0DC', fontWeight: isToday ? 600 : 400 }}>
                            {new Date(d.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            {isToday && <span style={{ fontSize: 9, color: '#818CF8', marginLeft: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>today</span>}
                          </div>
                          <div className="mono" style={{ fontSize: 13, color: d.analyses > 0 ? '#F472B6' : 'rgba(226,224,220,0.2)' }}>{d.analyses}</div>
                          <div className="mono" style={{ fontSize: 13, color: d.signups > 0 ? '#818CF8' : 'rgba(226,224,220,0.2)' }}>{d.signups}</div>
                          <div className="mono" style={{ fontSize: 13, color: total > 0 ? '#4ADE80' : 'rgba(226,224,220,0.2)' }}>{total}</div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}